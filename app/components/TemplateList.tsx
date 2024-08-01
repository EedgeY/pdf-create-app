import { Button } from '@/components/ui/button';
import React from 'react';

interface PdfData {
  _id: string;
  name: string;
  data: any;
}

interface TemplateListProps {
  templates: PdfData[];
  onLoadTemplate: (name: string) => void;
}
const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onLoadTemplate,
}) => {
  return (
    <div>
      {templates.map((template) => (
        <Button
          key={template._id}
          onClick={() => onLoadTemplate(template.name)}
        >
          {template.name}
        </Button>
      ))}
    </div>
  );
};

export default TemplateList;
