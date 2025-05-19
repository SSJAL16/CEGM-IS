import express from "express";
import salesSystemUserModel from "../models/sales_system/salesTransaction.js";
import salesSystemTransactionItemModel from "../models/sales_system/transactionItem.js";
import refundModel from "../models/sales_system/refund.js";
import categoryModel from "../models/sales_system/category.js";
import salesSystemRefundModel from "../models/sales_system/refund.js";
import salesSystemRefundedItemsModel from "../models/sales_system/refundedItems.js";
import salesSystemReplacedItemsModel from "../models/sales_system/replacedItems.js";
import salesSystemReplaceModel from "../models/sales_system/replace.js";
import productDetails from "../models/sales_system/productDetails.js";
import mongoose from 'mongoose';
const {
  productDetailsModel,
  getAllCategories,
  getProductsByCategory,
  getProducts,
  getProductsByID
} = productDetails;

const router = express.Router();

const sequenceSchema = new mongoose.Schema({
  sequenceName: { type: String, unique: true },
  sequenceValue: { type: Number, default: 1 }
});

// Safe model registration
const Sequence = mongoose.models.Sequence || mongoose.model('Sequence', sequenceSchema);

// Function to get next sequence value
export async function getNextSequence(sequenceName) {
  const sequence = await Sequence.findOneAndUpdate(
    { sequenceName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return sequence.sequenceValue;
}

//FETCH CATEGORY
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

//FETCH PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error });
  }
})

//FETCH PRODUCTS BY CATEGORY
router.get('/productsByCategory/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await getProductsByCategory(category);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});
router.get('/productsByID/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await getProductsByID(id);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

//READ
router.post("/findsalestransaction", async (req, res) => {
  try {
    // Fetch all sales transactions
    const transactions = await salesSystemUserModel.find(
      {},
      'sales_Transaction_id user_id total_Sales transaction_Date orNumber cashier_name'
    );

    // Fetch all users and create a map for user names
    const users = await salesSystemUserModel.find({}, 'first_name last_name user_id');
    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = `${user.first_name} ${user.last_name}`;
    });

    // Fetch transaction items for all transactions
    const transactionItems = await salesSystemTransactionItemModel.find({});
    const itemsMap = {};
    transactionItems.forEach(item => {
      if (!itemsMap[item.sales_Transaction_ID]) {
        itemsMap[item.sales_Transaction_ID] = [];
      }
      itemsMap[item.sales_Transaction_ID].push(item);
    });

    // Format the transactions data including transaction items
    const formattedData = transactions.map(salesTransaction => ({
      transactionId: salesTransaction.sales_Transaction_id,
      cashierName: salesTransaction.cashier_name,
      totalSales: `P ${salesTransaction.total_Sales}`,
      orNumber: salesTransaction.orNumber,
      transactionDate: salesTransaction.transaction_Date,
      transactionItems: itemsMap[salesTransaction.sales_Transaction_id] || [] // Add the transaction items
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching sales transactions:", err);
    res.status(500).json({ error: "Error fetching sales transactions" });
  }
});

router.post("/findrefund", async (req, res) => {
  try {
    const refunds = await refundModel.find({}, 'refund_id quantity_integer refund_date sales_Transaction_id transaction_Item_ID');
    const transactionItems = await salesSystemTransactionItemModel.find({}, 'transaction_Item_id description');
    const transactionMap = {};

    transactionItems.forEach(transactionItem => {
      transactionMap[transactionItem.transaction_Item_id] = `${transactionItem.description}`;
    });

    const formattedData = refunds.map(refundsData => ({
      refundId: refundsData.refund_id,
      description: refundsData.transaction_Item_ID || 'Unknown',
      quantity: refundsData.quantity_integer,
      transactionId: refundsData.sales_Transaction_id,
      refundDate: refundsData.refund_date ? new Date(refundsData.refund_date)
        .toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '') : 'Invalid Date'
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching sales transactions:", err);
    res.status(500).json({ error: "Error fetching sales transactions" });
  }
});

//CREATE
router.post("/createSalesTransaction", async (req, res) => {
  try {
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        error: "Transaction Cannot be Empty",
        receivedData: req.body
      });
    }
    const invalidItems = req.body.items.filter(item =>
      !item.product_id || !item.quantity || !item.unitPrice || !item.totalPrice || !item.description
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: "Please put an item or its quantity",
        invalidItems: invalidItems
      });
    }

    const or = req.body.orNumber;

    if (!or) {
      return res.status(400).json({
        error: "Please put an Official Receipt Number",
        invalidItems: invalidItems
      });
    }

    const existingTransaction = await salesSystemUserModel.findOne({ orNumber: or });
    if (existingTransaction) {
      return res.status(404).json({ error: "Official Receipt Number Taken" });
    }

    // Step 1: Generate transaction ID
    const nextTransactionID = await getNextSequence("salesTransactionID");
    const salesTransactionID = `ST-S${String(nextTransactionID).padStart(5, '0')}`;

    // Step 2: Create and save the Sales Transaction
    const salesTransaction = new salesSystemUserModel({
      sales_Transaction_id: salesTransactionID,
      transaction_Date: req.body.transaction_Date || new Date(),
      user_id: req.body.user_id || 1,
      cashier_name: req.body.cashier_name,
      orNumber: req.body.orNumber,
      total_Sales: parseFloat(req.body.total_Sales) || 0,
    });

    const savedTransaction = await salesTransaction.save();

    // Step 3: Create transaction items array
    const transactionItemsData = await Promise.all(
      req.body.items.map(async (item) => {
        const nextItemID = await getNextSequence("transaction_Item_id");
        return {
          transaction_Item_id: `TI-${String(nextItemID).padStart(5, '0')}`,
          product_id: item.product_id,
          sales_Transaction_ID: salesTransactionID,
          product_name: item.label,
          product_category: item.category,
          product_description: item.description,
          product_supplier: item.supplier,
          quantity_integer: parseInt(item.quantity, 10),
          unit_price: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice),
        };
      })
    );

    // Step 4: Save all transaction items
    const savedItems = await salesSystemTransactionItemModel.insertMany(transactionItemsData);

    await Promise.all(
      savedItems.map(async (item) => {
        await productDetailsModel.updateOne(
          { product_Id: item.product_id }, // Find the product by its ID
          { $inc: { product_Current_Stock: -item.quantity_integer } } // Decrease the quantity
        );
      })
    );

    // Step 5: Send success response with complete transaction data
    res.status(200).json({
      success: true,
      transaction: {
        ...savedTransaction.toObject(),
        items: savedItems
      },
      transactionId: salesTransaction.sales_Transaction_id
    });

  } catch (err) {
    console.error("Transaction creation error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create transaction",
      details: err.message,
      receivedData: req.body
    });
  }
});

router.put("/createRefundTransaction/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { grandTotal, reason, items } = req.body;

    // Step 1: Create the refund object
    const refund = {
      transaction_Id: transactionId,
      refundReason: reason || "No reason provided",
      totalRefundAmount: grandTotal,
      refundDate: new Date(),
    };

    // Step 2: Insert the refund data into the refund model
    const createdRefund = await salesSystemRefundModel.create(refund);

    // Step 3: Insert each item into the refundeditems model
    const refundedItemsData = items.map(item => ({
      refund_id: createdRefund._id,
      transaction_Item_id: item.transaction_Item_id,
      product_id: item.product_id,
      refunded_quantity: item.quantity,
      refunded_amount: item.totalPrice,
      product_category: item.category,
      product_name: item.name,
      product_description: item.description,
      product_supplier: item.supplier,
    }));

    await salesSystemRefundedItemsModel.insertMany(refundedItemsData);

    // Step 5: Adjust the stock levels for the refunded items
    const stockUpdates = items.map(item => ({
      product_id: item.product_id,
      quantityDifference: item.quantity
    }));

    await Promise.all(
      stockUpdates.map(async (update) => {
        await productDetailsModel.updateOne(
          { product_Id: update.product_id },
          { $inc: { product_Current_Stock: update.quantityDifference } }
        );
      })
    );

    // Step 4: Update the quantity of the original transaction items
    const existingItems = await salesSystemTransactionItemModel.find({
      sales_Transaction_ID: transactionId,
    });

    await Promise.all(
      existingItems.map(async (item) => {
        const refundedItem = items.find(i => i.product_id === item.product_id);
        if (refundedItem) {
          const newQuantity = item.quantity_integer - refundedItem.quantity;
          if (newQuantity > 0) {
            await salesSystemTransactionItemModel.updateOne(
              { _id: item._id },
              { $set: { quantity_integer: newQuantity } }
            );
          } else {
            await salesSystemTransactionItemModel.findOneAndDelete({ _id: item._id });
          }

          const newTotalPrice = (item.totalPrice - refundedItem.totalPrice).toFixed(2);;
          await salesSystemTransactionItemModel.updateOne(
            { _id: item._id },
            { $set: { totalPrice: newTotalPrice } }
          );
        }
      })
    );

    // Step 6: Adjust the total sales amount in the SalesTransaction model
    await salesSystemUserModel.updateOne(
      { sales_Transaction_id: transactionId },
      { $inc: { total_Sales: -parseFloat(grandTotal).toFixed(2) } }
    );

    // Step 6: Send success response
    res.status(200).json({
      success: true,
      message: "Refund transaction created successfully",
      refund: createdRefund,
    });
  } catch (err) {
    console.error("Refund transaction creation error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create refund transaction",
      details: err.message,
      receivedData: req.body,
    });
  }
});

router.get("/getReplace/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Step 1: Find all refunds associated with the transaction
    const replaces = await salesSystemReplaceModel.find({ transaction_Id: transactionId });

    if (!replaces.length) {
      return res.status(404).json({
        success: false,
        message: "No replaces found for the specified transaction",
      });
    }

    // Step 2: Find replaced items for each replace
    const replacedItemsPromises = replaces.map(async (replaces) => {
      const replacedItems = await salesSystemReplacedItemsModel.find({ replace_id: replaces._id });
      return {
        replaceDetails: {
          transactionId: replaces.transaction_Id,
          replaceReason: replaces.replaceReason,
          replaceDate: replaces.replaceDate,
        },
        replacedItems: replacedItems.map(item => ({
          transaction_Item_id: item.transaction_Item_id,
          product_id: item.product_id,
          replaced_quantity: item.replaced_quantity,
          product_category: item.product_category,
          product_name: item.product_name,
          product_description: item.product_description,
          product_supplier: item.product_supplier,
        })),
      };
    });

    const replacesWithItems = await Promise.all(replacedItemsPromises);

    // Step 3: Send the response
    res.status(200).json({
      success: true,
      message: "Refund details fetched successfully",
      data: replacesWithItems,
    });

  } catch (err) {
    console.error("Error fetching replace details:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch replace details",
      details: err.message,
    });
  }
});

router.put("/createReplaceTransaction/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason, items } = req.body;

    // Step 1: Create the replace object
    const replace = {
      transaction_Id: transactionId,
      replaceReason: reason || "No reason provided",
      replaceDate: new Date(),
    };

    // Step 2: Insert the replace data into the replace model
    const createdReplace = await salesSystemReplaceModel.create(replace);

    // Step 3: Insert each item into the replaceditems model
    const replacedItemsData = items.map(item => ({
      replace_id: createdReplace._id,
      transaction_Item_id: item.transaction_Item_id,
      product_id: item.product_id,
      replaced_quantity: item.quantity,
      product_category: item.category,
      product_name: item.name,
      product_description: item.description,
      product_supplier: item.supplier,
    }));

    await salesSystemReplacedItemsModel.insertMany(replacedItemsData);

    // Step 6: Send success response
    res.status(200).json({
      success: true,
      message: "Replace transaction created successfully",
      refund: createdReplace,
    });
  } catch (err) {
    console.error("Replace transaction creation error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create replace transaction",
      details: err.message,
      receivedData: req.body,
    });
  }
});

router.get("/getRefund/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Step 1: Find all refunds associated with the transaction
    const refunds = await salesSystemRefundModel.find({ transaction_Id: transactionId });

    if (!refunds.length) {
      return res.status(404).json({
        success: false,
        message: "No refunds found for the specified transaction",
      });
    }

    // Step 2: Find refunded items for each refund
    const refundedItemsPromises = refunds.map(async (refund) => {
      const refundedItems = await salesSystemRefundedItemsModel.find({ refund_id: refund._id });
      return {
        refundDetails: {
          transactionId: refund.transaction_Id,
          refundReason: refund.refundReason,
          totalRefundAmount: refund.totalRefundAmount.toFixed(2),
          refundDate: refund.refundDate,
        },
        refundedItems: refundedItems.map(item => ({
          transaction_Item_id: item.transaction_Item_id,
          product_id: item.product_id,
          refunded_quantity: item.refunded_quantity,
          refunded_amount: item.refunded_amount.toFixed(2), // Ensure only two decimal places
          product_category: item.product_category,
          product_name: item.product_name,
          product_description: item.product_description,
          product_supplier: item.product_supplier,
        })),
      };
    });

    const refundsWithItems = await Promise.all(refundedItemsPromises);

    // Step 3: Send the response
    res.status(200).json({
      success: true,
      message: "Refund details fetched successfully",
      data: refundsWithItems,
    });

  } catch (err) {
    console.error("Error fetching refund details:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch refund details",
      details: err.message,
    });
  }
});

router.put("/updateSalesTransaction/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Step 1: Delete if no items are provided
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      // Fetch the items in the transaction to restore stock
      const existingItems = await salesSystemTransactionItemModel.find({
        sales_Transaction_ID: transactionId,
      });

      if (existingItems.length > 0) {
        // Restore stock for all items in the transaction
        await Promise.all(
          existingItems.map(async (item) => {
            await productDetailsModel.updateOne(
              { product_Id: item.product_id },
              { $inc: { product_Current_Stock: item.quantity_integer } }
            );
          })
        );
      }

      const existingRefund = await salesSystemRefundModel.find({
        transaction_Id: transactionId,
      })

      if (existingRefund.length < 1) {
        const deletedTransaction = await salesSystemUserModel.findOneAndDelete({
          sales_Transaction_id: transactionId,
        });

        if (deletedTransaction) {
          await salesSystemTransactionItemModel.deleteMany({ sales_Transaction_ID: transactionId });
          return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully due to no items, and stock restored",
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Transaction not found for deletion",
          });
        }
      }
    }

    // Validate items
    const invalidItems = req.body.items.filter(item =>
      !item.product_id || !item.quantity || !item.unitPrice || !item.totalPrice || !item.description
    );
    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: "Please put an item and its quantity on the blank item or remove it",
        invalidItems: invalidItems,
      });
    }

    // Step 2: Find the existing transaction
    const existingTransaction = await salesSystemUserModel.findOne({
      sales_Transaction_id: transactionId,
    });
    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Fetch existing transaction items
    const existingItems = await salesSystemTransactionItemModel.find({
      sales_Transaction_ID: transactionId,
    });

    // Step 3: Calculate stock changes
    const stockUpdates = [];

    // Handle items still in the transaction
    req.body.items.forEach(updatedItem => {
      const previousItem = existingItems.find(item => item.product_id === updatedItem.product_id);
      const previousQuantity = previousItem ? previousItem.quantity_integer : 0;
      const quantityDifference = updatedItem.quantity - previousQuantity;

      stockUpdates.push({
        product_id: updatedItem.product_id,
        quantityDifference: quantityDifference,
      });
    });

    // Handle items no longer in the updated transaction
    existingItems.forEach(previousItem => {
      const isItemStillPresent = req.body.items.some(item => item.product_id === previousItem.product_id);
      if (!isItemStillPresent) {
        stockUpdates.push({
          product_id: previousItem.product_id,
          quantityDifference: -previousItem.quantity_integer, // Add back the full quantity
        });
      }
    });

    // Step 4: Update product details with stock changes
    await Promise.all(
      stockUpdates.map(async (update) => {
        await productDetailsModel.updateOne(
          { product_Id: update.product_id },
          { $inc: { product_Current_Stock: -update.quantityDifference } }
        );
      })
    );

    // Step 5: Update the transaction details
    existingTransaction.transaction_Date = req.body.transaction_Date || existingTransaction.transaction_Date;
    existingTransaction.total_Sales = parseFloat(req.body.total_Sales) || existingTransaction.total_Sales;
    existingTransaction.profit = parseFloat(req.body.profit) || existingTransaction.profit;
    existingTransaction.user_id = req.body.user_id || existingTransaction.user_id;

    const updatedTransaction = await existingTransaction.save();

    // Step 6: Update transaction items
    const transactionItemsData = req.body.items.map(item => ({
      product_id: item.product_id,
      sales_Transaction_ID: transactionId,
      quantity_integer: parseInt(item.quantity, 10),
      unit_price: parseFloat(item.unitPrice),
      totalPrice: parseFloat(item.totalPrice),
      product_name: item.description,
      product_category: item.category,
      status: item.status,
    }));

    await salesSystemTransactionItemModel.deleteMany({ sales_Transaction_ID: transactionId });
    const savedItems = await salesSystemTransactionItemModel.insertMany(transactionItemsData);

    // Step 7: Send success response
    res.status(200).json({
      success: true,
      transaction: {
        ...updatedTransaction.toObject(),
        items: savedItems,
      },
      transactionId: updatedTransaction.sales_Transaction_id,
    });
  } catch (err) {
    console.error("Transaction update error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update transaction",
      details: err.message,
      receivedData: req.body,
    });
  }
});


// DELETE
router.delete("/deleteTransaction/:transactionId", async (req, res) => {
  const { transactionId } = req.params; // Match this with the route

  try {
    // Delete the transaction from salesSystemUserModel
    const transaction = await salesSystemUserModel.findOneAndDelete({
      sales_Transaction_id: transactionId,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Optional: Delete all items associated with this transaction
    await salesSystemTransactionItemModel.deleteMany({ sales_Transaction_id: transactionId });

    res.json({ success: true, message: "Transaction and associated items deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

router.delete("/deleteRefund", async (req, res) => {
  const { refundId } = req.body;

  try {
    // Delete the transaction from refundModel
    const refund = await refundModel.findOneAndDelete({
      refund_id: refundId,
    });

    if (!refund) {
      return res.status(404).json({ error: "Refund not found" });
    }

    res.json({ success: true, message: "Refund deleted successfully" });
  } catch (error) {
    console.error("Error deleting refund:", error);
    res.status(500).json({ error: "Failed to delete refund" });
  }
});


router.get('/getTransaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the main transaction
    const transaction = await salesSystemUserModel.findOne({ sales_Transaction_id: transactionId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Find related items
    const items = await salesSystemTransactionItemModel.find({ sales_Transaction_ID: transaction.sales_Transaction_id });

    // Combine transaction details, items, and cashier's full name
    const responseData = {
      ...transaction.toObject(),
      items: items,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get("/analysis", async (req, res) => {
  try {
    const salesTransactions = await salesSystemUserModel.find();
    res.json(salesTransactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/createRefund", (req, res) => {
  refundModel.create(req.body)
    .then(refund => res.json(refund))
    .catch(err => res.json(err));
});

router.post("/createCategory", (req, res) => {
  categoryModel.create(req.body)
    .then(category => res.json(category))
    .catch(err => res.json(err))
})

export default router;