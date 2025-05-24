import PropTypes from "prop-types";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "medium",
  className = "",
  closeOnOverlayClick = true,
}) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const sizeStyles = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => closeOnOverlayClick && onClose()}
    >
      <div
        className={`bg-white rounded-lg p-6 ${sizeStyles[size]} relative ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        {/* Modal Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
};

export default Modal;
