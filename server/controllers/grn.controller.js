import mongoose from "mongoose";
import ProductDetails from "../models/CenteredTable/ProductDetails.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import GRN from "../models/grn.model.js";

export const createGRN = async (req, res) => {
    try {
      const {
        user,
        supplier,
        po,
        mop,
        order_status,
        items,
      } = req.body;
  
      const poExists = await PurchaseOrder.findById(po.po_id);
      if (!poExists) {
        return res.status(404).json({ message: "Purchase Order not found" });
      }
  
      const newGRN = new GRN({
        user,
        supplier,
        po,
        mop,
        order_status,
        items,
      });
  
      const savedGRN = await newGRN.save();
      res.status(201).json(savedGRN);
    } catch (error) {
      console.error("Error creating GRN:", error);
      res.status(500).json({ message: "Failed to create GRN", error: error.message });
    }
  };

  export const getAllGRNs = async (req, res) => {
    try {
      const grns = await GRN.find({ order_status: { $ne: "Archived" } });      
      res.status(200).json(grns);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res.status(500).json({ message: "Failed to fetch GRNs", error: error.message });
    }
  };

  export const getAllArchivedGRNs = async (req, res) => {
    try {
      const grns = await GRN.find({ order_status: { $eq: "Archived" } });   
      res.status(200).json(grns);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res.status(500).json({ message: "Failed to fetch GRNs", error: error.message });
    }
  };

  export const updateGRN = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      const updatedGRN = await GRN.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedGRN) {
        return res.status(404).json({ message: "GRN not found" });
      }
  
      res.status(200).json(updatedGRN);
    } catch (error) {
      console.error("Error updating GRN:", error);
      res.status(500).json({ message: "Failed to update GRN", error: error.message });
    }
  };

  export const archiveGRN = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedGRN = await GRN.findByIdAndUpdate(
        id,
        {
          order_status: "Archived",
          archivedAt: new Date(),
        },
        { new: true }
      );
  
      if (!updatedGRN) {
        return res.status(404).json({ message: "GRN not found" });
      }
  
      res.status(200).json({ message: "GRN archived successfully" });
    } catch (error) {
      console.error("Error archiving GRN:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export const deleteGRN = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedGRN = await GRN.findByIdAndDelete(id);
  
      if (!deletedGRN) {
        return res.status(404).json({ message: "GRN not found" });
      }
  
      res.status(200).json({ message: "GRN deleted successfully" });
    } catch (error) {
      console.error("Error deleting GRN:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const getGRNReports = async (req, res) => {
    try {
      const { supplier, user, startDate, endDate, status } = req.query;
  
      const filter = {};
  
      if (supplier && supplier !== "All") {
        filter["supplier.company_name"] = supplier;
      }
  
      if (user && user !== "All") {
        filter["user.first_name"] = user;
      }
  
      if (status && status !== "All") {
        filter.order_status = status;
      }
  
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
  
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
  
        filter.order_date = {
          $gte: start, 
          $lte: end,   
        };
      }
  
      console.log("Filter being applied:", filter);
  
      const reports = await GRN.find(filter)
        .sort({ createdAt: -1 });
  
      console.log(`Found ${reports.length} reports matching filters`);
      res.status(200).json(reports);
    } catch (error) {
      console.error("Error fetching purchase order reports:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  export const addProductQuantity = async (req, res) => {
    try {
      const { product_Id, quantityToAdd } = req.body;

      console.log("Product id to: ", product_Id);
      console.log("Quantity to add: ", quantityToAdd);
  
      const updatedProduct = await ProductDetails.findOneAndUpdate(
        { product_Id },
        { $inc: { product_Current_Stock: quantityToAdd } },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json({
        message: "Product quantity updated successfully",
        updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product quantity:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const retrieveGRN = async (req, res) => {
    try {
      const { id } = req.params;

      const updatedGRN = await GRN.findByIdAndUpdate(
        id,
        {
          order_status: "Approved",
          archivedAt: null,
        },
        { new: true }
      );

      if (!updatedGRN) {
        return res.status(404).json({ message: "GRN not found" });
      }

      res.status(200).json({ message: "GRN retrieved successfully", grn: updatedGRN });
    } catch (error) {
      console.error("Error retrieving GRN:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  