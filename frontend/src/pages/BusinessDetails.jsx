import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BusinessDetailsPage = () => {
  const { businessid } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [scraped, setScraped] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let pollingInterval = null;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const fetchBusinessDetails = async () => {
      try {
        console.log("Fetching business details...");

        const res = await fetch(
          `http://localhost:5000/api/businesses/business/${businessid}/details`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.trim()}`,
            },
          }
        );

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        console.log("Received initial business data:", data);
        console.log("Types:", {
          details: typeof data.details,
          competitors: Array.isArray(data.competitors),
          mapData: typeof data.mapData,
          scraped: typeof data.scraped,
        });

        setDetails(data.details || null);
        setCompetitors(data.competitors || []);
        setMapData(data.mapData || null);
        setScraped(data.scraped || null);
        setLoading(false);

        console.log("Scraping status:", data.scraped?.scraping_status);

        if (!data.scraped || data.scraped.scraping_status !== "completed") {
          console.log("Scrape not completed. Starting polling...");

          pollingInterval = setInterval(async () => {
            console.log("Polling scrape status...");

            const statusRes = await fetch(
              `http://localhost:5000/api/businesses/status/${businessid}`,
              {
                headers: {
                  Authorization: `Bearer ${token.trim()}`,
                },
              }
            );

            if (statusRes.ok) {
              const { scraping_status } = await statusRes.json();
              console.log(
                "✅ Status endpoint responded with:",
                scraping_status
              );

              if (scraping_status === "completed") {
                console.log(
                  "🎯 Scrape marked completed. Stopping poll and refetching..."
                );

                clearInterval(pollingInterval);

                const reFetch = await fetch(
                  `http://localhost:5000/api/businesses/business/${businessid}/details`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token.trim()}`,
                    },
                  }
                );

                if (reFetch.ok) {
                  const reData = await reFetch.json();
                  console.log(
                    "♻️ Re-fetched business details after scrape completion:",
                    reData
                  );

                  if (reData.scraped) {
                    setScraped(reData.scraped);
                    console.log("Updated scraped data into state.");
                  } else {
                    console.warn("Re-fetch didn't contain scraped data");
                  }
                } else {
                  console.error(
                    "Failed to re-fetch business details after completion"
                  );
                }
              } else {
                console.log("Still not completed. Continue polling...");
              }
            } else {
              console.warn(
                "Polling status fetch failed:",
                await statusRes.text()
              );
            }
          }, 10000); // every 10 seconds
        }

        // Google Map Init (unchanged)
        setTimeout(() => {
          if (window.google && data.mapData) {
            console.log("🗺️ Initializing map...");

            const mapContainer = document.getElementById("map");
            if (!mapContainer) return;

            const { business, competitors } = data.mapData;
            const map = new window.google.maps.Map(mapContainer, {
              center: business.location,
              zoom: 13,
            });

            const bounds = new window.google.maps.LatLngBounds();
            const businessMarker = new window.google.maps.Marker({
              position: business.location,
              map,
              label: {
                text: business.name,
                fontWeight: "bold",
                fontSize: "14px",
                color: "#FFFFFF",
              },
              title: "Main Business",
            });

            const businessInfo = new window.google.maps.InfoWindow({
              content: `<div style="font-weight:bold;">${business.name}</div>`,
            });

            businessMarker.addListener("click", () =>
              businessInfo.open(map, businessMarker)
            );
            bounds.extend(business.location);

            competitors.forEach((comp, i) => {
              const pos = comp.location;
              const dist =
                comp.distance_km?.toFixed(2) ||
                comp.distance?.toFixed(2) ||
                "N/A";

              const marker = new window.google.maps.Marker({
                position: pos,
                map,
                label: {
                  text: comp.name,
                  fontWeight: "bold",
                  fontSize: "15px",
                  color: "#FFFFFF",
                },
                title: `${dist} km from main`,
              });

              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="font-size:14px; font-weight:bold;">${
                  comp.name
                } (C${i + 1})</div>
                            <div style="font-size:12px;">${dist} km from main</div>`,
              });

              marker.addListener("click", () => infoWindow.open(map, marker));
              bounds.extend(pos);
            });

            map.fitBounds(bounds);
          }
        }, 300);
      } catch (err) {
        console.error("❌ Error in fetchBusinessDetails:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBusinessDetails();

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [businessid, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Business Details</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded"
        >
          Dashboard
        </button>
      </div>
      {/* Business Name */}
      <h1 className="text-3xl font-bold">{details?.name}</h1>

      {/* Business Details */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p>
          <strong>Address:</strong> {details?.address}
        </p>

        <p className="flex items-center gap-2">
          <strong>Status:</strong>
          {details?.status?.toLowerCase() === "open" ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
              Open
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
              Closed
            </span>
          )}
        </p>

        <p>
          <strong>Phone:</strong> {details?.phone_number}
        </p>

        {details?.website && (
          <p>
            <strong>Website:</strong>{" "}
            <a
              href={details.website}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Visit Website
            </a>
          </p>
        )}

        <p>
          <strong>Rating:</strong> {details?.rating}
        </p>
        <p>
          <strong>Total Reviews:</strong> {details?.reviews_count}
        </p>

        {/* Opening Hours */}
        {details?.opening_hours && (
          <div>
            <strong>Opening Hours:</strong>
            <ul className="list-disc ml-6 mt-1 text-sm">
              {Object.entries(details.opening_hours).map(
                ([day, hours], idx) => (
                  <li key={idx}>
                    <strong>{day}:</strong> {hours}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Reviews */}
        {details?.reviews?.length > 0 && (
          <div className="pt-4">
            <h3 className="text-lg font-semibold">Latest Reviews</h3>
            {details.reviews.slice(0, 3).map((review, idx) => (
              <div key={idx} className="border p-3 rounded mt-2">
                <p className="font-medium">{review.author_name}</p>
                <p className="text-sm text-gray-500">{review.time}</p>
                <p className="mt-1">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scraped Info */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-2xl font-semibold mb-2">Scraped Information</h2>
        {!scraped || scraped.scraping_status !== "completed" ? (
          <p className="text-gray-500 italic">Scraping in progress...</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div>
              <strong>Emails:</strong>{" "}
              {scraped.email?.length
                ? scraped.email.join(", ")
                : "No emails found"}
            </div>
            <div>
              <strong>Social Media:</strong>{" "}
              {scraped.social_media && Object.keys(scraped.social_media).length
                ? Object.entries(scraped.social_media).map(
                    ([label, url], index) => (
                      <div key={index}>
                        <strong>{label}:</strong>{" "}
                        <a
                          href={url}
                          target="_blank" // Opens link in a new tab
                          rel="noopener noreferrer" // For security
                          style={{ color: "blue", textDecoration: "underline" }} // Optional styling
                        >
                          {url}
                        </a>
                      </div>
                    )
                  )
                : "None"}
            </div>
            <div>
              <strong>Logo:</strong>{" "}
              {scraped.logo_url ? (
                <img
                  src={scraped.logo_url}
                  alt="Logo"
                  style={{ maxWidth: "200px", height: "auto" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/200";
                  }}
                />
              ) : (
                "None"
              )}
            </div>
            <div>
              <strong>Services Images:</strong>{" "}
              {scraped.service_images?.length
                ? scraped.service_images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Service Image ${index + 1}`}
                      style={{
                        maxWidth: "200px",
                        height: "auto",
                        margin: "5px",
                      }} // Optional styling
                    />
                  ))
                : "None"}
            </div>
            <div>
              <strong>Business Directories:</strong>{" "}
              {scraped.directories && Object.keys(scraped.directories).length
                ? Object.entries(scraped.directories).map(
                    ([label, url], index) => (
                      <div key={index}>
                        <strong>{label}:</strong>{" "}
                        <a
                          href={url}
                          target="_blank" // Opens link in a new tab
                          rel="noopener noreferrer" // For security
                          style={{ color: "blue", textDecoration: "underline" }} // Optional styling
                        >
                          {url}
                        </a>
                      </div>
                    )
                  )
                : "None"}
            </div>
          </div>
        )}
      </div>

      {/* Competitors */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-2xl font-semibold mb-4">Competitors</h2>
        {competitors.length > 0 ? (
          competitors.map((c, i) => (
            <div key={i} className="p-4 border rounded mb-4">
              <h3 className="text-lg font-semibold mb-1">
                Competitor 0{i + 1}: {c.name}
              </h3>

              <p className="flex items-center gap-2">
                <strong>Status:</strong>
                {c.status?.toLowerCase() === "open" ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    Open
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    Closed
                  </span>
                )}
              </p>

              <p>
                <strong>Address:</strong> {c.address}
              </p>
              <p>
                <strong>Phone:</strong> {c.phone_number}
              </p>

              {c.website && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit Website
                  </a>
                </p>
              )}

              <p>
                <strong>Category:</strong> {c.category}
              </p>
              <p>
                <strong>Rating:</strong> {c.rating}
              </p>
              <p>
                <strong>Review Count:</strong> {c.reviews_count}
              </p>
              <p>
                <strong>Distance:</strong> {c.distance_km?.toFixed(2)} km from
                main business
              </p>
            </div>
          ))
        ) : (
          <p>No competitors found.</p>
        )}
      </div>

      {/* Map View */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-2xl font-semibold mb-2">Map View</h2>
        {!mapData ? (
          <p>Loading map...</p>
        ) : (
          <div id="map" className="h-96 w-full rounded shadow" />
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsPage;
