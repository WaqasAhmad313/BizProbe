import { createContext, useState } from "react";
import PropTypes from "prop-types";

// Create authentication context
const AuthContext = createContext();

// AuthProvider component to manage authentication state
export const AuthProvider = ({ children }) => {
  // Store the authentication token in state (initialize from localStorage)
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  /**
   * Sign up a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {object} { success: boolean, message?: string }
   */
  const signUp = async (name, email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed.");

      // Store token on successful signup
      setToken(data.token);
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * Log in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {object} { success: boolean, message?: string }
   */
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");

      // Store token on successful login
      setToken(data.token);
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Prop validation for children
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext };
