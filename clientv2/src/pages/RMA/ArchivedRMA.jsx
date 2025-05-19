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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import deepPurple from "@mui/material/colors/deepPurple";
import Avatar from "@mui/material/Avatar";
import GeneratePO from "../../components/Modals/GeneratePO";
import ConfirmationModal from "../../components/Modals/CustomizeConfirmation";
import ViewRMA from "../../components/Modals/ViewRMA";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Tooltip, Alert, AlertTitle, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Swal from "sweetalert2";

import rmaService from "../../services/rmaService";
import { generateCustomGRNId, generateCustomPurchaseOrderId, generateCustomRMAId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const ArchivedRMA = () => {
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
  const [rmas, setRMAs] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalRMAs, setTotalRMAs] = useState(0);
  const [totalArchivedRMAs, setTotalArchivedRMAs] = useState(0);
  const [page, setPage] = useState(1);
  const [filteredRMAs, setFilteredRMAs] = useState([]);
  const [displayedRMAs, setDisplayedRMAs] = useState([]);
  const [selectedRMA, setSelectedRMA] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    getAllArchivedRMAs();
    getActiveRMAsCount();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Filter RMAs based on category and supplier
    let filtered = [...rmas];
    if (showBysetCatBy) {
      filtered = filtered.filter(rma => rma.return_status === showBysetCatBy);
    }
    if (selectedSupplier) {
      filtered = filtered.filter(rma => rma.supplier.company_name === selectedSupplier);
    }
    setFilteredRMAs(filtered);

    // Calculate pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedRMAs(filtered.slice(startIndex, endIndex));
  }, [rmas, showBysetCatBy, selectedSupplier, page, showBy]);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(rmas.map(rma => rma.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalArchivedRMAs(rmas.length);
  }, [rmas]);

  const getAllArchivedRMAs = async () => {
    try {
      const res = await rmaService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setRMAs(res.data);
        setFilteredRMAs(res.data);
        setDisplayedRMAs(res.data.slice(0, showBy));
      }
    } catch (error) {
      console.error("Failed to fetch rmas:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch RMAs. Please try again.',
        confirmButtonColor: '#1976d2',
      });
    }
  };

  const getActiveRMAsCount = async () => {
    try {
      const res = await rmaService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalRMAs(res.data.length);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewRMA = (rma) => {
    setSelectedRMA(rma);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedRMA(null);
  };

  const handleConfirmRetrieve = async (id) => {
    try {
      const response = await rmaService.retrieve(id);
      setOpenRetrieveModal(false); // Close the confirmation modal first
      await Swal.fire({
        icon: 'success',
        title: 'Retrieved Successfully',
        text: 'The RMA has been successfully retrieved and moved to active RMAs.',
        confirmButtonColor: '#1976d2',
      });
      getAllArchivedRMAs(); // Refresh the list
    } catch (error) {
      console.error("Retrieve failed:", error);
      setOpenRetrieveModal(false); // Close the confirmation modal
      await Swal.fire({
        icon: 'error',
        title: 'Retrieval Failed',
        text: 'Failed to retrieve the RMA. Please try again.',
        confirmButtonColor: '#1976d2',
      });
    }
  };

  const handleOpenRetrieve = (id) => {
    setOpenRetrieveModal(true);
    setSelectedID(id);
  };

  // Function to check if an RMA is eligible for deletion (older than 1 year)
  const isEligibleForDeletion = (rma) => {
    const archiveDate = new Date(rma.updatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return archiveDate < oneYearAgo;
  };

  // Function to handle permanent deletion of old archived RMA
  const handlePermanentDelete = (rma) => {
    if (!isEligibleForDeletion(rma)) {
      Swal.fire({
        icon: 'error',
        title: 'Not Eligible for Deletion',
        text: 'This RMA can only be deleted after being archived for 1 year.',
      });
      return;
    }

    Swal.fire({
      title: 'Permanent Delete',
      text: 'Are you sure you want to permanently delete this archived RMA? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await rmaService.delete(rma._id);
          await Swal.fire({
            icon: 'success',
            title: 'Deleted Successfully',
            text: 'The RMA has been permanently deleted.',
            confirmButtonColor: '#1976d2',
          });
          getAllArchivedRMAs(); // Refresh the list
        } catch (error) {
          console.error("Permanent deletion failed:", error);
          Swal.fire('Error!', 'Failed to delete archived RMA', 'error');
        }
      }
    });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Archived Return Merchandise Authorization</h5>
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
                title={"Total Generated RMA"}
                value={totalRMAs}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                title={"Total Archived RMA"}
                value={totalArchivedRMAs}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={
                location.pathname === "/rma"
                  ? 0
                  : location.pathname === "/archived-rma"
                  ? 1
                  : false
              }
              onChange={(event, newValue) => {
                if (newValue === 0) {
                  navigate("/rma");
                } else if (newValue === 1) {
                  navigate("/archived-rma");
                } 
              }}
              aria-label="RMA Tabs"
            >
              <Tab label="Generated RMA" />
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
                You can retrieve archived RMAs at any time to move them back to active RMAs. 
                After 1 year in archive, RMAs will become eligible for manual deletion using the delete button in the actions column.
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
                    setPage(1);
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
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
                  onChange={(e) => {
                    setCatBy(e.target.value);
                    setPage(1);
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
                    setPage(1);
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="supplier-select-label"
                  className="w-100"
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {[...new Set(rmas.map(rma => rma.supplier.company_name))].map(supplierName => (
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
                  <th>RMA ID</th>
                  <th>GRN ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>TOTAL RETURN PRODUCTS</th>
                  <th>STATUS</th>
                  <th>ARCHIVED DATE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
              {displayedRMAs.length > 0 ? (
                  displayedRMAs.map((rma, index) => (
                <tr key={rma._id}>
                  <td>
                    <div className="d-flex align-items-center">
                     <span>{generateCustomRMAId(rma._id)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                     <span>{generateCustomGRNId(rma.grn.grn_id)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center productBox">
                      <div className="imgWrapper">
                        <Avatar sx={{ bgcolor: deepPurple[500] }}>
                          {rma.supplier.company_name?.charAt(0)}
                        </Avatar>
                      </div>
                      <div className="info pl-3">
                        <h6>{rma.supplier.company_name}</h6>
                        <p>{rma.supplier.company_email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{rma.supplier.person_number}</td>
                  <td>{rma.supplier.company_city}, {rma.supplier.company_province}, {rma.supplier.company_country},</td>
                  <td>{rma.items.length}</td>
                  <td>{rma.return_status}</td>
                  <td>{new Date(rma.updatedAt).toLocaleDateString()}</td>
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
                        onClick={() => handleViewRMA(rma)}
                      >
                        VIEW
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenRetrieve(rma._id)}
                      >
                        RETRIEVE
                      </Button>
                      <Tooltip title={
                        isEligibleForDeletion(rma) 
                          ? "Permanently delete this archived RMA" 
                          : "Can be deleted after 1 year of archival"
                      }>
                        <div>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handlePermanentDelete(rma)}
                            disabled={!isEligibleForDeletion(rma)}
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
                      No archived return merchandise authorization found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedRMAs.length}</b> of <b>{filteredRMAs.length}</b> results
              </p>
              <Pagination
                count={Math.ceil(filteredRMAs.length / showBy)}
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
        </div>
      </div>

      <ViewRMA
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        rma={selectedRMA}
      />

      <ConfirmationModal
        open={openRetrieveModal}
        onClose={() => setOpenRetrieveModal(false)}
        onConfirm={() => handleConfirmRetrieve(selectedID)}
        title="Retrieve RMA"
        message="Are you sure you want to retrieve this RMA? This will move it back to the active RMAs."
        nameButton="Retrieve"
      />
    </>
  );
};

export default ArchivedRMA;
