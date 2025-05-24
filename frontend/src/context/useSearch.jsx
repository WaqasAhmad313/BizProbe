import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/businesses/search";

export const useSearch = () => {
  const {
    searchParams,
    updateSearchParams,
    businessResults,
    updateBusinessResults,
    competitors,
    updateCompetitors,
    mapData,
    updateMapData,
  } = useContext(SearchContext);

  const navigate = useNavigate();

  // Function to perform search (calls backend)
  const performSearch = async () => {
    if (!searchParams.query || !searchParams.location) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";

      if (!token) {
        console.warn("No token found! Redirecting to login.");
        alert("You must be logged in to search.");
        navigate("/login");
        return;
      }

      // Fetch businesses, competitors, and map data from backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          keyword: searchParams.query,
          location: searchParams.location,
          radius: searchParams.radius,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Failed to fetch businesses. Status: ${response.status}, Message: ${errorText}`
        );
        throw new Error(errorText);
      }

      // Extract business, competitors, and map data from response
      const data = await response.json();

      // Validate API response structure
      if (!data || typeof data !== "object") {
        console.error("Invalid API response format!", data);
        return;
      }

      // Check businesses data type
      if (!Array.isArray(data.businesses)) {
        console.error(
          "Expected 'businesses' to be an array in useSearch but got:",
          typeof data.businesses,
          data.businesses
        );
        return;
      }

      // Ensure businesses have required fields
      data.businesses.forEach((b, index) => {
        console.log(
          `useSearch Business #${index + 1}:`,
          JSON.stringify(b, null, 2)
        );
      });

      // Set businesses state
      updateBusinessResults(data.businesses);
      console.log(
        "Raw Competitors Data from API in useSearch:",
        data.competitors
      );

      // Ensure mapData is valid before updating
      if (!data.mapData || typeof data.mapData !== "object") {
        console.warn(
          "No valid map data received in useSearch. Setting as empty object."
        );
        data.mapData = {};
      }

      // Update state with competitors and map data
      updateCompetitors(data.competitors);
      updateMapData(data.mapData);
      navigate("/business-results");
    } catch (error) {
      console.error("API Error:", error);
      alert("Error searching businesses: " + error.message);
    }
  };

  return {
    searchParams,
    updateSearchParams,
    businessResults,
    updateBusinessResults,
    competitors,
    updateCompetitors,
    mapData,
    updateMapData,
    performSearch,
  };
};
