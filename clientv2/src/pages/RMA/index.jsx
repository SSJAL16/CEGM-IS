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
import ViewRMA from "../../components/Modals/ViewRMA";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import rmaService from "../../services/rmaService";
import { generateCustomGRNId, generateCustomPurchaseOrderId, generateCustomRMAId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };
const RMA = () => {
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
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
    getAllRMAs();
    getArchivedRMAsCount();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(rmas.map(rma => rma.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalRMAs(rmas.length);
  }, [rmas]);

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

  const getAllRMAs = async () => {
    try {
      const res = await rmaService.getAll();
      if (res.status === 200 && Array.isArray(res.data)) {
        setRMAs(res.data);
        setFilteredRMAs(res.data);
        setDisplayedRMAs(res.data.slice(0, showBy));
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const getArchivedRMAsCount = async () => {
    try {
      const res = await rmaService.getAllArchived();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalArchivedRMAs(res.data.length);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handleEditRMA = (rma) => {
    navigate("/edit-generated-rma", {
      state: { selectedRMA: rma }
    });
  };

  const handleConfirmArchive = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Archive RMA',
        text: 'Are you sure you want to archive this RMA?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Archive'
      });

      if (result.isConfirmed) {
        await rmaService.archive(id);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'RMA archived successfully!'
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to archive RMA'
      });
    }
  };
  
  const handleConfirmDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete RMA',
        text: 'Are you sure you want to delete this RMA? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete'
      });

      if (result.isConfirmed) {
        await rmaService.delete(id);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'RMA deleted successfully!'
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete RMA'
      });
    }
  };

  const handleViewRMA = (rma) => {
    setSelectedRMA(rma);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedRMA(null);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Return Merchandise Authorization</h5>
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
                  <th>PO ID</th>
                  <th>GRN ID</th>
                  <th style={{ width: "300px" }}>SUPPLIER</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>RETURN ITEMS</th>
                  <th>STATUS</th>
                  <th>TOTAL RETURN VALUE</th>
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
                          <span>{generateCustomPurchaseOrderId(rma.po.po_id)}</span>
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
                      <td>{rma.supplier.company_city}, {rma.supplier.company_province}, {rma.supplier.company_country}</td>
                      <td>
                        <Chip 
                          label={rma.items.length}
                          color="primary"
                          size="small"
                        />
                      </td>
                      <td>
                        <Chip 
                          label={rma.return_status}
                          color={
                            rma.return_status === "Draft" ? "warning" :
                            rma.return_status === "Approved" ? "success" :
                            rma.return_status === "Complete" ? "info" :
                            "default"
                          }
                          size="small"
                        />
                      </td>
                      <td>
                        <Typography color="primary">
                          ₱{rma.items.reduce((total, item) => total + (item.return_quantity * item.product_Price), 0).toFixed(2)}
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
                            onClick={() => handleViewRMA(rma)}
                            sx={{ 
                              minWidth: 'auto', 
                              px: 2
                            }}
                          >
                            VIEW
                          </Button>
                          {rma.return_status === "Draft" ? (
                            <>
                              <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleConfirmDelete(rma._id)}
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
                                onClick={() => handleEditRMA(rma)}
                                sx={{ 
                                  minWidth: 'auto', 
                                  px: 2
                                }}
                              >
                                EDIT
                              </Button>
                            </>
                          ) : rma.return_status === "Approved" ? (
                            <Button 
                              variant="contained" 
                              color="secondary"
                              onClick={() => handleConfirmArchive(rma._id)}
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
                    <td colSpan={10} className="text-center">
                      No return merchandise authorizations found.
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
                onChange={(event, value) => setPage(value)}
                color="primary"
                className="pagination"
                showFirstButton
                showLastButton
              />
            </div>
          </div>
        </div>
      </div>

      <ViewRMA
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        rma={selectedRMA}
      />
    </>
  );
};

export default RMA;
