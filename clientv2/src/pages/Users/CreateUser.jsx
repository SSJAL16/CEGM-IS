import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Swal from "sweetalert2";
import userService from "../../services/userService";
import { MyContext } from "../../App";
import { Country, State, City } from "country-state-city";

// Styled Breadcrumb component
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: theme.palette.grey[200],
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.grey[300],
  },
}));

const DEFAULT_PASSWORD = "@Cokins2025";

const CreateUser = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    country: "",
    region: "",
    city: "",
    address: "",
    zip_code: "",
    emergency_contact_full_name: "",
    emergency_contact_number: "",
    role: "Employee",
    isApproved: true,
    sendInvite: true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Load countries, states, and cities
  useEffect(() => {
    // Load countries on component mount
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);

    // Set Philippines as default
    const philippines = allCountries.find(
      (country) => country.name === "Philippines"
    );
    if (philippines) {
      setFormData((prev) => ({
        ...prev,
        country: philippines.isoCode,
      }));
    }
  }, []);

  useEffect(() => {
    // Load states when country changes
    if (formData.country) {
      setIsLoadingStates(true);
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      setFormData((prev) => ({
        ...prev,
        region: "",
        city: "",
      }));
      setIsLoadingStates(false);
    }
  }, [formData.country]);

  useEffect(() => {
    // Load cities when state changes
    if (formData.country && formData.region) {
      setIsLoadingCities(true);
      const stateCities = City.getCitiesOfState(
        formData.country,
        formData.region
      );
      setCities(stateCities);
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
      setIsLoadingCities(false);
    }
  }, [formData.country, formData.region]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) {
          error = `${name.replace("_", " ")} is required`;
        } else if (value.length < 2) {
          error = `${name.replace("_", " ")} must be at least 2 characters`;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = "Email is required";
        } else if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "phone_number":
      case "emergency_contact_number":
        const phoneRegex = /^\+639\d{9}$/;
        if (!value.trim()) {
          error = `${name.replace("_", " ")} is required`;
        } else if (!phoneRegex.test(value)) {
          error = "Phone number must start with +639 followed by 9 digits";
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;

      case "zip_code":
        const zipRegex = /^\d{4}$/;
        if (!value.trim()) {
          error = "ZIP code is required";
        } else if (!zipRegex.test(value)) {
          error = "ZIP code must be 4 digits";
        }
        break;

      case "emergency_contact_full_name":
        if (!value.trim()) {
          error = "Emergency contact name is required";
        } else if (value.length < 2) {
          error = "Emergency contact name must be at least 2 characters";
        }
        break;

      case "country":
        if (!value.trim()) {
          error = "Country is required";
        }
        break;

      case "region":
        if (!value.trim()) {
          error = "Region/State is required";
        }
        break;

      case "city":
        if (!value.trim()) {
          error = "City is required";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === "checkbox" ? checked : value;

    // For phone number, ensure it starts with +639
    let finalValue = newValue;
    if (name === "phone_number" && newValue && !newValue.startsWith("+639")) {
      if (newValue.startsWith("09")) {
        finalValue = "+63" + newValue.substring(1);
      } else if (newValue.startsWith("9")) {
        finalValue = "+639" + newValue.substring(1);
      } else if (!newValue.startsWith("+")) {
        finalValue = "+639" + newValue;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    // List of required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "address",
      "zip_code",
      "emergency_contact_full_name",
      "emergency_contact_number",
    ];

    // Check only required fields
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
        isValid = false;
      } else {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
      newTouched[field] = true;
    }

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isApproved: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const emptyFields = Object.keys(errors)
        .filter((key) => errors[key])
        .map((key) => key.replace(/_/g, " "))
        .join(", ");

      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: `Please check the following fields: ${emptyFields}`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...formData,
        password: DEFAULT_PASSWORD,
      };

      await userService.create(dataToSend);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        html: `
          <p>User has been created successfully!</p>
          ${
            formData.sendInvite
              ? "<p>An invitation email has been sent to the user.</p>"
              : ""
          }
          <p>Default password: <strong>${DEFAULT_PASSWORD}</strong></p>
        `,
        confirmButtonColor: "#3085d6",
      });

      navigate("/users");
    } catch (error) {
      let errorMessage = "Failed to create user";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "A user with this email already exists";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid input data. Please check your entries";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Create New User</h5>
        <div className="ml-auto d-flex align-items-center">
          <Breadcrumbs aria-label="breadcrumb" className="breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="/dashboard"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb component="a" href="/users" label="Users" />
            <StyledBreadcrumb
              label="Create User"
              icon={<PersonAddIcon fontSize="small" />}
            />
          </Breadcrumbs>
        </div>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <div className="row cardFilters mt-3">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.first_name && !!errors.first_name}
                      helperText={touched.first_name && errors.first_name}
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.last_name && !!errors.last_name}
                      helperText={touched.last_name && errors.last_name}
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Phone Number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.phone_number && !!errors.phone_number}
                      helperText={
                        (touched.phone_number && errors.phone_number) ||
                        "Format: +639XXXXXXXXX"
                      }
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-4 mb-3">
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.country && !!errors.country}
                      label="Country"
                      required
                    >
                      <MenuItem value="" disabled>
                        Select a country
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.country && errors.country && (
                      <Typography color="error" variant="caption">
                        {errors.country}
                      </Typography>
                    )}
                  </FormControl>
                </div>
                <div className="col-md-4 mb-3">
                  <FormControl fullWidth>
                    <InputLabel>Region/State</InputLabel>
                    <Select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.region && !!errors.region}
                      label="Region/State"
                      required
                      disabled={!formData.country || isLoadingStates}
                    >
                      <MenuItem value="" disabled>
                        {isLoadingStates
                          ? "Loading states..."
                          : "Select a region/state"}
                      </MenuItem>
                      {states.map((state) => (
                        <MenuItem key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.region && errors.region && (
                      <Typography color="error" variant="caption">
                        {errors.region}
                      </Typography>
                    )}
                  </FormControl>
                </div>
                <div className="col-md-4 mb-3">
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <Select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.city && !!errors.city}
                      label="City"
                      required
                      disabled={!formData.region || isLoadingCities}
                    >
                      <MenuItem value="" disabled>
                        {isLoadingCities
                          ? "Loading cities..."
                          : "Select a city"}
                      </MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.name} value={city.name}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.city && errors.city && (
                      <Typography color="error" variant="caption">
                        {errors.city}
                      </Typography>
                    )}
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.address && !!errors.address}
                      helperText={touched.address && errors.address}
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="ZIP Code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={touched.zip_code && !!errors.zip_code}
                      helperText={touched.zip_code && errors.zip_code}
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Emergency Contact Name"
                      name="emergency_contact_full_name"
                      value={formData.emergency_contact_full_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={
                        touched.emergency_contact_full_name &&
                        !!errors.emergency_contact_full_name
                      }
                      helperText={
                        touched.emergency_contact_full_name &&
                        errors.emergency_contact_full_name
                      }
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <FormControl fullWidth>
                    <TextField
                      label="Emergency Contact Number"
                      name="emergency_contact_number"
                      value={formData.emergency_contact_number}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      error={
                        touched.emergency_contact_number &&
                        !!errors.emergency_contact_number
                      }
                      helperText={
                        (touched.emergency_contact_number &&
                          errors.emergency_contact_number) ||
                        "Format: +639XXXXXXXXX"
                      }
                      required
                    />
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isApproved}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label="Auto-approve User"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.sendInvite}
                          onChange={handleInputChange}
                          name="sendInvite"
                          color="primary"
                        />
                      }
                      label="Send Email Invitation"
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="mb-3"
                  >
                    Note: A default password (@Cokins2025) will be set for the
                    new user.
                  </Typography>
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/users")}
                      className="mr-2"
                      size="large"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting}
                      sx={{ minWidth: 120, height: 45 }}
                    >
                      {isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
