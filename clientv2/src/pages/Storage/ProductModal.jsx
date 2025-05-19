import React from "react";
import { Modal, Button } from "react-bootstrap";

const ProductModal = ({
  showModal,
  handleModalClose,
  isEditMode,
  newProduct,
  handleInputChange,
  handleSubmit,
  categories, // Accept categories as a prop
}) => {
  return (
    <Modal show={showModal} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? "Edit Product" : "Create Product"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Dropdown for product category */}
          <div className="mb-3">
            <label htmlFor="product_Category" className="form-label">
              Product Category
            </label>
            <select
              id="product_Category"
              name="product_Category"
              className="form-control"
              value={newProduct.product_Category}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category.product_Category}>
                  {category.product_Category}
                </option>
              ))}
            </select>
          </div>

          {/* Other input fields */}
          <div className="mb-3">
            <label htmlFor="product_Description" className="form-label">
              Product Description
            </label>
            <input
              type="text"
              id="product_Description"
              name="product_Description"
              className="form-control"
              value={newProduct.product_Description}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product_Current_Stock" className="form-label">
              Stock
            </label>
            <input
              type="text"
              id="product_Current_Stock"
              name="product_Current_Stock"
              className="form-control"
              value={newProduct.product_Current_Stock}
              onChange={handleInputChange}
              disabled={isEditMode}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product_Price" className="form-label">
              Unit Price(₱)
            </label>
            <input
              type="text"
              id="product_Price"
              name="product_Price"
              className="form-control"
              value={newProduct.product_Price}
              onChange={(e) => {
                // Regex to allow only numbers and a decimal point (for prices)
                const regex = /^[0-9]*\.?[0-9]+$/;
                if (regex.test(e.target.value) || e.target.value === "") {
                  handleInputChange(e);
                }
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product_Minimum_Stock_Level" className="form-label">
              Minimum Stock Level
            </label>
            <input
              type="text"
              id="product_Minimum_Stock_Level"
              name="product_Minimum_Stock_Level"
              className="form-control"
              value={newProduct.product_Minimum_Stock_Level}
              onChange={(e) => {
                // Regex to allow only numbers
                const regex = /^[0-9]*$/;
                if (regex.test(e.target.value) || e.target.value === "") {
                  handleInputChange(e);
                }
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="product_Maximum_Stock_Level" className="form-label">
              Maximum Stock Level
            </label>
            <input
              type="text"
              id="product_Maximum_Stock_Level"
              name="product_Maximum_Stock_Level"
              className="form-control"
              value={newProduct.product_Maximum_Stock_Level}
              onChange={(e) => {
                // Regex to allow only numbers
                const regex = /^[0-9]*$/;
                if (regex.test(e.target.value) || e.target.value === "") {
                  // Update the maximum stock level if it's below the minimum stock level
                  const maxStockLevel = parseFloat(e.target.value);
                  const minStockLevel = parseFloat(
                    newProduct.product_Minimum_Stock_Level
                  );

                  // If the max is less than the min, set the max equal to the min
                  if (maxStockLevel < minStockLevel) {
                    handleInputChange({
                      target: {
                        name: "product_Maximum_Stock_Level",
                        value: minStockLevel,
                      },
                    });
                  } else {
                    handleInputChange(e);
                  }
                }
              }}
            />
            {parseFloat(newProduct.product_Maximum_Stock_Level) <
              parseFloat(newProduct.product_Minimum_Stock_Level) && (
              <div className="text-danger">
                Maximum stock level cannot be less than minimum stock level. It
                has been adjusted.
              </div>
            )}
          </div>

          <Button variant="primary" type="submit">
            {isEditMode ? "Save" : "Add"}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ProductModal;
