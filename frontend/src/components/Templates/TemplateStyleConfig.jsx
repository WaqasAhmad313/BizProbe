import PropTypes from "prop-types";

const TemplateStyleConfig = ({
  onBackgroundColorChange,
  onTextColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  backgroundColor,
  textColor,
  fontSize,
  fontFamily,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Template Style Configuration
      </h3>

      {/* Background Color Selection */}
      <div className="space-y-2">
        <label
          htmlFor="backgroundColor"
          className="text-md font-medium text-gray-700"
        >
          Background Color
        </label>
        <input
          type="color"
          id="backgroundColor"
          value={backgroundColor}
          onChange={(e) => onBackgroundColorChange(e.target.value)}
          className="w-full p-3 text-sm border rounded-md"
        />
      </div>

      {/* Text Color Selection */}
      <div className="space-y-2">
        <label
          htmlFor="textColor"
          className="text-md font-medium text-gray-700"
        >
          Text Color
        </label>
        <input
          type="color"
          id="textColor"
          value={textColor}
          onChange={(e) => onTextColorChange(e.target.value)}
          className="w-full p-3 text-sm border rounded-md"
        />
      </div>

      {/* Font Size Selection */}
      <div className="space-y-2">
        <label htmlFor="fontSize" className="text-md font-medium text-gray-700">
          Font Size
        </label>
        <select
          id="fontSize"
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="border p-3 w-full text-sm rounded-md"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-2">
        <label
          htmlFor="fontFamily"
          className="text-md font-medium text-gray-700"
        >
          Font Family
        </label>
        <select
          id="fontFamily"
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="border p-3 w-full text-sm rounded-md"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      {/* Preview of Styles */}
      <div className="space-y-2 mt-4">
        <h4 className="text-md font-medium text-gray-700">Preview</h4>
        <div
          className="border p-4 rounded-md"
          style={{
            backgroundColor: backgroundColor,
            color: textColor,
            fontSize:
              fontSize === "small"
                ? "12px"
                : fontSize === "medium"
                ? "16px"
                : "20px",
            fontFamily: fontFamily,
          }}
        >
          <p className="text-center">
            This is a preview of the email template with your selected styles.
          </p>
        </div>
      </div>
    </div>
  );
};

TemplateStyleConfig.propTypes = {
  onBackgroundColorChange: PropTypes.func.isRequired,
  onTextColorChange: PropTypes.func.isRequired,
  onFontSizeChange: PropTypes.func.isRequired,
  onFontFamilyChange: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  fontSize: PropTypes.oneOf(["small", "medium", "large"]).isRequired,
  fontFamily: PropTypes.string.isRequired,
};

export default TemplateStyleConfig;
