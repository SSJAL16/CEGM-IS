import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import GeneratePO from "../../components/Modals/GeneratePO";
import { MdDelete } from "react-icons/md";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";
import backorderService from "../../services/backorderService";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/authStore";

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // Check for user authentication at component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!isAuthenticated || !userData) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login to generate a purchase order.',
      }).then(() => {
        navigate('/login', { state: { from: '/generate-purchase-order' } });
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const { state } = useLocation(); 
  const { selectedProducts, selectedSupplierProducts } = state || {};
  const [products, setProducts] = useState(selectedProducts || []);
  const [errors, setErrors] = useState({});

  const [quantities, setQuantities] = useState(() => {
    const initialQuantities = {};
    selectedProducts?.forEach(product => {
      initialQuantities[product._id] = Math.max(product.minimum_stock - product.current_stock, 0);
    });
    return initialQuantities;
  });

  const validateQuantity = (product, quantity) => {
    const minRequiredQuantity = Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0);
    
    if (quantity <= 0) {
      return 'Quantity must be greater than 0';
    }
    if (quantity < minRequiredQuantity) {
      return `Quantity must be at least ${minRequiredQuantity} to meet minimum stock requirement`;
    }
    return null;
  };

  const handleQuantityChange = (id, value) => {
    const product = products.find(p => p.product_Id === id);
    const numericValue = Number(value);
    const error = validateQuantity(product, numericValue);
    
    setErrors(prev => ({
      ...prev,
      [id]: error
    }));

    setQuantities(prev => ({
      ...prev,
      [id]: numericValue
    }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedProducts) {
      setProducts(selectedProducts);
  
      const initialQuantities = {};
      const initialErrors = {};
      selectedProducts.forEach(product => {
        const quantity = Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0);
        initialQuantities[product.product_Id] = quantity;
        initialErrors[product.product_Id] = validateQuantity(product, quantity);
      });
      setQuantities(initialQuantities);
      setErrors(initialErrors);
    }
  }, [selectedProducts]);

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(product => product.product_Id !== id));
    setQuantities(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any errors or non-positive quantities
    if (Object.values(errors).some(error => error !== null) || 
        Object.values(quantities).some(qty => qty <= 0)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check the quantities and fix any errors before submitting.',
      });
      return;
    }

    // Get current user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || !userData.firstName || !userData.lastName) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Your session has expired. Please login again.',
      }).then(() => {
        navigate('/login', { state: { from: '/generate-purchase-order' } });
      });
      return;
    }

    const poData = {
      user: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_id: userData.userId
      },
      supplier: {
        person_name: selectedSupplierProducts.supplierInfo.person_name,
        person_number: selectedSupplierProducts.supplierInfo.person_number,
        person_email: selectedSupplierProducts.supplierInfo.person_email,
        company_name: selectedSupplierProducts.supplierInfo.company_name,
        company_email: selectedSupplierProducts.supplierInfo.company_email,
        company_country: selectedSupplierProducts.supplierInfo.company_country,
        company_province: selectedSupplierProducts.supplierInfo.company_province,
        company_city: selectedSupplierProducts.supplierInfo.company_city,
        company_zipCode: selectedSupplierProducts.supplierInfo.company_zipCode,
      },
      order_status: "Draft",
      items: products.map((product) => ({
        product_Id: product.product_Id,
        product_Name: product.product_Name,
        product_Description: product.product_Description, 
        product_Category: product.product_Category, 
        product_Current_Stock: product.product_Current_Stock, 
        product_Maximum_Stock_Level: product.product_Maximum_Stock_Level,
        product_Minimum_Stock_Level: product.product_Minimum_Stock_Level,
        product_Price: product.product_Price,
        quantity: Number(quantities[product.product_Id] || 0),
        backorder_quantity: Number(quantities[product.product_Id] || 0),  
        status: "Pending", 
      })),
    };

    try {
      const response = await purchaseOrderService.create(poData);
            Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Purchase order created successfully!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate("/generated-purchase-orders", {
          state: { showSnackbar: true, snackbarMessage: "Purchase order created successfully!" },
        });
      });

    } catch (error) {
      console.error("Error creating purchase order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create purchase order. Please try again.',
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const isSubmitDisabled = () => {
    return selectedProducts.length === 0 || 
           Object.values(errors).some(error => error !== null) ||
           Object.values(quantities).some(qty => qty <= 0);
  };

  return (
    <>
      <div className="right-content w-100">
        {/* First Card - Supplier Details */}
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Generate Purchase Order</h5>
        </div>

        <form className="form">
          <div className="row">
            <div className="col-md-12">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Primary Document Details</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>SUPPLIER NAME</h6>
                      <input type="text" name="" value={selectedSupplierProducts.supplierInfo.company_name} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>EMAIL</h6>
                      <input type="text" name="" value={selectedSupplierProducts.supplierInfo.person_email} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>PHONE NUMBER</h6>
                      <input type="text" name="" value={selectedSupplierProducts.supplierInfo.person_number} disabled/>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>Supplier Address</h6>
                        <input type="text" name="" value={`${selectedSupplierProducts.supplierInfo.company_city}, ${selectedSupplierProducts.supplierInfo.company_province}, ${selectedSupplierProducts.supplierInfo.company_country}, ${selectedSupplierProducts.supplierInfo.company_zipCode}`} disabled/>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>DATE</h6>
                      <input type="text" name="brand" value={new Date().toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric",})} disabled/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Second Card - Product Details */}
        <div className="card shadow border-0 p-3 mt-4">
          <h3 className="hd">Product Details</h3>

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>DELETE</th>
                  <th style={{ width: "300px" }}>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>CURRENT STOCK</th>
                  <th>MIN STOCK</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>ESTIMATED AMMOUNT</th>
                </tr>
              </thead>

              <tbody>
                {products?.map((product, index) => {
                  const estimatedAmount = product.product_Price * (quantities[product.product_Id] || 0);
                  return (
                <tr key={product.product_Id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="actions d-flex align-items-center">
                        <Button
                          className="error"
                          color="error"
                          onClick={() => handleDelete(product.product_Id)}
                        >
                          <MdDelete />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="info pl-3">
                        <h6>{product.product_Name}</h6>
                        <p>{product.product_Description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{product.product_Category}</td>
                  <td>{product.product_Current_Stock}</td>
                  <td>{product.product_Minimum_Stock_Level}</td>
                  <td>
                    <TextField
                      fullWidth
                      type="number"
                      value={quantities[product.product_Id] || 0}
                      onChange={(e) => {
                        const value = Math.max(Number(e.target.value), 0);
                        handleQuantityChange(product.product_Id, value);
                      }}
                      error={!!errors[product.product_Id]}
                      helperText={errors[product.product_Id] || `Minimum required: ${Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0)}`}
                      inputProps={{
                        min: Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0)
                      }}
                    />
                  </td>
                  <td>Php {Number(product.product_Price).toFixed(2)}</td>
                  <td>Php {Number(estimatedAmount).toFixed(2)}</td>
                </tr>
                  );
                })}
              </tbody>
            </table>
              <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitDisabled()}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Grid>
          </div>
        </div>
      </div>

      <GeneratePO open={open} handleClose={handleClose} />
    </>
  );
};

export default PurchaseOrder;
