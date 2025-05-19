import React, { useState } from "react";
import { Button } from "react-bootstrap";

const ProductTable = ({
  filteredProducts = [],
  loading,
  error,
  selectAll,
  handleSelectAll,
  handleSelectProduct,
  handleModalShow,
  selectedProducts,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Calculate the products to display on the current page
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
    <div className="table-responsive mt-3">
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <table className="table table-bordered table-striped v-align">
            <thead className="thead-dark">
              <tr>
                <th style={{ color: "white", fontSize: "16px" }}>Product ID</th>
                <th
                  style={{ color: "white", fontSize: "16px", width: "300px" }}
                >
                  Product Name & Specification
                </th>
                <th style={{ color: "white", fontSize: "16px" }}>Category</th>
                <th style={{ color: "white", fontSize: "16px" }}>
                  Current Stock Level
                </th>
                <th style={{ color: "white", fontSize: "16px" }}>Price</th>
                <th style={{ color: "white", fontSize: "16px" }}>Unit</th>
                <th style={{ color: "white", fontSize: "16px" }}>
                  Minimum Stock Level
                </th>
                <th style={{ color: "white", fontSize: "16px" }}>
                  Maximum Stock Level
                </th>
                <th style={{ color: "white", fontSize: "16px" }}>Supplier</th>
                <th style={{ color: "white", fontSize: "16px" }}>Date Added</th>
                <th style={{ color: "white", fontSize: "16px" }}>
                  Shelf Life (Days)
                </th>
                <th style={{ color: "white", fontSize: "16px" }}>Edit</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                      />
                      <span>{product.product_Id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="info pl-3">
                        <h6>{product.product_Name}</h6>
                        <p>{product.product_Description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{product.product_Category}</td>
                  <td>{product.product_Current_Stock}</td>
                  <td>₱ {product.product_Price}</td>
                  <td>{product.product_Unit}</td>
                  <td>{product.product_Minimum_Stock_Level}</td>
                  <td>{product.product_Maximum_Stock_Level}</td>
                  <td>{product.product_Supplier}</td>
                  <td>{new Date(product.product_Date).toLocaleDateString()}</td>
                  <td>{product.product_Shelf_Life}</td>
                  <td>
                    <div className="actions d-flex align-items-center">
                      <Button
                        variant="secondary"
                        onClick={() => handleModalShow(product)}
                        className="d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        title="Edit"
                      >
                        <i className="bi bi-pen"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="d-flex tableFooter justify-content-between align-items-center mt-3">
            <p>
              Showing <b>{currentProducts.length}</b> of{" "}
              <b>{filteredProducts.length}</b> results
            </p>
            <nav>
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
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
  );
};

export default ProductTable;
