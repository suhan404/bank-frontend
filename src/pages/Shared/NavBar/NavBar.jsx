import React, { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../../providers/AuthProvider";
import useAdmin from "../../../hooks/useAdmin";

const NavBar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [isAdmin, isAdminLoading] = useAdmin(); // ✅ correct
  console.log("isAdmin from navbar", isAdmin);
  const handleLogOut = () => {
    logOut()
      .then(() => { })
      .catch((error) => console.log(error));
  };
  const navOptions = (
    <>
      <li>
        <Link to="/allproducts">Products</Link>
      </li>
      <li>
        <Link to="/">Home</Link>
      </li>
      {user ? (
        <button onClick={handleLogOut}>Logout</button>
      ) : (
        <li>
          <Link to="/login">Login</Link>
        </li>
      )}
      <li>
        {user?.email ? <p>{user?.email}</p> : <Link to="/signup">Register</Link>}
      </li>

      {/* <li>
        { !user?.email ? <></>:<Link to="/dashboard" className="btn btn-primary text-white">
          Dashboard
        </Link>}
      </li> */}
      <li>
        {!user?.email || isAdminLoading ? null : isAdmin ? (
          <Link to="/admin-dashboard" className="btn btn-primary text-white">
            Admin Dashboard
          </Link>
        ) : (
          <Link to="/dashboard/user" className="btn btn-primary text-white">
            Dashboard
          </Link>
        )}
      </li>
    </>
  );

  return (
    <div className="navbar bg-base-100 border-b border-gray-200 px-4">
      {/* Left side (Logo) */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Digital-Banking
        </Link>
      </div>

      {/* Right side (Desktop Menu) */}
      <div className="hidden lg:flex">
        <ul className="menu menu-horizontal px-1 space-x-2">{navOptions}</ul>
      </div>

      {/* Mobile menu (Hamburger) */}
      <div className="dropdown dropdown-end lg:hidden">
        <label tabIndex={0} className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          {navOptions}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
