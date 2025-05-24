import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Globe, Info, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const BusinessCard = ({ business, competitors, mapData }) => {
  const filteredCompetitors = competitors || [];

  return (
    <SingleBusinessCard
      business={business}
      mapData={mapData}
      competitors={filteredCompetitors}
    />
  );
};

const SingleBusinessCard = ({ business, mapData, competitors }) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (!mapData?.business?.location || !mapRef.current) {
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error("GoMaps API is not available!");
      setMapError("GoMaps API not loaded");
      return;
    }

    initializeMap();

    function initializeMap() {
      try {
        mapRef.current.innerHTML = "";
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapData.business.location,
          zoom: 14,
        });

        new window.google.maps.Marker({
          position: mapData.business.location,
          map,
          label: "B",
          title: mapData.business.name,
        });

        if (Array.isArray(mapData.competitors)) {
          mapData.competitors.forEach((comp, index) => {
            if (comp.location) {
              new window.google.maps.Marker({
                position: comp.location,
                map,
                label: "C" + (index + 1),
                title: comp.name,
              });
            }
          });
        }
      } catch (error) {
        console.error("Map Initialization Error:", error);
        setMapError("Failed to load map");
      }
    }
  }, [mapData, mapData.business, mapData.competitors]);

  return (
    <Card className="flex flex-col md:flex-row w-full max-w-5xl p-6">
      <div className="flex flex-col md:flex-row w-full rounded-2xl border border-black">
        <div className="flex flex-col justify-between p-6 space-y-4 w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">
              {business.name}
            </h2>

            {business.status && (
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold mt-2 rounded-full ${
                  business.status === "Open"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"

                  //</div>  ? "bg-green-100 text-green-700"
                  //  : "bg-red-100 text-red-700"
                }`}
              >
                {business.status}
              </span>
            )}

            {business.address && (
              <p className="mt-4 text-gray-700">
                <strong className="text-gray-900">Address:</strong>{" "}
                {business.address}
              </p>
            )}

            {business.phonenumbers && (
              <p className="mt-2 text-gray-700">
                <strong className="text-gray-900">Phone:</strong>{" "}
                {business.phonenumbers}
              </p>
            )}

            {business.rating !== undefined && (
              <div className="mt-2">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Rating:</strong>
                  <span className="text-yellow-500 font-semibold">
                    {" "}
                    {business.rating}/5{" "}
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Reviews:</strong>{" "}
                  {business.reviewscount}
                </p>
              </div>
            )}

            {business.category && (
              <p className="mt-2 text-gray-700">
                <strong className="text-gray-900">Category:</strong>{" "}
                {business.category}
              </p>
            )}

            {competitors.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                  Competitors
                </h3>
                <ol className="list-decimal pl-5 mt-2 text-gray-700">
                  {competitors.map((comp, index) => (
                    <li key={index} className="mt-1">
                      {comp.name} ({comp.distance_km.toFixed(2)} km)
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="flex justify-start gap-2 pt-4">
            <Link to={`/business/${business.businessid}`}>
              <Button variant="outline" className="flex items-center">
                <Info className="w-4 h-4 mr-1" /> Details
              </Button>
            </Link>

            {business.profileurl && (
              <a
                href={business.profileurl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> View Profile
                </Button>
              </a>
            )}

            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="default" className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" /> Visit Website
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          {mapError ? (
            <div className="text-red-500 text-sm p-4 w-full h-full flex items-center justify-center border border-red-500 rounded-lg">
              {mapError}
            </div>
          ) : (
            <div
              ref={mapRef}
              className="w-full h-full min-h-[200px] md:min-h-[250px] rounded-lg border"
            ></div>
          )}
        </div>
      </div>
    </Card>
  );
};

BusinessCard.propTypes = {
  business: PropTypes.shape({
    businessid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
    phone: PropTypes.string,
    status: PropTypes.string,
    distance: PropTypes.number,
    rating: PropTypes.number,
    reviewscount: PropTypes.number,
    address: PropTypes.string,
    website: PropTypes.string,
    niche: PropTypes.string,
  }).isRequired,
  mapData: PropTypes.shape({
    business: PropTypes.shape({
      name: PropTypes.string.isRequired,
      location: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    }),
    competitors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        location: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
      })
    ),
  }).isRequired,
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

SingleBusinessCard.propTypes = BusinessCard.propTypes;

export default BusinessCard;

/*import PropTypes from "prop-types";

const BusinessCard = ({ business, competitors = [], mapData = {} }) => {
  if (!business) return null;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">{business.name}</h2>
      <p className="text-gray-600">{business.address}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Top Competitors:</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {competitors.length > 0 ? (
            competitors.map((comp, i) => (
              <li key={i}>
                {comp.name} — {comp.distance_km} km away
              </li>
            ))
          ) : (
            <li>No competitors found</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Map Data:</h3>
        {mapData?.business ? (
          <div className="text-sm">
            Location: {mapData.business.location?.lat},{" "}
            {mapData.business.location?.lng}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No map data</p>
        )}
      </div>
    </div>
  );
};

BusinessCard.propTypes = {
  business: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
  }),
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      distance_km: PropTypes.number,
    })
  ),
  mapData: PropTypes.shape({
    business: PropTypes.shape({
      name: PropTypes.string,
      location: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
      }),
    }),
    competitors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        location: PropTypes.shape({
          lat: PropTypes.number,
          lng: PropTypes.number,
        }),
      })
    ),
  }),
};

export default BusinessCard;
*/
