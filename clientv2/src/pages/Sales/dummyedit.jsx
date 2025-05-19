import React, { useState, useEffect } from 'react';
import Sidebar from '../SidebarComponents/Sidebar';
import styles from './Sales.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import Modal from './ModalFeature';
import Select from 'react-select';

const CreateTransaction = () => {
  const [items, setItems] = useState([{ code: '', description: '', stock: '', quantity_integer: '', unit_price: '', totalPrice: '', category: '' },]);
  const [orNumber, setORNumber] = useState('');
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
  const { transactionId } = useParams();

  console.log(items)

  useEffect(() => {
    console.log('Transaction ID:', transactionId); // Log transactionId

    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(`https://cegm-backend.onrender.com/getTransaction/${transactionId}`);
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddItem = () => {
    const newItem = {
      code: '',
      description: '',
      stock: '',
      quantity_integer: '',
      unit_price: '',
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

    if (field === 'quantity_integer') {
      const stock = parseInt(updatedItems[index].stock, 10) || 0;

      let newQuantity = parseInt(value, 10);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1; // Minimum quantity_integer
      } else if (newQuantity > stock) {
        newQuantity = stock; // Maximum quantity_integer
      }

      updatedItems[index].quantity_integer = newQuantity;
    } else {
      updatedItems[index][field] = value;
    }

    if (field === 'quantity_integer' || field === 'unit_price') {
      const quantity_integer = parseFloat(updatedItems[index].quantity_integer) || 0;
      const unit_price = parseFloat(updatedItems[index].unit_price) || 0;
      updatedItems[index].totalPrice = (quantity_integer * unit_price).toFixed(2);
    }

    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  const handleORChange = (value) => {
    setORNumber(value);
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

  const Submit = (e) => {
    e.preventDefault();

    // Create the sales transaction object
    const salesTransaction = {
      transaction_Date: new Date(),
      total_Sales: grandTotal,
      user_id: user.userId,
      orNumber: orNumber,
      items: items.map(item => ({
        product_id: item.code,
        quantity_integer: item.quantity_integer,
        unit_price: item.unit_price,
        totalPrice: item.totalPrice,
        description: item.product_name,
        category: item.product_category,
      })),
    };

    // Send sales transaction and items to the backend
    axios.post("https://cegm-backend.onrender.com/createSalesTransaction", salesTransaction)
      .then(result => {
        if (result.data.success) {
          setShowModal(true);
          setModalMessage('Transaction saved successfully! Redirecting...');
          console.log("Transaction saved successfully!", result.data);
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
        setShowModal(true);
        setModalMessage('Error: ' + (err.response?.data?.error || err.message));
      });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalMessage('');
  };

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
    updatedItems[index] = {
      ...updatedItems[index],
      category: selectedOption ? selectedOption.value : '',
      code: '',
      description: '',
      unit_price: '',
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
      const response = await axios.get(`https://cegm-backend.onrender.com/productsByCategory/${category}`);
      const fetchedProducts = response.data.products;
      const productOptions = fetchedProducts.map(product => ({
        value: product.product_Id,
        label: product.product_Name,
        unit_price: product.product_Price,
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
        unit_price: product.product_Price,
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
      handleInputChange(index, 'unit_price', selectedOption ? selectedOption.unit_price : '');
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
                value={user ? user.username : "e.g. Ssteven Allaga"}
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
                <th style={{ width: '30%' }}>Item Category</th>
                <th style={{ width: '35%' }}>Item Name</th>
                <th style={{ width: '10%' }}>Stock</th>
                <th style={{ width: '10%' }}>quantity_integer</th>
                <th style={{ width: '10%' }}>Unit Price</th>
                <th style={{ width: '10%' }}>Total Price</th>
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
                      value={item.quantity_integer}
                      onChange={(e) => handleInputChange(index, 'quantity_integer', e.target.value)}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleInputChange(index, 'unit_price', e.target.value)}
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
                    onChange={(e) => handleORChange(e.target.value)}
                    className="form-control"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-end">
            <button onClick={handleCancel} className="btn btn-danger me-2">Cancel</button>
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
