import { createContext, useState } from "react";
import PropTypes from "prop-types";

// eslint-disable-next-line react-refresh/only-export-components
export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // 🔹 Store search parameters (removed country field)
  const [searchParams, setSearchParams] = useState({
    query: "",
    location: "",
    radius: 5,
  });

  const [businessResults, setBusinessResults] = useState([]);
  const [competitors, setCompetitors] = useState({});
  const [mapData, setMapData] = useState({});

  // 🔹 Update search parameters safely
  const updateSearchParams = (params) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
    }));
  };

  // 🔹 Update business results safely
  const updateBusinessResults = (results = []) => {
    setBusinessResults(Array.isArray(results) ? results : []);
  };

  // 🔹 Update competitors safely
  const updateCompetitors = (data = {}) => {
    setCompetitors(
      typeof data === "object" && !Array.isArray(data) ? data : {}
    ); // ✅ Always an object
  };

  // 🔹 Update map data safely
  const updateMapData = (data = {}) => {
    setMapData(data || {}); // ✅ Always an object
  };

  // 🔹 Reset all search data safely
  const resetSearch = () => {
    setSearchParams({
      query: "",
      location: "",
      radius: 5,
    });
    setBusinessResults([]);
    setCompetitors([]);
    setMapData({});
  };

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        updateSearchParams,
        businessResults,
        updateBusinessResults,
        competitors,
        updateCompetitors,
        mapData,
        updateMapData,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
