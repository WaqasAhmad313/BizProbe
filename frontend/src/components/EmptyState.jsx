import PropTypes from "prop-types";

const EmptyState = ({ message, actionText, onActionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg shadow-sm text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M3 21L21 3"
        />
      </svg>
      <p className="text-xl text-gray-500 mb-4">{message}</p>

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onActionClick: PropTypes.func,
};

export default EmptyState;
