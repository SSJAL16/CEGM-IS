import React, { useEffect, useState } from "react";

import styles from "../Storage.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateProducts = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState({});
  const [newCategory, setNewCategory] = useState("");
  const [action, setAction] = useState(""); // To track whether it's an add, edit, or delete action
  const [deleteId, setDeleteId] = useState(null); // To track which category is being deleted
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // You can adjust this number

  // Fetch categories on component mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/category")
      .then((response) => {
        setCategories(response.data);
        setFilteredCategories(response.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Handle search query change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = categories.filter((category) =>
      category.product_Category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Handle pagination logic
  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle category actions
  const handleAddCategory = () => {
    setAction("add");
    setShowConfirmModal(true);
  };

  const handleEditCategory = () => {
    setAction("edit");
    setShowConfirmModal(true);
  };

  const confirmAddCategory = () => {
    axios
      .post("http://localhost:3000/api/category", {
        product_Category: newCategory,
      })
      .then((response) => {
        setCategories([...categories, response.data.data]);
        setFilteredCategories([...filteredCategories, response.data.data]);
        setShowModal(false);
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      })
      .catch((error) => console.error("Error adding category:", error));
  };

  const confirmEditCategory = () => {
    axios
      .put(`http://localhost:3000/api/category/${editCategory._id}`, {
        product_Category: editCategory.product_Category,
      })
      .then((response) => {
        const updatedCategories = categories.map((category) =>
          category._id === editCategory._id ? response.data.data : category
        );
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
        setShowModal(false);
        setShowConfirmModal(false);
        setShowSuccessModal(true); // Show success modal
      })
      .catch((error) => console.error("Error updating category:", error));
  };

  const handleDeleteCategory = (id) => {
    setDeleteId(id);
    setShowDeleteConfirmModal(true); // Show confirmation modal for delete
  };

  const confirmDeleteCategory = () => {
    setAction("delete"); // Set action to "delete" before making the request
    axios
      .delete(`http://localhost:3000/api/category/${deleteId}`)
      .then(() => {
        setCategories(
          categories.filter((category) => category._id !== deleteId)
        );
        setFilteredCategories(
          filteredCategories.filter((category) => category._id !== deleteId)
        );
        setShowDeleteConfirmModal(false);
        setShowSuccessModal(true); // Show success modal
      })
      .catch((error) => console.error("Error deleting category:", error));
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setEditCategory(category);
      setIsEditMode(true);
    } else {
      setNewCategory("");
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        {/* Your header and other UI elements */}

        <div className="card shadow-sm py-4 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">Category</h5>
            </div>

            <div className="d-flex ms-auto">
              <button
                className="btn btn-primary me-2"
                onClick={() => handleShowModal()}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Category
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => window.history.back()}
                style={{ whiteSpace: "nowrap" }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <div className="row cardFilters g-3 align-items-end">
            {/* Search Input */}
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search Categories"
                className="form-control"
              />
            </div>
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="text-white">
                    Categories
                  </th>
                  <th scope="col" className="text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="align-middle table-group-divider">
                {currentCategories.map((category) => (
                  <tr key={category._id}>
                    <td className="fw-semibold text-primary">
                      {category.product_Category}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-warning btn-sm me-2 shadow-sm fs-6 fw-medium rounded-pill"
                          onClick={() => handleShowModal(category)}
                        >
                          <i className="bi bi-pencil-square me-2"></i> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm shadow-sm fs-6 fw-medium rounded-pill"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <i className="bi bi-trash-fill me-2"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination">
                {/* Previous Button */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {/* Page Number Buttons */}
                {Array.from(
                  {
                    length: Math.ceil(filteredCategories.length / itemsPerPage),
                  },
                  (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  )
                )}

                {/* Next Button */}
                <li
                  className={`page-item ${
                    currentPage ===
                    Math.ceil(filteredCategories.length / itemsPerPage)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredCategories.length / itemsPerPage)
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Modal for Add/Edit Category */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>
              {isEditMode ? "Edit Category" : "Add Category"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="categoryName">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={
                    isEditMode ? editCategory.product_Category : newCategory
                  }
                  onChange={(e) => {
                    if (isEditMode) {
                      setEditCategory({
                        ...editCategory,
                        product_Category: e.target.value,
                      });
                    } else {
                      setNewCategory(e.target.value);
                    }
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={isEditMode ? handleEditCategory : handleAddCategory}
            >
              {isEditMode ? "Update" : "Add"}
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Confirmation Modal for Add/Edit */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header>
            <Modal.Title>
              Confirm {action === "add" ? "Add" : "Edit"} Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to{" "}
            {action === "add" ? "add this new category" : "edit this category"}?
            <br />
            <br />
            <br />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={
                action === "add" ? confirmAddCategory : confirmEditCategory
              }
            >
              Yes, {action === "add" ? "Add" : "Edit"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

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
              The category has been successfully{" "}
              {action === "add"
                ? "added"
                : action === "edit"
                ? "updated"
                : action === "delete"
                ? "deleted"
                : ""}
              .
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

        {/* Confirmation Modal for Delete */}
        <Modal
          show={showDeleteConfirmModal}
          onHide={() => setShowDeleteConfirmModal(false)}
        >
          <Modal.Header>
            <Modal.Title>Confirm Delete Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this category?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={confirmDeleteCategory}>
              Yes, Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default CreateProducts;
