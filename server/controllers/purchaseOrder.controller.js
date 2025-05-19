import mongoose from "mongoose";
import ProductDetails from "../models/CenteredTable/ProductDetails.js";
import Product from "../models/product.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";

export const getLowStockGroupedBySupplier = async (req, res) => {
  try {
    const groupedLowStock = await ProductDetails.aggregate([
      {
        $match: {
          $expr: {
            $lt: ["$product_Current_Stock", "$product_Minimum_Stock_Level"]
          }
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "product_Supplier",   
          foreignField: "company_name",
          as: "matchedSupplier"
        }
      },
      {
        $match: {
          "matchedSupplier.0": { $exists: true }  
        }
      },
      {
        $unwind: "$matchedSupplier"      
      },
      {
        $group: {
          _id: "$product_Supplier",
          supplierInfo: { $first: "$matchedSupplier" }, 
          lowStockProducts: {
            $push: {
              product_Id: "$product_Id",
              product_Name: "$product_Name",
              product_Category: "$product_Category",
              product_Supplier: "$product_Supplier",
              product_Description: "$product_Description",
              product_Current_Stock: "$product_Current_Stock",
              product_Quantity: "$product_Quantity",
              product_Price: "$product_Price",
              product_Minimum_Stock_Level: "$product_Minimum_Stock_Level",
              product_Maximum_Stock_Level: "$product_Maximum_Stock_Level"
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json(groupedLowStock);
    console.log("Low stock product group by supplier:\n", JSON.stringify(groupedLowStock, null, 2));
  } catch (err) {
    console.error("Error fetching grouped low stock products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const {
      user,
      supplier,
      items,
      order_status = "Draft",
    } = req.body;

    if (!user || !supplier || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newPO = new PurchaseOrder({
      user,
      supplier,
      order_status,
      items,
    });

    const savedPO = await newPO.save();

    return res.status(201).json({
      message: "Purchase Order created successfully.",
      purchaseOrder: savedPO,
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return res.status(500).json({ message: "Server error while creating purchase order." });
  }
};

export const getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({ order_status: { $ne: "Archived" } })
      .sort({ createdAt: -1 });

    console.log("Mga create na PO: ", purchaseOrders)
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Failed to retrieve purchase orders" });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Purchase Order ID" });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    res.status(200).json(purchaseOrder);
    console.log("PO data na gagamitin sa grn: ", purchaseOrder);
  } catch (error) {
    console.error("Error fetching Purchase Order:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllArchivedPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({ order_status: { $eq: "Archived" } })
      .sort({ createdAt: -1 });

    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Failed to retrieve purchase orders" });
  }
};


export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, items } = req.body;

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      { order_status, items },
      { new: true }
    );

    if (!updatedPO) return res.status(404).json({ message: "PO not found" });

    res.status(200).json(updatedPO);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

export const archivePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        order_status: "Archived",
        archivedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    res.status(200).json({ message: "Purchase Order archived successfully", purchaseOrder: updatedPO });
  } catch (error) {
    console.error("Error archiving purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPO = await PurchaseOrder.findByIdAndDelete(id);

    if (!deletedPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    res.status(200).json({ message: "Purchase Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPurchaseOrderReports = async (req, res) => {
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

    const reports = await PurchaseOrder.find(filter)
      .sort({ createdAt: -1 });

    console.log(`Found ${reports.length} reports matching filters`);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching purchase order reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const retrievePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        order_status: "Complete",
        archivedAt: null,
      },
      { new: true }
    );

    if (!updatedPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    res.status(200).json({ message: "Purchase Order retrieved successfully", purchaseOrder: updatedPO });
  } catch (error) {
    console.error("Error retrieving purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

