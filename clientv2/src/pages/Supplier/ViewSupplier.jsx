import { FaUserCircle } from "react-icons/fa";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { Link } from "react-router-dom";

import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VerifiedIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DashboardBox from "../Dashboard/components/dashboardBox";

import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import userService from "../../services/userService";
import UserAvatarLetter from "../../components/userAvatarLetter";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

import supplierService from "../../services/supplierService";
import { generateCustomSupplierId } from "../../customize/customizeId";

import EditSupplierModal from "../../components/Modals/EditSupplier";
import ConfirmationModal from "../../components/Modals/DeleteSupplier";
import CustomizedSnackbars from "../../components/SnackBar";
import TextField from "@mui/material/TextField";

const ViewSupplier = () => {
  const [showBy, setShowBy] = useState(10);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [displayedSuppliers, setDisplayedSuppliers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    // Filter suppliers based on search term and country
    let filtered = [...suppliers];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.company_name.toLowerCase().includes(search) ||
        supplier.person_name.toLowerCase().includes(search) ||
        supplier.company_email.toLowerCase().includes(search) ||
        supplier.person_email.toLowerCase().includes(search)
      );
    }

    if (filterCountry) {
      filtered = filtered.filter(supplier => 
        supplier.company_country === filterCountry
      );
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, filterCountry]);

  useEffect(() => {
    // Calculate pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    setDisplayedSuppliers(filteredSuppliers.slice(startIndex, endIndex));
  }, [filteredSuppliers, page, showBy]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data.suppliers);
      setFilteredSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleUpdateSupplier = async (updatedData) => {
    if (selectedSupplier) {
      try {
        await supplierService.update(selectedSupplier._id, updatedData);
        setIsEditModalOpen(false);
        fetchSuppliers();
      } catch (error) {
        console.error("Failed to update supplier:", error.response?.data || error);
      }
    }
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSupplier) {
      try {
        await supplierService.delete(selectedSupplier._id);
        setIsDeleteModalOpen(false);
        setOpenSnackbar(true);
        setSuppliers(suppliers.filter(s => s._id !== selectedSupplier._id));
        setSelectedSupplier(null);
      } catch (error) {
        console.error("Failed to delete supplier:", error);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Supplier List</h5>
          
        </div>


        <div className="card shadow border-0 p-3 mt-4">
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBy}
                  onChange={(e) => {
                    setShowBy(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
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
              <h4>FILTER BY COUNTRY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={filterCountry}
                  onChange={(e) => {
                    setFilterCountry(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {[...new Set(suppliers.map(s => s.company_country))].map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>SEARCH</h4>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by company name, contact person, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>SUPPLIER ID</th>
                  <th style={{ width: "300px" }}>NAME</th>
                  <th>ADDRESS</th>
                  <th>CONTACT PERSON</th>
                  <th style={{ width: "150px" }}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {displayedSuppliers.length > 0 ? (
                  displayedSuppliers.map((supplier) => (
                    <tr key={supplier._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span>{generateCustomSupplierId(supplier._id)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <UserAvatarLetter
                              first_name={supplier.company_name}
                            />
                          </div>
                          <div className="info pl-3">
                            <h6>{supplier.company_name}</h6>
                            <p>{supplier.company_email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{supplier.company_city}, {supplier.company_province}, {supplier.company_country}</td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <UserAvatarLetter
                              first_name={supplier.person_name}
                            />
                          </div>
                          <div className="info pl-3">
                            <h6>{supplier.person_name}</h6>
                            <p>{supplier.person_number}</p>
                            <p>{supplier.person_email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '0.5rem',
                          justifyContent: 'center'
                        }}>
                          <Button 
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditClick(supplier)}
                            sx={{ minWidth: 'auto', px: 2, py: 1 }}
                          >
                            <FaPencilAlt />
                          </Button>
                          <Button 
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteClick(supplier)}
                            sx={{ minWidth: 'auto', px: 2, py: 1 }}
                          >
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <p>
                showing <b>{displayedSuppliers.length}</b> of <b>{filteredSuppliers.length}</b> results
              </p>
              <Pagination
                count={Math.ceil(filteredSuppliers.length / showBy)}
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

      <EditSupplierModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={selectedSupplier}
        onUpdate={handleUpdateSupplier}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
      />

      <CustomizedSnackbars
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        message="Supplier deleted successfully!"
      />
    </>
  );
};

export default ViewSupplier;
