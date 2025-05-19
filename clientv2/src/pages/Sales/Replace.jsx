import React, { useState, useEffect } from 'react';
import styles from './Sales.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import Modal from './ModalFeature';
import Select from 'react-select';

const CreateReplace = () => {
  const [items, setItems] = useState([{ product_id: '', product_name: '', stock: '', quantity_integer: '', unit_price: '', totalPrice: '', product_category: '' },]);
  const [orNumber, setORNumber] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { transactionId } = useParams();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [deletevalue, setdeletevalue] = useState(null)
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getTransaction/${transactionId}`);

        if (response.data) {
          setTransactionDetails(response.data);

          setItems(
            (response.data.items || []).map(item => ({
              transaction_item_id: item._id,
              product_id: item.product_id,
              product_category: item.product_category,
              product_name: item.product_name,
              product_description: item.product_description,
              product_supplier: item.product_supplier,
              stock: "",
              quantity_integer: 0,
              current_quantity: item.quantity_integer,
              unit_price: (item.unit_price * 1.10).toFixed(2),
              totalPrice: 0,
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

  const handleCancel = () => {
    navigate(`/Sales/ViewTransaction/${transactionId}`);
  };

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'quantity_integer') {

      const stock = parseInt(updatedItems[index].stock, 10) || 0;
      const currentQuantity = parseInt(updatedItems[index].current_quantity, 10) || 0;

      // Maximum allowed quantity is stock + current quantity
      const maxAllowedQuantity = stock + currentQuantity;

      let newQuantity = parseInt(value, 10);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 0;
      } else if (newQuantity > currentQuantity) {
        newQuantity = currentQuantity;
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

  const handleModalClose = () => {
    setShowSaveModal(false);
    setModalMessage('');
  };
  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Create the sales transaction object and send to the backend
    const filteredItems = items.filter(item => item.quantity_integer > 0);
    // Check if there are no valid items to refund
    if (filteredItems.length === 0) {
      setShowSaveModal(true);
      setModalMessage('No items to refund. Please put an amount on what you want to refund.');
      return; // Exit the function early
    }

    const replace = {
      transaction_Date: new Date(),
      reason: reason,
      items: items
        .filter(item => item.quantity_integer > 0)
        .map(item => ({
          transaction_Item_id: item.transaction_item_id,
          product_id: item.product_id,
          name: item.product_name,
          category: item.product_category,
          description: item.product_description,
          supplier: item.product_supplier,
          quantity: item.quantity_integer,
        }))
    };

    console.log(replace)

    axios
      .put(`http://localhost:3000/createReplaceTransaction/${transactionId}`, replace)
      .then((result) => {
        if (result.data.success) {
          setShowSaveModal(true);
          setModalMessage('Replace Successful!');
          setTimeout(() => {
            navigate(`/Sales/ViewTransaction/${transactionId}`);
          }, 2000);
        } else {
          throw new Error(result.data.error || 'Unknown error occurred');
        }
      })
      .catch((err) => {
        console.error("Error details:", err.response?.data || err.message);
        setShowSaveModal(true);
        setModalMessage(
          'Error saving transaction: ' + (err.response?.data?.error || err.message)
        );
      });
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <div className="card shadow-sm py-3 px-4 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-bar-chart-fill fs-3"></i>
              <h5 className="fw-semibold ms-3 mb-0">Replace</h5>
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

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-1">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Item Category</th>
                <th style={{ width: '10%' }}>Item Name</th>
                <th style={{ width: '15%' }}>Product Description</th>
                <th style={{ width: '10%' }}>Product Supplier</th>
                <th style={{ width: '7%' }}>Quantity to Replace</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.product_category}
                      readOnly
                      className="form-control"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={item.product_name}
                      readOnly
                      className="form-control"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={item.product_description}
                      readOnly
                      className="form-control"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={item.product_supplier}
                      readOnly
                      className="form-control"
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.quantity_integer}
                      onChange={(e) => handleInputChange(index, 'quantity_integer', e.target.value)}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card shadow-sm px-4 py-3 mt-3">
          <table className="table mt-4">
            <tbody>
              <tr>
                <td>Official Receipt No. :</td>
                <td>
                  <input type="text" value={transactionDetails?.orNumber || '-----'} readOnly className="form-control" />
                </td>
              </tr>
              <tr>
                <td>Reason (Optional): </td>
                <td>
                  <textarea placeholder="Please put reason here"
                    rows={6}
                    name="reason"
                    id="reason"
                    className="form-control"
                    value={reason}
                    onChange={handleReasonChange}
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 d-flex justify-content-end">
            <button onClick={handleSaveChanges} className="btn btn-primary me-2" style={{ marginRight: '12px' }}>Replace</button>
            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
      <Modal isOpen={showSaveModal} message={modalMessage} onClose={handleModalClose} />
    </div>
  );
};

export default CreateReplace;