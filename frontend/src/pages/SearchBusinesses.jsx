import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import searchImage from "../assets/search.jpg";
import { useSearch } from "../context/useSearch";
import { AuthContext } from "../context/AuthContext";
import AuthForm from "../components/AuthForm";

const SearchBusinesses = () => {
  const { updateSearchParams, performSearch } = useSearch();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsAuthModalOpen(true);
    }
  }, [token]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const trimmedQuery = query.trim();
    const trimmedLocation = location.trim();
    let parsedRadius = parseInt(radius, 10);

    if (
      !trimmedQuery ||
      !trimmedLocation ||
      isNaN(parsedRadius) ||
      parsedRadius < 1
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    parsedRadius *= 1000;

    updateSearchParams({
      query: trimmedQuery,
      location: trimmedLocation,
      radius: parsedRadius,
    });

    try {
      setLoading(true);
      await performSearch(token);
      // You can optionally navigate here if needed
      // navigate("/results");
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <AuthForm isOpen={isAuthModalOpen} onClose={() => navigate("/")} />;
  }

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/2 p-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-4">
            Search for Businesses
          </h2>
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">
                Business Type/Niche
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Restaurants, Salons"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a city or address"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Radius (km)</label>
              <input
                type="text"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter radius in km"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
        <div className="w-1/2">
          <img
            src={searchImage}
            alt="Search"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBusinesses;
