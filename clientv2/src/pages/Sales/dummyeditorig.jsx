import React, { useState, useEffect } from 'react';
import Sidebar from '../SidebarComponents/Sidebar';
import styles from './Sales.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from './ModalFeature';
axios.defaults.withCredentials = true;
import Select from 'react-select';


const EditTransaction = () => {
  const [items, setItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState('0.00');
  const [amountGiven, setAmountGiven] = useState('-----');
  const [change, setChange] = useState('0.00');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);  // Modal visibility state
  const [deleteIndex, setDeleteIndex] = useState(null); // Track index of item to delete
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  console.log(items)

  useEffect(() => {
    console.log('Transaction ID:', transactionId); // Log transactionId

    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/getTransaction/${transactionId}`);
        console.log('Fetched data:', response.data); // Log the fetched data for debugging

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

  // Handle the deletion of an item
  const confirmDelete = (index) => {
    setDeleteIndex(index);  // Store the index of the item to be deleted
    setShowModal(true);  // Show confirmation modal
  };

  const handleDeleteConfirmed = () => {
    const updatedItems = items.filter((item, idx) => idx !== deleteIndex);
    setItems(updatedItems);
    calculateTotals(updatedItems);
    setShowModal(false);  // Hide modal after deletion
  };

  const handleDeleteCancelled = () => {
    setShowModal(false);  // Close modal without deleting
  };

  // Calculate the grand total, change, and other totals
  const calculateTotals = (updatedItems) => {
    let total = 0;
    updatedItems.forEach(item => {
      total += parseFloat(item.totalPrice);
    });
    setGrandTotal(total.toFixed(2));
    setChange((parseFloat(amountGiven) - total).toFixed(2));
  };

  // Update total price when quantity or unit price changes
  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'quantity') {
      const stock = parseInt(updatedItems[index].stock, 10) || 0;

      let newQuantity = parseInt(value, 10);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1; // Minimum quantity
      } else if (newQuantity > stock) {
        newQuantity = stock; // Maximum quantity
      }

      updatedItems[index].quantity = newQuantity;
    } else {
      updatedItems[index][field] = value;
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  const calculateGrandTotal = (items) => {
    const total = items.reduce((acc, item) => acc + (parseFloat(item.totalPrice) || 0), 0);
    setGrandTotal(total.toFixed(2));
  };

  const handleAddItem = () => {
    const newItem = {
      code: '',
      description: '',
      stock: '',
      quantity: '',
      unitPrice: '',
      totalPrice: '',
      category: '',
      products: [] // Initialize products array for the new item
    };

    setItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      const newItemIndex = updatedItems.length - 1; // Get the index of the newly added item

      // Fetch products and update the new item's products field
      fetchProducts(newItemIndex);

      return updatedItems;
    });
  };

  useEffect(() => {
    calculateGrandTotal(items);
  }, [items]);

  const statusOptions = [
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Sold', label: 'Sold' },
  ];

  const handleStatusChange = (index, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[index].status = selectedOption.value; // Update status based on selection
    setItems(updatedItems); // Update state
  };

  const handleCancel = () => {
    navigate(`/Sales/ViewTransaction/${transactionId}`);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Create the sales transaction object and send to the backend
    const updatedTransaction = {
      transaction_Date: new Date(),
      total_Sales: grandTotal,
      profit: (grandTotal / 1.15) * 0.15,
      user_id: 1, // Placeholder value
      amount_Given: amountGiven,
      items: items.map(item => ({
        product_id: item.product_id,  // Map code to product_id
        quantity: item.quantity_integer,
        unitPrice: item.unit_price,
        totalPrice: item.totalPrice,
        description: item.description
      }))
    };
    // Send sales transaction to the backend
    axios.put(`http://localhost:3001/updateSalesTransaction/${transactionId}`, updatedTransaction)
      .then(result => {
        if (result.data.success) {
          setShowSaveModal(true);
          setModalMessage('Transaction saved successfully!');
          console.log("Transaction saved successfully!", result.data);
          // Optional if nobody liked the modal, will be coded out immediately: navigate to sales page after success
          // navigate('/Sales');
          const transactionId = result.data.transactionId;
          setTimeout(() => {
            navigate(`/Sales/ViewTransaction/${transactionId}`);
          }, 2000);
        } else {
          throw new Error(result.data.error || 'Unknown error occurred');
        }
      })
      .catch(err => {
        console.error("Error details:", err.response?.data || err.message);
        setShowSaveModal(true);
        setModalMessage('Error saving transaction: ' + (err.response?.data?.error || err.message));
      });
  };

  const handleModalClose = () => {
    setShowSaveModal(false);
    setModalMessage('');
  };

  useEffect(() => {
    calculateTotals(items);
  }, [items]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3001/categories');
        const fetchedCategories = response.data.categories
        const categoryOptions = fetchedCategories.map(category => ({
          value: category,
          label: category
        }));
        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory !== undefined) {
      items.forEach((_, index) => {
        handleCategoryChange(index, selectedCategory);
      });
    }
  }, [selectedCategory]);

  const handleCategoryChange = (index, selectedOption) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      category: selectedOption ? selectedOption.value : '',
      code: '',
      description: '',
      unitPrice: '',
      stock: '',
    };
    setItems(updatedItems);

    if (selectedOption) {
      fetchProductsByCategory(selectedOption.value, index);
    } else {
      fetchProducts(index);
    }
  };

  const fetchProductsByCategory = async (category, index) => {
    try {
      const response = await axios.get(`http://localhost:3001/productsByCategory/${category}`);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Id,
        label: product.product_Name,
        unitPrice: product.product_Price,
        stock: product.product_Current_Stock,
        category: product.product_Category,
      }));
      const updatedItems = [...items];
      updatedItems[index].products = productOptions;
      setItems(updatedItems);
    } catch (error) {
      console.error(`Error fetching products for category "${category}":`, error);
    }
  };

  const fetchProducts = async (index) => {
    try {
      const response = await axios.get(`http://localhost:3001/products`);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Id,
        label: product.product_Name,
        unitPrice: product.product_Price,
        stock: product.product_Current_Stock,
        category: product.product_Category,
      }));

      // Update the specific item's products
      setItems((prevItems) => {
        const updatedItems = [...prevItems];
        if (updatedItems[index]) {
          updatedItems[index].products = productOptions;
        }
        return updatedItems;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductChange = (index, selectedOption) => {
    if (selectedOption.stock == '0') {
      setShowModal(true);
      setModalMessage(selectedOption.label + " is out of stock.");
      setSelectedProducts((prev) => prev.filter(p => p.code !== value));
      return
    } else {
      handleInputChange(index, 'code', selectedOption ? selectedOption.value : '');
      handleInputChange(index, 'description', selectedOption ? selectedOption.label : '');
      handleInputChange(index, 'unitPrice', selectedOption ? selectedOption.unitPrice : '');
      handleInputChange(index, 'stock', selectedOption ? selectedOption.stock : '');
      handleInputChange(index, 'category', selectedOption ? selectedOption.category : '');

      setSelectedProducts((prev) => {
        const existingProductIndex = prev.findIndex(p => p.code === selectedOption.value);

        if (existingProductIndex !== -1) {
          // If found, remove it from the array
          return prev.filter(p => p.code !== value);
        } else {
          // If not found, add the new item without the index
          return [...prev, { code: selectedOption.value }];
        }
      });
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">Edit Sales Transaction</h5>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3">
          <h6 className="mb-3">Transaction Details</h6>
          <div className="d-flex align-items-start mb-3">
            <div className="d-flex flex-column me-3" style={{ flex: '1' }}>
              <label>Transaction ID</label>
              <input type="text" value={transactionId} readOnly className="form-control" />
              <label className="mt-2">Cashier Name</label>
              <input type="text" value={transactionDetails?.cashierName || '-----'} readOnly className="form-control" />
            </div>
            <div style={{ flex: '1' }}>
              <label>Transaction Date</label>
              <input type="text" value={transactionDetails ? new Date(transactionDetails.transaction_Date).toLocaleString() : '-----'} readOnly className="form-control" />
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-1">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Action</th>
                <th style={{ width: '15%' }}>Item Category</th>
                <th style={{ width: '15%' }}>Item Name</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Unit Price</th>
                <th style={{ width: '10%' }}>Total Price</th>
                <th style={{ width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <button
                      onClick={() => confirmDelete(index)}
                      className="btn btn-danger"
                      style={{
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: 'none',
                        fontSize: '1.5rem',
                        lineHeight: '1rem',
                      }}
                    >
                      &minus;
                    </button>
                  </td>
                  <td>
                    <Select
                      value={
                        item.product_name
                          ? { value: item.product_category, label: item.product_category }
                          : categories.find((option) => option.value === item.code)
                      }
                      onChange={(selectedOption) => {
                        handleCategoryChange(index, selectedOption);
                        item.product_name = '';
                        item.stock = '';
                        item.unit_price = '';
                        setSelectedProducts((prev) => prev.filter(p => p.code !== item.code));
                      }}
                      options={categories}
                      placeholder="Category"
                      styles={customStyles}
                    />
                  </td>
                  <td>
                    <Select
                      value={
                        { value: item.product_name, label: item.product_name }
                      }
                      onChange={
                        (selectedOption) => {
                          setSelectedProducts((prev) => prev.filter(p => p.code !== item.product_id));
                          handleProductChange(index, selectedOption)
                        }
                      }
                      options={
                        item.products &&
                        item.products.filter(product => {
                          return !selectedProducts.find(p => p.code === product.value);
                        })
                      }
                      placeholder="Name"
                      styles={customStyles}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity_integer}
                      onChange={(e) => handleInputChange(index, 'quantity_integer', e.target.value)}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleInputChange(index, 'unit_price', e.target.value)}
                      className="form-control"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.totalPrice}
                      readOnly
                      className="form-control"
                    />
                  </td>
                  <td>
                    <Select
                      value={statusOptions.find((option) => option.value === item.status)}
                      onChange={(selectedOption) => handleStatusChange(index, selectedOption)}
                      options={statusOptions}
                      placeholder="Select Status"
                      styles={customStyles}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddItem} className="btn btn-primary">+ Add Item</button>
        </div>

        {/* Modal for confirmation */}
        {showModal && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px' }}>
            <div className="modal-content" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
              <h5>Are you sure you want to delete this item?</h5>
              <div className="d-flex justify-content-end mt-3">
                <button onClick={handleDeleteConfirmed} className="btn btn-danger me-2">Yes, Delete</button>
                <button onClick={handleDeleteCancelled} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-4">
            <tbody>
              <tr>
                <td>Grand Total:</td>
                <td>P {grandTotal}</td>
              </tr>
              <tr>
                <td>Official Receipt No. :</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-end">
            <button onClick={handleSaveChanges} className="btn btn-primary me-2">Save Changes</button>
            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
      <Modal isOpen={showSaveModal} message={modalMessage} onClose={handleModalClose} />
    </div>
  );
};


const customStyles = {
  control: (provided) => ({
    ...provided,
    height: '35px', // Match the height of Bootstrap inputs
    minHeight: '38px',
    borderRadius: '4px', // Match Bootstrap border radius
    fontSize: '14px', // Match font size of inputs
    borderColor: '#ced4da', // Match Bootstrap border color
    boxShadow: 'none', // Disable default shadow
    '&:hover': {
      borderColor: '#80bdff', // Match Bootstrap hover border color
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px', // Match Bootstrap padding
  }),
  input: (provided) => ({
    ...provided,
    margin: '0', // Remove extra margin
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d', // Match Bootstrap placeholder color
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#495057', // Match Bootstrap input text color
  }),
};

export default EditTransaction;
