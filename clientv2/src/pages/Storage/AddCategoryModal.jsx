import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";
import axios from "axios";

const CategoryModal = ({ show, handleClose }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (show) {
      fetchCategories(); // Fetch categories whenever the modal opens
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/category");
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCategory) {
      // Update category
      try {
        await axios.put(
          `http://localhost:3001/api/category/${editingCategory._id}`,
          { product_Category: categoryName }
        );
        fetchCategories();
        handleReset();
      } catch (error) {
        console.error("Failed to update category", error);
      }
    } else {
      // Create category
      try {
        await axios.post("http://localhost:3001/api/category", {
          product_Category: categoryName,
        });
        fetchCategories();
        setCategoryName(""); // Reset the input field
      } catch (error) {
        console.error("Failed to add category", error);
      }
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.product_Category);
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:3001/api/category/${categoryId}`);
        fetchCategories(); // Refresh the list after deletion
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  const handleReset = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingCategory ? "Edit Category" : "Add Category"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categoryName">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={categoryName}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" style={{ marginTop: 10 }}>
            {editingCategory ? "Save" : "Add Category"}
          </Button>
          {editingCategory && (
            <Button
              variant="secondary"
              onClick={handleReset}
              style={{ marginTop: 10, marginLeft: 10 }}
            >
              Cancel Edit
            </Button>
          )}
        </Form>

        <h5 style={{ marginTop: 20 }}>Category List</h5>
        <ListGroup>
          {categories.map((category) => (
            <ListGroup.Item key={category._id}>
              {category.product_Category}
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleEditClick(category)}
                style={{ marginLeft: 10 }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteClick(category._id)}
                style={{ marginLeft: 10 }}
              >
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;
