import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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

const EditBackOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const { selectedBackorder } = state || {};

  const [backorder, setBackorder] = useState(selectedBackorder || {});


  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("Selected Backorder:", backorder);
  }, []);

  const handleCancel = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to cancel editing this backorder?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/back-order", {
          state: { showSnackbar: true, snackbarMessage: "Backorder canceled successfully!" },
        });
      }
    });
  };

  const handleGenerate = async () => {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You want to approve this backorder?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const backorderData = {
            user: {
              first_name: backorder.user.first_name,
              last_name: backorder.user.last_name,
            },
            supplier: {
              person_name: backorder.supplier.person_name,
              person_number: backorder.supplier.person_number,
              person_email: backorder.supplier.person_email,
              company_name: backorder.supplier.company_name,
              company_email: backorder.supplier.company_email,
              company_country: backorder.supplier.company_country,
              company_province: backorder.supplier.company_province,
              company_city: backorder.supplier.company_city,
              company_zipCode: backorder.supplier.company_zipCode,
            },
            po: {
              po_id: backorder._id,
              order_date: backorder.order_date,
            },
            order_date: new Date(),
            order_status: "Approved",
            items: backorder?.items.map((item) => ({
              product_Id: item.product_Id,
              product_Name: item.product_Name,
              product_Description: item.product_Description, 
              product_Category: item.product_Category, 
              product_Current_Stock: item.product_Current_Stock, 
              product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
              product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
              product_Price: item.product_Price,
              order_quantity: item.quantity,
              backorder_quantity: item.backorder_quantity,
            })),
          };
    
          await backorderService.create(backorderData);

          Swal.fire(
            'Approved!',
            'Backorder has been approved.',
            'success'
          ).then(() => {
            navigate("/back-order", {
              state: { showSnackbar: true, snackbarMessage: "Backorder approved successfully!" },
            });
          });
        }
      });
    } catch (error) {
      console.error("Error create Backorder:", error);
      Swal.fire(
        'Error!',
        'Something went wrong while approving the backorder.',
        'error'
      );
    }
  };

  return (
    <>
      <div className="right-content w-100">
        {/* First Card - Supplier Details */}
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Edit Backorder</h5>
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
                      <input type="text" name="" value={backorder?.supplier?.company_name || ""} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>EMAIL</h6>
                      <input type="text" name="" value={backorder?.supplier?.company_email || ""} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>PHONE NUMBER</h6>
                      <input type="text" name="" value={backorder?.supplier?.person_number || ""} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>SUPPLIER ADDRESS</h6>
                      <input type="text" name="" value={`${backorder?.supplier?.company_city}, ${backorder?.supplier?.company_province}, ${backorder?.supplier?.company_country}, ${backorder?.supplier?.company_zipCode}`} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>CREATED DATE</h6>
                      <input type="text" name="brand" value={new Date().toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric",})}  disabled/>
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
                  <th style={{ width: "300px" }}>PRODUCT</th>
                  <th>ORDERED QUANTITY</th>
                  <th>BACKORDER QUANTITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {backorder?.items?.map((product, index) => {
                  
                  return (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="info pl-3">
                        <h6>{product.product_Name}</h6>
                        <p>{product.product_Description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {
                        product.quantity
                    }
                    </td>
                  <td>
                    <TextField
                        fullWidth
                        type="number"
                        value={product.backorder_quantity}
                        disabled
                    /> 
                  </td>

                  <td>{product.status}</td>
                </tr>

                  );
                })}
              </tbody>
            </table>
            <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
                <Grid item>
                  <Button variant="outlined" color="secondary" onClick={() => handleCancel()}>
                    Cancel
                  </Button>
                </Grid>

                <Grid item>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleGenerate()}
                      >
                        Approve
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

export default EditBackOrder;
