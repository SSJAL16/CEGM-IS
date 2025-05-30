import { FaExclamationTriangle, FaWarehouse } from "react-icons/fa"; // Import the icons
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Menu from "@mui/material/Menu";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardBox from "../Dashboard/components/dashboardBox";
import Checkbox from "@mui/material/Checkbox";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

import React, { useEffect, useState } from "react";
import styles from "./Storage.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button, Dropdown } from "react-bootstrap";
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";
import ConfirmationModal from "./ConfirmationModal/ConfirmationModal";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Storage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deleteAction, setDeleteAction] = useState(""); // "archive" or "delete"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchCategory, setSearchCategory] = useState(""); // For Category search
  const [selectedProducts, setSelectedProducts] = useState([]); // State for Selected Products that will be deleted
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [overStockCount, setOverStockCount] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Unified search term
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedFirstname = localStorage.getItem("firstname");
    const storedLastname = localStorage.getItem("lastname");
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (storedUsername && storedFirstname && storedLastname && storedEmail) {
      setUser({
        username: storedUsername,
        firstname: storedFirstname,
        lastname: storedLastname,
        email: storedEmail,
        userId: userId,
      });
    }
  }, []);
  const handleGeneratePDF = () => {
    if (filteredProducts.length === 0) {
      alert("No products to generate a report for.");
      return;
    }

    // Create a new jsPDF instance with landscape orientation
    const doc = new jsPDF({
      orientation: "landscape", // Set orientation to landscape
    });

    // Add the company logo (adjust the path based on your project structure)
    const logoPath = "/cokins-logo.png"; // Root-relative path to the logo
    const logoImg = new Image();
    logoImg.src = logoPath;

    logoImg.onload = () => {
      // Add the logo to the PDF (positioning and size)
      doc.addImage(logoImg, "PNG", 90, 5, 25, 25); // (image, format, x, y, width, height)

      // Set up title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Products Report", 120, 20); // Adjusted position due to the logo
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Generated by: Christian Calagui`, 14, 40); //doc.text(`Generated by: ${user.firstname} ${user.lastname}`, 14, 40);
      doc.text(`Email: Christiancalagui@gmail.com`, 14, 50); //doc.text(`Email: ${user.email}`, 14, 50);

      // Add the report generation date
      const currentDate = new Date().toLocaleDateString(); // Get the current date in local format
      doc.text(`Report generated on: ${currentDate}`, 14, 60);

      // Define table headers and data
      const tableColumn = [
        "Product ID",
        "Name",
        "Description",
        "Category",
        "Current Stock",
        "Price",
        "Status",
      ];
      const tableRows = filteredProducts.map((product) => [
        product.product_Id,
        product.product_Name,
        product.product_Description,
        product.product_Category,
        product.product_Current_Stock,
        product.product_Price,
        product.product_Status,
      ]);

      // Define color scheme or tokens for header and body
      const themeColors = {
        headerBackground: "#331373", // Dark purple (example token)
        headerTextColor: "#FFFFFF", // White text
        bodyBackground: "#F8F9FA", // Light background for body (example token)
        bodyTextColor: "#333333", // Dark text for body
      };

      // Add table to the PDF
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70, // Adjust start position to leave space for user details and date
        theme: "grid", // Optional: Set a table theme
        headStyles: {
          fillColor: [
            parseInt(themeColors.headerBackground.slice(1, 3), 16),
            parseInt(themeColors.headerBackground.slice(3, 5), 16),
            parseInt(themeColors.headerBackground.slice(5, 7), 16),
          ], // Convert hex to RGB
          textColor: [
            parseInt(themeColors.headerTextColor.slice(1, 3), 16),
            parseInt(themeColors.headerTextColor.slice(3, 5), 16),
            parseInt(themeColors.headerTextColor.slice(5, 7), 16),
          ], // Convert hex to RGB
        },
        bodyStyles: {
          fontSize: 10, // Adjust font size for better fit
          cellPadding: 2, // Adjust cell padding
          fillColor: [
            parseInt(themeColors.bodyBackground.slice(1, 3), 16),
            parseInt(themeColors.bodyBackground.slice(3, 5), 16),
            parseInt(themeColors.bodyBackground.slice(5, 7), 16),
          ], // Light body background
          textColor: [
            parseInt(themeColors.bodyTextColor.slice(1, 3), 16),
            parseInt(themeColors.bodyTextColor.slice(3, 5), 16),
            parseInt(themeColors.bodyTextColor.slice(5, 7), 16),
          ], // Dark body text
        },
        margin: { top: 20 }, // Margin top for table
        tableWidth: "auto", // Auto width for columns
      });

      // Save the PDF
      doc.save("filtered_products_report_landscape.pdf");
    };

    // Handle image load error
    logoImg.onerror = () => {
      alert("Error loading logo. Please check the logo path.");
    };
  };

  const openSuccessModal = (message) => {
    setSuccessModalMessage(message);
    setSuccessModalVisible(true);
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category) => {
    setSearchCategory(category);
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://cegm-backend.onrender.com/api/category");
        setCategories(response.data);
      } catch (error) {
        setError("Could not fetch categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const [newProduct, setNewProduct] = useState({
    product_Category: "",
    product_Description: "",
    product_Current_Stock: "",
    product_Quantity: "",
    product_Price: "",
    product_Minimum_Stock_Level: "",
    product_Maximum_Stock_Level: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://cegm-backend.onrender.com/api/storage-products"
        );
        setProducts(response.data);
      } catch (error) {
        setError("Could not fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      // Determine the status based on quantity levels
      let productStatus;
      if (
        newProduct.product_Current_Stock <
        newProduct.product_Minimum_Stock_Level
      ) {
        productStatus = "Low Stock";
      } else if (
        newProduct.product_Current_Stock >
        newProduct.product_Maximum_Stock_Level
      ) {
        productStatus = "Overstocked";
      } else {
        productStatus = "In Stock";
      }

      const productData = { ...newProduct, product_Status: productStatus };

      if (isEditMode) {
        const existingProduct = products.find(
          (product) => product._id === currentProductId
        );

        let updatedProductData = { ...newProduct };

        // If product_Quantity is set and is a valid number, update stock
        if (
          newProduct.product_Quantity !== "" &&
          !isNaN(newProduct.product_Quantity)
        ) {
          updatedProductData.product_Current_Stock =
            parseInt(existingProduct.product_Current_Stock) +
            parseInt(newProduct.product_Quantity);

          // Add the updated status after stock change
          if (
            updatedProductData.product_Current_Stock <
            updatedProductData.product_Minimum_Stock_Level
          ) {
            updatedProductData.product_Status = "Low Stock";
          } else if (
            updatedProductData.product_Current_Stock >
            updatedProductData.product_Maximum_Stock_Level
          ) {
            updatedProductData.product_Status = "Overstocked";
          } else {
            updatedProductData.product_Status = "In Stock";
          }
        } else {
          // If no quantity was provided, retain existing stock
          updatedProductData.product_Current_Stock =
            existingProduct.product_Current_Stock;
          updatedProductData.product_Status = productStatus;
        }

        // Update product in DB
        response = await axios.put(
          `https://cegm-backend.onrender.com/api/storage-products/${currentProductId}`,
          updatedProductData
        );

        // Update local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === currentProductId ? response.data : product
          )
        );

        // If quantity was added, log the stock movement
        if (
          newProduct.product_Quantity !== 0 &&
          !isNaN(newProduct.product_Quantity)
        ) {
          await axios.post("https://cegm-backend.onrender.com/api/stockMovement", {
            product_ID: existingProduct.product_Id,
            adj_Description: existingProduct.product_Description,
            adj_Category: existingProduct.product_Category,
            adj_Quantity: newProduct.product_Quantity,
            adj_Price: existingProduct.product_Price,
            adj_Adjustment_Type: "Added",
          });
        }
      } else {
        // Create new product
        response = await axios.post(
          "https://cegm-backend.onrender.com/api/storage-products",
          productData
        );
        const createdProduct = response.data;
        setProducts((prevProducts) => [...prevProducts, createdProduct]);

        // Manual adjustment entry
        await axios.post("https://cegm-backend.onrender.com/api/manualAdjustment", {
          product_ID: createdProduct.product_Id,
          adj_Description: createdProduct.product_Description,
          adj_Category: createdProduct.product_Category,
          adj_Quantity: createdProduct.product_Current_Stock,
          adj_Price: createdProduct.product_Price,
          adj_Adjustment_Type: "Added",
        });

        // Stock movement entry
        await axios.post("https://cegm-backend.onrender.com/api/stockMovement", {
          product_ID: createdProduct.product_Id,
          adj_Description: createdProduct.product_Description,
          adj_Category: createdProduct.product_Category,
          adj_Quantity: createdProduct.product_Current_Stock,
          adj_Price: createdProduct.product_Price,
          adj_Adjustment_Type: "Added",
        });
      }

      openSuccessModal(
        isEditMode
          ? "Product successfully updated!"
          : "Product successfully added!"
      );
      handleModalClose();
      resetForm();
    } catch (error) {
      setError("Could not save product. Please try again.");
    }
  };

  const handleModalShow = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setCurrentProductId(product._id);
      setNewProduct({
        product_Category: product.product_Category,
        product_Description: product.product_Description,
        product_Current_Stock: product.product_Current_Stock,
        product_Quantity: product.product_Quantity,
        product_Price: product.product_Price,
        product_Minimum_Stock_Level: product.product_Minimum_Stock_Level,
        product_Maximum_Stock_Level: product.product_Maximum_Stock_Level,
      });
    } else {
      setIsEditMode(false);
      resetForm();
    }
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);
  const resetForm = () => {
    setNewProduct({
      product_Category: "",
      product_Description: "",
      product_Current_Stock: "",
      product_Quantity: "",
      product_Price: "",
      product_Minimum_Stock_Level: "",
      product_Maximum_Stock_Level: "",
    });
    setCurrentProductId(null);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = searchCategory
        ? product.product_Category
            .toLowerCase()
            .includes(searchCategory.toLowerCase())
        : true;

      const matchesSearchTerm =
        searchTerm &&
        ((product.product_Id || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          (product.product_Name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.product_Category || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.product_Description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus = (statusFilter) => {
        switch (statusFilter) {
          case "Low Stock":
            return (
              product.product_Current_Stock <
              product.product_Minimum_Stock_Level
            );
          case "In Stock":
            return (
              product.product_Current_Stock >=
                product.product_Minimum_Stock_Level &&
              product.product_Current_Stock <=
                product.product_Maximum_Stock_Level
            );
          case "Overstocked":
            return (
              product.product_Current_Stock >
              product.product_Maximum_Stock_Level
            );
          default:
            return true;
        }
      };

      const productDate = new Date(product.product_Date);
      const normalizedProductDate = new Date(productDate.setHours(0, 0, 0, 0));

      const normalizedDateFrom = new Date(dateFrom);
      normalizedDateFrom.setHours(0, 0, 0, 0);

      const normalizedDateTo = new Date(dateTo);
      normalizedDateTo.setHours(23, 59, 59, 999);

      const isWithinDateRange =
        (!dateFrom || normalizedProductDate >= normalizedDateFrom) &&
        (!dateTo || normalizedProductDate <= normalizedDateTo);

      return (
        matchesCategory &&
        (!searchTerm || matchesSearchTerm) &&
        matchesStatus(statusFilter) &&
        isWithinDateRange
      );
    })
    .sort((a, b) => new Date(b.product_Date) - new Date(a.product_Date)); // Sort newest first

  const handleSelectProduct = (id) => {
    setSelectedProducts((prevSelectedProducts) =>
      prevSelectedProducts.includes(id)
        ? prevSelectedProducts.filter((productId) => productId !== id)
        : [...prevSelectedProducts, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]); // Deselect all
    } else {
      setSelectedProducts(products.map((product) => product._id)); // Select all
    }
    setSelectAll(!selectAll);
  };

  const handleArchive = async () => {
    setDeleteAction("archive");
    confirmDelete("archive");
  };

  const handleDeletePermanently = async () => {
    setDeleteAction("delete");
    confirmDelete("delete");
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length > 0) {
      setShowDeleteModal(true); // Show confirmation modal
    }
  };
  const confirmDelete = async (action) => {
    try {
      const productsToArchive = products.filter((product) =>
        selectedProducts.includes(product._id)
      );

      if (action === "archive" && productsToArchive.length > 0) {
        await axios.post(
          "https://cegm-backend.onrender.com/api/archive/bulk",
          productsToArchive
        );
      }

      if (action === "delete" || action === "archive") {
        for (let id of selectedProducts) {
          await axios.delete(
            `https://cegm-backend.onrender.com/api/storage-products/${id}`
          );
        }
      }

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => !selectedProducts.includes(product._id)
        )
      );
      setSelectedProducts([]);
      setSelectAll(false);
      openSuccessModal(
        action === "archive"
          ? "Products archived and deleted successfully."
          : "Products permanently deleted successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to archive/delete products"
      );
    } finally {
      setShowDeleteModal(false);
      setDeleteAction("");
    }
  };

  const handleArchiveSelected = async () => {
    try {
      const productsToArchive = products.filter((product) =>
        selectedProducts.includes(product._id)
      );

      if (productsToArchive.length > 0) {
        await axios.post(
          "https://cegm-backend.onrender.com/api/archive/bulk",
          productsToArchive
        );
      }

      // Remove archived from current list
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => !selectedProducts.includes(product._id)
        )
      );

      setSelectedProducts([]);
      setSelectAll(false);
      openSuccessModal("Products archived successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to archive products");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handlePermanentDelete = async () => {
    try {
      for (let id of selectedProducts) {
        await axios.delete(`https://cegm-backend.onrender.com/api/storage-products/${id}`);
      }

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => !selectedProducts.includes(product._id)
        )
      );

      setSelectedProducts([]);
      setSelectAll(false);
      openSuccessModal("Products permanently deleted.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete products");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false); // Close modal without deleting
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://cegm-backend.onrender.com/api/storage-products"
        );
        const fetchedProducts = response.data;

        // Calculate totals
        let quantitySum = 0;
        let priceSum = 0;
        let lowStock = 0;
        let overStock = 0;

        fetchedProducts.forEach((product) => {
          // Ensure product_Quantity is a valid number
          const quantity = parseInt(product.product_Quantity, 10);
          const price = parseFloat(product.product_Price);

          if (!isNaN(quantity)) {
            quantitySum += quantity; // Only add valid numbers
          }

          if (!isNaN(price) && !isNaN(quantity)) {
            priceSum += quantity * price; // Only calculate price if quantity is valid
          }

          if (
            product.product_Current_Stock < product.product_Minimum_Stock_Level
          ) {
            lowStock += 1;
          }
          if (
            product.product_Current_Stock > product.product_Maximum_Stock_Level
          ) {
            overStock += 1;
          }
        });

        // Update products and totals
        setProducts(fetchedProducts);
        setTotalQuantity(quantitySum);
        setLowStockCount(lowStock);
        setOverStockCount(overStock);
      } catch (error) {
        setError("Could not fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-4 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">Product List</h5>
            </div>
            <div className="d-flex align-items-center">
              <Button
                onClick={handleDeleteSelected}
                className="btn btn-danger me-2"
                disabled={selectedProducts.length === 0}
              >
                Delete Selected
              </Button>
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                  Actions
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/Storage/CreateProducts">
                    Add Product
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/Storage/CreateCategory">
                    Category
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#e53935", "#ff8a80"]}
                title="Low Stock"
                value={lowStockCount}
              />
              <DashboardBox
                color={["#f9a825", "#fdd835"]}
                grow={true}
                title="Over Stock"
                value={overStockCount}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <div className="row cardFilters mt-3 align-items-end">
            {/* Search Bar */}
            <div className="col-md-3">
              <label style={{ fontSize: "1rem" }} className="form-label">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by Name,Description or ID"
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-control"
                style={{ borderRadius: 5 }}
              />
            </div>

            {/* Category Dropdown */}
            <div className="col-md-2">
              <label style={{ fontSize: "1rem" }} className="form-label">
                CATEGORY BY
              </label>
              <Dropdown className="w-100">
                <Dropdown.Toggle
                  id="dropdown-category"
                  className="w-100 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: "white", // White background
                    color: "#343a40", // Dark text color
                    borderRadius: 5, // Rounded corners
                    textAlign: "left", // Align text to the left
                    border: "1px solid rgba(169, 169, 169, 0.5)", // Gray border with 50% opacity
                  }}
                >
                  {selectedCategory || "None"}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{
                    border: "none",
                  }}
                >
                  <Dropdown.Item onClick={() => handleCategoryFilterChange("")}>
                    All Categories
                  </Dropdown.Item>
                  {categories.map((category) => (
                    <Dropdown.Item
                      key={category._id}
                      onClick={() =>
                        handleCategoryFilterChange(category.product_Category)
                      }
                    >
                      {category.product_Category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Status Dropdown */}
            <div className="col-md-2">
              <label style={{ fontSize: "1rem" }} className="form-label">
                SHOW BY
              </label>
              <Dropdown onSelect={(e) => setStatusFilter(e)} className="w-100">
                <Dropdown.Toggle
                  id="dropdown-status"
                  className="w-100 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: "white", // White background
                    color: "#343a40", // Dark text color
                    borderRadius: 5, // Rounded corners
                    textAlign: "left", // Align text to the left
                    border: "1px solid rgba(169, 169, 169, 0.5)", // Gray border with 50% opacity
                  }}
                >
                  {statusFilter || "None"}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{
                    border: "none",
                  }}
                >
                  <Dropdown.Item eventKey="">All</Dropdown.Item>
                  <Dropdown.Item eventKey="Low Stock">Low Stock</Dropdown.Item>
                  <Dropdown.Item eventKey="In Stock">In Stock</Dropdown.Item>
                  <Dropdown.Item eventKey="Overstocked">
                    Overstocked
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* From Date */}
            <div className="col-md-2">
              <label
                style={{ fontSize: "1rem" }}
                htmlFor="dateFrom"
                className="form-label"
              >
                From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-control"
                style={{
                  backgroundColor: "white", // White background
                  color: "#343a40", // Dark text color
                  borderRadius: 5, // Rounded corners
                  textAlign: "left", // Align text to the left
                  border: "1px solid rgba(169, 169, 169, 0.5)", // Gray border with 50% opacity
                }}
              />
            </div>

            {/* To Date */}
            <div className="col-md-2">
              <label
                style={{ fontSize: "1rem" }}
                htmlFor="dateTo"
                className="form-label"
              >
                To
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-control"
                style={{
                  backgroundColor: "white", // White background
                  color: "#343a40", // Dark text color
                  borderRadius: 5, // Rounded corners
                  textAlign: "left", // Align text to the left
                  border: "1px solid rgba(169, 169, 169, 0.5)", // Gray border with 50% opacity
                }}
              />
            </div>

            {/* Generate PDF Button */}
            <div className="col-md-1 d-flex justify-content-end">
              <Button
                onClick={handleGeneratePDF}
                className="btn btn-primary px-3"
                style={{ whiteSpace: "nowrap", fontSize: "18px" }} // <-- Font size increased
              >
                Generate
              </Button>
            </div>
          </div>

          {/* Product Table */}
          <ProductTable
            filteredProducts={filteredProducts}
            loading={loading}
            error={error}
            selectAll={selectAll}
            handleSelectAll={handleSelectAll}
            handleSelectProduct={handleSelectProduct}
            handleModalShow={handleModalShow}
            selectedProducts={selectedProducts}
          />
        </div>
        {/* Success Modal */}
        <Modal show={successModalVisible} onHide={closeSuccessModal} centered>
          <Modal.Header>
            <Modal.Title className="text-success">
              <i className="bi bi-check-circle-fill me-2"></i> Success!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>{successModalMessage}</p>
            <div style={{ fontSize: "2em", color: "#28a745" }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button variant="success" onClick={closeSuccessModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Product Modal */}
        <ProductModal
          showModal={showModal}
          handleModalClose={handleModalClose}
          isEditMode={isEditMode}
          newProduct={newProduct}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          categories={categories} // Pass categories here
        />
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>What would you like to do with the selected products?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleArchiveSelected}>
              Archive
            </Button>
            <Button variant="danger" onClick={handlePermanentDelete}>
              Delete Permanently
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default Storage;
