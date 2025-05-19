import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import GeneratePO from "../../components/Modals/GeneratePO";
import { MdDelete } from "react-icons/md";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";
import grnService from "../../services/grnService";
import backorderService from "../../services/backorderService";
import rmaService from "../../services/rmaService";
import Swal from "sweetalert2";
import { Avatar, Chip, Typography } from "@mui/material";
import { deepPurple } from "@mui/material/colors";

const EditGRN = () => {
  const userDetails = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();
  const { state } = useLocation();
  const { selectedGRN } = state || {};

  const [grn, setGRN] = useState(selectedGRN || {});
  const [po, setPO] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (grn?.items) {
      validateQuantities(grn.items);
    }
  }, [grn?.items]);

  const getPObyId = async (po_id) => {
    try {
      const response = await purchaseOrderService.getPO(po_id);
      setPO(response.data)
    } catch (error) {
    }
  };

  
  useEffect(() => {
    if (grn?.po?.po_id) {
      getPObyId(grn.po.po_id);
      window.scrollTo(0, 0);
    }
  }, [grn]);

  const validateQuantities = (items) => {
    const newErrors = {};
    let isValid = true;

    items.forEach((item, index) => {
      const receivedQty = item.received_quantity || 0;
      const returnQty = item.return_quantity || 0;

      if (receivedQty < 0) {
        newErrors[`received_${index}`] = "Received quantity cannot be negative";
        isValid = false;
      }

      if (returnQty < 0) {
        newErrors[`return_${index}`] = "Return quantity cannot be negative";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    try {
      if (!validateQuantities(grn?.items)) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please check the quantities entered',
        });
        return;
      }

      // Only send the necessary item data for updating quantities
      const grnData = {
        delivered_date: new Date(),
        items: grn?.items.map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          order_quantity: item.order_quantity,
          received_quantity: item.received_quantity,
          return_quantity: item.return_quantity,
        })),
      };

      await grnService.update(grn._id, grnData);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'GRN quantities updated successfully!',
      }).then(() => {
        navigate("/grn", {
          state: {
            showSnackbar: true,
            snackbarMessage: "GRN quantities updated successfully!",
          },
        });
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update GRN quantities',
      });
    }
  };

  const handleSend = async () => {
    try {
      if (!validateQuantities(grn?.items)) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please check the quantities entered',
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to send this GRN?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, send it!'
      });

      if (!result.isConfirmed) {
        return;
      }

      const grnData = {
        delivered_date: new Date(),
        order_status: "Approved",
        items: grn?.items.map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          order_quantity: item.order_quantity,
          received_quantity: item.received_quantity,
          return_quantity: item.return_quantity,
        })),
      };

      await grnService.update(grn._id, grnData);

      const rmaData = {
        user: {
          first_name: grn.user.first_name,
          last_name: grn.user.last_name,
        },
        supplier: {
          person_name: grn.supplier.person_name,
          person_number: grn.supplier.person_number,
          person_email: grn.supplier.person_email,
          company_name: grn.supplier.company_name,
          company_email: grn.supplier.company_email,
          company_country: grn.supplier.company_country,
          company_province: grn.supplier.company_province,
          company_city: grn.supplier.company_city,
          company_zipCode: grn.supplier.company_zipCode,
        },
        po: {
          po_id: grn.po.po_id,
          order_date: grn.po.order_date,
        },
        grn: {
          grn_id: grn._id,
          order_date: new Date(),
        },
        return_status: "Draft",
        items: grn?.items
        .filter((item) => item.return_quantity > 0)
        .map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          order_quantity: item.quantity,
          return_quantity: item.return_quantity,
        })),
      };

      const processedItems = po.items.map((item) => {
        const currentBackorderQty = item.backorder_quantity;

        const matchedGRNItem = grn.items.find(
          (product) => product.product_Id === item.product_Id
        );

        const receivedQty = matchedGRNItem?.received_quantity || 0;

        let newBackorderQty = currentBackorderQty;
      
        if (currentBackorderQty > 0) {
          newBackorderQty = currentBackorderQty - receivedQty;
          if (newBackorderQty < 0) newBackorderQty = 0;
        }

        const status = newBackorderQty <= 0 ? "Complete" : "Pending";

        return {
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          quantity: item.quantity,
          backorder_quantity: newBackorderQty,
          status,
        };
      });
      
      const allItemsComplete = processedItems.every((item) => item.status === "Complete");
      
      const poData = {
        order_status: allItemsComplete ? "Complete" : "Approved",
        items: processedItems,
      };

      await purchaseOrderService.update(grn?.po.po_id, poData)

      try {
        console.log("All quantities updated successfully.");
        const itemsToUpdate = grn?.items
          .map((item) => ({
            product_Id: item.product_Id,
            quantityToAdd: item.received_quantity,
          }));
    
        await Promise.all(
          itemsToUpdate.map((item) =>
            grnService.addQuantity(item.product_Id, item.quantityToAdd)
          )
        );
    
        console.log("All quantities updated successfully.");
      } catch (error) {
      }

      if (rmaData.items.length > 0) {
        await rmaService.create(rmaData);
      } 

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'GRN sent and RMA created successfully!',
      }).then(() => {
        navigate("/grn", {
          state: {
            showSnackbar: true,
            snackbarMessage: "GRN sent and RMA created successfully!",
          },
        });
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send GRN and create RMA',
      });
    }
  };

  const handleDeleteItem = (index) => {
    // Implement the logic to delete the item at the specified index
  };

  const handleQuantityChange = (index, field, value) => {
    const updatedGRN = { ...grn };
    const updatedItems = [...updatedGRN.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: parseInt(value) || 0
    };
    updatedGRN.items = updatedItems;
    setGRN(updatedGRN);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedGRN = {
        ...selectedGRN,
        items: items.map(item => ({
          ...item,
          received_quantity: Number(receivedQuantities[item.product_Id] || 0)
        })),
        order_status: "Approved"
      };

      await grnService.update(selectedGRN._id, updatedGRN);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'GRN updated successfully!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate("/grn");
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update GRN. Please try again.',
      });
    }
  };

  return (
    <>
      <div className="right-content w-100">
        {/* First Card - Supplier Details */}
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Edit Goods Received Note</h5>
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
                      <input
                        type="text"
                        name=""
                        value={grn?.supplier?.company_name || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>EMAIL</h6>
                      <input
                        type="text"
                        name=""
                        value={grn?.supplier?.company_email || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>PHONE NUMBER</h6>
                      <input
                        type="text"
                        name=""
                        value={grn?.supplier?.person_number || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>SUPPLIER ADDRESS</h6>
                      <input
                        type="text"
                        name=""
                        value={`${grn?.supplier?.company_city}, ${grn?.supplier?.company_province}, ${grn?.supplier?.company_country}, ${grn?.supplier?.company_zipCode}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>CREATED DATE</h6>
                      <input
                        type="text"
                        name="brand"
                        value={new Date(grn.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                        disabled
                      />
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
                  <th style={{ width: "300px", whiteSpace: 'nowrap' }}>PRODUCT</th>
                  <th style={{ whiteSpace: 'nowrap' }}>CURRENT STOCK</th>
                  <th style={{ whiteSpace: 'nowrap' }}>ORDERED QUANTITY</th>
                  <th style={{ whiteSpace: 'nowrap' }}>RECEIVE QUANTITY</th>
                  <th style={{ whiteSpace: 'nowrap' }}>RETURN QUANTITY</th>
                  <th style={{ whiteSpace: 'nowrap' }}>UNIT PRICE</th>
                </tr>
              </thead>

              <tbody>
                {grn?.items?.map((product, index) => {
                  const matchingPOItem = po.items?.find(
                    (item) => item.product_Id === product.product_Id
                  );
                  const unitPrice = product.product_Price || 0;
                  const receivedQty = product.received_quantity || 0;
                  const estimatedAmount = unitPrice * receivedQty;
                  const orderedQty = product.order_quantity || 0;
                  
                  return (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <Avatar sx={{ bgcolor: deepPurple[500] }}>
                              {product.product_Name?.charAt(0)}
                            </Avatar>
                          </div>
                          <div className="info pl-3">
                            <h6>{product.product_Name}</h6>
                            <p>{product.product_Description}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Chip 
                          label={product.product_Current_Stock}
                          color="primary"
                          size="small"
                        />
                      </td>
                      <td>
                        <Chip 
                          label={orderedQty}
                          color="primary"
                          size="small"
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          value={product.received_quantity || 0}
                          onChange={(e) => handleQuantityChange(index, 'received_quantity', e.target.value)}
                          error={!!errors[`received_${index}`]}
                          helperText={errors[`received_${index}`]}
                          size="small"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </td>
                      <td>
                        <TextField
                          type="number"
                          value={product.return_quantity || 0}
                          onChange={(e) => handleQuantityChange(index, 'return_quantity', e.target.value)}
                          error={!!errors[`return_${index}`]}
                          helperText={errors[`return_${index}`]}
                          size="small"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </td>
                      <td>
                        <Typography color="primary">
                          ₱{unitPrice.toFixed(2)}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
              <Grid item>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => navigate("/grn")}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid item>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
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

export default EditGRN;
