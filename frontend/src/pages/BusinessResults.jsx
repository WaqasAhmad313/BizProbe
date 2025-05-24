import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSearch } from "../context/useSearch";
import BusinessCard from "../components/BusinessCard";
import AuthForm from "../components/AuthForm";
import MapView from "../components/MapView";

const BusinessResultsPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchData = useSearch();
  let { businessResults = [], competitors = {}, mapData = {} } = searchData;

  console.log("Initial Data in BusinessResultsPage:", {
    businessResults,
    competitors,
    mapData,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    if (!token) {
      setIsAuthModalOpen(true);
    }
  }, [token]);

  if (!token) {
    return <AuthForm isOpen={isAuthModalOpen} onClose={() => navigate("/")} />;
  }

  if (!Array.isArray(businessResults)) {
    return (
      <p className="text-center text-red-500">Error: Invalid business data</p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Business Results</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow"
        >
          Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b pb-2">
        <button
          className={`px-4 py-2 rounded-t-lg transition-all font-medium ${
            activeTab === "map"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("map")}
        >
          🗺️ Map View
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg transition-all font-medium ${
            activeTab === "list"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          📝 Business Cards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "map" ? (
        <MapView businesses={mapData.businesses || []} />
      ) : (
        <div className="grid gap-6 grid-cols-1">
          {businessResults.map((business, index) => {
            const businessId = business.businessid;

            const businessCompetitors = (competitors[businessId] || []).map(
              (comp) => ({ name: comp.name, distance_km: comp.distance_km })
            );

            const businessMapEntry =
              mapData.businesses?.find((entry) => entry.id === businessId) ||
              null;

            const businessMapData = businessMapEntry
              ? {
                  name: businessMapEntry.name,
                  location: businessMapEntry.location,
                }
              : null;

            const competitorsMapData = (
              businessMapEntry?.competitors || []
            ).map((comp) => ({
              name: comp.name,
              location: comp.location,
            }));

            const businessDataObject = {
              business,
              competitors: businessCompetitors,
              mapData: {
                business: businessMapData
                  ? {
                      name: businessMapData.name,
                      location: businessMapData.location,
                    }
                  : null,
                competitors: competitorsMapData.map((comp) => ({
                  name: comp.name,
                  location: comp.location,
                })),
              },
            };

            console.log(
              "Final Data Passing to BusinessCard:",
              businessDataObject
            );

            return (
              <BusinessCard key={businessId || index} {...businessDataObject} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessResultsPage;
