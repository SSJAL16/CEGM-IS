import DashboardBox from "../Dashboard/components/dashboardBox";
import React, { useEffect, useState } from "react";
import styles from "./Storage.module.css";
import { Dropdown, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Make sure to import this

const Storage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [stockMovements, setStockMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [addedCount, setAddedCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [physicalCounts, setPhysicalCounts] = useState({});
  const [discrepancies, setDiscrepancies] = useState({});
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [includeComments, setIncludeComments] = useState(false); // State to track if comments are included
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [currentMovement, setCurrentMovement] = useState(null);
  const [explanation, setExplanation] = useState("");

  const closeSuccessModal = () => setSuccessModalVisible(false);
  const closeErrorModal = () => setErrorModalVisible(false);

  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
  });
  const reconcileCounts = async () => {
    // First check for discrepancies
    const movementsWithDiscrepancies = stockMovements.filter((movement) => {
      const physicalCount =
        physicalCounts[movement.movement_ID] ?? movement.adj_Quantity;
      return physicalCount != movement.adj_Quantity;
    });

    if (movementsWithDiscrepancies.length > 0) {
      // Show modal for first discrepancy
      setCurrentMovement(movementsWithDiscrepancies[0]);
      setShowExplanationModal(true);
      return;
    }

    // If no discrepancies, proceed with normal reconciliation
    await performReconciliation();
  };

  // New function to update comment via API
  const updateMovementComment = async (movementId, comment) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/stockmovement/update-comment/${movementId}`,
        { adj_Comment: comment }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  };

  const performReconciliation = async (comment = "") => {
    const updatedMovements = stockMovements.map((movement) => {
      const physicalCount =
        physicalCounts[movement.movement_ID] ?? movement.adj_Quantity;
      return {
        ...movement,
        adj_Quantity: physicalCount,
      };
    });

    // Update the comment separately if provided
    if (comment && currentMovement) {
      try {
        await updateMovementComment(currentMovement.movement_ID, comment);
        // Update local state to reflect the new comment
        const updatedStockMovements = stockMovements.map((movement) => {
          if (movement.movement_ID === currentMovement.movement_ID) {
            return {
              ...movement,
              adj_Comment: comment,
            };
          }
          return movement;
        });
        setStockMovements(updatedStockMovements);
        setFilteredMovements(updatedStockMovements);
      } catch (error) {
        setModalMessage("Failed to save comment for the discrepancy.");
        setErrorModalVisible(true);
        return;
      }
    }

    // Proceed with quantity reconciliation
    try {
      const response = await axios.post(
        "http://localhost:3000/api/stockmovement/reconcile",
        {
          movements: updatedMovements,
        }
      );

      if (response.status === 200) {
        setModalMessage("Reconciliation completed and saved to the database!");
        setSuccessModalVisible(true);
        setPhysicalCounts({});
        setCurrentMovement(null);
        setExplanation("");

        // Refresh data to get the latest comments
        fetchStockMovements();
      } else {
        setModalMessage("Failed to save reconciliation data.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error("Error while saving reconciliation data:", error);
      setModalMessage(
        "An error occurred while saving the reconciliation data."
      );
      setErrorModalVisible(true);
    }
  };

  const handlePhysicalCountChange = (movementId, value) => {
    const updatedCounts = {
      ...physicalCounts,
      [movementId]: parseInt(value, 10) || 0,
    };

    setPhysicalCounts(updatedCounts);

    const updatedDiscrepancies = { ...discrepancies };
    const movement = stockMovements.find(
      (movement) => movement.movement_ID === movementId
    );

    if (movement) {
      const systemCount = movement.adj_Quantity;
      const discrepancy = updatedCounts[movementId] - systemCount;
      updatedDiscrepancies[movementId] = discrepancy;
    } else {
      updatedDiscrepancies[movementId] = 0;
    }

    setDiscrepancies(updatedDiscrepancies);
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedFirstname = localStorage.getItem("firstname");
    const storedLastname = localStorage.getItem("lastname");
    const storedEmail = localStorage.getItem("email");
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
  const handleGenerateReport = () => {
    if (filteredMovements.length === 0) {
      alert("No movements to generate a report for.");
      return;
    }

    // Show the modal to ask if the user wants to include comments
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal without generating the report
  };

  const handleIncludeComments = (value) => {
    setIncludeComments(value);
    setShowModal(false); // Close the modal after choosing
    generatePdf(value); // Generate the PDF based on the selected option
  };

  const generatePdf = (includeComments) => {
    const doc = new jsPDF({
      orientation: "landscape", // Landscape orientation
    });

    // Add the company logo (adjust the path based on your project structure)
    const logoPath = "/cegm.png"; // Root-relative path
    const logoImg = new Image();
    logoImg.src = logoPath;

    logoImg.onload = () => {
      // Add the logo to the PDF
      doc.addImage(logoImg, "PNG", 90, 5, 25, 25); // (image, format, x, y, width, height)

      // Set up title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Stock Movements Report", 120, 20); // Adjusted position due to the logo
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Generated by: Christian Calagui`, 14, 40); //doc.text(`Generated by: ${user.firstname} ${user.lastname}`, 14, 40);
      doc.text(`Email: Christiancalagui@gmail.com`, 14, 50); //doc.text(`Email: ${user.email}`, 14, 50);

      // Add the report generation date
      const currentDate = new Date().toLocaleDateString(); // Get the current date in local format
      doc.text(`Report generated on: ${currentDate}`, 14, 60);

      // Add a line for separation
      doc.setLineWidth(0.5);
      doc.line(14, 65, 285, 65); // Draw a line across the page

      // Set up table headers and data
      const headers = [
        "Movement ID",
        "Product ID",
        "Product Name",
        "Stock Action",
        "Quantity Moved",
        "Movement Date",
        ...(includeComments ? ["Comments"] : []), // Include comments column if selected
      ];

      const rows = filteredMovements.map((movement) => {
        const baseData = [
          movement.movement_ID.toString(),
          movement.product_ID.toString(),
          movement.adj_Description,
          movement.adj_Adjustment_Type,
          movement.adj_Quantity.toString(),
          new Date(movement.adj_Date).toLocaleDateString(),
        ];
        return includeComments
          ? [...baseData, movement.adj_Comment || ""] // Include comments data if selected
          : baseData;
      });

      // Define color scheme or tokens for header and body
      const themeColors = {
        headerBackground: "#331373", // Dark purple (example token)
        headerTextColor: "#FFFFFF", // White text
        bodyBackground: "#F8F9FA", // Light background for body (example token)
        bodyTextColor: "#333333", // Dark text for body
      };

      // Set up table options
      doc.autoTable({
        head: [headers], // Table headers
        body: rows, // Data rows
        startY: 80, // Position where table starts
        theme: "grid", // Table style
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
          fontSize: 10, // Adjust body font size
          cellPadding: 2, // Cell padding for better spacing
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
      doc.save("stock_movements_report.pdf");
    };

    // Handle image load error
    logoImg.onerror = () => {
      alert("Error loading logo. Please check the logo path.");
    };
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  const handleDateChange = (field, value) => {
    if (field === "from") {
      setFromDate(value);
      filterMovements(searchQuery, selectedAction, value, toDate);
    } else if (field === "to") {
      setToDate(value);
      filterMovements(searchQuery, selectedAction, fromDate, value);
    }
  };

  // Fetch stock movements and calculate totals
  const fetchStockMovements = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/stockMovement"
      );
      let movements = response.data;

      // Sort stock movements by date (most recent first)
      movements = movements.sort(
        (a, b) => new Date(b.adj_Date) - new Date(a.adj_Date)
      );

      // Set state with sorted movements
      setStockMovements(movements);
      setFilteredMovements(movements);

      // Calculate totals
      let added = 0;
      let sold = 0;
      let returned = 0;

      movements.forEach((movement) => {
        switch (movement.adj_Adjustment_Type) {
          case "Added":
            added += 1;
            break;
          case "Sold":
            sold += 1;
            break;
          case "Returned":
            returned += 1;
            break;
          default:
            break;
        }
      });

      // Update state with calculated totals
      setAddedCount(added);
      setSoldCount(sold);
      setReturnedCount(returned);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
    }
  };

  useEffect(() => {
    fetchStockMovements();
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
    filterMovements(value, selectedAction);
  };

  // Handle action selection from dropdown
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    filterMovements(searchQuery, action);
  };

  // Filter stock movements based on search query and action
  const filterMovements = (search, action, from, to) => {
    let filtered = stockMovements;

    // Filter based on search query
    filtered = filtered.filter((movement) => {
      const matchesSearch =
        movement.movement_ID.toString().toLowerCase().includes(search) ||
        movement.product_ID.toString().toLowerCase().includes(search) ||
        movement.adj_Description.toLowerCase().includes(search) ||
        movement.adj_Adjustment_Type.toLowerCase().includes(search) ||
        new Date(movement.adj_Date).toLocaleDateString().includes(search);

      return matchesSearch;
    });

    // Filter based on selected action
    if (action) {
      filtered = filtered.filter(
        (movement) => movement.adj_Adjustment_Type === action
      );
    }

    // Filter based on "from" date
    if (from) {
      filtered = filtered.filter(
        (movement) => new Date(movement.adj_Date) >= new Date(from)
      );
    }

    // Filter based on "to" date (include all dates up to and including the 'to' date)
    if (to) {
      const toDateWithTime = new Date(to);
      toDateWithTime.setHours(23, 59, 59, 999); // Include the full 'to' day
      filtered = filtered.filter(
        (movement) => new Date(movement.adj_Date) <= toDateWithTime
      );
    }
    // Update filtered movements
    setFilteredMovements(filtered);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const getRowColor = (action) => {
    switch (action) {
      case "Added":
        return "table-success";
      case "Sold":
        return "table-danger";
      case "Returned":
        return "table-warning";
      default:
        return "";
    }
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent} style={{ width: "100%" }}>
        <div className="card shadow-sm py-4 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">Stock Movements</h5>
            </div>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                grow={true}
                title="Added Products"
                value={addedCount}
              />
              <DashboardBox
                color={["#e53935", "#ff8a80"]}
                title="Sold Products"
                value={soldCount}
              />

              <DashboardBox
                color={["#f9a825", "#fdd835"]}
                title="Returned Products"
                value={returnedCount}
              />
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
                placeholder="Search..."
                className="form-control"
              />
            </div>

            {/* Dropdown Filter */}
            <div className="col-md-2">
              <label className="form-label">Stock Filter</label>
              <Dropdown onSelect={handleSelectAction}>
                <Dropdown.Toggle
                  className="w-100 d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: "white", // White background
                    color: "#343a40", // Dark text color
                    borderRadius: 5, // Rounded corners
                    textAlign: "left", // Align text to the left
                    border: "1px solid rgba(169, 169, 169, 0.5)", // Gray border with 50% opacity
                  }}
                  variant="secondary"
                  id="dropdown-basic"
                >
                  {selectedAction || "None"}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ border: "none" }}>
                  <Dropdown.Item eventKey="">All Actions</Dropdown.Item>
                  <Dropdown.Item eventKey="Added">Added</Dropdown.Item>
                  <Dropdown.Item eventKey="Sold">Sold</Dropdown.Item>
                  <Dropdown.Item eventKey="Returned">Returned</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* From Date */}
            <div className="col-md-2">
              <label htmlFor="dateFrom" className="form-label">
                From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={fromDate}
                onChange={(e) => handleDateChange("from", e.target.value)}
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
              <label htmlFor="dateTo" className="form-label">
                To
              </label>
              <input
                type="date"
                id="dateTo"
                value={toDate}
                onChange={(e) => handleDateChange("to", e.target.value)}
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

            {/* Action Buttons */}
            <div className="col-md-3 d-flex gap-2">
              <Button
                onClick={handleGenerateReport}
                className="btn btn-primary flex-fill"
              >
                Generate Report
              </Button>
              <button
                className="btn btn-warning flex-fill"
                onClick={reconcileCounts}
              >
                Reconcile Counts
              </button>
            </div>
          </div>

          {/* Modal for asking user to include comments */}
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Include Comments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Do you want to include comments in the report?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => handleIncludeComments(false)}
              >
                No
              </Button>
              <Button
                variant="primary"
                onClick={() => handleIncludeComments(true)}
              >
                Yes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Success Modal */}
          {successModalVisible && (
            <div className={styles.modalOverlay}>
              <div className={styles.successModal}>
                <h2 className={styles.successTitle}>Success!</h2>
                <p className={styles.successMessage}>{modalMessage}</p>
                <button
                  className={styles.closeButton}
                  onClick={closeSuccessModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {errorModalVisible && (
            <div className={styles.modalOverlay}>
              <div className={styles.errorModal}>
                <h2 className={styles.errorTitle}>Error</h2>
                <p className={styles.errorMessage}>{modalMessage}</p>
                <button
                  className={styles.closeButton}
                  onClick={closeErrorModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th scope="col" className="fw-semibold text-white">
                    Movement ID
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Product ID
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Specification
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Stock Action
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Quantity Moved
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Movement Date
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Comments
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Physical Count
                  </th>
                  <th scope="col" className="fw-semibold text-white">
                    Discrepancy
                  </th>
                </tr>
              </thead>

              <tbody className="fs-6 align-middle table-group-divider">
                {currentItems.map((movement) => (
                  <tr
                    key={movement.movement_ID}
                    className={getRowColor(movement.adj_Adjustment_Type)}
                  >
                    <td className="text-dark">{movement.movement_ID}</td>
                    <td className="text-dark">{movement.product_ID}</td>
                    <td className="text-dark">{movement.adj_Description}</td>
                    <td className="text-dark">
                      {movement.adj_Adjustment_Type}
                    </td>
                    <td className="text-dark">{movement.adj_Quantity}</td>
                    <td className="text-dark">
                      {new Date(movement.adj_Date).toLocaleDateString()}
                    </td>
                    <td className="text-dark">
                      {movement.adj_Comment || "No Comment"}
                    </td>{" "}
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={physicalCounts[movement.movement_ID] || ""}
                        onChange={(e) =>
                          handlePhysicalCountChange(
                            movement.movement_ID,
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td
                      className={
                        discrepancies[movement.movement_ID] !== 0
                          ? "text-danger"
                          : "text-success"
                      }
                    >
                      {discrepancies[movement.movement_ID] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </div>
      </main>
      <Modal
        show={showExplanationModal}
        onHide={() => setShowExplanationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Discrepancy Explanation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Movement ID:</strong> {currentMovement?.movement_ID}
            <br />
            <strong>Product:</strong> {currentMovement?.adj_Description}
            <br />
            <strong>System Count:</strong> {currentMovement?.adj_Quantity}
            <br />
            <strong>Physical Count:</strong>{" "}
            {physicalCounts[currentMovement?.movement_ID] ??
              currentMovement?.adj_Quantity}
          </p>
          <div className="mb-3">
            <label htmlFor="explanationText" className="form-label">
              Please explain the discrepancy:
            </label>
            <textarea
              className="form-control"
              id="explanationText"
              rows="3"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Enter reason for the count difference..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowExplanationModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              await performReconciliation(explanation);
              setShowExplanationModal(false);

              // Check if there are more discrepancies to process
              const remainingDiscrepancies = stockMovements.filter(
                (movement) => {
                  const physicalCount =
                    physicalCounts[movement.movement_ID] ??
                    movement.adj_Quantity;
                  return (
                    physicalCount != movement.adj_Quantity &&
                    (!currentMovement ||
                      movement.movement_ID !== currentMovement.movement_ID)
                  );
                }
              );

              if (remainingDiscrepancies.length > 0) {
                setCurrentMovement(remainingDiscrepancies[0]);
                setExplanation("");
                setShowExplanationModal(true);
              }
            }}
          >
            Save Explanation
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Storage;
