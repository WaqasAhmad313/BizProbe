import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // Eye icons for password toggle
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

const AuthForm = ({ isOpen, onClose }) => {
  const { signUp, login } = useContext(AuthContext); // Use AuthContext functions
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Error state for failed login/signup

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      let response;
      if (isLogin) {
        response = await login(formData.email, formData.password);
      } else {
        response = await signUp(
          formData.name,
          formData.email,
          formData.password
        );
      }

      if (!response.success) {
        setError(response.message); // Display error if login/signup fails
      } else {
        window.location.reload(); // Reload to apply auth state globally
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle modal close conditionally
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      const { name, email, password } = formData;
      if (name || email || password) {
        const confirmExit = window.confirm(
          "You have unsaved changes. Are you sure you want to exit?"
        );
        if (confirmExit) onClose();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-[600px] sm:w-[700px] flex relative border border-white">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Left - Form Section */}
        <div className="w-1/2 p-6 bg-white flex flex-col justify-center">
          <h2 className="text-xl font-bold text-center text-black">
            {isLogin ? "Login" : "Create an Account"}
          </h2>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field (Only in Signup) */}
            {!isLogin && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
                required
              />
            </div>

            {/* Password Field with Eye Icon */}
            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
                required
              />
              {/* Toggle Password Button */}
              <button
                type="button"
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`mt-4 w-full py-2 rounded-md font-semibold ${
                isLogin ? "bg-[#1E3A47] text-white" : "bg-[#0D1B22] text-white"
              }`}
            >
              {isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle Button */}
          <p className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? "Or create a new account" : "Already have an account?"}
          </p>
          <button
            className="w-full mt-2 py-2 border rounded-md font-semibold text-black bg-gray-100 hover:bg-gray-200 border border-black"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

        {/* Right - Info Section */}
        <div className="w-1/2 p-6 flex flex-col justify-center bg-[#011425] text-white">
          <h2 className="text-xl font-bold">
            {isLogin ? "Welcome Back!" : "Join BizProbe Today!"}
          </h2>
          <p className="mt-2 text-sm">
            {isLogin
              ? "Welcome back! We're excited to have you back. Log in to access your personalized dashboard, review your recent activity, and continue your journey"
              : "Unlock powerful insights and make smarter business decisions with BizProbe. Sign up now and experience the power of informed decision-making for sustainable business growth."}
          </p>
        </div>
      </div>
    </div>
  );
};

AuthForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AuthForm;
