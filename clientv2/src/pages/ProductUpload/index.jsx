import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import { IoCloseSharp } from "react-icons/io5";
import CustomizedSnackbars from "../../components/SnackBar";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FaRegImages } from "react-icons/fa";

import productService from "../../services/productService";
import supplierService from "../../services/supplierService";

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const ProductUpload = () => {
  const [categoryVal, setcategoryVal] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [product, setProduct] = useState({
    supplier_id: "",
    name: "",
    description: "",
    category: "",
    price: 0,
    current_stock: 0,
    minimum_stock_level: 0,
    maximum_stock_level: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const handleChangeCategory = (event) => {
    setcategoryVal(event.target.value);
    setProduct({ ...product, category: event.target.value})
  };

  const handleSubmit =  async (e) => {
    e.preventDefault();

    const formData = {
      supplier_id: product.supplier_id,
      product_Name: product.name,
      product_Description: product.description,
      product_Category: product.category,
      product_Price: product.price,
      product_Current_Stock: product.current_stock,
      product_Minimum_Stock_Level: product.minimum_stock_level,
      product_Maximum_Stock_Level: product.maximum_stock_level
    }

    try {
      await productService.create(formData);
      setOpenSnackbar(true);

      setProduct({ name: "", description: "", category: "", price: 0, current_stock: 0, minimum_stock_level: 0, maximum_stock_level: 0});
    } catch (error) {
      alert(error.message);
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 res-col">
          <h5 className="mb-0">Create Product</h5>
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component="a"
              label="Products"
              href="#"
              deleteIcon={<ExpandMoreIcon />}
            />
            <StyledBreadcrumb
              label="Product Upload"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Basic Information</h5>

                <div className="form-group">
                  <h6>PRODUCT NAME</h6>
                  <input type="text" name="name" value={product.name} 
                    onChange={(e) =>setProduct({...product, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <h6>DESCRIPTION</h6>
                  <textarea rows={5} cols={10} name="description" value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                  />
                </div>

                <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <h6>SUPPLIER</h6>
                        <Select
                          value={product.supplier_id}
                          onChange={(e) => setProduct({...product, supplier_id: e.target.value})}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          className="w-100"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {suppliers.map((supplier) => (
                            <MenuItem key={supplier._id} value={supplier._id}>
                              {supplier.company_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </div>
                    </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>CATEGORY</h6>
                      <Select
                        value={categoryVal}
                        onChange={handleChangeCategory}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        <MenuItem className="text-capitalize" value="School Supply">
                          School Supply
                        </MenuItem>

                        <MenuItem className="text-capitalize" value="Book">
                          Book
                        </MenuItem>

                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>PRICE</h6>
                      <input type="number" name="price" value={product.price}
                        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>CURRENT STOCK </h6>
                      <input type="number" name="current_stock" value={product.current_stock}
                        onChange={(e) => setProduct({ ...product, current_stock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>MINIMUM STOCK </h6>
                      <input type="number" name="minimum_stock_level" value={product.minimum_stock_level}
                        onChange={(e) => setProduct({ ...product, minimum_stock_level: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>MAXIMUM STOCK </h6>
                      <input type="number" name="maximum_stock_level" value={product.maximum_stock_level}
                        onChange={(e) => setProduct({ ...product, maximum_stock_level: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                  <FaCloudUploadAlt /> &nbsp; {"Add Product"}
                </Button>

              </div>
            </div>
          </div>
        </form>
      </div>

      <CustomizedSnackbars
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        message="New product added successfully!"
      />
    </>
  );
};

export default ProductUpload;
