import Supplier from "../models/supplier.model.js";
import mongoose from "mongoose";

export const createSupplier = async (req, res) => {
    const supplier = req.body;
  
    try {
      const newSupplier = new Supplier(supplier);
      await newSupplier.save();
      res.status(201).json(newSupplier);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

export const fetchSupplier = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const fetchAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();

    const totalSuppliers = await Supplier.countDocuments();
    res.status(200).json({
      suppliers,
      totalSuppliers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { person_name, person_number, person_email, company_name, company_email, company_country, company_province, company_city, company_zipCode } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id, 
      { 
        person_name, 
        person_number, 
        person_email, 
        company_name, 
        company_email, 
        company_country, 
        company_province, 
        company_city, 
        company_zipCode 
      },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
  }

  try {
      const deletedSupplier = await Supplier.findByIdAndDelete(id);

      if (!deletedSupplier) {
          return res.status(404).json({ message: "Supplier not found" });
      }

      res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getSupplierReports = async (req, res) => {
  try {
    const { company_name, company_country, company_province, startDate, endDate } = req.query;

    const filter = {};

    if (company_name && company_name !== "All") {
      filter.company_name = { $regex: company_name, $options: 'i' };
    }

    if (company_country && company_country !== "All") {
      filter.company_country = company_country;
    }

    if (company_province && company_province !== "All") {
      filter.company_province = company_province;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    console.log("Filter being applied:", filter);

    const reports = await Supplier.find(filter)
      .sort({ createdAt: -1 });

    console.log(`Found ${reports.length} reports matching filters`);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching supplier reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

  