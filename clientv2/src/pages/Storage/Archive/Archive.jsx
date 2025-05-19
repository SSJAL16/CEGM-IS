import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";

const Archive = () => {
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch archived products
  const fetchArchivedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://cegm-backend.onrender.com/api/archive");
      setArchivedProducts(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch archived products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = archivedProducts.filter(
    (product) =>
      product.product_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_Category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "..."];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
      }
    }
    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${page === currentPage ? "active" : ""} ${
          page === "..." ? "disabled" : ""
        }`}
      >
        <button
          className="page-link"
          onClick={() => handlePageClick(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      </li>
    ));
  };

  return (
    <div className="container-fluid" style={{ paddingTop: "60px" }}>
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title mb-0">Archived Products</h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-group mb-0">
              <div className="input-group" style={{ width: "300px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search archived products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={fetchArchivedProducts}
                    title="Refresh"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
              >
                <span>&times;</span>
              </button>
            </div>
          )}

          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading archived products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="alert alert-info">
                {searchTerm
                  ? "No archived products match your search criteria"
                  : "No products have been archived yet"}
              </div>
            ) : (
              <>
                <table className="table table-bordered table-striped table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th style={{ width: "120px" }}>Product ID</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Supplier</th>
                      <th style={{ width: "80px" }}>Stock</th>
                      <th style={{ width: "100px" }}>Price</th>
                      <th style={{ width: "120px" }}>Archived Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="font-weight-bold">
                          {product.product_Id}
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <strong>{product.product_Name}</strong>
                            <small className="text-muted">
                              {product.product_Description}
                            </small>
                          </div>
                        </td>
                        <td>{product.product_Category}</td>
                        <td>{product.product_Supplier}</td>
                        <td className="text-center">
                          {product.product_Current_Stock}
                        </td>
                        <td className="text-right">
                          ₱{parseFloat(product.product_Price).toFixed(2)}
                        </td>
                        <td>
                          {new Date(product.product_Date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing <strong>{startIndex + 1}</strong> to{" "}
                    <strong>
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredProducts.length
                      )}
                    </strong>{" "}
                    of <strong>{filteredProducts.length}</strong> archived
                    products
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {renderPageNumbers()}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;
