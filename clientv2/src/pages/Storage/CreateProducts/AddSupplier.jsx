import React, { useEffect, useState } from "react";

import styles from "../Storage.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSupplier, setEditSupplier] = useState({});
  const [newSupplier, setNewSupplier] = useState("");
  const [action, setAction] = useState(""); // To track whether it's an add, edit, or delete action
  const [deleteId, setDeleteId] = useState(null); // To track which supplier is being deleted
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // You can adjust this number

  // Fetch suppliers on component mount
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/storageSupplier")
      .then((response) => {
        setSuppliers(response.data);
        setFilteredSuppliers(response.data);
      })
      .catch((error) =>
        console.error("Error fetching storage suppliers:", error)
      );
  }, []);

  // Handle search query change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  // Handle pagination logic
  const indexOfLastSupplier = currentPage * itemsPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle supplier actions
  const handleAddSupplier = () => {
    setAction("add");
    setShowConfirmModal(true);
  };

  const handleEditSupplier = () => {
    setAction("edit");
    setShowConfirmModal(true);
  };

  const confirmAddSupplier = () => {
    axios
      .post("http://localhost:3000/api/storageSupplier", {
        name: newSupplier,
      })
      .then((response) => {
        setSuppliers([...suppliers, response.data.data]);
        setFilteredSuppliers([...filteredSuppliers, response.data.data]);
        setShowModal(false);
        setShowConfirmModal(false);
        setShowSuccessModal(true);
      })
      .catch((error) => console.error("Error adding supplier:", error));
  };

  const confirmEditSupplier = () => {
    axios
      .put(`http://localhost:3000/api/storageSupplier/${editSupplier._id}`, {
        name: editSupplier.name,
      })
      .then((response) => {
        const updatedSuppliers = suppliers.map((supplier) =>
          supplier._id === editSupplier._id ? response.data.data : supplier
        );
        setSuppliers(updatedSuppliers);
        setFilteredSuppliers(updatedSuppliers);
        setShowModal(false);
        setShowConfirmModal(false);
        setShowSuccessModal(true); // Show success modal
      })
      .catch((error) => console.error("Error updating supplier:", error));
  };

  const handleDeleteSupplier = (id) => {
    setDeleteId(id);
    setShowDeleteConfirmModal(true); // Show confirmation modal for delete
  };

  const confirmDeleteSupplier = () => {
    setAction("delete"); // Set action to "delete" before making the request
    axios
      .delete(`http://localhost:3000/api/storageSupplier/${deleteId}`)
      .then(() => {
        setSuppliers(suppliers.filter((supplier) => supplier._id !== deleteId));
        setFilteredSuppliers(
          filteredSuppliers.filter((supplier) => supplier._id !== deleteId)
        );
        setShowDeleteConfirmModal(false);
        setShowSuccessModal(true); // Show success modal
      })
      .catch((error) => console.error("Error deleting supplier:", error));
  };

  const handleShowModal = (supplier = null) => {
    if (supplier) {
      setEditSupplier(supplier);
      setIsEditMode(true);
    } else {
      setNewSupplier("");
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
              <h5 className="mb-0">Supplier</h5>
            </div>

            <div className="d-flex ms-auto">
              <button
                className="btn btn-primary me-2"
                onClick={() => handleShowModal()}
              >
                <i className="bi bi-plus-circle me-2"></i> Add Supplier
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
                placeholder="Search Suppliers"
                className="form-control"
              />
            </div>
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="text-white">
                    Supplier Name
                  </th>
                  <th scope="col" className="text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="align-middle table-group-divider">
                {currentSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="fw-semibold text-primary">
                      {supplier.name}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-warning btn-sm me-2 shadow-sm fs-6 fw-medium rounded-pill"
                          onClick={() => handleShowModal(supplier)}
                        >
                          <i className="bi bi-pencil-square me-2"></i> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm shadow-sm fs-6 fw-medium rounded-pill"
                          onClick={() => handleDeleteSupplier(supplier._id)}
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
                    length: Math.ceil(filteredSuppliers.length / itemsPerPage),
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
                    Math.ceil(filteredSuppliers.length / itemsPerPage)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredSuppliers.length / itemsPerPage)
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Modal for Adding / Editing Supplier */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditMode ? "Edit Supplier" : "Add Supplier"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formSupplierName">
                <Form.Label>Supplier Name</Form.Label>
                <Form.Control
                  type="text"
                  value={isEditMode ? editSupplier.name : newSupplier}
                  onChange={(e) =>
                    isEditMode
                      ? setEditSupplier({
                          ...editSupplier,
                          name: e.target.value,
                        })
                      : setNewSupplier(e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={isEditMode ? confirmEditSupplier : confirmAddSupplier}
            >
              {isEditMode ? "Save Changes" : "Add Supplier"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Success Modal */}
        <Modal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Action completed successfully!</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Confirm Delete Modal */}
        <Modal
          show={showDeleteConfirmModal}
          onHide={() => setShowDeleteConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this supplier?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteSupplier}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default CreateSupplier;
