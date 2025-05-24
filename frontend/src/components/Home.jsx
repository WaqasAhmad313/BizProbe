import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/bizprobe-logo.png";
import AuthForm from "../components/AuthForm";
import signupImage from "../assets/business_finder.jpg";
import searchImage from "../assets/business_search.jpg";
import outreachImage from "../assets/Outreach.jpg";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const Home = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle navigation with authentication check
  const handleNavigation = (route) => {
    if (token) {
      navigate(route);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Handle section scrolling
  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="fixed top-0 right-0 w-full bg-black bg-opacity-50 backdrop-blur-md shadow-md p-4 flex justify-end items-center z-10 space-x-6">
        <img src={logo} alt="BizProbe Logo" className="w-36 mr-auto" />
        <nav className="flex space-x-6 text-white">
          <button
            onClick={() => handleScroll("search")}
            className="hover:text-blue-600"
          >
            Search Business
          </button>
          <button
            onClick={() => handleScroll("outreach")}
            className="hover:text-blue-600"
          >
            Outreach
          </button>
        </nav>
        <div>
          {token ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Sign Up Section */}
      <section
        id="signup"
        className="flex flex-col md:flex-row items-center justify-between px-10 py-24 mt-16"
      >
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold">Join BizProbe Today</h2>
          <p className="mt-4 text-lg">
            Take your business to the next level with our advanced tools and
            insights. Gain access to exclusive data, find potential leads, and
            enhance your outreach efforts with ease.
          </p>
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src={signupImage}
            alt="Sign Up"
            className="w-80 rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Search Business Section */}
      <section
        id="search"
        className="flex flex-col md:flex-row items-center justify-between px-10 py-24 bg-gray-200"
      >
        <div className="md:w-1/2 flex justify-center">
          <img
            src={searchImage}
            alt="Search Business"
            className="w-80 rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold">Find the Right Businesses</h2>
          <p className="mt-4 text-lg">
            Easily discover businesses in your area or industry. Our intelligent
            search feature helps you connect with relevant businesses and
            explore new opportunities effortlessly.
          </p>
          <button
            onClick={() => handleNavigation("/search-businesses")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            Find Businesses
          </button>
        </div>
      </section>

      {/* Outreach Section */}
      <section
        id="outreach"
        className="flex flex-col md:flex-row items-center justify-between px-10 py-24"
      >
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold">Expand Your Reach</h2>
          <p className="mt-4 text-lg">
            Connect with potential clients and partners through our powerful
            outreach tools. Automate your outreach, track responses, and enhance
            your business networking.
          </p>
          <button
            onClick={() => handleNavigation("/outreach")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            Start Outreach
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src={outreachImage}
            alt="Outreach"
            className="w-80 rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-10 px-10 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="BizProbe Logo" className="w-36 mb-4" />
            <p className="text-sm">
              Take your business to the next level with our advanced tools and
              insights. Gain access to exclusive data, find potential leads, and
              enhance your outreach efforts with ease.
            </p>
          </div>

          {/* Page Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Pages</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation("signup")}
                  className="hover:text-blue-600"
                >
                  Sign Up
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("search")}
                  className="hover:text-blue-600"
                >
                  Search Businesses
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("outreach")}
                  className="hover:text-blue-600"
                >
                  Outreach
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500">
                <FaFacebookF size={20} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="hover:text-blue-600">
                <FaLinkedinIn size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

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
