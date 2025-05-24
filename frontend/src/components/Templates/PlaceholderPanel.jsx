import PropTypes from "prop-types";
import Button from "@/components/ui/Button";

const PlaceholderPanel = ({ onAddPlaceholder }) => {
  const placeholders = [
    { key: "Name", label: "Name" },
    { key: "Address", label: "Address" },
    { key: "Phonenumber", label: "Phone Number" },
    { key: "Website", label: "Website" },
    { key: "Rating", label: "Rating" },
    { key: "Reviews_count", label: "Reviews Count" },
    { key: "Niche", label: "Niche" },
    { key: "Logo", label: "Logo" },
    { key: "Social_media_links", label: "Social Media Links" },
    { key: "Service_images", label: "Service Images" },
    { key: "Team_names", label: "Team Names" },
    { key: "Directories", label: "Directories" },
    { key: "Competitors1_name", label: "Competitor 1 Name" },
    { key: "Competitors2_name", label: "Competitor 2 Name" },
    { key: "Competitors3_name", label: "Competitor 3 Name" },
    { key: "Competitors1_Distance", label: "Competitor 1 Distance" },
    { key: "Competitors2_Distance", label: "Competitor 2 Distance" },
    { key: "Competitors3_Distance", label: "Competitor 3 Distance" },
    { key: "Competitors1_Website", label: "Competitor 1 Website" },
    { key: "Competitors2_Website", label: "Competitor 2 Website" },
    { key: "Competitors3_Website", label: "Competitor 3 Website" },
    { key: "Competitors1_Rating", label: "Competitor 1 Rating" },
    { key: "Competitors2_Rating", label: "Competitor 2 Rating" },
    { key: "Competitors3_Rating", label: "Competitor 3 Rating" },
  ];

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Available Placeholders
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {placeholders.map((placeholder) => (
          <div
            key={placeholder.key}
            className="flex items-center justify-between bg-gray-50 border p-2 rounded"
          >
            <span className="text-sm font-medium text-gray-700">
              {placeholder.label}
            </span>
            <Button
              size="small"
              variant="outline"
              onClick={() => onAddPlaceholder(placeholder.key)}
            >
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

PlaceholderPanel.propTypes = {
  onAddPlaceholder: PropTypes.func.isRequired,
};

export default PlaceholderPanel;
