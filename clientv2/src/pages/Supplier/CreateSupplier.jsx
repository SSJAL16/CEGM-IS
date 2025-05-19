import {
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
} from "@mui/material";

import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Country, State, City } from "country-state-city";
import CustomizedSnackbars from "../../components/SnackBar";

import { validateName } from "../../validation/nameValidation";
import { validatePersonNumber } from "../../validation/phoneNumberValidation";
import { validateEmail } from "../../validation/emailValidation";
import { validateZipCode } from "../../validation/zipCodeValidation";
import { validateSupplierName } from "../../validation/supplierName";
import { validateInput } from "../../validation/requiredInputValidation";

import supplierService from "../../services/supplierService";

const CreateSupplier = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [person, setPerson] = useState({
    name: "",
    number: "",
    email: ""
  });
  
  const [company, setCompany] = useState({
    name: "",
    email: "",
  });
  
  const [location, setLocation] = useState({
    country: "",
    countryCode: "",
    state: "",
    stateCode: "",
    city: "",
    zipCode: ""
  });
  
  const [errors, setErrors] = useState({
    personName: "",
    personNumber: "",
    personEmail: "",
    companyName: "",
    companyEmail: "",
    country: "",
    state: "",
    city: "",
    zipCode: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {
      personName: validateName(person.name) || "",
      personNumber: validatePersonNumber(person.number) || "",
      personEmail: validateEmail(person.email) || "",
      companyName: validateSupplierName(company.name) || "",
      companyEmail: validateEmail(company.email) || "",
      country: validateInput(location.country, "Country") || "",
      state: validateInput(location.state, "State") || "",
      city: validateInput(location.city, "City") || "",
      zipCode: validateZipCode(company.zipCode) || ""
    };
  
    setErrors(newErrors);
  
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    if (hasErrors) {
      setSnackbarMessage("Please fix the validation errors");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
  
    const formData = {
      person_name: person.name,
      person_number: person.number,
      person_email: person.email,
      company_name: company.name,
      company_email: company.email,
      company_country: location.country,
      company_province: location.state,
      company_city: location.city,
      company_zipCode: company.zipCode,
    };
  
    try {
      await supplierService.create(formData);
      setSnackbarMessage("New supplier added successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
      setPerson({ name: "", number: "", email: "" });
      setCompany({ name: "", email: "", zipCode: "" });
      setLocation({ country: "", state: "", city: "" });
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to add supplier");
      setSnackbarSeverity("error"); 
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <CustomizedSnackbars
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 res-col">
          <h5 className="mb-0">Create Supplier</h5>
        </div>

        <form className="form" onSubmit={handleSubmit}>
  <div className="row">
    <div className="col-md-12">
      <div className="card p-4 mt-0">
        <h5 className="mb-4">Contact Person Details</h5>

        <div className="row">
          <div className="col">
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={person.name}
              onChange={(e) => {
                setPerson(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, personName: validateName(e.target.value) }));
              }}
              error={!!errors.personName}
              helperText={errors.personName}
            />
          </div>

          <div className="col">
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={person.number}
              onChange={(e) => {
                setPerson(prev => ({ ...prev, number: e.target.value }));
                setErrors(prev => ({ ...prev, personNumber: validatePersonNumber(e.target.value) }));
              }}
              error={!!errors.personNumber}
              helperText={errors.personNumber}
            />
          </div>

          <div className="col">
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={person.email}
              onChange={(e) => {
                setPerson(prev => ({ ...prev, email: e.target.value }));
                setErrors(prev => ({ ...prev, personEmail: validateEmail(e.target.value) }));
              }}
              error={!!errors.personEmail}
              helperText={errors.personEmail}
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Company Details */}
  <div className="row">
    <div className="col-md-12">
      <div className="card p-4 mt-0">
        <h5 className="mb-4">Company Details</h5>

        <div className="row mb-3">
          <div className="col">
            <TextField
              fullWidth
              label="Company Name"
              variant="outlined"
              value={company.name}
              onChange={(e) => {
                setCompany(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, companyName: validateSupplierName(e.target.value) }));
              }}
              error={!!errors.companyName}
              helperText={errors.companyName}
            />
          </div>

          <div className="col">
            <TextField
              fullWidth
              label="Company Email"
              variant="outlined"
              value={company.email}
              onChange={(e) => {
                setCompany(prev => ({ ...prev, email: e.target.value }));
                setErrors(prev => ({ ...prev, companyEmail: validateEmail(e.target.value) }));
              }}
              error={!!errors.companyEmail}
              helperText={errors.companyEmail}
            />
          </div>
        </div>

        {/* Location Inputs */}
        <div className="row mb-3">
          <div className="col">
            <Autocomplete
              options={Country.getAllCountries()}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => {
                setLocation(prev => ({
                  ...prev,
                  country: value?.name || "",
                  countryCode: value?.isoCode || "",
                  state: "",
                  stateCode: "",
                  city: ""
                }));
                setErrors(prev => ({ ...prev, country: validateInput(value?.name || "", "Country") }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  variant="outlined"
                  fullWidth
                  error={!!errors.country}
                  helperText={errors.country}
                />
              )}
            />
          </div>

          <div className="col">
            <Autocomplete
              options={
                location.countryCode
                  ? State.getStatesOfCountry(location.countryCode)
                  : []
              }
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => {
                setLocation(prev => ({
                  ...prev,
                  state: value?.name || "",
                  stateCode: value?.isoCode || "",
                  city: ""
                }));
                setErrors(prev => ({ ...prev, state: validateInput(value?.name || "", "State") }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State/Province"
                  variant="outlined"
                  fullWidth
                  error={!!errors.state}
                  helperText={errors.state}
                />
              )}
              disabled={!location.countryCode}
            />
          </div>

          <div className="col">
            <Autocomplete
              options={
                location.stateCode
                  ? City.getCitiesOfState(
                      location.countryCode,
                      location.stateCode
                    )
                  : []
              }
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => {
                setLocation(prev => ({
                  ...prev,
                  city: value?.name || ""
                }));
                setErrors(prev => ({ ...prev, city: validateInput(value?.name || "", "City") }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  variant="outlined"
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city}
                />
              )}
              disabled={!location.stateCode}
            />
          </div>

          <div className="col">
            <TextField
              fullWidth
              label="Zip Code"
              variant="outlined"
              value={company.zipCode}
              onChange={(e) => {
                setCompany(prev => ({ ...prev, zipCode: e.target.value }));
                setErrors(prev => ({ ...prev, zipCode: validateZipCode(e.target.value) }));
              }}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="btn-blue btn-lg btn-big w-100"
          variant="contained"
          color="primary"
          disabled={Object.values(errors).some(error => error !== "")}
        >
          <FaCloudUploadAlt /> &nbsp; {"Add Supplier"}
        </Button>
      </div>
    </div>
  </div>
</form>
      </div>
    </>
  );
};

export default CreateSupplier;
