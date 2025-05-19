import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./SignUp.module.css";
import { useUserStore } from "../../store/userStore";
import cokinsLogo from "../../assets/images/cokins_logo.png";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
import { MyContext } from "../../App";
import { TextField, Button, Typography, MenuItem } from "@mui/material";
import StepIcon from "@mui/material/StepIcon";
import { styled } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ErrorStepIcon = styled(StepIcon)(({ theme }) => ({
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
}));

const steps = [
  {
    label: "Personal Info",
  },
  {
    label: "Emergency",
  },
  {
    label: "Password",
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState([0]);
  const [touched, setTouched] = useState({
    first_name: false,
    last_name: false,
    email: false,
    phone_number: false,
    country: false,
    region: false,
    city: false,
    address: false,
    zip_code: false,
    emergency_contact_full_name: false,
    emergency_contact_number: false,
    password: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    country: "Philippines",
    region: "NCR",
    city: "Manila",
    address: "",
    zip_code: "",
    emergency_contact_full_name: "",
    emergency_contact_number: "",
    password: "",
    confirmPassword: "",
  });

  const { addUser, isLoading, errorAddUser } = useUserStore();

  const phoneRegex = /^\+639\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const zipCodeRegex = /^\d{4}$/;

  const passwordRequirements = [
    {
      id: "length",
      label: "At least 8 characters",
      validator: (password) => password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter",
      validator: (password) => /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter",
      validator: (password) => /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number",
      validator: (password) => /\d/.test(password),
    },
    {
      id: "special",
      label: "At least one special character",
      validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const getPasswordStrength = (password) => {
    if (!password) return [];
    return passwordRequirements.map((req) => ({
      ...req,
      isValid: req.validator(password),
    }));
  };

  const getPasswordStrengthScore = (password) => {
    if (!password) return 0;
    const requirements = getPasswordStrength(password);
    const validCount = requirements.filter((req) => req.isValid).length;
    return (validCount / requirements.length) * 100;
  };

  const getPasswordStrengthColor = (score) => {
    if (score < 40) return "error";
    if (score < 70) return "warning";
    return "success";
  };

  const getPasswordStrengthLabel = (score) => {
    if (score < 40) return "Weak";
    if (score < 70) return "Fair";
    return "Strong";
  };

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Load countries on component mount
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);

    // Initialize Philippines data
    const philippines = allCountries.find(
      (country) => country.name === "Philippines"
    );
    if (philippines) {
      // Set initial states for Philippines
      const philippineStates = State.getStatesOfCountry(philippines.isoCode);
      setStates(philippineStates);

      // Find NCR in states
      const ncr = philippineStates.find(
        (state) => state.name === "Metro Manila" || state.name === "NCR"
      );
      if (ncr) {
        // Set initial cities for NCR
        const ncrCities = City.getCitiesOfState(
          philippines.isoCode,
          ncr.isoCode
        );
        setCities(ncrCities);

        // Update form data with correct codes
        setFormData((prev) => ({
          ...prev,
          country: philippines.isoCode,
          region: ncr.isoCode,
          city: "Manila", // Keeping Manila as default city
        }));
      }
    }
  }, []);

  useEffect(() => {
    // Load states when country changes
    if (formData.country) {
      setIsLoadingStates(true);
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      // Reset region and city when country changes
      if (formData.country !== "PH") {
        // Only reset if not Philippines
        setFormData((prev) => ({
          ...prev,
          region: "",
          city: "",
        }));
      }
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
      // Reset city when region changes
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
      setIsLoadingCities(false);
    }
  }, [formData.country, formData.region]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // If empty, return empty
    if (!digits) return "";

    // If starts with +639, keep it
    if (digits.startsWith("639")) {
      return `+${digits.slice(0, 12)}`;
    }

    // If starts with 9, add +63
    if (digits.startsWith("9")) {
      return `+63${digits.slice(0, 10)}`;
    }

    // Otherwise, just add + and limit to 12 digits
    return `+${digits.slice(0, 12)}`;
  };

  const handlePhoneNumberChange = (field) => (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    handleFieldChange(field, formattedNumber);
  };

  const handleNext = async () => {
    // Mark all fields in current step as touched
    const currentStepFields = getCurrentStepFields();
    const newTouched = { ...touched };
    currentStepFields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Always add current step to visited steps when attempting to move forward
    setVisitedSteps((prev) => [...new Set([...prev, activeStep])]);

    // Validate all fields in current step
    const errors = currentStepFields
      .map((field) => ({
        field,
        error: getFieldError(field),
      }))
      .filter((item) => item.error !== "");

    if (errors.length > 0) {
      // Show error message for invalid fields
      let errorMessage = "";
      if (activeStep === 0) {
        const basicInfoErrors = errors.filter((error) =>
          ["first_name", "last_name", "email"].some(
            (field) => error.field === field
          )
        );
        const addressErrors = errors.filter((error) =>
          ["country", "region", "city", "address", "zip_code"].some(
            (field) => error.field === field
          )
        );

        if (basicInfoErrors.length > 0) {
          errorMessage +=
            "<strong>Basic Information:</strong><br>" +
            basicInfoErrors.map((item) => `• ${item.error}`).join("<br>");
        }
        if (addressErrors.length > 0) {
          if (basicInfoErrors.length > 0) errorMessage += "<br><br>";
          errorMessage +=
            "<strong>Address Information:</strong><br>" +
            addressErrors.map((item) => `• ${item.error}`).join("<br>");
        }
      } else if (activeStep === 1) {
        const phoneError = errors.find((e) => e.field === "phone_number");
        const emergencyNameError = errors.find(
          (e) => e.field === "emergency_contact_full_name"
        );
        const emergencyPhoneError = errors.find(
          (e) => e.field === "emergency_contact_number"
        );

        errorMessage = "<strong>Emergency Contact Information:</strong><br>";

        if (phoneError) {
          errorMessage += `• Your Phone Number: ${phoneError.error}<br>`;
        }
        if (emergencyNameError) {
          errorMessage += `• Emergency Contact Name: ${emergencyNameError.error}<br>`;
        }
        if (emergencyPhoneError) {
          errorMessage += `• Emergency Contact Number: ${emergencyPhoneError.error}`;
        }
      } else {
        errorMessage =
          "<strong>Password Information:</strong><br>" +
          errors.map((item) => `• ${item.error}`).join("<br>");
      }

      Swal.fire({
        title: "Validation Error",
        html: errorMessage,
        icon: "error",
        confirmButtonColor: "#0773dc",
      });
      return;
    }

    // If no errors, proceed to next step or signup
    if (activeStep === steps.length - 1) {
      await handleSignup();
    } else {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      // Add next step to visited steps when moving forward
      setVisitedSteps((prev) => [...new Set([...prev, nextStep])]);
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    // Add current step to visited steps when moving backward
    setVisitedSteps((prev) => [...new Set([...prev, activeStep])]);
  };

  const handleSignup = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Show confirmation dialog with user details
      const result = await Swal.fire({
        title: "Confirm Your Information",
        html: `
          <div style="text-align: left; margin-top: 1rem;">
            <p><strong>Name:</strong> ${formData.first_name} ${formData.last_name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone_number}</p>
            <p><strong>Country:</strong> ${formData.country}</p>
            <p><strong>Region:</strong> ${formData.region}</p>
            <p><strong>City:</strong> ${formData.city}</p>
            <p><strong>Address:</strong> ${formData.address}</p>
            <p><strong>ZIP Code:</strong> ${formData.zip_code}</p>
            <p><strong>Emergency Contact:</strong> ${formData.emergency_contact_full_name}</p>
            <p><strong>Emergency Number:</strong> ${formData.emergency_contact_number}</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Sign Up",
        cancelButtonText: "Review Information",
        confirmButtonColor: "#0773dc",
        cancelButtonColor: "#6c757d",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        try {
          const signupData = {
            ...formData,
            role: "Employee",
          };
          delete signupData.confirmPassword;

          await addUser(signupData);

          // Store email for verification page
          localStorage.setItem("verificationEmail", formData.email);

          Swal.fire({
            title: "Success!",
            text: "Account created successfully. Please verify your email.",
            icon: "success",
            confirmButtonColor: "#0773dc",
          }).then(() => {
            navigate("/verify-email");
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message || "Error signing up. Please try again.",
            icon: "error",
            confirmButtonColor: "#0773dc",
          });
        }
      }
    } catch (error) {
      console.error("Signup failed:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Error signing up. Please try again.",
        icon: "error",
        confirmButtonColor: "#0773dc",
      });
    }
  };

  const getCurrentStepFields = (step = activeStep) => {
    switch (step) {
      case 0:
        return [
          "first_name",
          "last_name",
          "email",
          "country",
          "region",
          "city",
          "address",
          "zip_code",
        ];
      case 1:
        return [
          "phone_number",
          "emergency_contact_full_name",
          "emergency_contact_number",
        ];
      case 2:
        return ["password", "confirmPassword"];
      default:
        return [];
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Validation logic for each step
  const validateStep = () => {
    const currentFields = getCurrentStepFields();
    const hasErrors = currentFields.some((field) => {
      if (!touched[field]) return false;

      switch (field) {
        case "email":
          return !emailRegex.test(formData[field]);
        case "phone_number":
        case "emergency_contact_number":
          return !phoneRegex.test(formData[field]);
        case "zip_code":
          return !zipCodeRegex.test(formData[field]);
        case "country":
        case "region":
        case "city":
          return !formData[field];
        case "password":
          return !passwordRequirements.every((req) =>
            req.validator(formData[field])
          );
        case "confirmPassword":
          return formData[field] !== formData.password;
        default:
          return !formData[field];
      }
    });

    return hasErrors;
  };

  const getFieldError = (field) => {
    if (!touched[field]) return "";

    switch (field) {
      case "email":
        return !emailRegex.test(formData[field])
          ? "Please enter a valid email address"
          : "";
      case "phone_number":
      case "emergency_contact_number":
        return !phoneRegex.test(formData[field])
          ? "Phone number must start with +639 and be 13 characters long"
          : "";
      case "zip_code":
        return !zipCodeRegex.test(formData[field])
          ? "ZIP code must be 4 digits"
          : "";
      case "country":
      case "region":
      case "city":
        return !formData[field]
          ? `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
          : "";
      case "password":
        if (!formData[field]) return "Password is required";
        const requirements = getPasswordStrength(formData[field]);
        const failedReqs = requirements.filter((req) => !req.isValid);
        if (failedReqs.length > 0) {
          return "Password does not meet all requirements";
        }
        return "";
      case "confirmPassword":
        return formData[field] !== formData.password
          ? "Passwords do not match"
          : "";
      default:
        return !formData[field] ? "This field is required" : "";
    }
  };

  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, [context]);

  const hasStepError = (stepIndex) => {
    // Always check for errors if the step has been visited
    if (!visitedSteps.includes(stepIndex)) {
      return false;
    }

    const fields = getCurrentStepFields(stepIndex);
    // Check if any field in this step has been touched and has an error
    const hasError = fields.some((field) => {
      const error = getFieldError(field);
      return touched[field] && error !== "";
    });

    return hasError;
  };

  const getStepState = (stepIndex) => {
    if (!visitedSteps.includes(stepIndex)) {
      return "default";
    }
    if (hasStepError(stepIndex)) {
      return "error";
    }
    if (stepIndex < activeStep) {
      return "completed";
    }
    return "default";
  };

  const handlePreventCopyPaste = (e) => {
    e.preventDefault();
    return false;
  };

  const isFormValid = () => {
    // Get all fields from all steps
    const allFields = [
      // Step 0 - Basic Info & Address
      "first_name",
      "last_name",
      "email",
      "country",
      "region",
      "city",
      "address",
      "zip_code",
      // Step 1 - Emergency Contact
      "phone_number",
      "emergency_contact_full_name",
      "emergency_contact_number",
      // Step 2 - Password
      "password",
      "confirmPassword",
    ];

    // Check if all fields have values
    const allFieldsFilled = allFields.every((field) => !!formData[field]);

    // Check if there are any validation errors
    const hasNoErrors = allFields.every((field) => {
      const error = getFieldError(field);
      return error === "";
    });

    // Check if passwords match
    const passwordsMatch = formData.password === formData.confirmPassword;

    // Check if password meets all requirements
    const passwordRequirementsMet = passwordRequirements.every((req) =>
      req.validator(formData.password)
    );

    // Check if phone numbers are valid
    const phoneNumbersValid =
      phoneRegex.test(formData.phone_number) &&
      phoneRegex.test(formData.emergency_contact_number);

    // Check if email is valid
    const emailValid = emailRegex.test(formData.email);

    // Check if zip code is valid
    const zipValid = zipCodeRegex.test(formData.zip_code);

    return (
      allFieldsFilled &&
      hasNoErrors &&
      passwordsMatch &&
      passwordRequirementsMet &&
      phoneNumbersValid &&
      emailValid &&
      zipValid
    );
  };

  return (
    <div
      className={`${styles["container"]} d-flex justify-content-center align-items-center min-vh-100 py-4`}
    >
      <div
        className={`row border ${styles["rounded-5"]} p-4 bg-white shadow ${styles["box-area"]}`}
        style={{ maxWidth: "1200px", width: "95%", height: "auto" }}
      >
        {/* Left box */}
        <div
          className={`${styles.cokinsBox} ${styles.left_box} col-md-4 rounded-4 d-flex justify-content-center align-items-center flex-column left-box p-4`}
          style={{ borderRadius: "20px" }}
        >
          <div className="featured-image mb-3">
            <img
              src={cokinsLogo}
              className="img-fluid"
              style={{ width: "180px" }}
              alt="featured"
            />
          </div>
          <h4 className="text-center text-white mb-2">Welcome to COKINS</h4>
          <p
            className="text-center text-white-50 mb-0 px-2"
            style={{ fontSize: "0.9rem" }}
          >
            Create your account to access our services
          </p>
        </div>

        {/* Right box */}
        <div
          className={`col-md-8 ${styles["right-box"]} px-4 d-flex flex-column`}
        >
          <div className="header-text mb-4">
            <h2 className="fw-bold text-center h4 mb-3">Sign Up</h2>
            <Box sx={{ width: "100%", mb: 3 }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize: "0.875rem",
                  },
                }}
              >
                {steps.map((step, index) => {
                  const stepState = getStepState(index);
                  return (
                    <Step key={step.label}>
                      <StepLabel
                        error={stepState === "error"}
                        StepIconComponent={ErrorStepIcon}
                        StepIconProps={{
                          error: stepState === "error",
                        }}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          </div>

          <div
            className="form-container flex-grow-1"
            style={{ height: "100%" }}
          >
            {/* Step content */}
            {activeStep === 0 && (
              <div className="row g-3">
                <div className="col-12">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Basic Information
                  </Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleFieldChange("first_name", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, first_name: true }))
                    }
                    error={!!getFieldError("first_name")}
                    helperText={getFieldError("first_name")}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleFieldChange("last_name", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, last_name: true }))
                    }
                    error={!!getFieldError("last_name")}
                    helperText={getFieldError("last_name")}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div className="col-12 mb-3">
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, email: true }))
                    }
                    error={!!getFieldError("email")}
                    helperText={getFieldError("email")}
                    variant="outlined"
                    size="small"
                  />
                </div>

                <div className="col-12">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Address Information
                  </Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    select
                    fullWidth
                    label="Country"
                    value={formData.country}
                    onChange={(e) =>
                      handleFieldChange("country", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, country: true }))
                    }
                    error={!!getFieldError("country")}
                    helperText={getFieldError("country")}
                    variant="outlined"
                    size="small"
                    defaultValue="PH"
                  >
                    <MenuItem value="" disabled>
                      Select a country
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    select
                    fullWidth
                    label="Region/State"
                    value={formData.region}
                    onChange={(e) =>
                      handleFieldChange("region", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, region: true }))
                    }
                    error={!!getFieldError("region")}
                    helperText={
                      getFieldError("region") ||
                      (!formData.country && "Please select a country first") ||
                      (isLoadingStates && "Loading states...")
                    }
                    variant="outlined"
                    size="small"
                    disabled={!formData.country || isLoadingStates}
                  >
                    <MenuItem value="" disabled>
                      Select a region/state
                    </MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    select
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, city: true }))
                    }
                    error={!!getFieldError("city")}
                    helperText={
                      getFieldError("city") ||
                      (!formData.region && "Please select a region first") ||
                      (isLoadingCities && "Loading cities...")
                    }
                    variant="outlined"
                    size="small"
                    disabled={!formData.region || isLoadingCities}
                  >
                    <MenuItem value="" disabled>
                      Select a city
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={(e) =>
                      handleFieldChange("zip_code", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, zip_code: true }))
                    }
                    error={!!getFieldError("zip_code")}
                    helperText={getFieldError("zip_code")}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div className="col-12">
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, address: true }))
                    }
                    error={!!getFieldError("address")}
                    helperText={getFieldError("address")}
                    variant="outlined"
                    size="small"
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="row g-3">
                <div className="col-12">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Emergency Contact Information
                  </Typography>
                </div>
                <div className="col-12 mb-3">
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={handlePhoneNumberChange("phone_number")}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, phone_number: true }))
                    }
                    error={!!getFieldError("phone_number")}
                    helperText={
                      getFieldError("phone_number") || "Format: +639XXXXXXXXX"
                    }
                    variant="outlined"
                    size="small"
                    inputProps={{
                      maxLength: 13,
                    }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    label="Emergency Contact Person Name"
                    value={formData.emergency_contact_full_name}
                    onChange={(e) =>
                      handleFieldChange(
                        "emergency_contact_full_name",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        emergency_contact_full_name: true,
                      }))
                    }
                    error={!!getFieldError("emergency_contact_full_name")}
                    helperText={getFieldError("emergency_contact_full_name")}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    label="Emergency Contact Number"
                    value={formData.emergency_contact_number}
                    onChange={handlePhoneNumberChange(
                      "emergency_contact_number"
                    )}
                    onBlur={() =>
                      setTouched((prev) => ({
                        ...prev,
                        emergency_contact_number: true,
                      }))
                    }
                    error={!!getFieldError("emergency_contact_number")}
                    helperText={
                      getFieldError("emergency_contact_number") ||
                      "Format: +639XXXXXXXXX"
                    }
                    variant="outlined"
                    size="small"
                    inputProps={{
                      maxLength: 13,
                    }}
                  />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="row g-3">
                <div className="col-12">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Set Password
                  </Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, password: true }))
                    }
                    error={!!getFieldError("password")}
                    helperText={getFieldError("password")}
                    variant="outlined"
                    size="small"
                    onCopy={handlePreventCopyPaste}
                    onPaste={handlePreventCopyPaste}
                    onCut={handlePreventCopyPaste}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFieldChange("confirmPassword", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, confirmPassword: true }))
                    }
                    error={!!getFieldError("confirmPassword")}
                    helperText={getFieldError("confirmPassword")}
                    variant="outlined"
                    size="small"
                    onCopy={handlePreventCopyPaste}
                    onPaste={handlePreventCopyPaste}
                    onCut={handlePreventCopyPaste}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </div>
                <div className="col-12">
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Password Requirements:
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      {getPasswordStrength(formData.password).map(
                        (requirement) => (
                          <Box
                            key={requirement.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            {requirement.isValid ? (
                              <CheckCircleOutlineIcon
                                color="success"
                                fontSize="small"
                                sx={{ flexShrink: 0 }}
                              />
                            ) : (
                              <CancelOutlinedIcon
                                color="error"
                                fontSize="small"
                                sx={{ flexShrink: 0 }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              color={
                                requirement.isValid ? "success.main" : "error"
                              }
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {requirement.label}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                    {formData.password && (
                      <>
                        <Box sx={{ width: "100%", mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={getPasswordStrengthScore(formData.password)}
                            color={getPasswordStrengthColor(
                              getPasswordStrengthScore(formData.password)
                            )}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color={getPasswordStrengthColor(
                            getPasswordStrengthScore(formData.password)
                          )}
                          align="right"
                        >
                          {getPasswordStrengthLabel(
                            getPasswordStrengthScore(formData.password)
                          )}
                        </Typography>
                      </>
                    )}
                  </Box>
                </div>
              </div>
            )}

            {errorAddUser && (
              <Alert severity="error" className="mt-3">
                {typeof errorAddUser === "string"
                  ? errorAddUser
                  : errorAddUser.message}
              </Alert>
            )}
          </div>

          <div className="mt-auto pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<i className="bi bi-arrow-left"></i>}
                size="small"
                sx={{ minWidth: "100px" }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  isLoading ||
                  (activeStep === steps.length - 1 && !isFormValid())
                }
                endIcon={
                  activeStep === steps.length - 1 ? null : (
                    <i className="bi bi-arrow-right"></i>
                  )
                }
                size="small"
                sx={{ minWidth: "100px" }}
              >
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                ) : activeStep === steps.length - 1 ? (
                  "Sign Up"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
            <div className="text-center mt-3">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ textDecoration: "none", color: "#0773dc" }}
                >
                  Login
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
