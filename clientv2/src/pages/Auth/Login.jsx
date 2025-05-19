import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import cokinsLogo from "../../assets/images/cokins_logo.png";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Alert from "@mui/material/Alert";
import { MyContext } from "../../App";
import { Button, TextField, IconButton, InputAdornment } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, errorLogin } = useAuthStore();

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(loginEmail);
    const isPasswordValid = password.trim() !== "";

    if (!isEmailValid || !isPasswordValid) {
      setEmailError(!isEmailValid);
      setPasswordError(!isPasswordValid);
      return;
    }

    await login(loginEmail, password);
    navigate("/");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, [context]);

  return (
    <div
      className={`${styles["container"]} d-flex justify-content-center align-items-center vh-100`}
    >
      <div
        className={`row border ${styles["rounded-5"]} p-3 bg-white shadow ${styles["box-area"]}`}
      >
        {/* Left box */}
        <div
          className={`${styles.cokinsBox} ${styles.left_box} col-md-6 d-flex justify-content-center align-items-center flex-column left-box`}
        >
          <div className="featured-image mb-3">
            <img
              src={cokinsLogo}
              className="img-fluid"
              style={{ width: "350px" }}
              alt="featured"
            />
          </div>
        </div>

        {/* Right box */}
        <div className={`col-md-6 ${styles["right-box"]}`}>
          <div className="header-text mb-4">
            <h2 className="fw-bold text-center">Welcome</h2>
            <p className="text-center">Login with username or email</p>
          </div>
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-3">
              <TextField
                size="small"
                fullWidth
                type="email"
                label="Email"
                variant="filled"
                error={emailError}
                helperText={
                  emailError ? "Please enter a valid email address." : ""
                }
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setEmailError(!validateEmail(e.target.value));
                }}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <TextField
                size="small"
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                variant="filled"
                value={password}
                error={passwordError}
                helperText={passwordError ? "Password is required" : ""}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(e.target.value.trim() === "");
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="mb-2 mt-3 d-flex justify-content-end">
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>

            {/* Error Alert */}
            {errorLogin && (
              <Alert
                severity={
                  errorLogin.code === "EMAIL_NOT_VERIFIED" ? "warning" : "error"
                }
                className="mb-2"
                onClose={() => {
                  useAuthStore.setState({ errorLogin: null });
                }}
              >
                {errorLogin.code === "EMAIL_NOT_VERIFIED" ? (
                  <>
                    Email not verified. Please{" "}
                    <Link
                      to="/verify-email"
                      style={{ textDecoration: "none" }}
                      onClick={() => {
                        localStorage.setItem("verificationEmail", loginEmail);
                        useAuthStore.setState({ errorLogin: null });
                      }}
                    >
                      Verify your email
                    </Link>
                    .
                  </>
                ) : (
                  errorLogin.message ||
                  "Something went wrong. Please try again."
                )}
              </Alert>
            )}

            {/* Login Button */}
            <div className="mb-3">
              <Button
                type="submit"
                disabled={isLoading}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LoginIcon />}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          <div className="header-text mb-4">
            <p className="text-center">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
