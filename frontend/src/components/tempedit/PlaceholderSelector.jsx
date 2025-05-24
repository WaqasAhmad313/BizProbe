import PropTypes from "prop-types";

export const PLACEHOLDERS = [
  { key: "Name", label: "Name" },
  { key: "Address", label: "Address" },
  { key: "Phonenumber", label: "Phone Number" },
  { key: "Website", label: "Website" },
  { key: "Rating", label: "Rating" },
  { key: "Reviews_count", label: "Reviews Count" },
  { key: "Niche", label: "Niche" },
  { key: "Logo", label: "Logo" },
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

/* eslint-disable react-refresh/only-export-components */
export default function PlaceholderSelector({ selected, onChange }) {
  const togglePlaceholder = (key) => {
    const newSelection = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(newSelection);
  };

  return (
    <div className="mb-6">
      <label className="block font-medium mb-2">Available Placeholders</label>
      <div className="flex flex-wrap gap-2">
        {PLACEHOLDERS.map((ph) => (
          <button
            key={ph.key}
            type="button"
            onClick={() => togglePlaceholder(ph.key)}
            className={`px-3 py-1 rounded-md text-sm ${
              selected.includes(ph.key)
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            {ph.label}
          </button>
        ))}
      </div>
    </div>
  );
}

PlaceholderSelector.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
