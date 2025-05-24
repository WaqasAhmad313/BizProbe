import PropTypes from "prop-types";

export default function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer"
        />
        <span className="text-sm font-mono">{value}</span>
      </div>
    </div>
  );
}

ColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
