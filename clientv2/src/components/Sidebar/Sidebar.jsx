import Button from "@mui/material/Button";
import { MdDashboard } from "react-icons/md";
import { FaAngleRight, FaDollarSign } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { useState, useContext } from "react";
import { Chip } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useAuthStore } from "../../store/authStore";
import { MyContext } from "../../App";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
  const { logout } = useAuthStore();
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const isOpenSubmenu = (index) => {
    setActiveTab(index);
    setIsToggleSubmenu(!isToggleSubmenu);
  };

  const handleLogout = () => {
    logout();
    console.log("User logged out");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (context.windowWidth < 992) {
      context.setIsOpenNav(false);
    }
  };

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <Button
              className={`w-100 ${activeTab === 0 ? "active" : ""}`}
              onClick={() => {
                isOpenSubmenu(0);
                handleNavigation("/");
              }}
            >
              <span className="icon">
                <MdDashboard />
              </span>
              Dashboard
            </Button>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 1 && isToggleSubmenu ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(1)}
            >
              <span className="icon">
                <ShoppingCartIcon />
              </span>
              Purchasing
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 1 && isToggleSubmenu ? "colapse" : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <Button
                    onClick={() => handleNavigation("/low-stock-products")}
                  >
                    Purchase Order
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/grn")}>GRN</Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/rma")}>RMA</Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/back-order")}>
                    Backorder
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/reports")}>
                    Reports
                  </Button>
                </li>
              </ul>
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 4 && isToggleSubmenu ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(4)}
            >
              <span className="icon">
                <FaUser />
              </span>
              Suppliers
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 4 && isToggleSubmenu ? "colapse" : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <Button onClick={() => handleNavigation("/supplier/view")}>
                    Supplier List
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/supplier/create")}>
                    Create Supplier
                  </Button>
                </li>
              </ul>
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 2 && isToggleSubmenu ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(2)}
            >
              <span className="icon">
                <FaProductHunt />
              </span>
              Products
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 2 && isToggleSubmenu ? "colapse" : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <Button onClick={() => handleNavigation("/storage")}>
                    Products
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => handleNavigation("/storage/stockmovement")}
                  >
                    Stock Movement
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/storage/archive")}>
                    Archive
                  </Button>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Button
              className={`w-100 ${
                activeTab === 5 && isToggleSubmenu ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(5)}
            >
              <span className="icon">
                <FaDollarSign />
              </span>
              Sales
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 5 && isToggleSubmenu ? "colapse" : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <Button onClick={() => handleNavigation("/sales")}>
                    Transaction
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/sales/Analysis")}>
                    Analysis & Report
                  </Button>
                </li>
              </ul>
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 3 && isToggleSubmenu ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(3)}
            >
              <span className="icon">
                <FaUser />
              </span>
              Users
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 3 && isToggleSubmenu ? "colapse" : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <Button onClick={() => handleNavigation("/users")}>
                    User List
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation("/users/create")}>
                    Create User
                  </Button>
                </li>
              </ul>
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${activeTab === 10 ? "active" : ""}`}
              onClick={() => {
                isOpenSubmenu(11);
                handleNavigation("/");
              }}
            >
              <span className="icon">
                <IoIosSettings />
              </span>
              Settings
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
          </li>
        </ul>

        <br />

        <div className="logoutWrapper">
          <div className="logoutBox">
            <Button variant="contained" onClick={handleLogout}>
              <IoMdLogOut /> Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
