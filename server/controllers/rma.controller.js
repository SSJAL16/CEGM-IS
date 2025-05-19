import RMA from "../models/rma.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import GRN from "../models/grn.model.js";
import Supplier from "../models/supplier.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/rma_proofs');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'rma-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

export const createRMA = async (req, res) => {
  try {
    const {
      user,
      supplier,
      po,
      grn,
      return_status,
      items,
    } = req.body;

    const poExists = await PurchaseOrder.findById(po.po_id);
    if (!poExists) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    const grnExists = await GRN.findById(grn.grn_id);
    if (!grnExists) {
      return res.status(404).json({ message: "GRN not found" });
    }

    const newRMA = new RMA({
      user,
      supplier,
      po,
      grn,
      return_status,
      items,
    });

    const savedRMA = await newRMA.save();
    res.status(201).json(savedRMA);
  } catch (error) {
    console.error("Error creating RMA:", error);
    res.status(500).json({ message: "Failed to create RMA", error: error.message });
  }
};

export const getAllRMAs = async (req, res) => {
  try {
    const rmas = await RMA.find({ return_status: { $ne: "Archived" } })       
    res.status(200).json(rmas);
  } catch (error) {
    
    console.error("Error fetching rmas:", error);
    res.status(500).json({ message: "Failed to fetch rmas", error: error.message });
  }
};

export const updateRMA = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File upload error", error: err.message });
      } else if (err) {
        return res.status(400).json({ message: "Invalid file type", error: err.message });
      }

      const { id } = req.params;
      const updateData = JSON.parse(req.body.data); // Parse the stringified form data

      // Process uploaded files if any
      if (req.files && req.files.length > 0) {
        const productId = req.body.product_id;
        const imageUrls = req.files.map(file => ({
          url: file.path,
          uploaded_at: new Date()
        }));

        // Update the specific product's proof_images
        updateData.items = updateData.items.map(item => {
          if (item._id === productId) {
            return {
              ...item,
              proof_images: [...(item.proof_images || []), ...imageUrls]
            };
          }
          return item;
        });
      }

      const updatedRMA = await RMA.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedRMA) {
        return res.status(404).json({ message: "RMA not found" });
      }

      res.status(200).json(updatedRMA);
    });
  } catch (error) {
    console.error("Error updating RMA:", error);
    res.status(500).json({ message: "Failed to update RMA", error: error.message });
  }
};

export const getAllArchivedRMAs = async (req, res) => {
  try {
    const rmas = await RMA.find({ return_status: { $eq: "Archived" } })      
    res.status(200).json(rmas);
  } catch (error) {
    console.error("Error fetching rmas:", error);
    res.status(500).json({ message: "Failed to fetch rmas", error: error.message });
  }
};

export const archiveRMA = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRMA = await RMA.findByIdAndUpdate(
      id,
      {
        return_status: "Archived",
        archivedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedRMA) {
      return res.status(404).json({ message: "RMA not found" });
    }

    res.status(200).json({ message: "RMA archived successfully" });
  } catch (error) {
    console.error("Error archiving RMA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRMA = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRMA = await RMA.findByIdAndDelete(id);

    if (!deletedRMA) {
      return res.status(404).json({ message: "RMA not found" });
    }

    res.status(200).json({ message: "RMA deleted successfully" });
  } catch (error) {
    console.error("Error deleting RMA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRMAReports = async (req, res) => {
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
      filter.return_status = status;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.return_date = {
        $gte: start, 
        $lte: end,   
      };
    }

    console.log("Filter being applied:", filter);

    const reports = await RMA.find(filter)
      .sort({ createdAt: -1 });

    console.log(`Found ${reports.length} reports matching filters`);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching purchase order reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const uploadProofImages = async (req, res) => {
  try {
    // Handle file upload using multer
    upload.array('proof_images', 5)(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File upload error", error: err.message });
      } else if (err) {
        return res.status(400).json({ message: "Invalid file type", error: err.message });
      }

      const { id, itemIndex } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      try {
        const rma = await RMA.findById(id);
        if (!rma) {
          return res.status(404).json({ message: "RMA not found" });
        }

        // Initialize proof_images array if it doesn't exist
        if (!rma.items[itemIndex].proof_images) {
          rma.items[itemIndex].proof_images = [];
        }

        // Add the new images
        const uploadedImages = files.map(file => ({
          url: `/uploads/rma_proofs/${file.filename}`,
          uploaded_at: new Date()
        }));

        rma.items[itemIndex].proof_images.push(...uploadedImages);
        
        await rma.save();
        res.status(200).json(rma);
      } catch (error) {
        // Clean up uploaded files if database operation fails
        files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
        throw error;
      }
    });
  } catch (error) {
    console.error("Error uploading proof images:", error);
    res.status(500).json({ message: "Failed to upload images", error: error.message });
  }
};

export const deleteProofImage = async (req, res) => {
  try {
    const { id, itemIndex, imageId } = req.params;

    const rma = await RMA.findById(id);
    if (!rma) {
      return res.status(404).json({ message: "RMA not found" });
    }

    const image = rma.items[itemIndex].proof_images.find(img => img._id.toString() === imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '..', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove image from RMA
    rma.items[itemIndex].proof_images = rma.items[itemIndex].proof_images.filter(
      img => img._id.toString() !== imageId
    );

    await rma.save();
    res.status(200).json({ message: "Image deleted successfully", rma });
  } catch (error) {
    console.error("Error deleting proof image:", error);
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};

export const retrieveRMA = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRMA = await RMA.findByIdAndUpdate(
      id,
      {
        return_status: "Approved",
        archivedAt: null,
      },
      { new: true }
    );

    if (!updatedRMA) {
      return res.status(404).json({ message: "RMA not found" });
    }

    res.status(200).json({ message: "RMA retrieved successfully", rma: updatedRMA });
  } catch (error) {
    console.error("Error retrieving RMA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
