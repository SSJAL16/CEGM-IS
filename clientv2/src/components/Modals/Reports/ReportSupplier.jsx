import * as React from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import supplierService from "../../../services/supplierService";

import { PDFViewer } from "@react-pdf/renderer";
import SupplierReportPDF from "./PDFReports/ReportSupplier";

export default function ReportSupplier({ open, handleClose }) {
  const [filters, setFilters] = useState({
    company_name: "",
    company_country: "",
    company_province: "",
    startDate: "",
    endDate: "",
  });

  const [reportData, setReportData] = useState([]);
  const [showPDF, setShowPDF] = useState(false);
  const handleCloseModal = () => setShowPDF(false);

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      company_name: "",
      company_country: "",
      company_province: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleGenerate = async () => {
    try {
      const response = await supplierService.getReport({
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate).toISOString().split("T")[0] : null,
        endDate: filters.endDate ? new Date(filters.endDate).toISOString().split("T")[0] : null,
      });
      setReportData(response.data);
      handleClose();
      setShowPDF(true);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
        <div className="card card-modal shadow border-0 p-4 mt-4">
          <Typography id="modal-title" variant="h6" sx={{ mb: 3 }}>
            Supplier Report
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={filters.company_name}
                onChange={handleFilterChange("company_name")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={filters.company_country}
                onChange={handleFilterChange("company_country")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Province"
                value={filters.company_province}
                onChange={handleFilterChange("company_province")}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange("startDate")}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange("endDate")}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                inputProps={{
                  min: filters.startDate,
                }}
              />
            </Grid>
          </Grid>

          <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
            <Grid item>
              <Button onClick={handleClearFilters} color="secondary">
                Clear Filters
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={handleClose}>Close</Button>
            </Grid>
            <Grid item>
              <Button onClick={handleGenerate} variant="contained">
                Generate
              </Button>
            </Grid>
          </Grid>
        </div>
      </Modal>

      {showPDF && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-black">Supplier Report PDF</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <PDFViewer width="100%" height="600">
                  <SupplierReportPDF data={reportData} />
                </PDFViewer>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 