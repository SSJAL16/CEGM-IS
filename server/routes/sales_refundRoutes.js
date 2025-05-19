import express from 'express';
import Refund from "../models/sales_system/sales_refundModel.js";
import RefundedItem from "../models/sales_system/sales_refundedItemsModel.js";
import TransactionItem from "../models/sales_system/sales_transactionItemModel.js";
import ProductDetails from "../models/sales_system/sales_productDetailsModel.js";
import SalesTransaction from "../models/sales_system/sales_salesTransactionModel.js";

const router = express.Router();

const createRefundTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { grandTotal, reason, items } = req.body;

        const refund = {
            transaction_Id: transactionId,
            refundReason: reason || "No reason provided",
            totalRefundAmount: grandTotal,
            refundDate: new Date(),
        };

        const createdRefund = await Refund.create(refund);

        const refundedItemsData = items.map(item => ({
            refund_id: createdRefund._id,
            transaction_Item_id: item.transaction_Item_id,
            product_id: item.product_id,
            refunded_quantity: item.quantity,
            refunded_amount: item.totalPrice,
            product_category: item.category,
            product_name: item.description
        }));

        await RefundedItem.insertMany(refundedItemsData);

        const stockUpdates = items.map(item => ({
            product_id: item.product_id,
            quantityDifference: item.quantity
        }));

        await Promise.all(
            stockUpdates.map(async (update) => {
                await ProductDetails.updateOne(
                    { product_Id: update.product_id },
                    { $inc: { product_Current_Stock: update.quantityDifference } }
                );
            })
        );

        const existingItems = await TransactionItem.find({
            sales_Transaction_ID: transactionId,
        });

        await Promise.all(
            existingItems.map(async (item) => {
                const refundedItem = items.find(i => i.product_id === item.product_id);
                if (refundedItem) {
                    const newQuantity = item.quantity_integer - refundedItem.quantity;
                    if (newQuantity > 0) {
                        await TransactionItem.updateOne(
                            { _id: item._id },
                            { $set: { quantity_integer: newQuantity } }
                        );
                    } else {
                        await TransactionItem.findOneAndDelete({ _id: item._id });
                    }

                    const newTotalPrice = (item.totalPrice - refundedItem.totalPrice).toFixed(2);
                    await TransactionItem.updateOne(
                        { _id: item._id },
                        { $set: { totalPrice: newTotalPrice } }
                    );
                }
            })
        );

        await SalesTransaction.updateOne(
            { sales_Transaction_id: transactionId },
            { $inc: { total_Sales: -parseFloat(grandTotal).toFixed(2) } }
        );

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
};

const getRefunds = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const refunds = await Refund.find({ transaction_Id: transactionId });
        if (!refunds.length) {
            return res.status(404).json({
                success: false,
                message: "No refunds found for the specified transaction",
            });
        }

        const refundedItemsPromises = refunds.map(async (refund) => {
            const refundedItems = await RefundedItem.find({ refund_id: refund._id });
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
                    refunded_amount: item.refunded_amount.toFixed(2),
                    product_category: item.product_category,
                    product_name: item.product_name
                })),
            };
        });

        const refundsWithItems = await Promise.all(refundedItemsPromises);

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
};

const findRefund = async (req, res) => {
    try {
        const refunds = await Refund.find({}, 'refund_id quantity_integer refund_date sales_Transaction_id transaction_Item_ID');
        const transactionItems = await TransactionItem.find({}, 'transaction_Item_id description');
        const transactionMap = {};

        transactionItems.forEach(transactionItem => {
            transactionMap[transactionItem.transaction_Item_id] = `${transactionItem.description}`;
        });

        const formattedData = refunds.map(refundData => ({
            refundId: refundData.refund_id,
            description: refundData.transaction_Item_ID || 'Unknown',
            quantity: refundData.quantity_integer,
            transactionId: refundData.sales_Transaction_id,
            refundDate: refundData.refund_date ? new Date(refundData.refund_date)
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
};

const deleteRefund = async (req, res) => {
    const { refundId } = req.body;
    try {
        const refund = await Refund.findOneAndDelete({ refund_id: refundId });
        if (!refund) {
            return res.status(404).json({ error: "Refund not found" });
        }
        res.json({ success: true, message: "Refund deleted successfully" });
    } catch (error) {
        console.error("Error deleting refund:", error);
        res.status(500).json({ error: "Failed to delete refund" });
    }
};

router.put('/createRefundTransaction/:transactionId', createRefundTransaction);
router.get('/getRefund/:transactionId', getRefunds);
router.post('/findrefund', findRefund);
router.delete('/deleteRefund', deleteRefund);

export default router;
