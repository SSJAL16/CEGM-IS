import React, { useEffect, useState } from "react";
import styles from "../Storage.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateProducts = () => {
  const [newProduct, setNewProduct] = useState({
    product_Name: "",
    product_Description: "",
    product_Category: "",
    product_Price: "",
    product_Unit: "", // New field
    product_Current_Stock: "0",
    product_Minimum_Stock_Level: "",
    product_Maximum_Stock_Level: "",
    product_Supplier: "",
    product_Shelf_Life: "",
    product_Profit_Margin: "",
  });

  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [action, setAction] = useState(""); // This will store the action type (add, edit, delete)
  const [suppliers, setSuppliers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch suppliers data on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/suppliers");

        // Check for the new response structure
        if (
          response.data &&
          response.data.suppliers &&
          Array.isArray(response.data.suppliers)
        ) {
          const companyNames = response.data.suppliers.map((supplier) => ({
            id: supplier._id,
            company_name: supplier.company_name,
          }));
          setSuppliers(companyNames);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setSuppliers([]);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
      }
    };

    fetchSuppliers();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/category/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow empty value (for clearing inputs)
    if (value === "") {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
      setError(""); // Clear any existing errors
      return;
    }

    // Example regex for validating fields
    let validValue = value;
    switch (name) {
      case "product_Name":
        const nameRegex = /^[A-Za-z0-9\s]+$/;
        if (!nameRegex.test(value)) {
          setError(
            "Product Name can only contain letters, numbers, and spaces."
          );
          return;
        }
        break;

      case "product_Description":
        const descriptionRegex =
          /^[A-Za-z][A-Za-z0-9\s\-\_\#\$\%\&\!\+\=\(\)]*$/;

        if (!descriptionRegex.test(value)) {
          setError(
            "Description must start with a letter and may contain numbers and symbols."
          );
          return;
        }
        break;

      case "product_Price":
        const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
        if (!priceRegex.test(value)) {
          setError(
            "Price must be a positive number with up to two decimal places."
          );
          return;
        }
        break;

      case "product_Current_Stock":
      case "product_Minimum_Stock_Level":
      case "product_Maximum_Stock_Level":
        const stockRegex = /^[0-9]+$/;
        if (!stockRegex.test(value)) {
          setError("Stock levels must be valid numbers.");
          return;
        }
        break;

      case "product_Shelf_Life":
        const shelfLifeRegex = /^[0-9]+(\.[0-9]+)?$/; // Only numbers, optionally with a decimal point
        if (!shelfLifeRegex.test(value)) {
          setError("Shelf Life must be a valid number.");
          return;
        }
        break;

      case "product_Profit_Margin":
        const profitMarginRegex = /^[0-9]+(\.[0-9]+)?$/;
        if (!profitMarginRegex.test(value)) {
          setError("Profit Margin must be a valid number.");
          return;
        }

        const marginValue = parseFloat(value);
        if (marginValue > 5) {
          setError("Profit Margin cannot exceed 5%.");
          return;
        }

        break;

      default:
        break;
    }

    // If validation passed, update the state
    setNewProduct((prev) => {
      const updatedProduct = { ...prev, [name]: validValue };

      // Automatically update Maximum Stock Level based on Minimum Stock Level
      if (name === "product_Minimum_Stock_Level") {
        const minimum = parseInt(value) || 0;
        updatedProduct.product_Maximum_Stock_Level = (minimum * 4).toString();
      }

      // Prevent Maximum Stock Level from going below Minimum Stock Level
      if (name === "product_Maximum_Stock_Level") {
        const minimumStockLevel =
          parseInt(updatedProduct.product_Minimum_Stock_Level) || 0;
        const maximumStockLevel = parseInt(value) || 0;

        // Check if max stock level is less than min stock level
        if (maximumStockLevel < minimumStockLevel) {
          setError(
            "Maximum Stock Level cannot be less than Minimum Stock Level."
          );
          return prev; // Return previous state to prevent the update
        } else {
          updatedProduct.product_Maximum_Stock_Level = maximumStockLevel;
          setError(""); // Clear the error if the value is valid
        }
      }

      return updatedProduct;
    });
  };

  const handleAddProduct = () => {
    setIsSubmitted(true);

    // Check if any required fields are empty
    for (const key in newProduct) {
      if (newProduct[key] === "" || newProduct[key] === undefined) {
        setError("All fields are required!");
        return;
      }
    }

    // Validate profit margin and calculate price with margin
    if (newProduct.product_Profit_Margin !== "") {
      const margin = parseFloat(newProduct.product_Profit_Margin);
      const price = parseFloat(newProduct.product_Price);
      if (!isNaN(margin) && !isNaN(price)) {
        const addedMargin = price + (price * margin) / 100;
        newProduct.product_Price = addedMargin.toFixed(2); // Update the price with margin
      }
    }

    // Check if Minimum Stock Level is lower than Maximum Stock Level
    if (
      parseInt(newProduct.product_Minimum_Stock_Level) >=
      parseInt(newProduct.product_Maximum_Stock_Level)
    ) {
      setError("Minimum Stock Level must be lower than Maximum Stock Level.");
      return;
    }

    let productStatus;
    if (
      newProduct.product_Current_Stock < newProduct.product_Minimum_Stock_Level
    ) {
      productStatus = "Low Stock";
    } else if (
      newProduct.product_Current_Stock > newProduct.product_Maximum_Stock_Level
    ) {
      productStatus = "Overstocked";
    } else {
      productStatus = "In Stock";
    }

    // Add the new product to the product list
    setProductList((prevList) => [
      ...prevList,
      { ...newProduct, product_Status: productStatus },
    ]);

    // Reset the form after adding the product
    resetForm();

    setError(""); // Clear the error if product is added
  };

  const handleRemoveProduct = (index) => {
    setProductList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleCreateProducts = async () => {
    try {
      // Step 1: Group products by name + description and calculate totals
      const productGroups = new Map();

      productList.forEach((product) => {
        const key = `${product.product_Name.toLowerCase()}|${product.product_Description.toLowerCase()}`;

        if (productGroups.has(key)) {
          const existingGroup = productGroups.get(key);
          // Sum current stock
          existingGroup.totalCurrentStock +=
            parseInt(product.product_Current_Stock) || 0;
          // Sum maximum stock
          existingGroup.totalMaxStock +=
            parseInt(product.product_Maximum_Stock_Level) || 0;
          // Keep track of all products in this group
          existingGroup.products.push(product);
        } else {
          productGroups.set(key, {
            totalCurrentStock: parseInt(product.product_Current_Stock) || 0,
            totalMaxStock: parseInt(product.product_Maximum_Stock_Level) || 0,
            products: [product],
          });
        }
      });

      // Step 2: Apply the totals to all products in each group
      const updatedProductList = [];

      productGroups.forEach((group) => {
        group.products.forEach((product) => {
          updatedProductList.push({
            ...product,
            product_Current_Stock: group.totalCurrentStock,
            product_Maximum_Stock_Level: group.totalMaxStock,
            // Update status based on new totals
            product_Status:
              group.totalCurrentStock <
              parseInt(product.product_Minimum_Stock_Level)
                ? "Low Stock"
                : group.totalCurrentStock > group.totalMaxStock
                ? "Overstocked"
                : "In Stock",
          });
        });
      });

      // Step 3: Send products to backend
      const response = await axios.post(
        "http://localhost:3000/api/storage-products/bulk",
        updatedProductList
      );

      if (response.status === 201) {
        const { insertedOrUpdatedProducts } = response.data;

        // Step 4: Create manual adjustments
        const manualAdjustments = updatedProductList.map((product, index) => {
          const product_ID = insertedOrUpdatedProducts[index];
          return {
            product_ID,
            adj_Description: product.product_Description,
            adj_Category: product.product_Category,
            adj_Quantity: product.product_Current_Stock,
            adj_Price: product.product_Price,
            adj_Supplier: product.product_Supplier,
            adj_Shelf_Life: product.product_Shelf_Life,
            adj_Adjustment_Type: product_ID ? "Updated" : "Added",
          };
        });

        // Step 5: Send adjustments to backend
        const manualAdjustmentResponse = await axios.post(
          "http://localhost:3000/api/manualAdjustment",
          manualAdjustments
        );

        if (manualAdjustmentResponse.status === 201) {
          await createStockMovements(manualAdjustmentResponse.data);
          setProductList([]);
          setShowModal(false);
          setAction("add");
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      setError(
        "Could not create products or stock movements. Please try again."
      );
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const createStockMovements = async (manualAdjustments) => {
    try {
      const stockMovements = manualAdjustments.map((adjustment) => ({
        product_ID: adjustment.product_ID,
        movement_ID: adjustment.manualAdjust_ID,
        adj_Description: adjustment.adj_Description,
        adj_Category: adjustment.adj_Category,
        adj_Quantity: adjustment.adj_Quantity,
        adj_Price: adjustment.adj_Price,
        adj_Adjustment_Type: "Added",
      }));

      await axios.post(
        "http://localhost:3000/api/stockMovement/bulk",
        stockMovements
      );
    } catch (error) {
      console.error("Error creating stock movements:", error);
    }
  };

  const resetForm = () => {
    setNewProduct({
      product_Name: "",
      product_Description: "",
      product_Category: "",
      product_Price: "",
      product_Unit: "", // Reset to empty
      product_Current_Stock: "0",
      product_Minimum_Stock_Level: "",
      product_Maximum_Stock_Level: "",
      product_Supplier: "",
      product_Shelf_Life: "",
      product_Profit_Margin: "",
    });
    setIsSubmitted(false);
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-4 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">Storage</h5>
            </div>
            <button
              className="btn btn-secondary ms-auto"
              onClick={() => window.history.back()}
              style={{ whiteSpace: "nowrap" }}
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="card shadow-sm p-4 mb-4">
          <h5 className="card-title">
            <i className="bi bi-plus-circle me-2"></i>Add New Products
          </h5>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3">
              {/* Category Field */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <select
                    name="product_Category"
                    className="form-control"
                    value={newProduct.product_Category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category.product_Category}
                      >
                        {category.product_Category}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="product_Category">
                    Select Category <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Category && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Product Name Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Name"
                    type="text"
                    name="product_Name"
                    className="form-control"
                    value={newProduct.product_Name}
                    onChange={handleInputChange}
                    placeholder="Product Name"
                    required
                  />
                  <label htmlFor="product_Name">
                    Product Name <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Name && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Specification Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Description"
                    type="text"
                    name="product_Description"
                    className="form-control"
                    value={newProduct.product_Description}
                    onChange={handleInputChange}
                    placeholder="Specification"
                    required
                  />
                  <label htmlFor="product_Description">
                    Specification <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Description && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Supplier Field */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <select
                    name="product_Supplier"
                    className="form-control"
                    value={newProduct.product_Supplier}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {Array.isArray(suppliers) &&
                      suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.company_name}>
                          {supplier.company_name}
                        </option>
                      ))}
                  </select>
                  <label htmlFor="product_Supplier">
                    Select Supplier <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Supplier && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Minimum Stock Level Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Minimum_Stock_Level"
                    type="number"
                    name="product_Minimum_Stock_Level"
                    className="form-control"
                    value={newProduct.product_Minimum_Stock_Level}
                    onChange={handleInputChange}
                    placeholder="Minimum Stock Level"
                    required
                  />
                  <label htmlFor="product_Minimum_Stock_Level">
                    Minimum Stock Level <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Minimum_Stock_Level && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Maximum Stock Level Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Maximum_Stock_Level"
                    type="number"
                    name="product_Maximum_Stock_Level"
                    className="form-control"
                    value={newProduct.product_Maximum_Stock_Level}
                    onChange={handleInputChange}
                    placeholder="Maximum Stock Level"
                    required
                  />
                  <label htmlFor="product_Maximum_Stock_Level">
                    Maximum Stock Level <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Maximum_Stock_Level && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Price Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Price"
                    type="text"
                    name="product_Price"
                    className="form-control"
                    value={newProduct.product_Price}
                    onChange={handleInputChange}
                    placeholder="Price per Unit(e.g box,pcs,rim)"
                    required
                  />
                  <label htmlFor="product_Price">
                    Price per Unit(e.g box,pcs,rim){" "}
                    <span style={{ color: "red" }}>*</span>
                    {isSubmitted && !newProduct.product_Price && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>
              {/* Unit Field */}
              <div className="col-md-2 position-relative">
                <div className="form-floating">
                  <select
                    id="product_Unit"
                    name="product_Unit"
                    className="form-control"
                    value={newProduct.product_Unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="rim">rim</option>
                  </select>
                  <label htmlFor="product_Unit">
                    Unit <span style={{ color: "red" }}>*</span>
                  </label>
                </div>
              </div>

              {/* Shelf Life Field */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    name="product_Shelf_Life"
                    className="form-control"
                    value={newProduct.product_Shelf_Life}
                    onChange={handleInputChange}
                    placeholder="Shelf Life (in days, months, etc.)"
                    required
                  />
                  <label htmlFor="product_Shelf_Life">
                    Shelf Life (in days) <span style={{ color: "red" }}>*</span>
                    {isSubmitted && newProduct.product_Shelf_Life === "" && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Profit Margin Field */}
              <div className="col-md-6 position-relative">
                <div className="form-floating">
                  <input
                    id="product_Profit_Margin"
                    type="number"
                    name="product_Profit_Margin"
                    className="form-control"
                    value={newProduct.product_Profit_Margin}
                    onChange={handleInputChange}
                    placeholder="Profit Margin (%)"
                  />
                  <label htmlFor="product_Profit_Margin">
                    Profit Margin (%)<span style={{ color: "red" }}>*</span>
                  </label>
                </div>
              </div>

              {/* Display Error Message */}
              {error && (
                <div className="text-danger mt-2">
                  <i className="bi bi-exclamation-triangle"></i> {error}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
              <button
                type="submit"
                className="btn btn-success"
                onClick={() => setShowModal(true)}
                disabled={productList.length === 0}
              >
                Save All Products
              </button>
            </div>
          </form>
        </div>

        {/* Success Confirmation Modal */}
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          centered
        >
          <Modal.Header>
            <Modal.Title className="text-success">
              <i className="bi bi-check-circle-fill me-2"></i> Success!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>
              The products have been successfully added to products and stock
              movement.
            </p>
            <div style={{ fontSize: "2em", color: "#28a745" }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button
              variant="success"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>Confirm Product Creation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to create the selected products?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCreateProducts}>
              Confirm
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Product List Preview */}
        <div className="card shadow-sm p-4 mt-4">
          <h5 className="card-title">Products Preview</h5>
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product, index) => (
                <tr key={index}>
                  <td>{product.product_Name}</td>
                  <td>{product.product_Category}</td>
                  <td>{product.product_Price}</td>
                  <td>{product.product_Current_Stock}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CreateProducts;
