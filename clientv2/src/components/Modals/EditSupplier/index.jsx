import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Country, State, City } from "country-state-city";

import { validateName } from "../../../validation/nameValidation";
import { validatePersonNumber } from "../../../validation/phoneNumberValidation";
import { validateEmail } from "../../../validation/emailValidation";
import { validateInput } from "../../../validation/requiredInputValidation";
import { validateZipCode } from "../../../validation/zipCodeValidation";
import { validateSupplierName } from "../../../validation/supplierName";

const EditSupplierModal = ({ open, onClose, supplier, onUpdate }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_city: "",
    company_province: "",
    company_country: "",
    person_name: "",
    person_email: "",
    person_number: "",
    company_zipCode: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        company_name: supplier.company_name,
        company_email: supplier.company_email,
        company_city: supplier.company_city,
        company_province: supplier.company_province,
        company_country: supplier.company_country,
        person_name: supplier.person_name,
        person_email: supplier.person_email,
        person_number: supplier.person_number,
        company_zipCode: supplier.company_zipCode,
      });
      setErrors({});
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({
      ...errors,
      [name]:
        name === "company_name"
          ? validateSupplierName(value)
          : name === "company_email" || name === "person_email"
          ? validateEmail(value)
          : name === "person_name"
          ? validateName(value)
          : name === "person_number"
          ? validatePersonNumber(value)
          : name === "company_zipCode"
          ? validateZipCode(value)
          : validateInput(value, name),
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Edit Supplier
        </Typography>

        <FormControl fullWidth sx={{ marginBottom: "16px" }}>
          <TextField
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            error={!!errors.company_name}
            helperText={errors.company_name}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginBottom: "16px" }}>
          <TextField
            label="Company Email"
            name="company_email"
            value={formData.company_email}
            onChange={handleChange}
            error={!!errors.company_email}
            helperText={errors.company_email}
          />
        </FormControl>

        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <FormControl fullWidth>
            <Typography variant="subtitle1">Country</Typography>
            <Select
              name="company_country"
              value={formData.company_country}
              onChange={handleChange}
            >
              {Country.getAllCountries().map((country) => (
                <MenuItem key={country.isoCode} value={country.name}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {errors.company_country}
            </Typography>
          </FormControl>

          <FormControl fullWidth disabled={!formData.company_country}>
            <Typography variant="subtitle1">Province/State</Typography>
            <Select
              name="company_province"
              value={formData.company_province}
              onChange={handleChange}
            >
              {State.getStatesOfCountry(
                Country.getAllCountries().find((c) => c.name === formData.company_country)?.isoCode || ""
              ).map((state) => (
                <MenuItem key={state.isoCode} value={state.name}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {errors.company_province}
            </Typography>
          </FormControl>
          
          <FormControl fullWidth disabled={!formData.company_province}>
            <Typography variant="subtitle1">City</Typography>
            <Select
              name="company_city"
              value={formData.company_city}
              onChange={handleChange}
            >
              {City.getCitiesOfState(
                Country.getAllCountries().find((c) => c.name === formData.company_country)?.isoCode || "",
                State.getStatesOfCountry(
                  Country.getAllCountries().find((c) => c.name === formData.company_country)?.isoCode || ""
                ).find((s) => s.name === formData.company_province)?.isoCode || ""
              ).map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error">
              {errors.company_city}
            </Typography>
          </FormControl>
        </div>


        <FormControl fullWidth sx={{ marginBottom: "16px" }}>
          <TextField
            label="Zip Code"
            name="company_zipCode"
            value={formData.company_zipCode}
            onChange={handleChange}
            error={!!errors.company_zipCode}
            helperText={errors.company_zipCode}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginBottom: "16px" }}>
          <TextField
            label="Person Name"
            name="person_name"
            value={formData.person_name}
            onChange={handleChange}
            error={!!errors.person_name}
            helperText={errors.person_name}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginBottom: "16px" }}>
          <TextField
            label="Person Email"
            name="person_email"
            value={formData.person_email}
            onChange={handleChange}
            error={!!errors.person_email}
            helperText={errors.person_email}
          />
        </FormControl>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={Object.values(errors).some((err) => err)}
            onClick={() => onUpdate(formData)} 
          >
            Update
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "32px",
  borderRadius: "8px",
  boxShadow: 24,
};

export default EditSupplierModal;