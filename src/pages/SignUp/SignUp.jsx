import React, { useContext, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const SignUp = () => {
  // State to hold the input values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // default role is 'user'
  const [error, setError] = useState("");

  const { createUser, updateUserProfile } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const Navigate = useNavigate();

  // handleSignUp function to log data
  const handleSignUp = (e) => {
    e.preventDefault(); // prevent form submission
    setRole("user");

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return; // stop further execution if passwords don't match
    }

    setError(""); // Clear any previous errors

    console.log({
      name,
      email,
      password,
      role,
    });

    createUser(email, password)
      .then((result) => {
        const user = result.user;
        console.log(user);
        updateUserProfile(name).then(() => {
          const userInfo = {
            name,
            email,
          };
          axiosPublic.post("/users/signup", userInfo).then((res) => {
            if (res.data.insertedId) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "User Created successfully",
                showConfirmButton: false,
                timer: 1500,
              });
              Navigate("/");
            }
          });
        }).catch((error) => console.log(error));
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input input-bordered input-primary w-full mt-2"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered input-primary w-full mt-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input input-bordered input-primary w-full mt-2"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input input-bordered input-primary w-full mt-2"
            />
          </div>

          {/* Display error message if passwords do not match */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button type="submit" className="btn btn-primary w-full mt-4">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
