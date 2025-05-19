import express from 'express';
import Replace from "../models/sales_system/sales_replaceModel.js";
import ReplacedItem from "../models/sales_system/sales_replacedItemsModel.js";

const router = express.Router();

const createReplaceTransaction = async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { reason, items } = req.body;
  
      const replace = {
        transaction_Id: transactionId,
        replaceReason: reason || "No reason provided",
        replaceDate: new Date(),
      };
  
      const createdReplace = await Replace.create(replace);
  
      const replacedItemsData = items.map(item => ({
        replace_id: createdReplace._id,
        transaction_Item_id: item.transaction_Item_id,
        product_id: item.product_id,
        replaced_quantity: item.quantity,
        product_category: item.category,
        product_name: item.description
      }));
  
      await ReplacedItem.insertMany(replacedItemsData);
  
      res.status(200).json({
        success: true,
        message: "Replace transaction created successfully",
        replace: createdReplace,
      });
    } catch (err) {
      console.error("Replace transaction creation error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create replace transaction",
        details: err.message,
      });
    }
};

const getReplaceDetails = async (req, res) => {
    try {
      const { transactionId } = req.params;
  
      const replaces = await Replace.find({ transaction_Id: transactionId });
      if (!replaces.length) {
        return res.status(404).json({
          success: false,
          message: "No replaces found for the specified transaction",
        });
      }
  
      const replacedItemsPromises = replaces.map(async (replace) => {
        const replacedItems = await ReplacedItem.find({ replace_id: replace._id });
        return {
          replaceDetails: {
            transactionId: replace.transaction_Id,
            replaceReason: replace.replaceReason,
            replaceDate: replace.replaceDate,
          },
          replacedItems: replacedItems.map(item => ({
            transaction_Item_id: item.transaction_Item_id,
            product_id: item.product_id,
            replaced_quantity: item.replaced_quantity,
            product_category: item.product_category,
            product_name: item.product_name
          })),
        };
      });
  
      const replacesWithItems = await Promise.all(replacedItemsPromises);
  
      res.status(200).json({
        success: true,
        message: "Replace details fetched successfully",
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
};

router.put('/createReplaceTransaction/:transactionId', createReplaceTransaction);
router.get('/getReplace/:transactionId', getReplaceDetails);

export default router;
