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
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import GeneratePO from "../../components/Modals/GeneratePO";
import CustomizedSnackbars from "../../components/SnackBar";
import ConfirmationModal from "../../components/Modals/CustomizeConfirmation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewPO from '../../components/Modals/ViewPO';
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, Alert, AlertTitle } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Swal from 'sweetalert2';

import purchaseOrderService from "../../services/purchaseOrderService";

import { generateCustomPurchaseOrderId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ArchivedPO = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [showBy, setshowBy] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [selectedID, setSelectedID] = useState("");
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  
  // Add state variables for metrics
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalGeneratedPOs, setTotalGeneratedPOs] = useState(0);
  const [totalArchivedPOs, setTotalArchivedPOs] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllPurchaseOrders();
    getGeneratedPOsCount();
    const shouldShowSnackbar = localStorage.getItem("showSnackbar");
    const snackbarMsg = localStorage.getItem("snackbarMessage");

    if (shouldShowSnackbar === "true") {
      setMessage(snackbarMsg || "Success!");
      setOpenSnackbar(true);
      localStorage.removeItem("showSnackbar");
      localStorage.removeItem("snackbarMessage");
    }
  }, []);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(purchaseOrders.map(po => po.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalArchivedPOs(purchaseOrders.length);
  }, [purchaseOrders]);

  useEffect(() => {
    // Filter orders based on status
    let filtered = [...purchaseOrders];
    if (statusFilter) {
      filtered = filtered.filter((po) => po.order_status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [purchaseOrders, statusFilter]);

  useEffect(() => {
    // Update displayed orders based on pagination and show by
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedOrders(filteredOrders.slice(startIndex, endIndex));
  }, [filteredOrders, page, showBy]);

  const getGeneratedPOsCount = async () => {
    try {
      const res = await purchaseOrderService.getAllPO();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalGeneratedPOs(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch generated POs count:", error);
    }
  };

  const fetchAllPurchaseOrders = async () => {
    try {
      const res = await purchaseOrderService.getAllArchivedPO();
      if (res.status === 200 && Array.isArray(res.data)) {
        setPurchaseOrders(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleShowByChange = (event) => {
    setshowBy(event.target.value);
    setPage(1); // Reset to first page when changing items per page
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when changing filter
  };

  const totalPages = Math.ceil(filteredOrders.length / showBy);

  const handleConfirmArchive = async (id) => {
    try {
      await purchaseOrderService.archive(id);
      localStorage.setItem(
        "snackbarMessage",
        "Purchase Order archived successfully!"
      );
      localStorage.setItem("showSnackbar", "true");
      window.location.reload();
    } catch (error) {
      console.error("Archive failed:", error);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await purchaseOrderService.delete(id);
      localStorage.setItem(
        "snackbarMessage",
        "Purchase Order delete successfully!"
      );
      localStorage.setItem("showSnackbar", "true");
      window.location.reload();
      setMessage("Purchase Order delete successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDelete = (id) => {
    setOpenDeleteModal(true);
    setSelectedID(id);
  };

  const handleOpenArchive = (id) => {
    setOpenArchiveModal(true);
    setSelectedID(id);
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedPO(null);
  };

  const handleConfirmRetrieve = async (id) => {
    try {
      const response = await purchaseOrderService.retrieve(id);
      setOpenRetrieveModal(false); // Close the confirmation modal first
      await Swal.fire({
        icon: 'success',
        title: 'Retrieved Successfully',
        text: 'The purchase order has been successfully retrieved and moved to active purchase orders.',
        confirmButtonColor: '#1976d2',
      });
      fetchAllPurchaseOrders(); // Refresh the list
    } catch (error) {
      console.error("Retrieve failed:", error);
      setOpenRetrieveModal(false); // Close the confirmation modal
      await Swal.fire({
        icon: 'error',
        title: 'Retrieval Failed',
        text: 'Failed to retrieve the purchase order. Please try again.',
        confirmButtonColor: '#1976d2',
      });
    }
  };

  const handleOpenRetrieve = (id) => {
    setOpenRetrieveModal(true);
    setSelectedID(id);
  };

  // Function to check if a PO is eligible for deletion (older than 1 year)
  const isEligibleForDeletion = (po) => {
    const archiveDate = new Date(po.updatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return archiveDate < oneYearAgo;
  };

  // Function to handle permanent deletion of old archived PO
  const handlePermanentDelete = (po) => {
    if (!isEligibleForDeletion(po)) {
      Swal.fire({
        icon: 'error',
        title: 'Not Eligible for Deletion',
        text: 'This purchase order can only be deleted after being archived for 1 year.',
      });
      return;
    }

    Swal.fire({
      title: 'Permanent Delete',
      text: 'Are you sure you want to permanently delete this archived purchase order? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await purchaseOrderService.delete(po._id);
          setMessage("Archived purchase order permanently deleted!");
          setOpenSnackbar(true);
          fetchAllPurchaseOrders(); // Refresh the list
        } catch (error) {
          console.error("Permanent deletion failed:", error);
          Swal.fire('Error!', 'Failed to delete archived purchase order', 'error');
        }
      }
    });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Archived Purchase Order</h5>
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
                title={"Total Generated Purchase Order"}
                value={totalGeneratedPOs}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                title={"Total Archived Purchase Order"}
                value={totalArchivedPOs}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={
                location.pathname === "/low-stock-products"
                  ? 0
                  : location.pathname === "/generated-purchase-orders"
                  ? 1
                  : location.pathname === "/archived-purchase-orders"
                  ? 2
                  : false
              }
              onChange={(event, newValue) => {
                if (newValue === 0) {
                  navigate("/low-stock-products");
                } else if (newValue === 1) {
                  navigate("/generated-purchase-orders");
                } else if (newValue === 2) {
                  navigate("/archived-purchase-orders");
                }
              }}
              aria-label="Purchase Order Tabs"
            >
              <Tab label="Low Stock Products" />
              <Tab label="Purchase Orders" />
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
                You can retrieve archived purchase orders at any time to move them back to active purchase orders. 
                After 1 year in archive, purchase orders will become eligible for manual deletion using the delete button in the actions column.
              </Typography>
            </Box>
          </Alert>
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBy}
                  onChange={handleShowByChange}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>STATUS FILTER</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
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
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>PO ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>ORDER DATE</th>
                  <th>STATUS</th>
                  <th>NUMBER OF PRODUCTS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {displayedOrders.length > 0 ? (
                  displayedOrders.map((po, index) => (
                    <tr key={po._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span>{generateCustomPurchaseOrderId(po._id)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <Avatar sx={{ bgcolor: deepPurple[500] }}>
                              {po.supplier?.company_name?.charAt(0) || "S"}
                            </Avatar>
                          </div>
                          <div className="info pl-3">
                            <h6>{po.supplier?.company_name}</h6>
                            <p>{po.supplier?.company_email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{po.supplier?.person_number}</td>
                      <td>{`${po.supplier?.company_city}, ${po.supplier?.company_province}, ${po.supplier?.company_country}`}</td>
                      <td>{new Date(po.order_date).toLocaleDateString()}</td>
                      <td>
                        <Chip 
                          label={po.order_status}
                          color={
                            po.order_status === "Draft" ? "warning" :
                            po.order_status === "Approved" ? "success" :
                            po.order_status === "Complete" ? "info" :
                            "default"
                          }
                          size="small"
                        />
                      </td>
                      <td>
                        <Chip 
                          label={po.items?.length}
                          color="primary"
                          size="small"
                        />
                      </td>
                      <td>
                        <Typography color="primary">
                          ₱{po.items?.reduce((total, item) => total + (item.quantity * item.product_Price), 0).toFixed(2)}
                        </Typography>
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Button
                            variant="outlined"
                            color="info"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewPO(po)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            VIEW
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenRetrieve(po._id)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            RETRIEVE
                          </Button>
                          <Tooltip title={
                            isEligibleForDeletion(po) 
                              ? "Permanently delete this archived purchase order" 
                              : "Can be deleted after 1 year of archival"
                          }>
                            <div>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handlePermanentDelete(po)}
                                disabled={!isEligibleForDeletion(po)}
                              >
                                DELETE
                              </Button>
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No archived purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedOrders.length}</b> of{" "}
                <b>{filteredOrders.length}</b> results
              </p>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                className="pagination"
                showFirstButton
                showLastButton
              />
            </div>
          </div>

          <ConfirmationModal
            open={openDeleteModal}
            onClose={() => setOpenDeleteModal(false)}
            onConfirm={() => handleConfirmDelete(selectedID)}
            title="Delete Purchase Order"
            message="Are you sure you want to delete this purchase order? This action cannot be undone."
            nameButton="Delete"
          />

          <ConfirmationModal
            open={openArchiveModal}
            onClose={() => setOpenArchiveModal(false)}
            onConfirm={() => handleConfirmArchive(selectedID)}
            title="Archive Purchase Order"
            message="Are you sure you want to archive this purchase order?"
            nameButton="Archive"
          />

          <ConfirmationModal
            open={openRetrieveModal}
            onClose={() => setOpenRetrieveModal(false)}
            onConfirm={() => handleConfirmRetrieve(selectedID)}
            title="Retrieve Purchase Order"
            message="Are you sure you want to retrieve this purchase order? This will move it back to the active purchase orders."
            nameButton="Retrieve"
          />

          <CustomizedSnackbars
            open={openSnackbar}
            handleClose={handleCloseSnackbar}
            message={message}
          />
        </div>
      </div>

      <ViewPO
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        po={selectedPO}
      />
    </>
  );
};

export default ArchivedPO;
