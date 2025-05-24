import PropTypes from "prop-types";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

const TemplateViewModal = ({ open, onClose, template }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Subject</p>
            <p className="text-gray-800 border p-3 rounded">
              {template.subject}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Content</p>
            <div
              className="border p-3 rounded text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => console.log("Edit clicked")}>
            Edit Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

TemplateViewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};

export default TemplateViewModal;
