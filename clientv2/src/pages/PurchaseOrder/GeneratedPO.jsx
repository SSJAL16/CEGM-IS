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
import Swal from "sweetalert2";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewPO from '../../components/Modals/ViewPO';
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import purchaseOrderService from "../../services/purchaseOrderService";
import grnService from "../../services/grnService";

import { generateCustomPurchaseOrderId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const GeneratedPO = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [page, setPage] = useState(1);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredPOs, setFilteredPOs] = useState([]);
  const [displayedPOs, setDisplayedPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Add state variables for metrics
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalGeneratedPOs, setTotalGeneratedPOs] = useState(0);
  const [totalArchivedPOs, setTotalArchivedPOs] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAllPurchaseOrders();
    getArchivedPOsCount();
    const shouldShowSnackbar = localStorage.getItem("showSnackbar");
    const snackbarMsg = localStorage.getItem("snackbarMessage");

    if (shouldShowSnackbar === "true") {
      Swal.fire({
        icon: 'success',
        title: snackbarMsg || 'Success!',
        showConfirmButton: false,
        timer: 1500
      });
      localStorage.removeItem("showSnackbar");
      localStorage.removeItem("snackbarMessage");
    }
  }, []);

  useEffect(() => {
    // Calculate dashboard metrics
    const uniqueSuppliers = new Set(purchaseOrders.map(po => po.supplier.company_name));
    setTotalSuppliers(uniqueSuppliers.size);
    setTotalGeneratedPOs(purchaseOrders.length);
  }, [purchaseOrders]);

  // Filter POs based on status and supplier
  useEffect(() => {
    let filtered = [...purchaseOrders];
    
    if (showBysetCatBy) {
      filtered = filtered.filter(po => po.order_status === showBysetCatBy);
    }
    
    if (selectedSupplier) {
      filtered = filtered.filter(po => 
        po.supplier.company_name.toLowerCase().includes(selectedSupplier.toLowerCase())
      );
    }
    
    setFilteredPOs(filtered);
  }, [purchaseOrders, showBysetCatBy, selectedSupplier]);

  // Update displayed POs based on pagination
  useEffect(() => {
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedPOs(filteredPOs.slice(startIndex, endIndex));
  }, [filteredPOs, page, showBy]);

  const getAllPurchaseOrders = async () => {
    try {
      const res = await purchaseOrderService.getAllPO();
            if (res.status === 200 && Array.isArray(res.data)) {
        setPurchaseOrders(res.data);
        setFilteredPOs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
    }
  };

  const getArchivedPOsCount = async () => {
    try {
      const res = await purchaseOrderService.getAllArchivedPO();
      if (res.status === 200 && Array.isArray(res.data)) {
        setTotalArchivedPOs(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch archived POs count:", error);
    }
  };

  const handleEdit = (purchaseOrder) => {
    navigate("/edit-generated-purchase-order", {
      state: { selectedPurchaseOrder: purchaseOrder },
    });
  };

  const handleArchive = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Archive Purchase Order',
        text: 'Are you sure you want to archive this purchase order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!'
      });

      if (result.isConfirmed) {
        await purchaseOrderService.archive(id);
        Swal.fire({
          icon: 'success',
          title: 'Purchase Order archived successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Archive failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Archive Failed',
        text: 'Something went wrong!'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Purchase Order',
        text: 'Are you sure you want to delete this purchase order? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await purchaseOrderService.delete(id);
        Swal.fire({
          icon: 'success',
          title: 'Purchase Order deleted successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Something went wrong!'
      });
    }
  };

  const validateStockLevels = (items) => {
    for (const item of items) {
      const currentStock = item.product_Current_Stock;
      const minStock = item.product_Minimum_Stock_Level;
      const orderQty = item.quantity;
      
      if (currentStock + orderQty < minStock) {
        return false;
      }
    }
    return true;
  };

  const handleCreateGRN = async (po) => {
    try {
            // Validate stock levels before creating GRN
      if (!validateStockLevels(po.items)) {
        Swal.fire({
          icon: 'error',
          title: 'Cannot create GRN',
          text: "Some items' quantities plus current stock are below minimum stock levels"
        });
        return;
      }

            const grnData = {
        user: {
          first_name: po.user.first_name,
          last_name: po.user.last_name
        },
        supplier: {
          person_name: po.supplier.person_name,
          person_number: po.supplier.person_number,
          person_email: po.supplier.person_email,
          company_name: po.supplier.company_name,
          company_email: po.supplier.company_email,
          company_country: po.supplier.company_country,
          company_province: po.supplier.company_province,
          company_city: po.supplier.company_city,
          company_zipCode: po.supplier.company_zipCode,
        },
        po: {
          po_id: po._id,
          order_date: po.order_date
        },
        mop: "Cash",
        order_status: "Draft",
        items: po.items.map((item) => ({
          product_Id: item.product_Id,
          product_Name: item.product_Name,
          product_Description: item.product_Description, 
          product_Category: item.product_Category, 
          product_Current_Stock: item.product_Current_Stock, 
          product_Maximum_Stock_Level: item.product_Maximum_Stock_Level,
          product_Minimum_Stock_Level: item.product_Minimum_Stock_Level,
          product_Price: item.product_Price,
          order_quantity: item.quantity,
          received_quantity: 0,
          return_quantity: 0,
        })),
      };

      await grnService.create(grnData);
      navigate("/grn");
      
    } catch (error) {
      console.error("Error creating GRN:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to generate GRN',
        text: 'Something went wrong!'
      });
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedPO(null);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Generated Purchase Order</h5>
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
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBy}
                  onChange={(e) => setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
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
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>SEARCH SUPPLIER</h4>
              <FormControl size="small" className="w-100">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search supplier..."
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                />
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
                {displayedPOs.length > 0 ? (
                  displayedPOs.map((po, index) => (
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
                          gap: '0.5rem',
                          whiteSpace: 'nowrap'
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
                          {po.order_status === "Draft" ? (
                            <>
                              <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleDelete(po._id)}
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
                                onClick={() => handleEdit(po)}
                                sx={{ 
                                  minWidth: 'auto', 
                                  px: 2
                                }}
                              >
                                EDIT
                              </Button>
                            </>
                          ) : po.order_status === "Approved" ? (
                            <Button 
                              variant="contained" 
                              color="primary"
                              onClick={() => handleCreateGRN(po)}
                              sx={{ 
                                minWidth: 'auto', 
                                px: 2
                              }}
                            >
                              GENERATE GRN
                            </Button>
                          ) : po.order_status === "Complete" ? (
                            <Button 
                              variant="contained" 
                              color="secondary"
                              onClick={() => handleArchive(po._id)}
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
                      No purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedPOs.length}</b> of{" "}
                <b>{filteredPOs.length}</b> results
              </p>
              <Pagination
                count={Math.ceil(filteredPOs.length / showBy)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </div>
          </div>
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

export default GeneratedPO;
