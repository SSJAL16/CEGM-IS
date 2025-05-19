import React, { useState, useEffect } from 'react';
import styles from './Sales.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const ViewTransaction = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCollapsedReplace, setIsCollapsedReplace] = useState(true);
  const [items, setItems] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [replaces, setReplaces] = useState([]);
  const [grandTotal, setGrandTotal] = useState('0.00');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to control the delete confirmation modal
  const [showRestrictionModal, setshowRestrictionModal] = useState(false);
  console.log(replaces)

  const navigate = useNavigate();
  const { transactionId } = useParams(); // Get transaction ID from URL parameters

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleCollapseReplace = () => {
    setIsCollapsedReplace(!isCollapsedReplace);
  };

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(`https://cegm-backend.onrender.com/getTransaction/${transactionId}`);

        if (response.data) {
          setTransactionDetails(response.data);
          setItems(response.data.items || []); // Ensure items array is properly set
          setGrandTotal(response.data.total_Sales ? response.data.total_Sales.toFixed(2) : '0.00'); // Safeguard for undefined values
        } else {
          console.error('No data returned from server');
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  useEffect(() => {

    const fetchRefundDetails = async () => {
      try {
        const response = await axios.get(`https://cegm-backend.onrender.com/getRefund/${transactionId}`);

        if (response.data) {
          setRefunds(response.data.data || []);
        } else {
          console.error('No data returned from server');
        }
      } catch (error) {
        console.error('Error fetching refund details:', error);
      }
    };

    const fetchReplaceDetails = async () => {
      try {
        const response = await axios.get(`https://cegm-backend.onrender.com/getReplace/${transactionId}`);

        if (response.data) {
          setReplaces(response.data.data || []);
        } else {
          console.error('No data returned from server');
        }
      } catch (error) {
        console.error('Error fetching refund details:', error);
      }
    };

    fetchRefundDetails();
    fetchReplaceDetails();
  }, [transactionId]);

  const totalAmount = refunds.reduce((total, item) => total + Number(item.refundDetails.totalRefundAmount), 0).toFixed(2);

  const handleCancel = () => {
    navigate('/Sales');
  };

  const handleEdit = () => {
    navigate(`/Sales/EditTransaction/${transactionId}`);
  };

  const handleRefund = () => {
    navigate(`/Sales/Refund/${transactionId}`);
  };

  const handleReplace = () => {
    navigate(`/Sales/Replace/${transactionId}`);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  const handleDelete = async () => {
    try {
      // Make the DELETE request to the backend to remove the transaction
      await axios.delete(`https://cegm-backend.onrender.com/deleteTransaction/${transactionId}`);
      navigate('/Sales'); // Navigate back to the sales page after deletion
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

const canDeleteTransaction = (transactionDate) => {
    if (!transactionDate) return false;
    
    const originalDate = new Date(transactionDate);
    const oneYearLater = new Date(
      originalDate.getFullYear() + 1,
      originalDate.getMonth(),
      originalDate.getDate()
    );

    const today = new Date();
    return today >= oneYearLater;
  };

  const handleDeleteConfirmation = () => {
    if (!canDeleteTransaction(transactionDetails?.transaction_Date)) {
      alert('This transaction cannot be deleted until One year or later.');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false); // Close the confirmation modal without deleting
  };

  const handleShowReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Centered Header
    doc.setFontSize(16);
    doc.text("COKINS", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("109 Kayang St, Baguio, 2600 Benguet", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Official Receipt No.: ${transactionDetails?.orNumber || 'N/A'}`, 10, 30);
    doc.text(`Date: ${new Date(transactionDetails?.transaction_Date).toLocaleString()}`, 10, 38);
    doc.text(`Cashier: ${transactionDetails?.cashier_name || '-----'}`, 10, 46);

    doc.setFontSize(13);
    doc.text("SALES INVOICE", pageWidth / 2, 54, { align: "center" });

    // Table Headers
    let y = 64;
    doc.setFontSize(12);
    doc.text("Item", 10, y);
    doc.text("Qty", 90, y);
    doc.text("Unit Price", 110, y);
    doc.text("Total", 160, y);
    doc.line(10, y + 2, pageWidth - 10, y + 2); // horizontal line
    y += 10;

    // Items
    items.forEach((item) => {
      const itemName = `${item.product_name} (${item.product_supplier})`;
      const qty = `${item.quantity_integer}`;
      const unitPrice = `P${(item.unit_price * 1.1).toFixed(2)}`;
      const total = `P${item.totalPrice.toFixed(2)}`;

      doc.text(itemName, 10, y);
      doc.text(qty, 95, y, { align: 'right' });
      doc.text(unitPrice, 125, y, { align: 'right' });
      doc.text(total, 190, y, { align: 'right' });

      y += 10;

      // Prevent overflow
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;
    doc.setFontSize(13);
    doc.text(`Grand Total: P ${grandTotal}`, 10, y);

    const pdfOutput = doc.output('blob');
    setPdfBlob(pdfOutput);
    setShowReceipt(true);
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">View Sales Transaction</h5>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3">
          <h6 className="mb-3">Transaction Details</h6>
          <div className="d-flex align-items-start mb-3">
            <div className="d-flex" style={{ width: '100%' }}>
              <div className="d-flex flex-column me-3" style={{ flex: '1' }}>
                <label>Transaction ID</label>
                <input type="text" value={transactionId} readOnly className="form-control" />
                <label className="mt-2">Cashier Name</label>
                <input type="text" value={transactionDetails?.cashier_name || '-----'} readOnly className="form-control" />
              </div>
              <div style={{ flex: '1', marginLeft: '1rem' }}>
                <label>Transaction Date</label>
                <input
                  type="text"
                  value={
                    transactionDetails
                      ? new Date(transactionDetails.transaction_Date).toLocaleString()
                      : '-----'
                  }
                  readOnly
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-1">
            <thead>
              <tr>
                <th>Category</th>
                <th>Name</th>
                <th>Description</th>
                <th>Supplier</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_category}</td>
                    <td>{item.product_name}</td>
                    <td>{item.product_description}</td>
                    <td>{item.product_supplier}</td>
                    <td>{item.quantity_integer}</td>
                    <td>{(item.unit_price * 1.10).toFixed(2)}</td>
                    <td>{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No items available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column flex-md-row">
          {refunds.length > 0 && replaces.length > 0 ? (
            <>
              <div className="w-100 me-md-3">
                {/* Refund History */}
                <div className="card shadow-sm px-4 py-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-3">Refund History</h6>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={toggleCollapse}
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? "Show" : "Hide"} Details
                    </button>
                  </div>
                  <div className={`collapse ${!isCollapsed ? "show" : ""}`}>
                    <div>
                      <p>
                        <strong>Overall Total Refund Amount:</strong> P {totalAmount}
                      </p>
                      {refunds.map((refund, index) => (
                        <div key={index} className="card shadow-sm px-4 py-3 mt-3">
                          <h6>Refund #{index + 1}</h6>
                          <p>
                            <strong>Reason:</strong> {refund.refundDetails.refundReason}
                          </p>
                          <p>
                            <strong>Total Refund Amount:</strong> P{" "}
                            {parseFloat(refund.refundDetails.totalRefundAmount).toFixed(
                              2
                            )}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(
                              refund.refundDetails.refundDate
                            ).toLocaleDateString()}
                          </p>
                          <h6 className="mt-3">Refunded Items</h6>
                          <table className="table mt-1">
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                                <th>Refunded Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {refund.refundedItems.length > 0 ? (
                                refund.refundedItems.map((item, itemIndex) => (
                                  <tr key={itemIndex}>
                                    <td>{item.product_category}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_description}</td>
                                    <td>{item.product_supplier}</td>
                                    <td>{item.refunded_quantity}</td>
                                    <td>
                                      P{" "}
                                      {parseFloat(item.refunded_amount).toFixed(2)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center">
                                    No refunded items available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-100">
                {/* Replace History */}
                <div className="card shadow-sm px-4 py-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-3">Replace History</h6>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={toggleCollapseReplace}
                      aria-expanded={!isCollapsedReplace}
                    >
                      {isCollapsedReplace ? "Show" : "Hide"} Details
                    </button>
                  </div>
                  <div className={`collapse ${!isCollapsedReplace ? "show" : ""}`}>
                    <div>
                      {replaces.map((replace, index) => (
                        <div key={index} className="card shadow-sm px-4 py-3 mt-3">
                          <h6>Replace #{index + 1}</h6>
                          <p>
                            <strong>Reason:</strong>{" "}
                            {replace.replaceDetails.replaceReason}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(
                              replace.replaceDetails.replaceDate
                            ).toLocaleDateString()}
                          </p>
                          <h6 className="mt-3">Replaced Items</h6>
                          <table className="table mt-1">
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {replace.replacedItems.length > 0 ? (
                                replace.replacedItems.map((item, itemIndex) => (
                                  <tr key={itemIndex}>
                                    <td>{item.product_category}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_description}</td>
                                    <td>{item.product_supplier}</td>
                                    <td>{item.replaced_quantity}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No replaced items available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : refunds.length > 0 ? (
            // Only Refund History
            <div className="w-100">
              <div className="card shadow-sm px-4 py-3 mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-3">Refund History</h6>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleCollapse}
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? "Show" : "Hide"} Details
                  </button>
                </div>
                <div className={`collapse ${!isCollapsed ? "show" : ""}`}>
                  <div>
                    <p><strong>Overall Total Refund Amount:</strong> P {totalAmount}</p>
                    {refunds.length > 0 ? (
                      refunds.map((refund, index) => (
                        <div key={index} className="card shadow-sm px-4 py-3 mt-3">
                          <h6>Refund #{index + 1}</h6>
                          <p><strong>Reason:</strong> {refund.refundDetails.refundReason}</p>
                          <p><strong>Total Refund Amount:</strong> P {parseFloat(refund.refundDetails.totalRefundAmount).toFixed(2)}</p>
                          <p><strong>Date:</strong> {new Date(refund.refundDetails.refundDate).toLocaleDateString()}</p>

                          <h6 className="mt-3">Refunded Items</h6>
                          <table className="table mt-1">
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                                <th>Refunded Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {refund.refundedItems.length > 0 ? (
                                refund.refundedItems.map((item, itemIndex) => (
                                  <tr key={itemIndex}>
                                    <td>{item.product_category}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_description}</td>
                                    <td>{item.product_supplier}</td>
                                    <td>{item.refunded_quantity}</td>
                                    <td>P {parseFloat(item.refunded_amount).toFixed(2)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center">
                                    No refunded items available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p>No refunds found for this transaction.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : replaces.length > 0 ? (
            // Only Replace History
            <div className="w-100">
              <div className="card shadow-sm px-4 py-3 mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-3">Replace History</h6>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleCollapseReplace}
                    aria-expanded={!isCollapsedReplace}
                  >
                    {isCollapsedReplace ? "Show" : "Hide"} Details
                  </button>
                </div>
                <div className={`collapse ${!isCollapsedReplace ? "show" : ""}`}>
                  <div>
                    {replaces.length > 0 ? (
                      replaces.map((replace, index) => (
                        <div key={index} className="card shadow-sm px-4 py-3 mt-3">
                          <h6>Replace #{index + 1}</h6>
                          <p><strong>Reason:</strong> {replace.replaceDetails.replaceReason}</p>
                          <p><strong>Date:</strong> {new Date(replace.replaceDetails.replaceDate).toLocaleDateString()}</p>

                          <h6 className="mt-3">Replaced Items</h6>
                          <table className="table mt-1">
                            <thead>
                              <tr>
                                <th>Category</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {replace.replacedItems.length > 0 ? (
                                replace.replacedItems.map((item, itemIndex) => (
                                  <tr key={itemIndex}>
                                    <td>{item.product_category}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_description}</td>
                                    <td>{item.product_supplier}</td>
                                    <td>{item.replaced_quantity}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center">
                                    No replaced items available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p>No refunds found for this transaction.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <table className="table mt-1">
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="text-center">No refunds or replaces found.</div>
                </td>
              </tr> </table>
          )}
        </div>

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-4">
            <tbody>
              <tr>
                <td><b>Grand Total:</b></td>
                <td>P {grandTotal}</td>
              </tr>
              <tr>
                <td><b>Official Receipt No. :</b></td>
                <td>{transactionDetails?.orNumber || '-----'}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-between">
            <button onClick={handleDeleteConfirmation} className="btn btn-danger" ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
            </svg></button>
            <div className="d-flex justify-content-end">
              <button onClick={handleShowReceipt} className="btn btn-success" style={{ padding: '10px', marginRight: '7px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="currentColor" className="bi bi-receipt-cutoff" viewBox="0 0 16 16">
                  <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5M11.5 4a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z" />
                  <path d="M2.354.646a.5.5 0 0 0-.801.13l-.5 1A.5.5 0 0 0 1 2v13H.5a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H15V2a.5.5 0 0 0-.053-.224l-.5-1a.5.5 0 0 0-.8-.13L13 1.293l-.646-.647a.5.5 0 0 0-.708 0L11 1.293l-.646-.647a.5.5 0 0 0-.708 0L9 1.293 8.354.646a.5.5 0 0 0-.708 0L7 1.293 6.354.646a.5.5 0 0 0-.708 0L5 1.293 4.354.646a.5.5 0 0 0-.708 0L3 1.293zm-.217 1.198.51.51a.5.5 0 0 0 .707 0L4 1.707l.646.647a.5.5 0 0 0 .708 0L6 1.707l.646.647a.5.5 0 0 0 .708 0L8 1.707l.646.647a.5.5 0 0 0 .708 0L10 1.707l.646.647a.5.5 0 0 0 .708 0L12 1.707l.646.647a.5.5 0 0 0 .708 0l.509-.51.137.274V15H2V2.118z" />
                </svg>
              </button>

              <button onClick={handleEdit} className="btn btn-primary" style={{ marginRight: '7px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                </svg>
              </button>

              <button onClick={handleReplace} className="btn btn-warning" style={{ marginRight: '7px' }}>Replace</button>

              <button onClick={handleRefund} className="btn btn-warning" style={{ marginRight: '7px' }}>Refund</button>

              <button onClick={handleCancel} className="btn btn-outline-secondary">Exit</button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ display: 'block', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered"> {/* Center the modal vertically */}
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleCloseDeleteModal}></button>
              </div>
              <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ color: 'red' }}>Are you sure you want to delete this transaction?</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal show d-block" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt</h5>
                <button type="button" className="btn-close" onClick={handleCloseReceipt}></button>
              </div>
              <div className="modal-body">
                <embed src={URL.createObjectURL(pdfBlob)} type="application/pdf" width="100%" height="400px" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseReceipt}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRestrictionModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Not Allowed</h5>
                <button type="button" className="btn-close" onClick={handleCloseRestrictionModal}></button>
              </div>
              <div className="modal-body">
                <p>This transaction cannot be deleted until {formattedDate} or later.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseRestrictionModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTransaction;
