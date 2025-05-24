import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

const TemplateCard = ({ template, onView, onEdit }) => {
  return (
    <Card className="rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 p-5 flex flex-col justify-between bg-white h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">
          {template.template_name}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium text-gray-700">Subject:</span>{" "}
          {template.subject}
        </p>
        <p className="text-xs text-gray-500">
          Created on:{" "}
          {new Date(template.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <CardContent className="flex gap-3 p-0">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 border-gray-300 hover:border-gray-400"
          onClick={() => onView(template)}
        >
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => onEdit(template)}
        >
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </CardContent>
    </Card>
  );
};

TemplateCard.propTypes = {
  template: PropTypes.shape({
    template_name: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default TemplateCard;
