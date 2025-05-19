import React, { useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";

const LowStockModal = ({ show, handleClose, lowStockItems }) => {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can adjust this number to show more/less items per page

  // Calculate total pages
  const totalPages = Math.ceil(lowStockItems.length / itemsPerPage);

  // Slice the items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = lowStockItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to get stock level range
  const getStockLevelRange = () => {
    if (lowStockItems.length === 0) return { earliest: "", latest: "" };

    const stockLevels = lowStockItems.map((item) => item.product_Current_Stock);
    const earliest = Math.min(...stockLevels);
    const latest = Math.max(...stockLevels);

    return { earliest, latest };
  };

  // Function to handle printing
  const handlePrint = () => {
    const { earliest, latest } = getStockLevelRange();

    // Prepare all the items for printing
    const printContent = document.createElement("div");

    // Add the stock range and table headers to the print content
    const tableHeader = `
      <table class="table table-bordered">
        <thead class="table-info">
          <tr>
            <th>Product ID</th>
            <th>Category</th>
            <th>Description</th>
            <th>Current Stock</th>
            <th>Minimum Stock Level</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Add the rows for all lowStockItems
    const tableRows = lowStockItems
      .map((item) => {
        return `
        <tr>
          <td>${item.product_Id}</td>
          <td>${item.product_Category}</td>
          <td>${item.product_Description}</td>
          <td>${item.product_Current_Stock}</td>
          <td>${item.product_Minimum_Stock_Level}</td>
        </tr>
      `;
      })
      .join("");

    const tableFooter = `</tbody></table>`;

    // Add everything to the print content
    printContent.innerHTML = `
      <h1>Low Stock Products</h1>
      ${tableHeader}
      ${tableRows}
      ${tableFooter}
    `;

    // Open the print window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Low Stock Products</title>
          <link 
            rel="stylesheet" 
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
            integrity="sha384-DyZvNqH2BzU0HqUEUeChzj7H04pZ2dWQy1B3i29e6H7SvD8sPvL49Rim55G8Dq4m"
            crossorigin="anonymous"
          />
            <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              color: #333;
              background-color: #f4f4f4;
            }
            h1 {
              text-align: center;
              color: #007bff;
              margin-bottom: 20px;
            }
            p {
              font-size: 16px;
              margin: 10px 0;
            }
            .date-range {
              margin-bottom: 20px;
              text-align: center;
              font-weight: bold;
              color: #333;
              background-color: #e9ecef;
              padding: 10px;
              border-radius: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background-color: #fff;
            }
            th, td {
              border: 1px solid #007bff;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: blue;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            tr:hover {
              background-color: #e2e6ea;
            }
            footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#0d6efd" }}>
          Low Stock Products
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="printable-content">
        {/* Added an ID for printing */}
        <Table striped bordered hover responsive>
          <thead className="table-info">
            <tr>
              <th>Product ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Current Stock</th>
              <th>Minimum Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.product_Id}>
                <td>{item.product_Id}</td>
                <td>{item.product_Category}</td>
                <td>{item.product_Description}</td>
                <td>{item.product_Current_Stock}</td>
                <td>{item.product_Minimum_Stock_Level}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => paginate(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
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
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <Modal.Footer>
        <Button variant="primary" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LowStockModal;
