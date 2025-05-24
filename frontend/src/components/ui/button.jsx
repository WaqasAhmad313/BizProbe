import PropTypes from "prop-types";
import { FiLoader } from "react-icons/fi";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  isLoading = false,
  icon: Icon,
  disabled = false,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-md transition";
  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };
  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
    secondary:
      "bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500",
    outline:
      "border border-gray-600 text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500",
  };

  const disabledStyles = disabled
    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
    : "";

  const loadingStyles = isLoading
    ? "bg-gray-300 text-gray-500 cursor-wait"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${loadingStyles} ${className}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <FiLoader className="animate-spin" />
      ) : (
        Icon && <Icon className="mr-2" />
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "outline"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  isLoading: PropTypes.bool,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
