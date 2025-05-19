import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import GeneratePO from "../../components/Modals/GeneratePO";
import { MdDelete, MdAddAPhoto } from "react-icons/md";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";
import grnService from "../../services/grnService";
import backorderService from "../../services/backorderService";
import rmaService from "../../services/rmaService";
import Swal from "sweetalert2";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from '@mui/material/CircularProgress';

const EditRMA = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const { selectedRMA } = state || {};

  const [rma, setRMA] = useState(selectedRMA || {});
  const [reasons, setReasons] = useState({});
  const [reasonErrors, setReasonErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [imageUploads, setImageUploads] = useState({});
  const [uploadLoading, setUploadLoading] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
        // Initialize reasons from existing data
    const initialReasons = {};
    rma?.items?.forEach(item => {
      initialReasons[item._id] = item.reason || '';
    });
    setReasons(initialReasons);
  }, []);

  const handleReasonChange = (productId, value) => {
    setReasons(prev => ({
      ...prev,
      [productId]: value
    }));

    setReasonErrors(prev => ({
      ...prev,
      [productId]: !value.trim() ? "Reason is required" : ""
    }));
  };

  const handleImageUpload = async (event, itemIndex) => {
    const files = Array.from(event.target.files);
    setUploadLoading(prev => ({ ...prev, [itemIndex]: true }));

    try {
      const updatedRMA = await rmaService.uploadProofImages(rma._id, itemIndex, files);
      
      // Update the local state with the new images
      setRMA(updatedRMA);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Images uploaded successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload images. Please try again.',
      });
    } finally {
      setUploadLoading(prev => ({ ...prev, [itemIndex]: false }));
    }
  };

  const handleDeleteImage = async (itemIndex, imageIndex) => {
    try {
      // Remove image from the item's proof_images array
      const updatedItems = [...rma.items];
      updatedItems[itemIndex].proof_images.splice(imageIndex, 1);
      
      const response = await rmaService.update(rma._id, {
        ...rma,
        items: updatedItems
      });

      setRMA(response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Image deleted successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete image. Please try again.',
      });
    }
  };

  const isFormValid = () => {
    return rma?.items?.every(item => {
      const hasReason = reasons[item._id] && reasons[item._id].trim();
      const hasImages = (selectedImages[item._id]?.length > 0) || 
                       (item.proof_images && item.proof_images.length > 0);
      return hasReason && hasImages;
    });
  };

  const handleCancel = async () => {
    navigate("/rma", {
      state: { showSnackbar: true, snackbarMessage: "RMA canceled successfully!" },
    });
  };

  const handleSend = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to approve this RMA?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!'
      });

      if (result.isConfirmed) {
        // Create FormData to handle file uploads
        const formData = new FormData();
        
        const rmaData = {
          user_id: rma?.user_id?._id,
          supplier_id: rma?.supplier_id?._id,
          po_id: rma?.po_id?._id,
          grn_id: rma?.grn_id?._id,
          return_status: "Approved",
          items: rma?.items.map((item) => ({
            ...item,
            reason: reasons[item._id]
          })),
        };

        formData.append('data', JSON.stringify(rmaData));

        // Append images for each product
        Object.entries(selectedImages).forEach(([productId, files]) => {
          files.forEach(file => {
            formData.append('proof_images', file);
          });
          formData.append('product_id', productId);
        });

        await rmaService.update(rma._id, formData);

        navigate("/rma", {
          state: { showSnackbar: true, snackbarMessage: "RMA approved successfully!" },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update the RMA'
      });
    }
  };

  return (
    <>
      <div className="right-content w-100">
        {/* First Card - Supplier Details */}
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Edit Return Merchandise Authorization</h5>
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
                      <input type="text" name="" value={rma?.supplier?.company_name || ""} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>EMAIL</h6>
                      <input type="text" name="" value={rma?.supplier.company_email || ""} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>PHONE NUMBER</h6>
                      <input type="text" name="" value={rma?.supplier?.person_number || ""} disabled />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>SUPPLIER ADDRESS</h6>
                      <input type="text" name="" value={`${rma?.supplier?.company_city}, ${rma?.supplier?.company_province}, ${rma?.supplier?.company_country}, ${rma?.supplier?.company_zipCode}`} disabled />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <h6>CREATED DATE</h6>
                      <input type="text" name="brand" value={new Date(rma.createdAt).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric",})}  disabled/>
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
                  <th>CURRENT STOCK</th>
                  <th>RETURN QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>REASON</th>
                  <th>PROOF IMAGES</th>
                </tr>
              </thead>
              <tbody>
                {rma?.items?.map((product, index) => (
                  <tr key={product._id}>
                    <td>
                      <div className="d-flex align-items-center productBox">
                        <div className="info pl-3">
                          <h6>{product.product_Name}</h6>
                          <p>{product.product_Description}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.product_Current_Stock}</td>
                    <td>
                      <TextField
                        fullWidth
                        type="number"
                        value={product.return_quantity}
                        disabled
                      /> 
                    </td>
                    <td>{product.product_Price}</td>
                    <td>
                      <TextField
                        fullWidth
                        type="text"
                        placeholder="Enter your reason"
                        value={reasons[product._id] || ''}
                        onChange={(e) => handleReasonChange(product._id, e.target.value)}
                        error={!!reasonErrors[product._id]}
                        helperText={reasonErrors[product._id]}
                      /> 
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Image Upload Button */}
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`upload-image-${index}`}
                          type="file"
                          multiple
                          onChange={(e) => handleImageUpload(e, index)}
                        />
                        <label htmlFor={`upload-image-${index}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={uploadLoading[index] ? <CircularProgress size={20} /> : <PhotoCamera />}
                            disabled={uploadLoading[index]}
                          >
                            Upload Images
                          </Button>
                        </label>

                        {/* Display Uploaded Images */}
                        {product.proof_images && product.proof_images.length > 0 && (
                          <ImageList sx={{ width: 200, height: 150 }} cols={2} rowHeight={100}>
                            {product.proof_images.map((image, imgIndex) => (
                              <ImageListItem 
                                key={imgIndex}
                                sx={{ 
                                  position: 'relative',
                                  '&:hover .delete-icon': {
                                    opacity: 1
                                  }
                                }}
                              >
                                <img
                                  src={image.url}
                                  alt={`Proof ${imgIndex + 1}`}
                                  loading="lazy"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => window.open(image.url, '_blank')}
                                />
                                <IconButton
                                  className="delete-icon"
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                                    }
                                  }}
                                  onClick={() => handleDeleteImage(index, imgIndex)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ImageListItem>
                            ))}
                          </ImageList>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outlined" color="secondary" onClick={() => handleCancel()}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSend()}
                disabled={!isFormValid()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRMA;
