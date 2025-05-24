import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

ButtonEditor.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      bgColor: PropTypes.string.isRequired,
      borderRadius: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ButtonEditor.defaultProps = {
  disabled: false,
};

export default function ButtonEditor({ buttons, onChange, disabled }) {
  const updateButton = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    onChange(newButtons);
  };

  const addButton = () => {
    onChange([
      ...buttons,
      {
        text: "New Button",
        url: "#",
        color: "#ffffff",
        bgColor: "#3B82F6",
        borderRadius: "4px",
      },
    ]);
  };

  const removeButton = (index) => {
    onChange(buttons.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-6">
      <label className="block font-medium mb-2">Call-to-Action Buttons</label>
      {buttons.map((btn, index) => (
        <div key={index} className="p-4 border rounded-md mb-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm mb-1">Button Text</label>
              <input
                type="text"
                value={btn.text}
                onChange={(e) => updateButton(index, "text", e.target.value)}
                className="w-full p-2 border rounded"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                URL (use {"{{placeholders}}"})
              </label>
              <input
                type="text"
                value={btn.url}
                onChange={(e) => updateButton(index, "url", e.target.value)}
                className="w-full p-2 border rounded"
                disabled={disabled}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <ColorPicker
              label="Text Color"
              value={btn.color}
              onChange={(color) => updateButton(index, "color", color)}
              disabled={disabled}
            />
            <ColorPicker
              label="BG Color"
              value={btn.bgColor}
              onChange={(color) => updateButton(index, "bgColor", color)}
              disabled={disabled}
            />
            <div>
              <label className="block text-sm mb-1">Border Radius (px)</label>
              <input
                type="number"
                value={parseInt(btn.borderRadius || "0")}
                onChange={(e) =>
                  updateButton(index, "borderRadius", `${e.target.value}px`)
                }
                className="w-full p-2 border rounded"
                disabled={disabled}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeButton(index)}
            className="text-red-500 text-sm hover:text-red-700"
            disabled={disabled}
          >
            Remove Button
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addButton}
        className="mt-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        disabled={disabled}
      >
        + Add Button
      </button>
    </div>
  );
}
