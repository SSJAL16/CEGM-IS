import React, { useState, useEffect } from "react";
import styles from "./Sales.module.css";
import { Link } from "react-router-dom";
import axios from 'axios';
axios.defaults.withCredentials = true;


const Refunded = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'refundId', direction: 'ascending' });
  const [data, readRefundsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await axios.post('https://cegm-backend.onrender.com/findrefund');
        readRefundsData(response.data); // assuming the data is in the expected format
      } catch (error) {
        console.error("Error fetching refund data:", error);
      }
    };
    
    fetchRefunds();
  }, []);

  // Filter data based on the search query
  const filteredData = data.filter((item) => {
    const searchValue = searchQuery.toLowerCase();
    return (
      item.refundId.toLowerCase().includes(searchValue) ||
      item.description.toLowerCase().includes(searchValue) ||
      item.transactionId.toLowerCase().includes(searchValue) ||
      item.refundDate.toLowerCase().includes(searchValue)
    );
  });

  // Sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key === 'quantity') {
      // Sort quantity as numbers
      return sortConfig.direction === 'ascending' 
        ? a.quantity - b.quantity 
        : b.quantity - a.quantity;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const arrowStyle = {
    color: 'blue', 
    fontWeight: 'bold',
    marginLeft: '5px',
  };

  const columnStyles = {
    refundId: { width: '100px' },
    description: { width: '200px' },
    quantity: { width: '100px' },
    transactionId: { width: '150px' },
    refundDate: { width: '150px' },
    action: { width: '100px' },  // New column for the delete button
  };

  const handleDelete = async (refundId) => {
    try {
      const response = await axios.delete('https://cegm-backend.onrender.com/deleteRefund', {
        data: { refundId },
      });
      if (response.data.success) {
        // If deletion is successful, refetch the data
        readRefundsData(prevData => prevData.filter(item => item.refundId !== refundId));
        alert('Refund deleted successfully');
      } else {
        alert('Failed to delete the refund');
      }
    } catch (error) {
      console.error('Error deleting refund:', error);
      alert('Error deleting refund');
    }
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">Refunded Sales</h5>
            </div>
            <div>
              <div className="dropdown">
                <Link to="/Sales/CreateRefund" className="btn btn-primary">
                  + Add Refund
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3">
          <div className="d-flex justify-content-end">
            <ul className="nav nav-underline fs-6 text-end me-3">
              <li className="nav-item pe-3">
                <Link
                  to="/Sales"
                  className="nav-link fw-semibold text-decoration-none" style={{color:'#6a6d71'}}
                >
                  Transaction
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/Sales/Refunded"
                  className="nav-link fw-semibold text-decoration-none border-bottom border-primary border-2"
                >
                  Refunded
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/Sales/Analysis"
                  className="nav-link fw-semibold text-decoration-none" style={{color:'#6a6d71'}}
                >
                  Analysis & Report
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-5">
            <div className="w-100 mb-3">
              <input
                type="text"
                className="form-input rounded-pill border-primary"
                placeholder="Search by Refund ID/Transaction ID/Item Description/Refund Date"
                style={{ width: '100%', paddingLeft: 10 }}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="table-responsive">
            <table className="table table-hover border-top">
      <thead>
        <tr>
          <th onClick={() => requestSort('refundId')} style={{ ...columnStyles.refundId, cursor: 'pointer' }}>
            REFUND ID
            {sortConfig.key === 'refundId' && (
              <span style={arrowStyle}>
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </th>
          <th onClick={() => requestSort('description')} style={{ ...columnStyles.description, cursor: 'pointer' }}>
            ITEM DESCRIPTION
            {sortConfig.key === 'description' && (
              <span style={arrowStyle}>
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </th>
          <th onClick={() => requestSort('quantity')} style={{ ...columnStyles.quantity, cursor: 'pointer' }}>
            QUANTITY
            {sortConfig.key === 'quantity' && (
              <span style={arrowStyle}>
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </th>
          <th onClick={() => requestSort('transactionId')} style={{ ...columnStyles.transactionId, cursor: 'pointer' }}>
            TRANSACTION ID
            {sortConfig.key === 'transactionId' && (
              <span style={arrowStyle}>
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </th>
          <th onClick={() => requestSort('refundDate')} style={{ ...columnStyles.refundDate, cursor: 'pointer' }}>
            REFUND DATE
            {sortConfig.key === 'refundDate' && (
              <span style={arrowStyle}>
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </th>
          <th style={{ ...columnStyles.action, cursor: 'pointer' }}>ACTION</th>
        </tr>
      </thead>
      <tbody className="fs-6 align-middle table-group-divider">
        {sortedData.length > 0 ? (
          sortedData.map((item, index) => (
            <tr key={index}>
              <th scope="row" className="text-primary">{item.refundId}</th>
              <td className="text-primary">{item.description}</td>
              <td className="text-primary">{item.quantity}</td>
              <td className="text-primary">{item.transactionId}</td>
              <td className="text-primary">{item.refundDate}</td>
              <td className="text-primary">
                <button
                  onClick={() => handleDelete(item.refundId)}
                  className="btn btn-sm btn-danger"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center">No data available</td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Refunded;
