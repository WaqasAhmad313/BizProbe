import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";

const MapView = ({ businesses }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new atlas.Map(mapRef.current, {
      center: [72.8777, 19.076], // default center
      zoom: 10,
      language: "en-US",
      authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: "YOUR_AZURE_MAPS_SUBSCRIPTION_KEY",
      },
    });

    mapInstance.current.events.add("ready", () => {
      // Add Map controls for style switching
      mapInstance.current.controls.add(new atlas.control.StyleControl({}), {
        position: "top-right",
      });

      const datasource = new atlas.source.DataSource();
      mapInstance.current.sources.add(datasource);

      // Add all pins as features
      businesses.forEach((biz) => {
        const point = new atlas.data.Point([
          biz.location.lng,
          biz.location.lat,
        ]);
        const feature = new atlas.data.Feature(point, { title: biz.name });
        datasource.add(feature);
      });

      // Symbol layer with red pins and labels
      const symbolLayer = new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
          image: "pin-round-red",
          allowOverlap: true, // ensures icons always show without zoom dependency
        },
        textOptions: {
          textField: ["get", "title"],
          offset: [0, 1.2],
          allowOverlap: true,
        },
      });

      mapInstance.current.layers.add(symbolLayer);

      // Optional: fit map to bounds covering all pins
      if (businesses.length > 0) {
        const bounds = new atlas.data.BoundingBox.fromData(
          businesses.map(
            (biz) => new atlas.data.Point([biz.location.lng, biz.location.lat])
          )
        );
        mapInstance.current.setCamera({
          bounds,
          padding: 50,
        });
      }
    });

    return () => {
      mapInstance.current && mapInstance.current.dispose();
    };
  }, [businesses]);

  return <div ref={mapRef} className="w-full h-[600px] rounded-xl shadow-md" />;
};

// ✅ PropTypes validation
MapView.propTypes = {
  businesses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      location: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
};

export default MapView;
