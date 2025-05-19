import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import DashboardBox from "../Dashboard/components/dashboardBox";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import deepPurple from "@mui/material/colors/deepPurple";
import Avatar from "@mui/material/Avatar";
import CustomizedSnackbars from "../../components/SnackBar";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewBackOrder from "../../components/Modals/ViewBackOrder";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, Alert, AlertTitle } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmationModal from "../../components/Modals/CustomizeConfirmation";

import backorderService from "../../services/backorderService";
import { generateCustomGRNId, generateCustomPurchaseOrderId, generateCustomBackOrderId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const ArchivedBackOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [backorders, setBackorders] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredBackorders, setFilteredBackorders] = useState([]);
  const [displayedBackorders, setDisplayedBackorders] = useState([]);
  
  // Add state variables for metrics
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalGeneratedBackorders, setTotalGeneratedBackorders] = useState(0);
  const [totalArchivedBackorders, setTotalArchivedBackorders] = useState(0);
  const [selectedBackOrder, setSelectedBackOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [selectedID, setSelectedID] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllArchivedBackOrders();
    getGeneratedBackordersCount();
  }, []);

  useEffect(() => {
    // Filter backorders based on category and supplier
    let filtered = [...backorders];
    if (showBysetCatBy) {
      filtered = filtered.filter(bo => bo.order_status === showBysetCatBy);
    }
    if (selectedSupplier) {
      filtered = filtered.filter(bo => bo.supplier.company_name === selectedSupplier);
    }
    setFilteredBackorders(filtered);
  }, [backorders, showBysetCatBy, selectedSupplier]);

  useEffect(() => {
    // Calculate pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedBackorders(filteredBackorders.slice(startIndex, endIndex));
  }, [filteredBackorders, page, showBy]);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(backorders.map(bo => bo.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalArchivedBackorders(backorders.length);
  }, [backorders]);

  const getAllArchivedBackOrders = async () => {
    try {
      const res = await backorderService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setBackorders(res.data);
        setFilteredBackorders(res.data);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message if needed
    }
  };

  const getGeneratedBackordersCount = async () => {
    try {
      const res = await backorderService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalGeneratedBackorders(res.data.length);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message if needed
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewBackOrder = (backOrder) => {
    setSelectedBackOrder(backOrder);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedBackOrder(null);
  };

  // Function to check if a backorder is eligible for deletion (older than 1 year)
  const isEligibleForDeletion = (backorder) => {
    const archiveDate = new Date(backorder.updatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return archiveDate < oneYearAgo;
  };

  // Function to handle permanent deletion of old archived backorder
  const handlePermanentDelete = (backorder) => {
    if (!isEligibleForDeletion(backorder)) {
      Swal.fire({
        icon: 'error',
        title: 'Not Eligible for Deletion',
        text: 'This backorder can only be deleted after being archived for 1 year.',
      });
      return;
    }

    Swal.fire({
      title: 'Permanent Delete',
      text: 'Are you sure you want to permanently delete this archived backorder? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await backorderService.delete(backorder._id);
          setMessage("Archived backorder permanently deleted!");
          setOpenSnackbar(true);
          getAllArchivedBackOrders();
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete archived backorder', 'error');
        }
      }
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleConfirmRetrieve = async (id) => {
    try {
      const response = await backorderService.retrieve(id);
      setOpenRetrieveModal(false); // Close the confirmation modal first
      await Swal.fire({
        icon: 'success',
        title: 'Retrieved Successfully',
        text: 'The backorder has been successfully retrieved and moved to active backorders.',
        confirmButtonColor: '#1976d2',
      });
      getAllArchivedBackOrders(); // Refresh the list
    } catch (error) {
      console.error("Retrieve failed:", error);
      setOpenRetrieveModal(false); // Close the confirmation modal
      await Swal.fire({
        icon: 'error',
        title: 'Retrieval Failed',
        text: 'Failed to retrieve the backorder. Please try again.',
        confirmButtonColor: '#1976d2',
      });
    }
  };

  const handleOpenRetrieve = (id) => {
    setOpenRetrieveModal(true);
    setSelectedID(id);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Archived Backorder</h5>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                title={"Number of Suppliers"}
                value={totalSuppliers}
              />
              <DashboardBox
                color={["#c012e2", "#eb64fe"]}
                title={"Total Generated Backorder"}
                value={totalGeneratedBackorders}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                title={"Total Archived Backorder"}
                value={totalArchivedBackorders}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={
                location.pathname === "/back-order"
                  ? 0
                  : location.pathname === "/generated-back-order"
                  ? 1
                  : location.pathname === "/archived-back-order"
                  ? 2
                  : false
              }
              onChange={(event, newValue) => {
                if (newValue === 0) {
                  navigate("/back-order");
                } else if (newValue === 1) {
                  navigate("/generated-back-order");
                } else if (newValue === 2) {
                  navigate("/archived-back-order");
                } 
              }}
              aria-label="Backorder Tabs"
            >
              <Tab label="Generate Backorder" />
              <Tab label="Generated Backorder" />
              <Tab label="Archived" />
            </Tabs>
          </Box>

          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>Archive Management Policy</AlertTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>
                You can retrieve archived backorders at any time to move them back to active backorders. 
                After 1 year in archive, backorders will become eligible for manual deletion using the delete button in the actions column.
              </Typography>
            </Box>
          </Alert>
          
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBy}
                  onChange={(e) => setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>FILTER BY STATUS</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBysetCatBy}
                  onChange={(e) => setCatBy(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                  <MenuItem value="Complete">Complete</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>SUPPLIER</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="supplier-select-label"
                  className="w-100"
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {[...new Set(backorders.map(bo => bo.supplier.company_name))].map(supplierName => (
                    <MenuItem key={supplierName} value={supplierName}>
                      {supplierName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>BACKORDER ID</th>
                  <th>PO ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>TOTAL PRODUCTS</th>
                  <th>STATUS</th>
                  <th>TOTAL PRICE</th>
                  <th style={{ width: "320px" }}>ACTION</th>
                </tr>
              </thead>

              <tbody>
              {displayedBackorders.length > 0 ? (
                  displayedBackorders.map((backorder, index) => (
                <tr key={backorder._id}>
                  <td>
                    <div className="d-flex align-items-center">
                     <span>{generateCustomBackOrderId(backorder._id)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                     <span>{generateCustomPurchaseOrderId(backorder.po.po_id)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="imgWrapper">
                        <Avatar sx={{ bgcolor: deepPurple[500] }}>
                          {backorder.supplier.company_name?.charAt(0)}
                        </Avatar>
                      </div>
                      <div className="info pl-3">
                        <h6>{backorder.supplier.company_name}</h6>
                        <p>{backorder.supplier.company_email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Chip 
                      label={backorder.items.length}
                      color="primary"
                      size="small"
                    />
                  </td>
                  <td>
                    <Chip 
                      label={backorder.order_status}
                      color={
                        backorder.order_status === "Draft" ? "warning" :
                        backorder.order_status === "Approved" ? "success" :
                        backorder.order_status === "Complete" ? "info" :
                        "default"
                      }
                      size="small"
                    />
                  </td>
                  <td>
                    <Typography color="primary">
                      ₱{backorder.items.reduce((total, item) => total + (item.backorder_quantity * item.product_Price), 0).toFixed(2)}
                    </Typography>
                  </td>
                  <td style={{ width: "320px", padding: "0.5rem" }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap',
                      justifyContent: 'flex-start'
                    }}>
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewBackOrder(backorder)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 2,
                          py: 1
                        }}
                      >
                        VIEW
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenRetrieve(backorder._id)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 2,
                          py: 1
                        }}
                      >
                        RETRIEVE
                      </Button>
                      <Tooltip title={
                        isEligibleForDeletion(backorder) 
                          ? "Permanently delete this archived backorder" 
                          : "Can be deleted after 1 year of archival"
                      }>
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handlePermanentDelete(backorder)}
                            disabled={!isEligibleForDeletion(backorder)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2,
                              py: 1
                            }}
                          >
                            DELETE
                          </Button>
                        </span>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No archived backorders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedBackorders.length}</b> of <b>{filteredBackorders.length}</b> results
              </p>
              <Pagination
                count={Math.ceil(filteredBackorders.length / showBy)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                className="pagination"
                showFirstButton
                showLastButton
              />
            </div>
          </div>
        </div>
      </div>

      <ViewBackOrder
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        backOrder={selectedBackOrder}
      />

      <CustomizedSnackbars
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={message}
      />

      <ConfirmationModal
        open={openRetrieveModal}
        onClose={() => setOpenRetrieveModal(false)}
        onConfirm={() => handleConfirmRetrieve(selectedID)}
        title="Retrieve Backorder"
        message="Are you sure you want to retrieve this backorder? This will move it back to the active backorders."
        nameButton="Retrieve"
      />
    </>
  );
};

export default ArchivedBackOrder;
