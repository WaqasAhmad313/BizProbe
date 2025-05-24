import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

export default function StyleControls({ style, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...style, [field]: value });
  };

  return (
    <div className="mb-6">
      <label className="block font-medium mb-2">Email Styling</label>
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Background Color"
          value={style.contentBgColor}
          onChange={(color) => handleChange("contentBgColor", color)}
        />
        <ColorPicker
          label="Text Color"
          value={style.textColor}
          onChange={(color) => handleChange("textColor", color)}
        />
        <ColorPicker
          label="Border Color"
          value={style.borderColor}
          onChange={(color) => handleChange("borderColor", color)}
        />
        <div>
          <label className="block text-sm mb-1">Border Width (px)</label>
          <input
            type="number"
            value={parseInt(style.borderWidth || "1")}
            onChange={(e) => handleChange("borderWidth", `${e.target.value}px`)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Border Radius (px)</label>
          <input
            type="number"
            value={parseInt(style.borderRadius || "8")}
            onChange={(e) =>
              handleChange("borderRadius", `${e.target.value}px`)
            }
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );
}

StyleControls.propTypes = {
  style: PropTypes.shape({
    contentBgColor: PropTypes.string,
    textColor: PropTypes.string,
    borderColor: PropTypes.string,
    borderWidth: PropTypes.string,
    borderRadius: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
