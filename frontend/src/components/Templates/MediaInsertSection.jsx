import PropTypes from "prop-types";
import Button from "@/components/ui/Button";

const MediaInsertSection = ({
  onAddMediaPlaceholder,
  onUploadMedia,
  mediaPlaceholders,
  onMediaDescriptionChange,
  mediaDescription,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Media Insert Section
      </h3>

      {/* Media Placeholder Selection */}
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-700">
          Choose Media Placeholder
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {mediaPlaceholders.map((placeholder) => (
            <Button
              key={placeholder.key}
              size="small"
              variant="outline"
              onClick={() => onAddMediaPlaceholder(placeholder.key)}
            >
              {placeholder.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Media Upload Section */}
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-700">
          Upload Your Own Media
        </h4>
        <input
          type="file"
          accept="image/*, video/*"
          onChange={onUploadMedia}
          className="border rounded p-2 text-sm"
        />
      </div>

      {/* Media Description */}
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-700">
          Describe Media Content
        </h4>
        <textarea
          value={mediaDescription}
          onChange={(e) => onMediaDescriptionChange(e.target.value)}
          placeholder="Write a brief description of your media content"
          rows={4}
          className="border p-3 w-full text-sm rounded-md"
        />
      </div>
    </div>
  );
};

MediaInsertSection.propTypes = {
  onAddMediaPlaceholder: PropTypes.func.isRequired,
  onUploadMedia: PropTypes.func.isRequired,
  mediaPlaceholders: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onMediaDescriptionChange: PropTypes.func.isRequired,
  mediaDescription: PropTypes.string.isRequired,
};

export default MediaInsertSection;
