import React, { useState, useEffect } from 'react';
import styles from './Sales.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import Modal from './ModalFeature';
import Select from 'react-select';

const EditTransaction = () => {
  const [items, setItems] = useState([{ product_id: '', product_name: '', stock: '', quantity_integer: '', unit_price: '', totalPrice: '', product_category: '' },]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { transactionId } = useParams();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [deletevalue, setdeletevalue] = useState(null)
  const [deleteIndex, setDeleteIndex] = useState(null);

  console.log(items)
  useEffect(() => {
    console.log('Transaction ID:', transactionId); // Log transactionId    

    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(`https://cegm-backend.onrender.com/getTransaction/${transactionId}`);

        console.log(response.data);

        if (response.data) {
          setTransactionDetails(response.data);

          setItems(
            (response.data.items || []).map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              description: item.product_description,
              supplier: item.product_supplier,
              quantity_integer: item.quantity_integer,
              current_quantity: item.quantity_integer,
              unit_price: item.unit_price,
              totalPrice: item.totalPrice,
              product_category: item.product_category,
              status: item.status,
              products: [],
            }))
          );

          setSelectedProducts(
            (response.data.items || []).map(item => ({
              code: item.product_id,
            })),
          )

          response.data.items.forEach((item, index) => {
            fetchProducts(index)
            fetchProductsById(item.product_id)
          });

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

  const fetchProductsById = async (product_id, index) => {
    try {
      const response = await axios.get(`https://cegm-backend.onrender.com/productsByID/${product_id}`);
      const fetchedProductsStock = response.data.products;
      const stock = fetchedProductsStock[0]?.product_Current_Stock; // Get the stock directly

      setItems((prevItems) => {
        const updatedItems = [...prevItems];
        // Find the index of the item with the same product_id
        const itemIndex = updatedItems.findIndex(item => item.product_id === product_id);
        if (itemIndex !== -1) {
          updatedItems[itemIndex].stock = stock; // Update the stock for the found item
        }
        return updatedItems;
      });
    } catch (error) {
      console.error(`Error fetching products for id "${product_id}":`, error);
    }
  };

  const handleCancel = () => {
    navigate(`/Sales/ViewTransaction/${transactionId}`);
  };

  const handleAddItem = () => {
    const newItem = {
      product_id: '',
      product_name: '',
      stock: '',
      description: '',
      supplier: '',
      quantity_integer: '',
      unit_price: '',
      totalPrice: '',
      product_category: '',
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
      console.log('stock', updatedItems[index]);

      const stock = parseInt(updatedItems[index].stock, 10) || 0;
      const currentQuantity = parseInt(updatedItems[index].current_quantity, 10) || 0;
      console.log(currentQuantity)

      // Maximum allowed quantity is stock + current quantity
      const maxAllowedQuantity = stock + currentQuantity;

      let newQuantity = parseInt(value, 10);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1; // Minimum quantity_integer
      } else if (newQuantity > maxAllowedQuantity) {
        newQuantity = maxAllowedQuantity; // Maximum quantity_integer
      }

      updatedItems[index].quantity_integer = newQuantity;
    } else {
      updatedItems[index][field] = value;
    }

    if (field === 'quantity_integer' || field === 'unit_price') {
      const quantity_integer = parseFloat(updatedItems[index].quantity_integer) || 0;
      const unit_price = parseFloat(updatedItems[index].unit_price * 1.10) || 0;
      updatedItems[index].totalPrice = (quantity_integer * unit_price).toFixed(2);
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

  useEffect(() => {
    calculateGrandTotal(items);
  }, [items]);

  const handleModalClose = () => {
    setShowSaveModal(false);
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
      product_category: selectedOption ? selectedOption.value : '',
      product_id: '',
      product_name: '',
      description: '',
      supplier: '',
      unit_price: '',
      stock: '',
      quantity: '',
      totalPrice: '',
      products: []
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
        description: product.product_Description,
        supplier: product.product_Supplier,
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
        description: product.product_Description,
        supplier: product.product_Supplier,
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

  const confirmDelete = (index, value) => {

    setDeleteIndex(index);  // Store the index of the item to be deleted
    setdeletevalue(value);
    setShowModal(true);  // Show confirmation modal
  };

  const handleDeleteConfirmed = () => {
    const updatedItems = items.filter((item, idx) => idx !== deleteIndex);
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
    setSelectedProducts((prev) => prev.filter(p => p.code !== deletevalue));
    setShowModal(false);  // Hide modal after deletion
  };

  const handleDeleteCancelled = () => {
    setShowModal(false);  // Close modal without deleting
  };

  const handleProductChange = (index, selectedOption) => {
    if (selectedOption.stock == '0') {
      setShowModal(true);
      setModalMessage(selectedOption.label + " is out of stock.");
      setSelectedProducts((prev) => prev.filter(p => p.code !== value));
      return
    } else {
      handleInputChange(index, 'product_id', selectedOption ? selectedOption.value : '');
      handleInputChange(index, 'product_name', selectedOption ? selectedOption.label : '');
      handleInputChange(index, 'description', selectedOption ? selectedOption.description : '');
      handleInputChange(index, 'supplier', selectedOption ? selectedOption.supplier : '');
      handleInputChange(index, 'unit_price', selectedOption ? selectedOption.unit_price : '');
      handleInputChange(index, 'stock', selectedOption ? selectedOption.stock : '');
      handleInputChange(index, 'product_category', selectedOption ? selectedOption.category : '');

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

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Submit stock movements
      for (const item of items) {
        const stockMovement = {
          product_ID: item.product_id,
          adj_Quantity: item.quantity_integer,
          adj_Price: item.unit_price,
          adj_Comment: 'No Comment',
          adj_Description: item.description,
          adj_Category: item.product_category,
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

      // Step 2: Update the sales transaction
      const updatedTransaction = {
        transaction_Date: new Date(),
        total_Sales: grandTotal,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity_integer,
          unitPrice: item.unit_price,
          totalPrice: item.totalPrice,
          name: item.product_name,
          description: item.description,
          supplier: item.supplier,
          category: item.product_category,
          status: item.status,
        }))
      };

      const result = await axios.put(`https://cegm-backend.onrender.com/updateSalesTransaction/${transactionId}`, updatedTransaction);

      if (!result.data.success) {
        throw new Error(result.data.error || "Unknown error occurred while updating transaction.");
      }

      // Step 3: Handle success or deletion
      setShowSaveModal(true);

      if (result.data.message === "Transaction deleted successfully due to no items, and stock restored") {
        setModalMessage("Transaction deleted successfully due to no items.");
        setTimeout(() => {
          navigate("/Sales");
        }, 2000);
      } else {
        setModalMessage("Transaction saved successfully!");
        const newTransactionId = result.data.transactionId;
        setTimeout(() => {
          navigate(`/Sales/ViewTransaction/${newTransactionId}`);
        }, 2000);
      }

    } catch (error) {
      console.error("Error saving transaction:", error);
      setShowSaveModal(true);
      setModalMessage("Error saving transaction: " + (error.message || "Unknown error occurred."));
    }
  };


  return (
    <div className={styles.dashboard}>
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
                <th style={{ width: '5%' }}>Action</th>
                <th style={{ width: '25%' }}>Item Category</th>
                <th style={{ width: '25%' }}>Item Name</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '30%' }}>Supplier</th>
                <th style={{ width: '10%' }}>Stock</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Retail Price</th>
                <th style={{ width: '10%' }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <button
                      onClick={() => {
                        confirmDelete(index, item.product_id)
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
                          : categories.find((option) => option.value === item.product_id)
                      }
                      onChange={(selectedOption) => {
                        handleCategoryChange(index, selectedOption);
                        item.product_name = '';
                        item.description = '';
                        item.supplier = '';
                        item.stock = '';
                        item.unit_price = '';
                        setSelectedProducts((prev) => prev.filter(p => p.code !== item.product_id));
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
                      type="textbox"
                      className="form-control"
                      value={item.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      readOnly
                      style={{ fontSize: '14px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.supplier || ''}
                      onChange={(e) => handleInputChange(index, 'supplier', e.target.value)}
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
                      value={item.quantity_integer}
                      onChange={(e) => handleInputChange(index, 'quantity_integer', e.target.value)}
                      className="form-control"
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={(item.unit_price * 1.10).toFixed(2)}
                      onChange={(e) => handleInputChange(index, 'unit_price', e.target.value)}
                      className="form-control"
                      readOnly
                      style={{ width: '100px', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={parseFloat(item.totalPrice).toFixed(2)}
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

        {showModal && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px' }}>
            <div className="modal-content" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
              <h5>Are you sure you want to remove this item?</h5>
              <div className="d-flex justify-content-end mt-3">
                <button onClick={handleDeleteConfirmed} className="btn btn-danger me-2">Yes, Remove</button>
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
                  <input type="text" value={transactionDetails?.orNumber || '-----'} readOnly className="form-control" />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-end gap-3">
            <button
              onClick={handleSaveChanges}
              className="btn btn-primary"
              style={{ marginRight: '12px' }}
            >
              Save Changes
            </button>
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
