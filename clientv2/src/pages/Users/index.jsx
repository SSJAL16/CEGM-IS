import { FaUserCircle } from "react-icons/fa";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import { useContext } from "react";
import { MyContext } from "../../App";

import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete, MdCheckCircle, MdCancel } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

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
import AddIcon from "@mui/icons-material/Add";
import { FormHelperText } from "@mui/material";
import { Avatar } from "@mui/material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  width: "80%",
  maxWidth: "800px",
};

// Add stringToColor function if not already present
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

const Users = () => {
  const [showBy, setshowBy] = useState(10);
  const [categoryBy, setCategoryBy] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const context = useContext(MyContext);
  const isAdmin = context?.user?.role === "Admin";
  const [editErrors, setEditErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadUsers();
    loadPendingUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      const allUsers = response.data.data || [];
      setUsers(allUsers.filter((user) => user.isApproved === true));
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load users",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const loadPendingUsers = async () => {
    try {
      const response = await userService.getAll();
      const allUsers = response.data.data || [];
      setPendingUsers(allUsers.filter((user) => user.isApproved === false));
    } catch (error) {
      console.error("Error fetching pending users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load pending users",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleApprove = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Approve User",
        text: "Are you sure you want to approve this user?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve!",
      });

      if (result.isConfirmed) {
        await userService.approveUser(userId);

        await Swal.fire({
          icon: "success",
          title: "Approved!",
          text: "User has been approved successfully.",
          confirmButtonColor: "#3085d6",
        });

        // Refresh both user lists
        await loadUsers();
        await loadPendingUsers();
      }
    } catch (error) {
      console.error("Error approving user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to approve user",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Reject and Remove User",
        text: "Are you sure? This will permanently delete the user account from the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, reject and delete!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await userService.rejectUser(userId);

        await Swal.fire({
          icon: "success",
          title: "Rejected!",
          text: "User has been rejected and removed from the system.",
          confirmButtonColor: "#3085d6",
        });

        // Refresh both user lists
        await loadUsers();
        await loadPendingUsers();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Failed to reject and remove user",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getFilteredUsers = (userList) => {
    let filtered = [...userList];

    if (categoryBy) {
      switch (categoryBy) {
        case "role":
          filtered.sort((a, b) => a.role.localeCompare(b.role));
          break;
        case "status":
          filtered.sort((a, b) =>
            a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1
          );
          break;
        case "alphabetical":
          filtered.sort((a, b) => a.first_name.localeCompare(b.first_name));
          break;
        default:
          break;
      }
    }

    // Calculate pagination
    const startIndex = (page - 1) * showBy;
    const endIndex = startIndex + showBy;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems) => {
    return Math.ceil(totalItems / showBy);
  };

  const handleView = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setEditErrors({});
    setTouched({});
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Delete User",
        text: "Are you sure you want to delete this user? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await userService.delete(userId);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          confirmButtonColor: "#3085d6",
        });

        // Refresh user lists
        await loadUsers();
        await loadPendingUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to delete user",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
        return !value.trim()
          ? "This field is required"
          : !/^[a-zA-Z\s]*$/.test(value)
          ? "Only letters and spaces are allowed"
          : "";
      case "phone_number":
        return !value.trim()
          ? "This field is required"
          : !/^\+639\d{9}$/.test(value)
          ? "Phone number must be in format: +639XXXXXXXXX"
          : "";
      case "role":
        if (!value) return "Role is required";
        if (editUser?._id === context.user._id)
          return "You cannot change your own role";
        return "";
      default:
        return "";
    }
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;

    // Prevent changing own role
    if (name === "role" && editUser?._id === context.user._id) {
      return;
    }

    setEditUser((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setEditErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEditBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isEditFormValid = () => {
    const requiredFields = ["first_name", "last_name", "phone_number"];
    if (isAdmin) requiredFields.push("role");

    const newErrors = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, editUser[field] || "");
      if (error) newErrors[field] = error;
    });

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!isEditFormValid()) {
      // Mark all fields as touched to show errors
      const touchedFields = {};
      Object.keys(editUser).forEach((key) => (touchedFields[key] = true));
      setTouched(touchedFields);
      return;
    }

    try {
      const { email, _id, ...updateData } = editUser;

      if (!isAdmin) {
        delete updateData.role;
      }

      await userService.update(editUser._id, updateData);

      setIsEditModalOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User has been updated successfully.",
        confirmButtonColor: "#3085d6",
      });

      await loadUsers();
      await loadPendingUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update user",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">User List</h5>
          <div className="ml-auto d-flex align-items-center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/users/create"
              className="mr-3"
            >
              Create User
            </Button>
            <Breadcrumbs aria-label="breadcrumb" className="breadcrumbs_">
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyledBreadcrumb label="Users" deleteIcon={<ExpandMoreIcon />} />
            </Breadcrumbs>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                icon={<FaUserCircle />}
                grow={true}
                title="Total Users"
                value={users.length}
              />
              <DashboardBox
                color={["#c012e2", "#eb64fe"]}
                icon={<FaUserCircle />}
                title="Pending Users"
                value={pendingUsers.length}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                icon={<FaUserCircle />}
                title="Banned Users"
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <Tabs value={activeTab} onChange={handleTabChange} className="mb-4">
            <Tab label={`All Users (${users.length})`} />
            <Tab label={`Pending Approvals (${pendingUsers.length})`} />
          </Tabs>

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
                  <MenuItem value={10}>10 per page</MenuItem>
                  <MenuItem value={25}>25 per page</MenuItem>
                  <MenuItem value={50}>50 per page</MenuItem>
                  <MenuItem value={100}>100 per page</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>CATEGORY BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={categoryBy}
                  onChange={(e) => setCategoryBy(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  labelId="demo-select-small-label"
                  className="w-100"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="alphabetical">Alphabetical</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {activeTab === 0 ? (
            // All Users Tab Content
            <div className="table-responsive mt-3">
              <table className="table table-bordered table-striped v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>UID</th>
                    <th style={{ width: "300px" }}>NAME</th>
                    <th>PHONE NUMBER</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers(users).map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Checkbox {...label} /> <span>{user.user_id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <Avatar
                              src={user.avatar}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: stringToColor(
                                  `${user.first_name} ${user.last_name}`
                                ),
                                marginRight: 2,
                                border: "2px solid #fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              {!user.avatar &&
                                `${user.first_name[0]}${user.last_name[0]}`}
                            </Avatar>
                          </div>
                          <div className="info pl-3">
                            <h6>
                              {user.first_name} {user.last_name}
                            </h6>
                            <p>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone_number}</td>
                      <td>{user.role}</td>
                      <td>
                        <Chip
                          label={user.isVerified ? "Verified" : "Not Verified"}
                          icon={
                            user.isVerified ? <VerifiedIcon /> : <ErrorIcon />
                          }
                          color={user.isVerified ? "success" : "error"}
                          variant="filled"
                          size="small"
                        />
                      </td>
                      <td>
                        <div className="actions d-flex align-items-center">
                          <Button
                            className="secondary mr-2"
                            color="secondary"
                            onClick={() => handleView(user)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            className="success mr-2"
                            color="success"
                            onClick={() => handleEdit(user)}
                          >
                            <FaPencilAlt />
                          </Button>
                          <Button
                            className="error"
                            color="error"
                            onClick={() => handleDelete(user._id)}
                          >
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Pending Approvals Tab Content
            <div className="table-responsive mt-3">
              {pendingUsers.length === 0 ? (
                <Alert severity="info" className="w-100">
                  No pending approvals at the moment.
                </Alert>
              ) : (
                <table className="table table-bordered table-striped v-align">
                  <thead className="thead-dark">
                    <tr>
                      <th>UID</th>
                      <th style={{ width: "300px" }}>NAME</th>
                      <th>PHONE NUMBER</th>
                      <th>EMAIL</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUsers(pendingUsers).map((user) => (
                      <tr key={user._id}>
                        <td>{user.user_id}</td>
                        <td>
                          <div className="d-flex align-items-center productBox">
                            <div className="imgWrapper">
                              <Avatar
                                src={user.avatar}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: stringToColor(
                                    `${user.first_name} ${user.last_name}`
                                  ),
                                  marginRight: 2,
                                  border: "2px solid #fff",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                {!user.avatar &&
                                  `${user.first_name[0]}${user.last_name[0]}`}
                              </Avatar>
                            </div>
                            <div className="info pl-3">
                              <h6>
                                {user.first_name} {user.last_name}
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td>{user.phone_number}</td>
                        <td>{user.email}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Button
                              className="success mr-2"
                              color="success"
                              onClick={() => handleApprove(user.user_id)}
                            >
                              <MdCheckCircle />
                            </Button>
                            <Button
                              className="error"
                              color="error"
                              onClick={() => handleReject(user.user_id)}
                            >
                              <MdCancel />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="d-flex tableFooter">
            <p>
              showing{" "}
              <b>
                {
                  getFilteredUsers(activeTab === 0 ? users : pendingUsers)
                    .length
                }
              </b>{" "}
              of <b>{(activeTab === 0 ? users : pendingUsers).length}</b>{" "}
              results
            </p>
            <Pagination
              count={getTotalPages(
                activeTab === 0 ? users.length : pendingUsers.length
              )}
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

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        aria-labelledby="view-user-modal"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            User Details
          </Typography>
          {viewUser && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  First Name
                </Typography>
                <Typography variant="body1">{viewUser.first_name}</Typography>
              </div>
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  Last Name
                </Typography>
                <Typography variant="body1">{viewUser.last_name}</Typography>
              </div>
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{viewUser.email}</Typography>
              </div>
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">{viewUser.phone_number}</Typography>
              </div>
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  Role
                </Typography>
                <Typography variant="body1">{viewUser.role}</Typography>
              </div>
              <div className="col-md-6 mb-3">
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {viewUser.isVerified ? "Verified" : "Not Verified"}
                </Typography>
              </div>
              <div className="col-md-12 mt-3">
                <Button
                  variant="contained"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        aria-labelledby="edit-user-modal"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            Edit User
          </Typography>
          {editUser && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={editUser.first_name || ""}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditBlur}
                  error={touched.first_name && Boolean(editErrors.first_name)}
                  helperText={touched.first_name && editErrors.first_name}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={editUser.last_name || ""}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditBlur}
                  error={touched.last_name && Boolean(editErrors.last_name)}
                  helperText={touched.last_name && editErrors.last_name}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextField
                  fullWidth
                  label="Email"
                  value={editUser.email || ""}
                  disabled
                  helperText="Email cannot be changed by admin"
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={editUser.phone_number || ""}
                  onChange={handleEditFieldChange}
                  onBlur={handleEditBlur}
                  error={
                    touched.phone_number && Boolean(editErrors.phone_number)
                  }
                  helperText={
                    touched.phone_number
                      ? editErrors.phone_number || "Format: +639XXXXXXXXX"
                      : "Format: +639XXXXXXXXX"
                  }
                />
              </div>
              {isAdmin && (
                <div className="col-md-6 mb-3">
                  <FormControl
                    fullWidth
                    error={touched.role && Boolean(editErrors.role)}
                  >
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={editUser.role || ""}
                      label="Role"
                      name="role"
                      onChange={handleEditFieldChange}
                      onBlur={handleEditBlur}
                      disabled={editUser?._id === context.user._id}
                    >
                      <MenuItem value="Employee">Employee</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Moderator">Moderator</MenuItem>
                    </Select>
                    {touched.role && editErrors.role && (
                      <FormHelperText>{editErrors.role}</FormHelperText>
                    )}
                    {editUser?._id === context.user._id && (
                      <FormHelperText>
                        You cannot change your own role
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
              )}
              <div className="col-md-12 mt-3">
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditModalOpen(false)}
                    sx={{ minWidth: 100 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEditSubmit}
                    sx={{ minWidth: 100 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Users;
