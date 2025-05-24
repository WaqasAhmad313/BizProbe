import PropTypes from "prop-types";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onOpenChange}
    >
      <div
        className="relative z-60 bg-white rounded-lg shadow-xl p-4 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export const DialogContent = ({ children, className = "" }) => (
  <div className={`w-full ${className}`}>{children}</div>
);

DialogContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

DialogHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export const DialogTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);

DialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const DialogFooter = ({ children, className = "" }) => (
  <div className={`mt-6 flex justify-end space-x-2 ${className}`}>
    {children}
  </div>
);

DialogFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Dialog;
