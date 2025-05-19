import BackOrder from "../models/backOrder.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";


export const getBackorderedProducts = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({
      "items.backorder_quantity": { $gt: 0 },
    });

    const result = purchaseOrders.map((order) => {
      const backorderedItems = order.items.filter(
        (item) => item.backorder_quantity > 0
      );
      return {
        _id: order._id,
        user: order.user,
        supplier: order.supplier,
        order_date: order.order_date,
        order_status: order.order_status,
        items: backorderedItems,
      };
    });

    res.status(200).json(result);
    console.log("Ito na fetch ko galing PO:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching backordered products:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
};

export const createBackOrder = async (req, res) => {
  try {
    const { user, supplier, po, order_date, order_status, items } = req.body;

    const newBackOrder = new BackOrder({
      user,
      supplier,
      po,
      order_date,
      order_status,
      items,
    });

    await newBackOrder.save();
    res.status(201).json(newBackOrder);
  } catch (error) {
    console.error("Error creating backorder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBackOrders = async (req, res) => {
  try {
    const backorders = await BackOrder.find({ order_status: { $ne: "Archived" } })      
    res.status(200).json(backorders);
    console.log("Ito mga BO: ", backorders)
  } catch (error) {
    console.error("Error fetching Backorders:", error);
    res.status(500).json({ message: "Failed to fetch Backorders", error: error.message });
  }
};

export const getAllArchivedBackOrders = async (req, res) => {
  try {
    const backorders = await BackOrder.find({ order_status: { $eq: "Archived" } })   
    res.status(200).json(backorders);
  } catch (error) {
    console.error("Error fetching Backorders:", error);
    res.status(500).json({ message: "Failed to fetch Backorders", error: error.message });
  }
};

export const updateBackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedBackorder = await BackOrder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBackorder) {
      return res.status(404).json({ message: "GRN not found" });
    }

    res.status(200).json(updatedBackorder);
  } catch (error) {
    console.error("Error updating GRN:", error);
    res.status(500).json({ message: "Failed to update GRN", error: error.message });
  }
};

export const archiveBackOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBackorder = await BackOrder.findByIdAndUpdate(
      id,
      {
        order_status: "Archived",
        archivedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedBackorder) {
      return res.status(404).json({ message: "Backorder not found" });
    }

    res.status(200).json({ message: "Backorder archived successfully" });
  } catch (error) {
    console.error("Error archiving Backorder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBackOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBackorder = await BackOrder.findByIdAndDelete(id);

    if (!deletedBackorder) {
      return res.status(404).json({ message: "Backorder not found" });
    }

    res.status(200).json({ message: "Backorder deleted successfully" });
  } catch (error) {
    console.error("Error deleting Backorder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBackOrderReports = async (req, res) => {
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

    const reports = await BackOrder.find(filter)
      .sort({ createdAt: -1 });

    console.log(`Found ${reports.length} reports matching filters`);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching purchase order reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const retrieveBackOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBackorder = await BackOrder.findByIdAndUpdate(
      id,
      {
        order_status: "Approved",
        archivedAt: null,
      },
      { new: true }
    );

    if (!updatedBackorder) {
      return res.status(404).json({ message: "Backorder not found" });
    }

    res.status(200).json({ message: "Backorder retrieved successfully", backorder: updatedBackorder });
  } catch (error) {
    console.error("Error retrieving Backorder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


