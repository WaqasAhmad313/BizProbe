import { useEffect, useState } from "react";
import { X, Plus, Search as SearchIcon, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletionMode, setDeletionMode] = useState(false);
  const [selectedBizIds, setSelectedBizIds] = useState([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    niche: "",
    address: "",
    scraped: "",
    outreach: "",
  });

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const query = new URLSearchParams(filters).toString();
      const res = await fetch(
        `http://localhost:5000/api/business/dashboard?${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.success) {
        setBusinesses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    fetchBusinesses();
  };

  const toggleDeletionMode = () => {
    setDeletionMode((prev) => !prev);
    setSelectedBizIds([]); // Reset selection on toggle
  };

  const handleSelectBiz = (id) => {
    setSelectedBizIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedBizIds.length === 0) {
      alert("Please select at least one business to delete.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:5000/api/business/dashboard/remove",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ businessIds: selectedBizIds }),
        }
      );

      const result = await res.json();
      if (result.success) {
        alert("Selected businesses deleted successfully.");
        fetchBusinesses();
        setSelectedBizIds([]);
        setDeletionMode(false);
      } else {
        alert(result.message || "Some businesses could not be removed.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-neutral-900">Businesses</h2>
        <div className="flex gap-3">
          {/* Delete Button (Primary) */}
          <button
            onClick={deletionMode ? handleDelete : toggleDeletionMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              deletionMode
                ? "bg-gradient-to-b from-red-600 to-red-800 text-white hover:shadow-md hover:from-red-700 hover:to-red-900"
                : "bg-white text-red-600 border border-red-300 hover:bg-red-50"
            }`}
          >
            <span>{deletionMode ? "Confirm Delete" : "Delete"}</span>
            <span className="hidden group-hover:inline">
              {deletionMode ? <Trash2 size={16} /> : <X size={16} />}
            </span>
          </button>

          {/* Add Button (Primary) */}
          <button
            onClick={() => window.open("Add-business", "_blank")}
            className="group flex items-center gap-2 bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white px-4 py-2 rounded-md text-sm font-medium hover:shadow-md hover:from-indigo-800 hover:to-purple-900 transition"
          >
            <span>Add Business</span>
            <Plus size={16} className="hidden group-hover:inline" />
          </button>

          {/* Search Button (Secondary) */}
          <button
            onClick={() => window.open("/search-businesses", "_blank")}
            className="group flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <span>Search</span>
            <SearchIcon size={16} className="hidden group-hover:inline" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-none border border-gray-200 w-full">
        {" "}
        {/* Full width */}
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <input
            type="text"
            placeholder="Niche"
            value={filters.niche}
            onChange={(e) => handleInputChange("niche", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-10" /* Equal height & width */
          />
          <input
            type="text"
            placeholder="Address"
            value={filters.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-10" /* Equal height & width */
          />
          <select
            value={filters.outreach}
            onChange={(e) => handleInputChange("outreach", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-10" /* Equal height & width */
          >
            <option value="">Outreach</option>
            <option value="true">Sent</option>
            <option value="false">Pending</option>
          </select>
          <button
            onClick={applyFilters}
            className="bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 transition h-10" /* Equal height */
          >
            Apply
          </button>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-10 text-gray-500">
            Loading businesses...
          </p>
        ) : businesses.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No businesses found.
          </p>
        ) : (
          <table className="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="p-2 w-4">
                  {deletionMode && (
                    <span className="text-sm text-gray-500">✓</span>
                  )}
                </th>
                <th className="p-1"></th>
                <th className="p-3">Business Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Niche</th>
                <th className="p-3">Website</th>
                <th className="p-3">Date</th>
                <th className="p-3">Outreach</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz, index) => (
                <tr
                  key={biz.businessid}
                  className="border-t border-gray-100 hover:bg-neutral-50"
                >
                  <td className="p-2 text-center">
                    {deletionMode && (
                      <input
                        type="checkbox"
                        checked={selectedBizIds.includes(biz.businessid)}
                        onChange={() => handleSelectBiz(biz.businessid)}
                      />
                    )}
                  </td>
                  <td className="p-1">{index + 1}</td>
                  <td
                    className="p-3 font-medium truncate max-w-[200px]"
                    title={biz.name}
                  >
                    <a
                      href={`/business/${biz.businessid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {biz.name}
                    </a>
                  </td>
                  <td
                    className="p-3 truncate max-w-[250px]"
                    title={biz.address}
                  >
                    {biz.address}
                  </td>
                  <td className="p-3 truncate max-w-[150px]" title={biz.niche}>
                    {biz.niche}
                  </td>
                  <td
                    className="p-3 text-blue-600 underline max-w-[200px] truncate"
                    title={biz.website}
                  >
                    <a href={biz.website} target="_blank" rel="noreferrer">
                      {biz.website}
                    </a>
                  </td>
                  <td className="p-3">
                    {new Date(biz.search_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="p-3">
                    {biz.outreach_sent ? (
                      <span className="text-green-600 font-semibold">Sent</span>
                    ) : (
                      <span className="text-yellow-500 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Businesses;
