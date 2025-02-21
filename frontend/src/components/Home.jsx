import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/bizprobe-logo.png";
import AuthForm from "../components/AuthForm"; // Import AuthForm

const Home = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle navigation
  const handleNavigation = (route) => {
    if (token) {
      navigate(route);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F4959] flex flex-col items-center justify-center p-6 relative">
      {/* Logo */}
      <img
        src={logo}
        alt="BizProbe Logo"
        className="absolute top-6 left-6 w-48"
      />

      {/* Top Right - Login / Dashboard Button */}
      <div className="absolute top-6 right-6">
        {token ? (
          <button
            onClick={() => navigate("/Dashboard")}
            className="px-6 py-2 bg-white text-black rounded-md shadow-lg hover:bg-gray-700 hover:text-white border border-white transition"
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2 bg-white text-black rounded-md shadow-lg hover:bg-black hover:text-white border border-white transition"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="text-center text-white mt-10">
        <h1 className="text-3xl font-bold">BIZPROBE</h1>
        <p className="text-lg mt-2">Empowering Businesses, Amplifying Reach</p>
      </div>

      {/* Navigation Cards */}
      <div className="mt-10 flex flex-col md:flex-row gap-6">
        {/* Keyword Volume */}
        <div
          onClick={() => handleNavigation("/keyword-volume")}
          className="group cursor-pointer"
        >
          <div className="w-72 h-32 bg-[#011425] text-white flex flex-col items-center justify-center rounded-lg border border-gray-400 transition-all group-hover:scale-105">
            <h2 className="text-lg font-bold">KEYWORD VOLUME</h2>
            <p className="text-center text-sm mt-2">
              Capitalize on hidden opportunities to dominate your market
            </p>
          </div>
        </div>

        {/* Search Businesses */}
        <div
          onClick={() => handleNavigation("/search-businesses")}
          className="group cursor-pointer"
        >
          <div className="w-72 h-32 bg-[#011425] text-white flex flex-col items-center justify-center rounded-lg border border-gray-400 transition-all group-hover:scale-105">
            <h2 className="text-lg font-bold">SEARCH BUSINESSES</h2>
            <p className="text-center text-sm mt-2">
              Connect with local businesses to find the services and products
              you need
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthForm
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
