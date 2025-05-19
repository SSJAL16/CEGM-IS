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
import EditIcon from "@mui/icons-material/Edit";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import deepPurple from "@mui/material/colors/deepPurple";
import Avatar from "@mui/material/Avatar";
import GeneratePO from "../../components/Modals/GeneratePO";
import CustomizedSnackbars from "../../components/SnackBar";
import ConfirmationModal from "../../components/Modals/CustomizeConfirmation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewGRN from "../../components/Modals/ViewGRN";
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, Alert, AlertTitle, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Swal from "sweetalert2";

import grnService from "../../services/grnService";
import {
  generateCustomGRNId,
  generateCustomPurchaseOrderId,
} from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const ArchivedGRN = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openArchiveModal, setOpenArchiveModal] = useState(false);
  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [selectedID, setSelectedID] = useState("");
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [grns, setGRNs] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredGRNs, setFilteredGRNs] = useState([]);
  const [displayedGRNs, setDisplayedGRNs] = useState([]);
  
  // Add state variables for metrics
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalGeneratedGRNs, setTotalGeneratedGRNs] = useState(0);
  const [totalArchivedGRNs, setTotalArchivedGRNs] = useState(0);

  // Add these state variables
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleClose = () => setOpen(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllArchivedGRNS();
    getGeneratedGRNsCount();
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
    const uniqueSuppliers = new Set(grns.map(grn => grn.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalArchivedGRNs(grns.length);
  }, [grns]);

  const getGeneratedGRNsCount = async () => {
    try {
      const res = await grnService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalGeneratedGRNs(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch generated GRNs count:", error);
    }
  };

  useEffect(() => {
    // Filter GRNs based on category and supplier
    const filtered = grns.filter(grn => {
      const matchesCategory = !showBysetCatBy || grn.order_status === showBysetCatBy;
      const matchesSupplier = !selectedSupplier || grn.supplier.company_name === selectedSupplier;
      return matchesCategory && matchesSupplier;
    });
    setFilteredGRNs(filtered);

    // Reset to first page when filters change
    setPage(1);
  }, [grns, showBysetCatBy, selectedSupplier]);

  useEffect(() => {
    // Calculate displayed GRNs based on pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedGRNs(filteredGRNs.slice(startIndex, endIndex));
  }, [filteredGRNs, page, showBy]);

  const getAllArchivedGRNS = async () => {
    try {
      const res = await grnService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setGRNs(res.data);
        setFilteredGRNs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch archived GRNs:", error);
    }
  };

  const handleEditGRN = (grn) => {
    navigate("/edit-generated-grn", {
      state: { selectedGRN: grn },
    });
  };

  const handleConfirmArchive = async (id) => {
    try {
      await grnService.archive(id);
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
      await grnService.delete(id);
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const totalPages = Math.ceil(filteredGRNs.length / showBy);

  // Add these handler functions
  const handleViewGRN = (grn) => {
    setSelectedGRN(grn);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedGRN(null);
  };

  // Function to check if a GRN is eligible for deletion (older than 1 year)
  const isEligibleForDeletion = (grn) => {
    const archiveDate = new Date(grn.updatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return archiveDate < oneYearAgo;
  };

  // Function to handle permanent deletion of old archived GRN
  const handlePermanentDelete = (grn) => {
    if (!isEligibleForDeletion(grn)) {
      Swal.fire({
        icon: 'error',
        title: 'Not Eligible for Deletion',
        text: 'This GRN can only be deleted after being archived for 1 year.',
      });
      return;
    }

    Swal.fire({
      title: 'Permanent Delete',
      text: 'Are you sure you want to permanently delete this archived GRN? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await grnService.delete(grn._id);
          setMessage("Archived GRN permanently deleted!");
          setOpenSnackbar(true);
          getAllArchivedGRNS(); // Refresh the list
        } catch (error) {
          console.error("Permanent deletion failed:", error);
          Swal.fire('Error!', 'Failed to delete archived GRN', 'error');
        }
      }
    });
  };

  const handleConfirmRetrieve = async (id) => {
    try {
      const response = await grnService.retrieve(id);
      setOpenRetrieveModal(false); // Close the confirmation modal first
      await Swal.fire({
        icon: 'success',
        title: 'Retrieved Successfully',
        text: 'The GRN has been successfully retrieved and moved to active GRNs.',
        confirmButtonColor: '#1976d2',
      });
      getAllArchivedGRNS(); // Refresh the list
    } catch (error) {
      console.error("Retrieve failed:", error);
      setOpenRetrieveModal(false); // Close the confirmation modal
      await Swal.fire({
        icon: 'error',
        title: 'Retrieval Failed',
        text: 'Failed to retrieve the GRN. Please try again.',
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
          <h5 className="mb-0">Archived Goods Received Note</h5>
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
                title={"Total Generated GRN"}
                value={totalGeneratedGRNs}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                title={"Total Archived GRN"}
                value={totalArchivedGRNs}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={
                location.pathname === "/grn"
                  ? 0
                  : location.pathname === "/archived-grn"
                  ? 1
                  : false
              }
              onChange={(event, newValue) => {
                if (newValue === 0) {
                  navigate("/grn");
                } else if (newValue === 1) {
                  navigate("/archived-grn");
                }
              }}
              aria-label="GRN Tabs"
            >
              <Tab label="Generated GRN" />
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
                You can retrieve archived GRNs at any time to move them back to active GRNs. 
                After 1 year in archive, GRNs will become eligible for manual deletion using the delete button in the actions column.
              </Typography>
            </Box>
          </Alert>
          
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBy}
                  onChange={(e) => {
                    setshowBy(e.target.value);
                    setPage(1); // Reset to first page when changing items per page
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>FILTER BY STATUS</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBysetCatBy}
                  onChange={(e) => {
                    setCatBy(e.target.value);
                    setPage(1); // Reset to first page when changing category
                  }}
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
                    setPage(1); // Reset to first page when changing supplier
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="supplier-select-label"
                  className="w-100"
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {[...new Set(grns.map(grn => grn.supplier.company_name))].map(supplierName => (
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
                  <th>GRN ID</th>
                  <th>PO ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>ORDERED ITEMS</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {displayedGRNs.length > 0 ? (
                  displayedGRNs.map((grn, index) => (
                    <tr key={grn._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span>{generateCustomGRNId(grn._id)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span>
                            {generateCustomPurchaseOrderId(grn.po.po_id)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <Avatar sx={{ bgcolor: deepPurple[500] }}>
                              {grn.supplier.company_name?.charAt(0)}
                            </Avatar>
                          </div>
                          <div className="info pl-3">
                            <h6>{grn.supplier.company_name}</h6>
                            <p>{grn.supplier.company_email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{grn.supplier.person_number}</td>
                      <td>
                        {grn.supplier.company_city},{" "}
                        {grn.supplier.company_province},{" "}
                        {grn.supplier.company_country},
                      </td>
                      <td>{grn.items.length}</td>
                      <td>{grn.order_status}</td>
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
                            onClick={() => handleViewGRN(grn)}
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
                            onClick={() => handleOpenRetrieve(grn._id)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            RETRIEVE
                          </Button>
                          <Tooltip title={
                            isEligibleForDeletion(grn) 
                              ? "Permanently delete this archived GRN" 
                              : "Can be deleted after 1 year of archival"
                          }>
                            <span>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handlePermanentDelete(grn)}
                                disabled={!isEligibleForDeletion(grn)}
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
                    <td colSpan={8} className="text-center">
                      No archived GRNs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedGRNs.length}</b> of <b>{filteredGRNs.length}</b> results
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
            <GeneratePO open={open} handleClose={handleClose} />
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
            title="Retrieve GRN"
            message="Are you sure you want to retrieve this GRN? This will move it back to the active GRNs."
            nameButton="Retrieve"
          />

          <CustomizedSnackbars
            open={openSnackbar}
            handleClose={handleCloseSnackbar}
            message={message}
          />
        </div>
      </div>

      <ViewGRN
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        grn={selectedGRN}
      />
    </>
  );
};

export default ArchivedGRN;
