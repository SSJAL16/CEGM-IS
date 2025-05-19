import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "react-bootstrap";

const StockMovementModal = ({ show, handleClose, stockMovements }) => {
  const [getDate, setGetDate] = useState({ earliest: " ", latest: " " });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  // Function to find the earliest and latest dates
  const getDateRange = () => {
    if (stockMovements.length === 0) return { earliest: "", latest: "" };

    const dates = stockMovements.map((movement) => new Date(movement.adj_Date));
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    return {
      earliest: earliest.toLocaleDateString(),
      latest: latest.toLocaleDateString(),
    };
  };

  // Update the getDate state only if the values are different from the current ones
  useEffect(() => {
    const newGetDate = getDateRange();
    if (
      newGetDate.earliest !== getDate.earliest ||
      newGetDate.latest !== getDate.latest
    ) {
      setGetDate(newGetDate);
    }
  }, [stockMovements]); // Only run when stockMovements changes

  const handlePrint = () => {
    const { earliest, latest } = getDateRange();
    const printContent = document.getElementById("printable-content");
    const printWindow = window.open("", "_blank");

    // Include all stockMovements, not just the current page's
    const allMovements = stockMovements
      .map(
        (movement) => ` 
      <tr>
        <td>${movement.movement_ID}</td>
        <td>${movement.product_ID}</td>
        <td>${movement.adj_Description}</td>
        <td>${movement.adj_Category}</td>
        <td>${movement.adj_Quantity}</td>
        <td>${movement.adj_Price}</td>
        <td>${movement.adj_Adjustment_Type}</td>
        <td>${new Date(movement.adj_Date).toLocaleDateString()}</td>
      </tr>
    `
      )
      .join("");

    // Relative path to the logo in the _images folder
    const logoPath = "./_images/logo.png"; // Adjust path based on your project structure

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Stock Movements</title>
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
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo-container img {
              max-width: 200px;
              height: auto;
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
          <div class="logo-container">
            <img src="${logoPath}" alt="Company Logo" />
          </div>
          <h1>Stock Movements</h1>
          <div class="date-range">
            <p>Start Date: <strong>${earliest}</strong></p>
            <p>End Date: <strong>${latest}</strong></p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Movement ID</th>
                <th>Product ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Adjustment Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${allMovements}
            </tbody>
          </table>
          <footer>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Paginate function
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get the current items to display based on the page
  const totalPages = Math.ceil(stockMovements.length / itemsPerPage);
  const currentItems = stockMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#0d6efd" }}>
          Stock Movements From: {getDate.earliest} to {getDate.latest}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal">
        <div id="printable-content">
          <Table striped bordered hover responsive>
            <thead className="table-info">
              <tr>
                <th>Movement ID</th>
                <th>Product ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Adjustment Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((movement) => (
                <tr key={movement.movement_ID}>
                  <td>{movement.movement_ID}</td>
                  <td>{movement.product_ID}</td>
                  <td>{movement.adj_Description}</td>
                  <td>{movement.adj_Category}</td>
                  <td>{movement.adj_Quantity}</td>
                  <td>{movement.adj_Price}</td>
                  <td>{movement.adj_Adjustment_Type}</td>
                  <td>{new Date(movement.adj_Date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
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
      </Modal.Body>
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

export default StockMovementModal;
