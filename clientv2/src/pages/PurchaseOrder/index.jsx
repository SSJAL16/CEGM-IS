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
import GeneratePO from "../../components/Modals/GeneratePO";
import CustomizedSnackbars from "../../components/SnackBar";

import purchaseOrderService from "../../services/purchaseOrderService";

import { generateCustomSupplierId } from "../../customize/customizeId";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [displayedSuppliers, setDisplayedSuppliers] = useState([]);
  const [lowStockSuppliers, setLowStockSuppliers] = useState([]);
  const [selectedSupplierProducts, setSelectedSupplierProducts] = useState([]);
  
  // Add state variables for metrics
  const [totalGeneratedPOs, setTotalGeneratedPOs] = useState(0);
  const [totalArchivedPOs, setTotalArchivedPOs] = useState(0);

  const handleOpen = (supplierProducts) => {
    setSelectedSupplierProducts(supplierProducts);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLowStockData();
    getGeneratedPOsCount();
    getArchivedPOsCount();
  }, []);

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

  useEffect(() => {
    if (location.state?.showSnackbar) {
      setOpenSnackbar(true);
      setSnackbarMessage(location.state.snackbarMessage || "Success");
    }
  }, [location.state]);

  // Filter suppliers based on category and supplier name
  useEffect(() => {
    let filtered = [...lowStockSuppliers];
    
    if (showBysetCatBy) {
      filtered = filtered.filter(supplier => supplier.status === showBysetCatBy);
    }
    
    if (selectedSupplier) {
      filtered = filtered.filter(supplier => 
        supplier.supplierInfo?.company_name?.toLowerCase().includes(selectedSupplier.toLowerCase())
      );
    }
    
    setFilteredSuppliers(filtered);
  }, [lowStockSuppliers, showBysetCatBy, selectedSupplier]);

  // Update displayed suppliers based on pagination
  useEffect(() => {
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedSuppliers(filteredSuppliers.slice(startIndex, endIndex));
  }, [filteredSuppliers, page, showBy]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchLowStockData = async () => {
    try {
      const res = await purchaseOrderService.getAll();
      setLowStockSuppliers(res.data);
    } catch (error) {
      console.error("Failed to fetch low stock data:", error);
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Purchase Order</h5>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                title={"Number of Suppliers"}
                value={lowStockSuppliers.length}
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
                  labelId="demo-select-small-label"
                  className="w-100"
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
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
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
                  <th>SUPPLIER ID</th>
                  <th style={{ width: "300px" }}>NAME</th>
                  <th>CONTACT</th>
                  <th>ADDRESS</th>
                  <th>LOW STOCK ITEMS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {displayedSuppliers.map((supplier, index) => (
                  <tr key={supplier._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span>{generateCustomSupplierId(supplier.supplierInfo?._id)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center productBox">
                        <div className="imgWrapper">
                          <Avatar sx={{ bgcolor: deepPurple[500] }}>
                            {supplier.supplierInfo?.company_name?.charAt(0)}
                          </Avatar>
                        </div>
                        <div className="info pl-3">
                          <h6>{supplier.supplierInfo?.company_name}</h6>
                          <p>{supplier.supplierInfo?.company_email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center productBox">
                        <div className="imgWrapper">
                          <Avatar sx={{ bgcolor: deepPurple[500] }}>
                            {supplier.supplierInfo?.person_name?.charAt(0)}
                          </Avatar>
                        </div>
                        <div className="info pl-3">
                          <h6>{supplier.supplierInfo?.person_name}</h6>
                          <p>{supplier.supplierInfo?.person_number}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {supplier.supplierInfo?.company_city}, {supplier.supplierInfo?.company_province},{" "}
                      {supplier.supplierInfo?.company_country}
                    </td>
                    <td>{supplier.lowStockProducts.length}</td>
                    <td>
                      <Button
                        onClick={() => handleOpen(supplier)}
                        variant="contained"
                      >
                        GENERATE
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <p>
                showing <b>{displayedSuppliers.length}</b> of{" "}
                <b>{filteredSuppliers.length}</b> results
              </p>
              <Pagination
                count={Math.ceil(filteredSuppliers.length / showBy)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </div>
          </div>
        </div>
      </div>

      <GeneratePO
        open={open}
        handleClose={handleClose}
        selectedSupplierProducts={selectedSupplierProducts}
      />
      <CustomizedSnackbars
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity="success"
      />
    </>
  );
};

export default PurchaseOrder;
