import * as React from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import purchaseOrderService from "../../../services/purchaseOrderService";
import supplierService from "../../../services/supplierService";
import userService from "../../../services/userService";

import { PDFViewer } from "@react-pdf/renderer";
import PurchaseOrderReportPDF from "./PDFReports/ReportPO"

export default function ReportPO({ open, handleClose }) {

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  const [handleCloseKO, setHandleCloseKO] = useState(handleClose);
  const [showPDF, setShowPDF] = useState(false);
  const handleCloseModal = () => setShowPDF(false);

  useEffect(() => {
    fetchSuppliers();
    fetchUsers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data.suppliers);
      console.log("fetch suppliers:", suppliers)
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data.data);
      console.log("fetch users:", users)
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleGenerate = async () => {
    try {
      const params = {
        supplier: selectedSupplier,
        user: selectedUser,
        startDate: startDate ? new Date(startDate).toISOString().split("T")[0] : null,
        endDate: endDate ? new Date(endDate).toISOString().split("T")[0] : null,
        status: status,
      };
  
      const response = await purchaseOrderService.getReport(params);
      console.log("Report data:", response.data);
      setReportData(response.data);
      handleClose();
      setShowPDF(true);
  
    } catch (error) {
      console.error("Failed to fetch report", error);
    }
  };

  return (
    <>
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <div className="card card-modal shadow border-0 p-4 mt-4">
        <Typography id="modal-title" variant="h6" sx={{ mb: 3 }}>
          Report Purchase Order
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <div className="form-group">
              <h6>SELECT SUPPLIER</h6>
              <Select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Select Supplier" }}
                className="w-100"
              >
                <MenuItem value="">
                  <em value={null}>All</em>
                </MenuItem>

                {suppliers.map((supplier) => (
                  <MenuItem key={supplier._id} value={supplier.company_name}>
                    {supplier.company_name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className="form-group">
              <h6>SELECT USER</h6>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Select User" }}
                className="w-100"
              >
                <MenuItem value="">
                  <em value={null}>All</em>
                </MenuItem>
                
                {users.map((user) => (
                  <MenuItem key={user._id} value={user.first_name}>
                    {user.first_name} {user.last_name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </Grid>



          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              inputProps={{
                min: startDate,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <div className="form-group">
              <h6>PURCHASE ORDER STATUS</h6>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Purchase Order Status" }}
                className="w-100"
              >
                <MenuItem value="">
                  <em value={null}>All</em>
                </MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </div>
          </Grid>
        </Grid>

        <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 4 }}>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Close
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleGenerate}>
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
                  <h5 className="modal-title text-black">Purchase Order Report PDF</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* PDF Viewer */}
                  <PDFViewer width="100%" height="600">
                      <PurchaseOrderReportPDF data={reportData} />
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
