import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthForm from "../components/AuthForm";

const AuthPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  useEffect(() => {
    if (token) navigate("/Businesssearch"); // Redirect if already logged in
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isAuthModalOpen && (
        <AuthForm
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AuthPage;
