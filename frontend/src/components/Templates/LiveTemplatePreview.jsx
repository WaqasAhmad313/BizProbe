import PropTypes from "prop-types";

const LiveTemplatePreview = ({
  subject,
  body,
  backgroundColor,
  textColor,
  fontSize,
  fontFamily,
  media,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      {/* Subject Preview */}
      <h3
        className="text-xl font-semibold mb-4"
        style={{
          color: textColor,
          fontFamily: fontFamily,
        }}
      >
        {subject}
      </h3>

      {/* Body Preview */}
      <div
        className="text-sm leading-relaxed mb-4"
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
        <div dangerouslySetInnerHTML={{ __html: body }}></div>
      </div>

      {/* Media Preview */}
      {media && media.url && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700">Media Preview</h4>
          <img
            src={media.url}
            alt={media.altText || "Media"}
            className="mt-2 rounded-md max-w-full"
            style={{ maxHeight: "300px", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Button (CTA) Preview */}
      <div className="mt-4 text-center">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: "#4B89FF",
            color: "#FFFFFF",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "4px",
            fontFamily: fontFamily,
          }}
        >
          Call to Action
        </button>
      </div>
    </div>
  );
};

LiveTemplatePreview.propTypes = {
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  fontSize: PropTypes.oneOf(["small", "medium", "large"]).isRequired,
  fontFamily: PropTypes.string.isRequired,
  media: PropTypes.shape({
    url: PropTypes.string,
    altText: PropTypes.string,
  }),
};

export default LiveTemplatePreview;
