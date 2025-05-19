import React, { useState, useEffect } from "react";
import styles from "./Sales.module.css";
import { Link } from "react-router-dom";
import axios from 'axios';
import { Line } from "react-chartjs-2";
import Select from "react-select";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


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
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
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

  // Fetch products filtered by category
  const fetchProducts = async (category = null) => {
    try {
      const url = category
        ? `http://localhost:3000/productsByCategory/${category}`
        : 'http://localhost:3000/products';

      const response = await axios.get(url);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Name,  // Changed to use product name for filtering
        label: product.product_Name,
        description: product.product_Description,
        supplier: product.product_Supplier,
        unitPrice: product.product_Price,
        stock: product.product_Current_Stock,
        category: product.product_Category,
      }));

      setProducts(productOptions);
      // Reset product and supplier selections when category changes
      setSelectedProduct(null);
      setSuppliers([]);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch suppliers filtered by product's supplier info
  const fetchSuppliers = async (productSupplier) => {
    try {
      const response = await axios.get('http://localhost:3000/suppliers');
      let allSuppliers = response.data.suppliers;

      let filteredSuppliers = [];
      if (Array.isArray(productSupplier)) {
        filteredSuppliers = allSuppliers.filter(s => productSupplier.includes(s.supplier_Id));
      } else if (productSupplier) {
        filteredSuppliers = allSuppliers.filter(s => s.supplier_Id === productSupplier);
      } else {
        filteredSuppliers = allSuppliers;
      }

      const supplierOptions = filteredSuppliers.map(supplier => ({
        value: supplier.supplier_Id,
        label: supplier.supplier_Name,
      }));

      setSuppliers(supplierOptions); // <-- Update top-level suppliers state
      setSelectedSupplier(null);     // Reset selected supplier
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    const fetchSalesTransactions = async () => {
      try {
        const response = await axios.post('http://localhost:3000/findsalestransaction');
        readTransactionData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching sales transactions:", error);
      }
    };

    fetchSalesTransactions();
  }, []);

  useEffect(() => {
    let filtered = data;

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

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.transactionItems.some(transactionItem =>
          transactionItem.product_category.toLowerCase() === selectedCategory.value.toLowerCase()
        )
      );
    }

    // Filter by product (after category is selected)
    if (selectedProduct) {
      filtered = filtered.filter(item =>
        item.transactionItems.some(transactionItem =>
          transactionItem.product_name.toLowerCase() === selectedProduct.value.toLowerCase()
        )
      );
    }

    // Filter by supplier (after product is selected)
    if (selectedSupplier) {
      filtered = filtered.filter(item =>
        item.transactionItems.some(transactionItem =>
          transactionItem.supplier_name?.toLowerCase() === selectedSupplier.label.toLowerCase()
        )
      );
    }

    if (startDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(item => new Date(item.transactionDate) <= new Date(endDate));
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedCategory, selectedProduct, selectedSupplier, startDate, endDate, data]);


  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handler when category changes
  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    fetchProducts(selectedOption ? selectedOption.value : null);
  };

  // Handler when product changes
  const handleProductChange = (selectedOption) => {
    setSelectedProduct(selectedOption);
    if (selectedOption) {
      // Create supplier options based on the selected product's supplier info
      const supplierOptions = [{
        value: selectedOption.supplier, // Assuming supplier is the ID
        label: selectedOption.supplier // You might want to map this to actual supplier name
      }];
      setSuppliers(supplierOptions);
      setSelectedSupplier(null); // Reset selected supplier when product changes
    } else {
      setSuppliers([]);
      setSelectedSupplier(null);
    }
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
  for (let i = 1; i <= totalPages; i++) {
    paginationButtons.push(
      <button
        key={i}
        className={`btn ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </button>
    );
  }

  const calculateTotalSales = () => {
    return filteredData.reduce((acc, item) => {
      const total = parseFloat(item.totalSales.replace(/[^0-9.-]+/g, ""));
      return acc + total;
    }, 0);
  };

  // Generate sales trends data
  const generateSalesTrends = () => {
    const trends = {};

    // Group sales by transaction date
    filteredData.forEach(item => {
      const transactionDate = item.transactionDate
        ? new Date(item.transactionDate).toLocaleDateString('en-GB')
        : '';

      const salesData = parseFloat(item.totalSales.replace(/[^0-9.-]+/g, ""));

      if (trends[transactionDate]) {
        trends[transactionDate] += salesData;
      } else {
        trends[transactionDate] = salesData;
      }
    });

    const labels = Object.keys(trends); // Dates
    const data = Object.values(trends); // Corresponding total sales for each date

    return { labels, data };
  };

  const { labels, data: salesData } = generateSalesTrends();

  // Chart.js Data for Trends (by date instead of category)
  const chartData = {
    labels: labels, // Array of dates
    datasets: [
      {
        label: 'Total Sales by Date',
        data: salesData, // Array of sales for each date
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

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

  const generatePDF = async (data) => {
    if (data.length === 0) {
      alert("No data available to generate PDF.");
      return;
    }

    const doc = new jsPDF();
    const margin = 14;
    const lineHeight = 10;

    // Header Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales Report', margin, 20);

    // Optional Company Info or Report Date
    const today = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Generated: ${today}`, margin, 27);

    // Total Sales Summary
    const totalSales = calculateTotalSales(); // Ensure this is defined externally
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Sales: ₱${totalSales.toFixed(2)}`, margin, 37);

    // Table Headers
    const tableYStart = 47;
    const headers = ['Transaction ID', 'Cashier Name', 'Total Sales', 'Transaction Date'];
    const columnWidths = [50, 50, 40, 40];

    let currentY = tableYStart;

    // Draw header row background
    doc.setFillColor(220, 220, 220); // Light gray
    doc.rect(margin, currentY - 7, columnWidths.reduce((a, b) => a + b), lineHeight, 'F');

    // Print headers
    headers.forEach((header, i) => {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(header, margin + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 2, currentY);
    });

    // Table Data
    currentY += lineHeight;
    doc.setFont('helvetica', 'normal');
    data.forEach(transaction => {
      const row = [
        transaction.transactionId,
        transaction.cashierName,
        `₱${parseFloat(transaction.totalSales.replace(/[^0-9.-]+/g, "")).toFixed(2)}`,
        new Date(transaction.transactionDate).toLocaleDateString('en-GB'),
      ];

      row.forEach((value, i) => {
        doc.text(value.toString(), margin + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 2, currentY);
      });

      currentY += lineHeight;

      // Page Break Logic
      if (currentY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Add Chart (if available)
    try {
      const chartElement = document.querySelector('.chart-container');
      if (chartElement) {
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add a new page for the chart
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Sales Chart', margin, 20); // Optional chart title

        // Add the image
        doc.addImage(imgData, 'PNG', margin, 30, pdfWidth, pdfHeight);
      } else {
        console.warn('Chart element not found.');
      }
    } catch (error) {
      console.error('Error generating chart image:', error);
      alert('An error occurred while generating the chart. Please try again.');
    }

    // Save the PDF
    doc.save(`Sales_Report_${today}.pdf`);
  };

  const handleGeneratePDF = () => {
    // Ensure data is available
    if (paginatedData && paginatedData.length > 0) {
      // Make sure chart data exists
      if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
        alert('Chart data is missing.');
        return;
      }
      generatePDF(paginatedData);
    } else {
      alert("No data available to generate PDF.");
    }
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
                  Analysis & Report
                </span>
              </li>
            </ul>

          </div>
          <div className="card shadow-sm px-4 py-3">
            <div className="mt-2">
              {/* Category Select (above) */}
              <div className="mb-3">
                <button className="btn btn-success" onClick={handleGeneratePDF}>
                  Generate PDF Report
                </button>
              </div>
              <div className="mb-3">
                <label className="form-label d-block" style={{ fontWeight: 'bold' }}>
                  Product Category
                </label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  placeholder="All"
                  isClearable
                  className="form-input rounded-pill border"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-block fw-bold">Product</label>
                <Select
                  options={products}
                  value={selectedProduct}
                  onChange={handleProductChange}
                  placeholder="All"
                  isClearable
                  className="form-input rounded-pill border"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-block fw-bold">Supplier</label>
                <Select
                  options={suppliers}
                  value={selectedSupplier}
                  onChange={(option) => setSelectedSupplier(option)}
                  placeholder="All"
                  isClearable
                  className="form-input rounded-pill border"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Other Inputs on the Same Row */}
              <div className="d-flex align-items-start mb-3">
                {/* General Search Input */}
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
                    <div className="text-danger mt-2">{endDateError}</div>
                  )}
                </div>
              </div>

              {/* Display Total Sales */}
              <div className="mb-4">
                <h5>Total Sales: ₱{calculateTotalSales().toFixed(2)}</h5>
              </div>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('transactionId')} style={columnStyles.transactionId}>
                      Transaction ID {sortConfig.key === 'transactionId' && <span style={arrowStyle}>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => requestSort('cashierName')} style={columnStyles.cashierName}>
                      Cashier Name {sortConfig.key === 'cashierName' && <span style={arrowStyle}>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => requestSort('totalSales')} style={columnStyles.totalSales}>
                      Total Sales {sortConfig.key === 'totalSales' && <span style={arrowStyle}>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => requestSort('transactionDate')} style={columnStyles.transactionDate}>
                      Transaction Date {sortConfig.key === 'transactionDate' && <span style={arrowStyle}>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>}
                    </th>
                    <th style={columnStyles.actions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((transaction) => (
                    <tr key={transaction.transactionId}>
                      <td>{transaction.transactionId}</td>
                      <td>{transaction.cashierName}</td>
                      <td>{transaction.totalSales}</td>
                      <td>{new Date(transaction.transactionDate).toLocaleDateString('en-GB')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Link to={`/Sales/ViewTransaction/${transaction.transactionId}`} className="btn btn-outline-primary">
                          View
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bar Chart */}
              <div className="chart-container">
                <Line data={chartData} />
              </div>
              {/* Pagination */}
              <div className="pagination-buttons">
                {paginationButtons}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sales;
