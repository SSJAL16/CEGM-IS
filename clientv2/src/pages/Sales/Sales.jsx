import React, { useState, useEffect } from "react";
import styles from "./Sales.module.css";
import { Link } from "react-router-dom";
import axios from 'axios';
axios.defaults.withCredentials = true;
import Select from 'react-select';

const ITEMS_PER_PAGE = 8;

const Sales = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'transactionId', direction: 'ascending' });
  const [data, readTransactionData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryQuery, setCategoryQuery] = useState('');
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://cegm-backend.onrender.com/categories');
        const fetchedCategories = response.data.categories;
        const categoryOptions = fetchedCategories.map(category => ({
          value: category,
          label: category,
        }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);
  useEffect(() => {
    let filtered = data;

    // Filter by general search query
    if (searchQuery !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const matchesTransactionItems = item.transactionItems.some(transactionItem =>
          transactionItem.product_name.toLowerCase().includes(lowerCaseQuery)
        );

        return (
          item.transactionId.toLowerCase().includes(lowerCaseQuery) ||
          item.cashierName.toLowerCase().includes(lowerCaseQuery) ||
          String(item.orNumber).toLowerCase().includes(lowerCaseQuery) ||
          matchesTransactionItems
        );
      });
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.transactionItems.some(transactionItem =>
          transactionItem.product_category.toLowerCase() === selectedCategory.value.toLowerCase()
        )
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) <= new Date(endDate));
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedCategory, startDate, endDate, data]);


  useEffect(() => {
    const fetchSalesTransactions = async () => {
      try {
        const response = await axios.post('https://cegm-backend.onrender.com/findsalestransaction');
        readTransactionData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching sales transactions:", error);
      }
    };

    fetchSalesTransactions();
  }, []);

  // Update filteredData based on search query
  useEffect(() => {
    let filtered = data;

    // Filter by search query
    if (searchQuery !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const matchesTransactionItems = item.transactionItems.some(transactionItem =>
          transactionItem.product_category.toLowerCase().includes(lowerCaseQuery) ||
          transactionItem.product_name.toLowerCase().includes(lowerCaseQuery)
        );

        return (
          item.transactionId.toLowerCase().includes(lowerCaseQuery) ||
          item.cashierName.toLowerCase().includes(lowerCaseQuery) ||
          String(item.orNumber).toLowerCase().includes(lowerCaseQuery) ||
          matchesTransactionItems
        );
      });
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) <= new Date(endDate));
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, startDate, endDate, data]);

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

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key === 'totalSales') {
      const numA = parseFloat(a.totalSales.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(b.totalSales.replace(/[^0-9.-]+/g, ""));

      return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
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

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginationButtons = [];

  // Previous Button
  paginationButtons.push(
    <button
      key="prev"
      className="btn btn-outline-primary mx-1"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      &lt;
    </button>
  );

  // Numbered Page Buttons
  for (let i = 1; i <= totalPages; i++) {
    paginationButtons.push(
      <button
        key={i}
        className={`btn mx-1 ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </button>
    );
  }

  // Next Button
  paginationButtons.push(
    <button
      key="next"
      className="btn btn-outline-primary mx-1"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      &gt;
    </button>
  );



  const arrowStyle = {
    color: 'blue',
    fontWeight: 'bold',
    marginLeft: '5px',
  };

  const columnStyles = {
    transactionId: { width: '150px' },
    cashierName: { width: '150px' },
    totalSales: { width: '100px' },
    transactionDate: { width: '150px' },
    actions: { width: '100px', textAlign: 'center' },
  };
  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">Sales</h5>
            </div>
            <div>
              <div className="dropdown">
                <Link to="/Sales/CreateTransaction" className="btn btn-primary">
                  + Add Transaction
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3">
          <div className="d-flex justify-content-start">
            <ul className="nav nav-underline ms-3" style={{ paddingLeft: 0 }}>
              <li className="nav-item pe-1">
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    display: 'block',
                    textAlign: 'left',
                    width: '100%',              
                    direction: 'ltr',         
                  }}
                >
                  Transactions
                </span>
              </li>
            </ul>

          </div>
          <div className="mt-3">
            {/* Category Select (above) */}
            <div className="mb-3">
              <label className="form-label d-block" style={{ fontWeight: 'bold' }}>
                Product Category
              </label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={(selectedOption) => setSelectedCategory(selectedOption)}
                placeholder="All"
                isClearable
                className="form-input rounded-pill border"
                classNamePrefix="react-select"
              />
            </div>

            {/* Other Inputs on the Same Row */}
            <div className="d-flex align-items-start mb-3">
              {/* General Search Input */}
              <div className="me-3" style={{ flex: 2 }}>
                <label className="form-label d-block" style={{ fontWeight: 'bold' }}>
                  Search
                </label>
                <input
                  type="text"
                  className="form-input rounded-pill border"
                  placeholder="Transaction ID/Cashier Name/OR Number"
                  style={{ width: '100%', paddingLeft: 10 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Start Date Input */}
              <div className="me-3" style={{ flex: 1 }}>
                <label className="form-label d-block" style={{ fontWeight: 'bold' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-input rounded-pill border"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ paddingLeft: 10 }}
                />
              </div>

              {/* End Date Input */}
              <div style={{ flex: 1 }}>
                <label className="form-label d-block" style={{ fontWeight: 'bold' }}>
                  End Date
                </label>
                <input
                  type="date"
                  className="form-input rounded-pill border"
                  value={endDate}
                  onChange={(e) => {
                    const selectedEndDate = e.target.value;
                    setEndDate(selectedEndDate);

                    // Validation: Check if End Date is valid
                    if (startDate && new Date(selectedEndDate) < new Date(startDate)) {
                      setEndDateError("Cannot be earlier than Start Date.");
                    } else {
                      setEndDateError(''); // Clear the error if valid
                    }
                  }}
                  style={{ paddingLeft: 10 }}
                />
                {endDateError && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.6rem' }}>
                    {endDateError}
                  </div>
                )}
              </div>
            </div>


            <div className="table-responsive">
              <table className="table table-hover border-top">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('transactionId')} style={{ ...columnStyles.transactionId, cursor: 'pointer' }}>
                      TRANSACTION ID
                      {sortConfig.key === 'transactionId' && (
                        <span style={arrowStyle}>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th onClick={() => requestSort('cashierName')} style={{ ...columnStyles.cashierName, cursor: 'pointer' }}>
                      CASHIER NAME
                      {sortConfig.key === 'cashierName' && (
                        <span style={arrowStyle}>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th onClick={() => requestSort('totalSales')} style={{ ...columnStyles.totalSales, cursor: 'pointer' }}>
                      TOTAL SALES
                      {sortConfig.key === 'totalSales' && (
                        <span style={arrowStyle}>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th onClick={() => requestSort('transactionDate')} style={{ ...columnStyles.transactionDate, cursor: 'pointer' }}>
                      TRANSACTION DATE
                      {sortConfig.key === 'transactionDate' && (
                        <span style={arrowStyle}>
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th style={columnStyles.actions}>ACTION</th>
                  </tr>
                </thead>
                <tbody className="fs-6 align-middle table-group-divider">



                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" className="text-primary" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/Sales/ViewTransaction/${item.transactionId}`}>{item.transactionId}</th>
                        <td className="text">{item.cashierName}</td>
                        <td className="text">{item.totalSales}</td>
                        <td className="text">
                          {new Date(item.transactionDate).toLocaleDateString('en-GB')}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <Link to={`/Sales/ViewTransaction/${item.transactionId}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i> Manage
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No data available</td>
                    </tr>
                  )}


                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              {paginationButtons}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sales;
