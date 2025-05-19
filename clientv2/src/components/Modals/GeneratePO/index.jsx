import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";

import { generateCustomProductId } from "../../../customize/customizeId";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 3,
  width: "80%",
  maxWidth: "1000px",
};

export default function GeneratePO({
  open,
  handleClose,
  selectedSupplierProducts = {}, 
}) {
  const [selectedProducts, setSelectedProducts] = React.useState([]);
  const navigate = useNavigate();

  const lowStockProducts = selectedSupplierProducts?.lowStockProducts || [];

  const isProductSelected = (id) =>
    selectedProducts.some((p) => p.product_Id === id);

  const handleCheckboxChange = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.product_Id === product.product_Id);
      return exists
        ? prev.filter((p) => p.product_Id !== product.product_Id)
        : [...prev, product];
    });
  };

  const handleGenerate = () => {
    console.log("Supplier information: ", selectedSupplierProducts);
    console.log("Selected product: ", selectedProducts);
    navigate("/generate-purchase-order", {
      state: { selectedSupplierProducts, selectedProducts },
    });
    handleClose();
  };

  React.useEffect(() => {
    if (open && lowStockProducts.length > 0) {
      setSelectedProducts(lowStockProducts);
    } else {
      setSelectedProducts([]);
    }
  }, [open, selectedSupplierProducts]);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" sx={{ mb: 2 }}>
          Low Stock Products
        </Typography>
        {lowStockProducts.length === 0 ? (
          <Typography>No low stock products available.</Typography>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>PRODUCT ID</th>
                  <th>PRODUCT NAME</th>
                  <th>CATEGORY</th>
                  <th>CURRENT STOCK</th>
                  <th>REORDER LEVEL</th>
                  <th>UNIT PRICE</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product, index) => {
                  const stockPercentage =
                  (product.product_Current_Stock / product.product_Minimum_Stock_Level) * 100;

                  return (
                    <tr key={product.product_Id || index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Checkbox
                            checked={isProductSelected(product.product_Id)}
                            onChange={() => handleCheckboxChange(product)}
                          />
                          <span>
                            {product.product_Id}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="info">
                            <h6>{product.product_Name}</h6>
                            <p>{product.product_Description || "No description"}</p>
                          </div>
                        </div>
                      </td>
                      <td>{product.product_Category}</td>
                      <td>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {product.product_Current_Stock} / {product.product_Minimum_Stock_Level}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={stockPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            bgcolor: "#f5f5f5",
                          }}
                        />
                      </td>
                      <td>{product.product_Minimum_Stock_Level}</td>
                      <td>Php {product.product_Price.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedProducts.length === 0}
            onClick={handleGenerate}
          >
            Generate
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
}
