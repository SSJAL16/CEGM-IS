import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  purchasing_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  min_stock: { type: Number, required: true },
  max_stock: { type: Number, required: true },
});

const ProductSupplierSchema = new mongoose.Schema({
  product_supplier_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  products: { type: [ProductSchema], required: true },
}, { timestamps: true });

const ProductSupplierModel = mongoose.model('ProductSupplier', ProductSupplierSchema);

export default ProductSupplierModel;