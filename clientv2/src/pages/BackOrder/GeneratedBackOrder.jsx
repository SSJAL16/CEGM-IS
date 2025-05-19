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
import EditIcon from '@mui/icons-material/Edit';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import deepPurple from "@mui/material/colors/deepPurple";
import Avatar from "@mui/material/Avatar";
import CustomizedSnackbars from "../../components/SnackBar";
import Swal from "sweetalert2";
import { Chip, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewBackOrder from "../../components/Modals/ViewBackOrder";

import backorderService from "../../services/backorderService";
import { generateCustomGRNId, generateCustomPurchaseOrderId, generateCustomBackOrderId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const GeneratedBackOrder = () => {
  const navigate = useNavigate();
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const { state } = useLocation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [backorders, setBackorders] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalBackorders, setTotalBackorders] = useState(0);
  const [totalArchivedBackorders, setTotalArchivedBackorders] = useState(0);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(1);
  const [filteredBackorders, setFilteredBackorders] = useState([]);
  const [displayedBackorders, setDisplayedBackorders] = useState([]);
  const [selectedBackOrder, setSelectedBackOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllBackOrders();
    getArchivedBackordersCount();
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
    setTotalBackorders(backorders.length);
  }, [backorders]);

  const getAllBackOrders = async () => {
    try {
      const res = await backorderService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setBackorders(res.data);
        setFilteredBackorders(res.data);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message if needed
    }
  };

  const getArchivedBackordersCount = async () => {
    try {
      const res = await backorderService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalArchivedBackorders(res.data.length);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message if needed
    }
  };

  const handleEditBackorder = (backorder) => {
    navigate("/edit-generated-back-order", {
      state: { selectedBackorder: backorder }
    });
  };

  const handleOpenArchive = (id) => {
    Swal.fire({
      title: 'Archive Backorder',
      text: 'Are you sure you want to archive this backorder?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Archive',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await backorderService.archive(id);
          localStorage.setItem("snackbarMessage", "Backorder archived successfully!");
          localStorage.setItem("showSnackbar", "true");
          window.location.reload();
        } catch (error) {
          console.error("Archive failed:", error);
          Swal.fire('Error!', 'Failed to archive backorder', 'error');
        }
      }
    });
  };

  const handleOpenDelete = (id) => {
    Swal.fire({
      title: 'Delete Backorder',
      text: 'Are you sure you want to delete this backorder? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await backorderService.delete(id);
          localStorage.setItem("snackbarMessage", "Backorder deleted successfully!");
          localStorage.setItem("showSnackbar", "true");
          window.location.reload();
          setMessage("Backorder deleted successfully!")
          setOpenSnackbar(true)
        } catch (error) {
          console.error("Delete failed:", error);
          Swal.fire('Error!', 'Failed to delete backorder', 'error');
        }
      }
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewBackOrder = (backorder) => {
    setSelectedBackOrder(backorder);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedBackOrder(null);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Backorder</h5>
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
                value={totalBackorders}
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
                  <th>BO ID</th>
                  <th>PO ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>TOTAL BACKORDER PRODUCTS</th>
                  <th>STATUS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>ACTION</th>
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
                  <td>{backorder.supplier.person_number}</td>
                  <td>{backorder.supplier.company_city}, {backorder.supplier.company_province}, {backorder.supplier.company_country},</td>
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
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap'
                    }}>
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewBackOrder(backorder)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 2
                        }}
                      >
                        VIEW
                      </Button>
                      {backorder.order_status === "Draft" ? (
                        <>
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleOpenDelete(backorder._id)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            DELETE
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditBackorder(backorder)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            EDIT
                          </Button>
                        </>
                      ) : backorder.order_status === "Approved" ? (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => handleOpenArchive(backorder._id)}
                          sx={{ 
                            minWidth: 'auto', 
                            px: 2
                          }}
                        >
                          ARCHIVE
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No backorders found.
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

            <CustomizedSnackbars
              open={openSnackbar}
              handleClose={handleCloseSnackbar}
              message={message}
            />
      </div>

      <ViewBackOrder
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        backOrder={selectedBackOrder}
      />
    </>
  );
};

export default GeneratedBackOrder;
