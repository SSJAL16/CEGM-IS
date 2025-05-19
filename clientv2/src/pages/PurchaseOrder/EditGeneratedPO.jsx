import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import GeneratePO from "../../components/Modals/GeneratePO";
import { MdDelete } from "react-icons/md";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";
import grnService from "../../services/grnService";
import backorderService from "../../services/backorderService";
import Swal from "sweetalert2";
import { Chip } from "@mui/material";

const EditGeneratedPurchaseOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const { selectedPurchaseOrder } = state || {};

  const [purchaseOrder, setPurchaseOrder] = useState(selectedPurchaseOrder || {});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editableItems, setEditableItems] = useState([]);
  const [productErrors, setProductErrors] = useState({});

  const handleQuantityChange = (index, value) => {
    const updatedItems = [...editableItems];
    const numericValue = Number(value);
    const product = updatedItems[index];
    
    // Calculate minimum required quantity
    const minRequiredQuantity = Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0);
    
    // Update quantity
    updatedItems[index].quantity = numericValue;
    
    // Set validation errors if needed
    const errors = { ...productErrors };
    if (numericValue < minRequiredQuantity) {
      errors[index] = `Quantity must be at least ${minRequiredQuantity} to meet minimum stock requirement`;
    } else {
      delete errors[index];
    }
    
    setEditableItems(updatedItems);
    setProductErrors(errors);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (purchaseOrder.items) {
      setEditableItems([...purchaseOrder.items]); 
    }
      }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (purchaseOrder.items) {
      const initializedItems = purchaseOrder.items.map((item) => ({
        ...item,
        quantity: item.quantity // Keep original quantity from PO
      }));
      setEditableItems(initializedItems);
    }
  }, []);

  const handleDeleteProduct = (indexToDelete) => {
    const updatedItems = editableItems.filter((_, index) => index !== indexToDelete);
    setEditableItems(updatedItems);
  };

  const validateAllQuantities = () => {
    let isValid = true;
    const errors = {};

    editableItems.forEach((item, index) => {
      const minRequiredQuantity = Math.max(item.product_Minimum_Stock_Level - item.product_Current_Stock, 0);
      
      if (item.quantity < minRequiredQuantity) {
        errors[index] = `Quantity must be at least ${minRequiredQuantity} to meet minimum stock requirement`;
        isValid = false;
      }
    });

    setProductErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateAllQuantities()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please ensure all quantities meet minimum stock requirements'
      });
      return;
    }

    try {
      const updatedPO = {
        order_status: "Draft",
        items: editableItems.map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          quantity: item.quantity,
          backorder_quantity: item.quantity,  
          status: "Pending", 
        })),
      };
  
      await purchaseOrderService.update(purchaseOrder._id, updatedPO);
  
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Purchase order saved successfully!',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        navigate("/generated-purchase-orders", {
          state: { showSnackbar: true, snackbarMessage: "Purchase order updated successfully!" },
        });
      });
    } catch (error) {
      console.error("Error updating purchase order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update purchase order.'
      });
    }
  };

  const handleSend = async () => {
    if (!validateAllQuantities()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please ensure all quantities meet minimum stock requirements'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You are about to send this purchase order to the supplier. This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, send it!'
      });

      if (!result.isConfirmed) {
        return;
      }


      const updatedPO = {
        order_status: "Approved",
        items: editableItems.map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          quantity: item.quantity,
          backorder_quantity: item.quantity,  
          status: "Pending", 
        })),
      };
  
      await purchaseOrderService.update(purchaseOrder._id, updatedPO);
  
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Purchase order has been sent to supplier successfully!',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        navigate("/generated-purchase-orders", {
          state: { showSnackbar: true, snackbarMessage: "Purchase order sent successfully!" },
        });
      });
    } catch (error) {
      console.error("Error sending purchase order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send purchase order.'
      });
    }
  };

  const handleCancel = async () => {
    navigate("/generated-purchase-orders", {
      state: { showSnackbar: true, snackbarMessage: "Cancel updating Purchase Order!" },
    });
  };


  return (
    <>
      <div className="right-content w-100">
        {/* First Card - Supplier Details */}
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Edit Generate Purchase Order</h5>
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
                      <input type="text" name="" value={purchaseOrder?.supplier?.company_name || ""} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>EMAIL</h6>
                      <input type="text" name="" value={purchaseOrder.supplier.company_email} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>PHONE NUMBER</h6>
                      <input type="text" name="" value={purchaseOrder.supplier.person_number} disabled/>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>SUPPLIER ADDRESS</h6>
                        <input type="text" name="" value={`${purchaseOrder.supplier.company_city}, ${purchaseOrder.supplier.company_province}, ${purchaseOrder.supplier.company_country}, ${purchaseOrder.supplier.company_zipCode}`} disabled/>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>DATE</h6>
                      <input type="text" name="brand" value={new Date(purchaseOrder.order_date).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric",})}  disabled/>
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
                  <th>MAX STOCK</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>ESTIMATED AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {editableItems?.map((product, index) => {
                  const estimatedAmount = product.product_Price * product.quantity;
                  const stockStatus = product.product_Current_Stock <= product.product_Minimum_Stock_Level ? 'Low Stock' : 'In Stock';
                  return (
                    <tr key={product.product_Id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Button
                            className="error"
                            color="error"
                            onClick={() => handleDeleteProduct(index)}
                            sx={{ 
                              minWidth: 'auto',
                              p: 1
                            }}
                          >
                            <MdDelete />
                          </Button>
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
                      <td>{product.product_Maximum_Stock_Level}</td>
                      <td>
                        <TextField
                          fullWidth
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          error={Boolean(productErrors[index])}
                          helperText={productErrors[index] || `Minimum required: ${Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0)}`}
                          inputProps={{
                            min: Math.max(product.product_Minimum_Stock_Level - product.product_Current_Stock, 0)
                          }}
                        />
                      </td>
                      <td>₱ {product.product_Price.toFixed(2)}</td>
                      <td>₱ {estimatedAmount.toFixed(2)}</td>
                      <td>
                        <Chip 
                          label={stockStatus}
                          color={stockStatus === 'Low Stock' ? 'error' : 'success'}
                          size="small"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
                <Grid item>
                  <Button variant="outlined" color="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Grid>

                <Grid item>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={editableItems.length === 0 || Object.keys(productErrors).length > 0}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={editableItems.length === 0 || Object.keys(productErrors).length > 0}
                        onClick={handleSend} 
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditGeneratedPurchaseOrder;
