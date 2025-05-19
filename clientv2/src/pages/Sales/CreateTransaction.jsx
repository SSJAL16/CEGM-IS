import React, { useState, useEffect } from 'react';
import styles from './Sales.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import Modal from './ModalFeature';
import Select from 'react-select';

const CreateTransaction = () => {
  const [items, setItems] = useState([{ code: '', description: '', stock: '', quantity: '', unitPrice: '', totalPrice: '', category: '' },]);
  const [orNumber, setOrNumber] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const name = localStorage.getItem("full_name");

  const handleAddItem = () => {
    const newItem = {
      code: '',
      name: '',
      description: '',
      supplier: '',
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
      const unitPrice = parseFloat(updatedItems[index].unitPrice * 1.10) || 0;
      updatedItems[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  const calculateGrandTotal = (items) => {
    const total = items.reduce((acc, item) => acc + (parseFloat(item.totalPrice) || 0), 0);
    setGrandTotal(total.toFixed(2));
  };

  const handleDeleteItem = (index, value) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    setSelectedProducts((prev) => prev.filter(p => p.code !== value));
    calculateGrandTotal(updatedItems);
  };

  const handleCancel = () => {
    navigate('/Sales');
  };

  useEffect(() => {
    calculateGrandTotal(items);
  }, [items]);

  const Submit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Try submitting all stock movements first
      for (const item of items) {
        const stockMovement = {
          product_ID: item.code,
          adj_Quantity: item.quantity,
          adj_Price: item.unitPrice,
          adj_Comment: 'No Comment',
          adj_Description: item.description,
          adj_Category: item.category,
          adj_Date: new Date(),
          adj_Adjustment_Type: "Sold",
        };

        const movementRes = await fetch("https://cegm-backend.onrender.com/api/stockMovement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockMovement),
        });

        if (!movementRes.ok) {
          const errRes = await movementRes.json();
          throw new Error(errRes.message || "Failed to save stock movement.");
        }
      }

      // Step 2: Proceed with saving the sales transaction *only if all stock movements succeeded*
      const salesTransaction = {
        user_id: localStorage.getItem("user_id"),
        cashier_name: localStorage.getItem("full_name"),
        transaction_Date: new Date(),
        orNumber: orNumber,
        total_Sales: grandTotal,
        items: items.map((item) => ({
          product_id: item.code,
          label: item.label,
          category: item.category,
          description: item.description,
          supplier: item.supplier,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };

      const result = await axios.post("https://cegm-backend.onrender.com/createSalesTransaction", salesTransaction);

      if (!result.data.success) {
        throw new Error(result.data.error || "Unknown error while saving transaction.");
      }

      const transactionId = result.data.transactionId;

      // Step 3: Show success and redirect
      setShowModal(true);
      setModalMessage("Transaction and stock movement saved. Redirecting...");
      setTimeout(() => {
        navigate(`/Sales/ViewTransaction/${transactionId}`);
      }, 2000);
    } catch (error) {
      console.error("Submit Error:", error);
      setShowModal(true);
      setModalMessage("Error: " + (error.message || "Unknown error occurred."));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalMessage('');
  };

  useEffect(() => {
    const generateORNumber = () => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const yyyy = now.getFullYear();
      const randomDigits = Math.floor(100 + Math.random() * 900); // 3-digit random number
      return `${mm}${dd}${yyyy}${randomDigits}`;
    };

    setOrNumber(generateORNumber());
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://cegm-backend.onrender.com/categories');
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
    const previousCode = updatedItems[index].code;

    updatedItems[index] = {
      ...updatedItems[index],
      category: selectedOption ? selectedOption.value : '',
      code: '',
      label: '',
      name: '',
      description: '',
      supplier: '',
      unitPrice: '',
      stock: '',
      quantity: '',
      totalPrice: '',
      products: []
    };

    setItems(updatedItems);

    // Remove previously selected product from selectedProducts
    if (previousCode) {
      setSelectedProducts((prev) => prev.filter(p => p.code !== previousCode));
    }

    if (selectedOption) {
      fetchProductsByCategory(selectedOption.value, index);
    } else {
      fetchProducts(index);
    }
  };

  const fetchProductsByCategory = async (category, index) => {
    try {
      const response = await axios.get(`https://cegm-backend.onrender.com/productsByCategory/${category}`);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Id,
        label: product.product_Name,
        description: product.product_Description,
        supplier: product.product_Supplier,
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
      const response = await axios.get(`https://cegm-backend.onrender.com/products`);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Id,
        label: product.product_Name,
        description: product.product_Description,
        supplier: product.product_Supplier,
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
      handleInputChange(index, 'label', selectedOption ? selectedOption.label : '');
      handleInputChange(index, 'description', selectedOption ? selectedOption.description : '');
      handleInputChange(index, 'supplier', selectedOption ? selectedOption.supplier : '');
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
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">Create Sales Transaction</h5>
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3">
          <h6 className="mb-3">Transaction Details</h6>
          <div className="d-flex align-items-start mb-3">
            <div className="d-flex flex-column me-3" style={{ flex: '1' }}>
              <label>Cashier Name</label>
              <input
                type="text"
                value={name}
                readOnly
                className="form-control"
              />
            </div>
            <div style={{ flex: '1' }}>
              <label>Transaction Date</label>
              <input
                type="text"
                value={new Date().toLocaleString()}
                readOnly
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-1">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Action</th>
                <th style={{ width: '25%' }}>Category</th>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '30%' }}>Supplier</th>
                <th style={{ width: '10%' }}>Stock</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '10%' }}>Price</th>
                <th style={{ width: '10%' }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <button
                      onClick={() => {
                        handleDeleteItem(index, item.code)
                      }}
                      className="btn"
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
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
                        item.description
                          ? { value: item.category, label: item.category }
                          : categories.find((option) => option.value === item.code)
                      }
                      onChange={(selectedOption) => {
                        handleCategoryChange(index, selectedOption);
                        item.label = '';
                        item.description = '';
                        item.supplier = '';
                        item.stock = '';
                        item.unitPrice = '';
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
                        { value: item.label, label: item.label }
                      }
                      onChange={
                        (selectedOption) => {
                          setSelectedProducts((prev) => prev.filter(p => p.code !== item.code));
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
                      type="textbox"
                      className="form-control"
                      value={item.description}
                      readOnly
                      style={{ fontSize: '14px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.supplier || ''}
                      readOnly
                      style={{ fontSize: '14px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleInputChange(index, 'stock', e.target.value)}
                      className="form-control"
                      style={{ width: '70px' }}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={(item.unitPrice * 1.10).toFixed(2)}
                      onChange={(e) => handleInputChange(index, 'unitPrice', e.target.value)}
                      className="form-control"
                      readOnly
                      style={{ width: '100px', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.totalPrice}
                      readOnly
                      className="form-control"
                      style={{ width: '100px', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          <button onClick={handleAddItem} className="btn btn-primary">+ Add Item</button>
        </div>

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
                    type="number"
                    value={orNumber}
                    readOnly
                    className="form-control"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-end">
            <button onClick={handleCancel} className="btn btn-danger" style={{ marginRight: '12px' }}>Cancel</button>
            <button onClick={Submit} className="btn btn-primary">Done</button>
          </div>
        </div>
      </main>
      <Modal isOpen={showModal} message={modalMessage} onClose={handleModalClose} />
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

export default CreateTransaction;
