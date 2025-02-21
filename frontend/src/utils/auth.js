import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// eslint-disable-next-line react/prop-types
export const ProtectedRoute = ({ element }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/"); // Redirect if no token is found
    }
  }, [token, navigate]);

  return token ? element : null;
};
