import express from 'express';
import SalesTransaction from "../models/sales_system/sales_salesTransactionModel.js";
import TransactionItem from "../models/sales_system/sales_transactionItemModel.js";
import Refund from "../models/sales_system/sales_refundModel.js";
import ProductDetails from "../models/sales_system/sales_productDetailsModel.js";
import UserModel from "../models/sales_system/User.js";
import { getNextSequence } from "../functions/sequence.js";

const router = express.Router();

const getTransactionDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Find the main transaction
        const transaction = await SalesTransaction.findOne({ sales_Transaction_id: transactionId });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Find cashier by user_id and return first and last name
        const cashier = await UserModel.findOne(
            { user_id: transaction.user_id },
            'first_name last_name'
        );

        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }

        // Combine cashier's full name
        const cashierName = `${cashier.first_name} ${cashier.last_name}`;

        // Find related items
        const items = await TransactionItem.find({ sales_Transaction_ID: transaction.sales_Transaction_id });

        // Combine transaction details, items, and cashier's full name
        const responseData = {
            ...transaction.toObject(),
            items: items,
            cashierName: cashierName,  // Add the cashier's full name
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const findSalesTransactions = async (req, res) => {
    try {
        const transactions = await SalesTransaction.find({}, 'sales_Transaction_id user_id total_Sales transaction_Date orNumber');
        const users = await UserModel.find({}, 'first_name last_name user_id');

        const userMap = {};
        users.forEach(user => {
            userMap[user.user_id] = `${user.first_name} ${user.last_name}`;
        });

        const transactionItems = await TransactionItem.find({});
        const itemsMap = {};
        transactionItems.forEach(item => {
            if (!itemsMap[item.sales_Transaction_ID]) {
                itemsMap[item.sales_Transaction_ID] = [];
            }
            itemsMap[item.sales_Transaction_ID].push(item);
        });

        const formattedData = transactions.map(salesTransaction => ({
            transactionId: salesTransaction.sales_Transaction_id,
            cashierName: userMap[salesTransaction.user_id] || 'Unknown',
            totalSales: `P ${salesTransaction.total_Sales}`,
            orNumber: salesTransaction.orNumber,
            transactionDate: salesTransaction.transaction_Date,
            transactionItems: itemsMap[salesTransaction.sales_Transaction_id] || []
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Error fetching sales transactions:", err);
        res.status(500).json({ error: "Error fetching sales transactions" });
    }
};

const createSalesTransaction = async (req, res) => {
    try {
        const { items, orNumber, transaction_Date, total_Sales, user_id } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Transaction Cannot be Empty", receivedData: req.body });
        }

        const invalidItems = items.filter(item =>
            !item.product_id || !item.quantity || !item.unitPrice || !item.totalPrice || !item.description
        );
        if (invalidItems.length > 0) {
            return res.status(400).json({ error: "Please put an item or its quantity", invalidItems });
        }

        if (!orNumber) {
            return res.status(400).json({ error: "Please put an Official Receipt Number" });
        }

        const existingTransaction = await salesSystemSalesTransactionModel.findOne({ orNumber });
        if (existingTransaction) {
            return res.status(404).json({ error: "Official Receipt Number Taken" });
        }

        const nextTransactionID = await getNextSequence("salesTransactionID");
        const salesTransactionID = `ST-S${String(nextTransactionID).padStart(5, '0')}`;

        const salesTransaction = new SalesTransaction({
            sales_Transaction_id: salesTransactionID,
            transaction_Date: transaction_Date || new Date(),
            total_Sales: parseFloat(total_Sales) || 0,
            user_id: user_id || 1,
            orNumber,
        });

        const savedTransaction = await salesTransaction.save();

        const transactionItemsData = await Promise.all(
            items.map(async (item) => {
                const nextItemID = await getNextSequence("transaction_Item_id");
                return {
                    transaction_Item_id: `TI-${String(nextItemID).padStart(5, '0')}`,
                    product_id: item.product_id,
                    sales_Transaction_ID: salesTransactionID,
                    quantity_integer: parseInt(item.quantity, 10),
                    unit_price: parseFloat(item.unitPrice),
                    totalPrice: parseFloat(item.totalPrice),
                    product_name: item.description,
                    product_category: item.category,
                };
            })
        );

        const savedItems = await TransactionItem.insertMany(transactionItemsData);

        await Promise.all(
            savedItems.map(item =>
                ProductDetails.updateOne(
                    { product_Id: item.product_id },
                    { $inc: { product_Current_Stock: -item.quantity_integer } }
                )
            )
        );

        res.status(200).json({
            success: true,
            transaction: {
                ...savedTransaction.toObject(),
                items: savedItems,
            },
            transactionId: salesTransaction.sales_Transaction_id
        });
    } catch (err) {
        console.error("Transaction creation error:", err);
        res.status(500).json({ success: false, error: "Failed to create transaction", details: err.message });
    }
};

const updateSalesTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { items, transaction_Date, total_Sales, profit, user_id } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            const existingItems = await TransactionItem.find({ sales_Transaction_ID: transactionId });

            if (existingItems.length > 0) {
                await Promise.all(
                    existingItems.map(item =>
                        ProductDetails.updateOne(
                            { product_Id: item.product_id },
                            { $inc: { product_Current_Stock: item.quantity_integer } }
                        )
                    )
                );
            }

            const existingRefund = await Refund.find({ transaction_Id: transactionId });
            if (existingRefund.length < 1) {
                const deletedTransaction = await SalesTransaction.findOneAndDelete({
                    sales_Transaction_id: transactionId,
                });

                if (deletedTransaction) {
                    await TransactionItem.deleteMany({ sales_Transaction_ID: transactionId });
                    return res.status(200).json({ success: true, message: "Transaction deleted and stock restored" });
                } else {
                    return res.status(404).json({ success: false, message: "Transaction not found" });
                }
            }
        }

        const invalidItems = items.filter(item =>
            !item.product_id || !item.quantity || !item.unitPrice || !item.totalPrice || !item.description
        );
        if (invalidItems.length > 0) {
            return res.status(400).json({ error: "Please put an item and its quantity", invalidItems });
        }

        const existingTransaction = await SalesTransaction.findOne({ sales_Transaction_id: transactionId });
        if (!existingTransaction) return res.status(404).json({ error: "Transaction not found" });

        const existingItems = await TransactionItem.find({ sales_Transaction_ID: transactionId });

        const stockUpdates = [];

        items.forEach(updatedItem => {
            const previousItem = existingItems.find(item => item.product_id === updatedItem.product_id);
            const previousQuantity = previousItem ? previousItem.quantity_integer : 0;
            const quantityDifference = updatedItem.quantity - previousQuantity;
            stockUpdates.push({ product_id: updatedItem.product_id, quantityDifference });
        });

        existingItems.forEach(previousItem => {
            const stillExists = items.some(item => item.product_id === previousItem.product_id);
            if (!stillExists) {
                stockUpdates.push({ product_id: previousItem.product_id, quantityDifference: -previousItem.quantity_integer });
            }
        });

        await Promise.all(
            stockUpdates.map(update =>
                ProductDetails.updateOne(
                    { product_Id: update.product_id },
                    { $inc: { product_Current_Stock: -update.quantityDifference } }
                )
            )
        );

        existingTransaction.transaction_Date = transaction_Date || existingTransaction.transaction_Date;
        existingTransaction.total_Sales = parseFloat(total_Sales) || existingTransaction.total_Sales;
        existingTransaction.profit = parseFloat(profit) || existingTransaction.profit;
        existingTransaction.user_id = user_id || existingTransaction.user_id;

        const updatedTransaction = await existingTransaction.save();

        const transactionItemsData = items.map(item => ({
            product_id: item.product_id,
            sales_Transaction_ID: transactionId,
            quantity_integer: parseInt(item.quantity, 10),
            unit_price: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            product_name: item.description,
            product_category: item.category,
            status: item.status,
        }));

        await TransactionItem.deleteMany({ sales_Transaction_ID: transactionId });
        const savedItems = await TransactionItem.insertMany(transactionItemsData);

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
        res.status(500).json({ success: false, error: "Failed to update transaction", details: err.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await SalesTransaction.findOneAndDelete({ sales_Transaction_id: transactionId });

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        await SalesTransaction.deleteMany({ sales_Transaction_ID: transactionId });
        res.json({ success: true, message: "Transaction and associated items deleted" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Failed to delete transaction" });
    }
};

router.get('/getTransaction/:transactionId', getTransactionDetails);
router.post("/findsalestransaction", findSalesTransactions);
router.post("/createSalesTransaction", createSalesTransaction);
router.put("/updateSalesTransaction/:transactionId", updateSalesTransaction);
router.delete("/deleteTransaction/:transactionId", deleteTransaction);

export default router;