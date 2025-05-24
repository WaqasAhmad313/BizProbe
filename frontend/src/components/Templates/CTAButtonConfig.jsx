import PropTypes from "prop-types";
import Button from "@/components/ui/Button";

const CTAButtonConfig = ({
  onButtonTextChange,
  onButtonLinkChange,
  onButtonStyleChange,
  onButtonSizeChange,
  onButtonColorChange,
  buttonText,
  buttonLink,
  buttonStyle,
  buttonSize,
  buttonColor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        CTA Button Configuration
      </h3>

      {/* Button Text Input */}
      <div className="space-y-2">
        <label
          htmlFor="buttonText"
          className="text-md font-medium text-gray-700"
        >
          Button Text
        </label>
        <input
          type="text"
          id="buttonText"
          value={buttonText}
          onChange={(e) => onButtonTextChange(e.target.value)}
          placeholder="Enter button text"
          className="border p-3 w-full text-sm rounded-md"
        />
      </div>

      {/* Button Link Input */}
      <div className="space-y-2">
        <label
          htmlFor="buttonLink"
          className="text-md font-medium text-gray-700"
        >
          Button Link
        </label>
        <input
          type="url"
          id="buttonLink"
          value={buttonLink}
          onChange={(e) => onButtonLinkChange(e.target.value)}
          placeholder="Enter URL"
          className="border p-3 w-full text-sm rounded-md"
        />
      </div>

      {/* Button Style Selection */}
      <div className="space-y-2">
        <label
          htmlFor="buttonStyle"
          className="text-md font-medium text-gray-700"
        >
          Button Style
        </label>
        <select
          id="buttonStyle"
          value={buttonStyle}
          onChange={(e) => onButtonStyleChange(e.target.value)}
          className="border p-3 w-full text-sm rounded-md"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="danger">Danger</option>
        </select>
      </div>

      {/* Button Size Selection */}
      <div className="space-y-2">
        <label
          htmlFor="buttonSize"
          className="text-md font-medium text-gray-700"
        >
          Button Size
        </label>
        <select
          id="buttonSize"
          value={buttonSize}
          onChange={(e) => onButtonSizeChange(e.target.value)}
          className="border p-3 w-full text-sm rounded-md"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Button Color Selection */}
      <div className="space-y-2">
        <label
          htmlFor="buttonColor"
          className="text-md font-medium text-gray-700"
        >
          Button Color
        </label>
        <input
          type="color"
          id="buttonColor"
          value={buttonColor}
          onChange={(e) => onButtonColorChange(e.target.value)}
          className="w-full p-3 text-sm border rounded-md"
        />
      </div>

      {/* Preview of the Button */}
      <div className="space-y-2 mt-4">
        <h4 className="text-md font-medium text-gray-700">Preview of Button</h4>
        <Button
          size={buttonSize}
          variant={buttonStyle}
          style={{ backgroundColor: buttonColor }}
        >
          {buttonText || "Preview Button"}
        </Button>
      </div>
    </div>
  );
};

CTAButtonConfig.propTypes = {
  onButtonTextChange: PropTypes.func.isRequired,
  onButtonLinkChange: PropTypes.func.isRequired,
  onButtonStyleChange: PropTypes.func.isRequired,
  onButtonSizeChange: PropTypes.func.isRequired,
  onButtonColorChange: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonLink: PropTypes.string.isRequired,
  buttonStyle: PropTypes.oneOf(["primary", "secondary", "outline", "danger"])
    .isRequired,
  buttonSize: PropTypes.oneOf(["small", "medium", "large"]).isRequired,
  buttonColor: PropTypes.string.isRequired,
};

export default CTAButtonConfig;
