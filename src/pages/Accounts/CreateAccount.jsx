import React, { useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const CreateAccount = () => {
    const {user} = useAuth();
  const [name, setName] = useState(user?.displayName);
  const [email, setEmail] = useState(user?.email);
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [nidImage1, setNidImage1] = useState(null);
  const [nidImage2, setNidImage2] = useState(null);
  
  // Error states
  const [phoneError, setPhoneError] = useState("");

  
  console.log("user",user)
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const validatePhone = (phoneValue) => {
    if (phoneValue.length !== 11) {
      setPhoneError("Phone number must be exactly 11 characters");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };


  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  // ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before submission
    const isPhoneValid = validatePhone(phone);

    if (!isPhoneValid) {
      return;
    }

    // Create FormData object
    const formData1 = new FormData();
    formData1.append('image', profileImage);  // Ensure the field name is correct as expected by the API (e.g., 'image')
    const formData2 = new FormData();
    formData2.append('image', nidImage1);  // Ensure the field name is correct as expected by the API (e.g., 'image')
    const formData3 = new FormData();
    formData3.append('image', nidImage2);  // Ensure the field name is correct as expected by the API (e.g., 'image')

    try {
        // Sending POST request to ImgBB (or any image hosting service)
        const res1 = await axiosPublic.post(image_hosting_api, formData1, {
            // Note: Do not manually set 'Content-Type' for multipart form data, axios handles it
        });

        const res2 = await axiosPublic.post(image_hosting_api, formData2, {
            // Note: Do not manually set 'Content-Type' for multipart form data, axios handles it
        });

        const res3 = await axiosPublic.post(image_hosting_api, formData3, {
            // Note: Do not manually set 'Content-Type' for multipart form data, axios handles it
        });
        console.log("Image uploaded successfully:", res1.data);
        console.log("Image uploaded successfully:2", res2.data);
        console.log("Image uploaded successfully:3", res3.data);

        // If the image upload is successful, proceed with your account creation
        if (res1.data.success) {
            const accountData = {
                name,
                email,
                phone,
                accountType,
                deposit: 0,
                profileImage: res1.data.data.display_url,  // Get the URL of the uploaded image from the response
                nidImage1: res2.data.data.display_url,  // Get the URL of the uploaded image from the response
                nidImage2: res3.data.data.display_url,  // Get the URL of the uploaded image from the response
            };

            // You can now send account data to your server or handle it accordingly
            console.log("Account data", accountData);

            const result = await axiosSecure.post("/accounts/createaccount", accountData);
        console.log("Account creation response:", result.data);

        if (result.data.insertedId) {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `${name}'s account has been created successfully!`,
            showConfirmButton: false,
            timer: 1500,
          });

          // Reset form after success
          setName("");
          setEmail("");
          setPhone("");
          setAccountType("");
          setProfileImage(null);
          setNidImage1(null);
          setNidImage2(null);
        }else {
        throw new Error("Error uploading images");
      }
            

        }
    } catch (error) {
        console.error("Error uploading image:", error.response?.data || error.message);

        // Optional: Show an error alert with the failure reason
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong with the image upload.',
        });
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-primary">
          Open a New Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">Name*</span>
            </div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </label>

          {/* Email */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">Email*</span>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </label>

          {/* Phone */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">Phone*</span>
            </div>
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={handlePhoneChange}
              required
              className={`input input-bordered w-full ${phoneError ? 'input-error' : ''}`}
            />
            {phoneError && <span className="text-error text-sm mt-1">{phoneError}</span>}
          </label>

          {/* Account Type */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">Account Type*</span>
            </div>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
              className="select select-bordered w-full"
            >
              <option value="">Select an Account Type</option>
              <option value="savings">Savings</option>
              <option value="checking">Checking</option>
              <option value="business">Business</option>
            </select>
          </label>

          {/* Initial Deposit removed - deposit is set to 0 on the server side */}

          {/* Profile Image */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">Profile Image*</span>
            </div>
            <input
              type="file"
              onChange={(e) => setProfileImage(e.target.files[0])}
              accept="image/*"
              required
              className="file-input file-input-bordered w-full"
            />
          </label>

          {/* NID Image 1 */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">NID Image 1*</span>
            </div>
            <input
              type="file"
              onChange={(e) => setNidImage1(e.target.files[0])}
              accept="image/*"
              required
              className="file-input file-input-bordered w-full"
            />
          </label>

          {/* NID Image 2 */}
          <label className="form-control w-full my-6">
            <div className="label">
              <span className="label-text">NID Image 2*</span>
            </div>
            <input
              type="file"
              onChange={(e) => setNidImage2(e.target.files[0])}
              accept="image/*"
              required
              className="file-input file-input-bordered w-full"
            />
          </label>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
