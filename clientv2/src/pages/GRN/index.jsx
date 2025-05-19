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
import GeneratePO from "../../components/Modals/GeneratePO";
import Swal from "sweetalert2";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewGRN from "../../components/Modals/ViewGRN";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import grnService from "../../services/grnService";
import purchaseOrderService from "../../services/purchaseOrderService";
import { generateCustomGRNId, generateCustomPurchaseOrderId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const GRN = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [grns, setGRNs] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredGRNs, setFilteredGRNs] = useState([]);
  const [displayedGRNs, setDisplayedGRNs] = useState([]);
  
  // Add state variables for metrics
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalGeneratedGRNs, setTotalGeneratedGRNs] = useState(0);
  const [totalArchivedGRNs, setTotalArchivedGRNs] = useState(0);

  const [selectedGRN, setSelectedGRN] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleClose = () => setOpen(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllGRNS();
    getPendingPOs();
    getArchivedGRNsCount();
  }, []);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(grns.map(grn => grn.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalGeneratedGRNs(grns.length);
  }, [grns]);

  const getArchivedGRNsCount = async () => {
    try {
      const res = await grnService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalArchivedGRNs(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch archived GRNs count:", error);
    }
  };

  const getPendingPOs = async () => {
    try {
      const res = await purchaseOrderService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        // Filter POs that are approved but don't have GRN yet
        const pending = res.data.filter(po => 
          po.order_status === "Approved" && !grns.some(grn => grn.po_id._id === po._id)
        );
        setPendingPOs(pending);
      }
    } catch (error) {
      console.error("Failed to fetch pending POs:", error);
    }
  };

  const handleGenerateGRN = async (po) => {
    try {
      const result = await Swal.fire({
        title: 'Generate GRN',
        text: 'Do you want to generate a GRN for this Purchase Order?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, generate GRN'
      });

      if (result.isConfirmed) {
        const grnData = {
          po_id: po._id,
          supplier_id: po.supplier._id,
          items: po.items,
          order_status: "Draft"
        };

        const res = await grnService.create(grnData);
        if (res.status === 201) {
          Swal.fire('Success', 'GRN generated successfully', 'success');
          getAllGRNS();
          getPendingPOs();
        }
      }
    } catch (error) {
      console.error("Failed to generate GRN:", error);
      Swal.fire('Error', 'Failed to generate GRN', 'error');
    }
  };

  useEffect(() => {
    // Filter GRNs based on category and supplier
    let filtered = [...grns];
    if (showBysetCatBy) {
      filtered = filtered.filter(grn => grn.order_status === showBysetCatBy);
    }
    if (selectedSupplier) {
      filtered = filtered.filter(grn => grn.supplier.company_name === selectedSupplier);
    }
    setFilteredGRNs(filtered);
  }, [grns, showBysetCatBy, selectedSupplier]);

  useEffect(() => {
    // Calculate displayed GRNs based on pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedGRNs(filteredGRNs.slice(startIndex, endIndex));
  }, [filteredGRNs, page, showBy]);

  const getAllGRNS = async () => {
    try {
      const res = await grnService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setGRNs(res.data);
        setFilteredGRNs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch GRN:", error);
    }
  };

  const handleEditGRN = (grn) => {
    navigate("/edit-generated-grn", {
      state: { selectedGRN: grn }
    });
  };

  const handleArchive = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Archive GRN',
        text: 'Are you sure you want to archive this GRN?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!'
      });

      if (result.isConfirmed) {
        await grnService.archive(id);
        Swal.fire(
          'Archived!',
          'GRN has been archived.',
          'success'
        );
        getAllGRNS();
      }
    } catch (error) {
      console.error("Archive failed:", error);
      Swal.fire(
        'Error!',
        'Failed to archive GRN.',
        'error'
      );
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete GRN',
        text: 'Are you sure you want to delete this GRN? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await grnService.delete(id);
        Swal.fire(
          'Deleted!',
          'GRN has been deleted.',
          'success'
        );
        getAllGRNS();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire(
        'Error!',
        'Failed to delete GRN.',
        'error'
      );
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const totalPages = Math.ceil(filteredGRNs.length / showBy);

  const handleViewGRN = (grn) => {
    setSelectedGRN(grn);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedGRN(null);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Goods Received Note</h5>
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
          {pendingPOs.length > 0 && (
            <div className="alert alert-info">
              You have {pendingPOs.length} approved Purchase Orders pending GRN generation
            </div>
          )}

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

          {/* Pending POs Table */}
          {pendingPOs.length > 0 && (
            <div className="table-responsive mt-3">
              <h5>Pending Purchase Orders</h5>
              <table className="table table-bordered table-striped v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>PO ID</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPOs.map(po => (
                    <tr key={po._id}>
                      <td>{generateCustomPurchaseOrderId(po._id)}</td>
                      <td>{po.supplier.company_name}</td>
                      <td>{po.order_status}</td>
                      <td>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => handleGenerateGRN(po)}
                        >
                          Generate GRN
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>ORDER DATE</th>
                  <th>STATUS</th>
                  <th>NUMBER OF ITEMS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>ACTIONS</th>
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
                  <td>{grn.supplier.company_city}, {grn.supplier.company_province}, {grn.supplier.company_country}</td>
                  <td>{new Date(grn.po.order_date).toLocaleDateString()}</td>
                  <td>
                    <Chip 
                      label={grn.order_status}
                      color={
                        grn.order_status === "Draft" ? "warning" :
                        grn.order_status === "Approved" ? "success" :
                        grn.order_status === "Complete" ? "info" :
                        "default"
                      }
                      size="small"
                    />
                  </td>
                  <td>
                    <Chip 
                      label={grn.items.length}
                      color="primary"
                      size="small"
                    />
                  </td>
                  <td>
                    <Typography color="primary">
                      ₱{grn.items.reduce((total, item) => total + (item.received_quantity * item.product_Price), 0).toFixed(2)}
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
                        onClick={() => handleViewGRN(grn)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 2
                        }}
                      >
                        VIEW
                      </Button>
                      {grn.order_status === "Draft" ? (
                        <>
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleDelete(grn._id)}
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
                            onClick={() => handleEditGRN(grn)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            EDIT
                          </Button>
                        </>
                      ) : grn.order_status === "Approved" ? (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => handleArchive(grn._id)}
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
                      No goods received notes found.
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
          </div>
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

export default GRN;
