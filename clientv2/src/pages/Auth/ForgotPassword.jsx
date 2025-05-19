import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import cokinsLogo from "../../assets/images/cokins_logo.png";
import styles from "./Login.module.css";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Alert from "@mui/material/Alert";
import { MyContext } from "../../App";
import { Button, TextField } from "@mui/material";

function ForgotPassword() {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, [context]);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword, errorForgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div
      className={`${styles["container"]} d-flex justify-content-center align-items-center min-vh-100`}
    >
      <div
        className={`row border ${styles["rounded-5"]} p-3 bg-white shadow ${styles["box-area"]}`}
      >
        {/* Left box */}
        <div
          className={`${styles.cokinsBox} ${styles.left_box} col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box`}
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
          <div className="header-text mb-2">
            <h2 className="fw-bold text-center">Forgot Password</h2>
            <p className="text-center">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="input mb-3">
                <TextField
                  size="small"
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="filled"
                />
              </div>

              {errorForgotPassword && (
                <Alert severity="error" className="mb-2">
                  {errorForgotPassword.message ||
                    "Something went wrong. Please try again."}
                </Alert>
              )}

              {/* Reset button */}
              <Button
                fullWidth
                type="submit"
                disabled={isLoading}
                variant="contained"
                margin="normal"
                size="large"
              >
                {isLoading ? (
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                ) : (
                  "Request Reset"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <i className="bi bi-envelope-fill fs-3 text-primary mb-3"></i>
              <p className="text-muted">
                If an account exists for <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </p>
            </div>
          )}
          <div className="header-text mb-2">
            <Link to="/login">
              <p className="text-center">
                <i className="bi bi-arrow-left me-2"></i>Back to Login
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
