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
    <div className='flex items-center overflow-x-auto py-4 gap-6'>
      {templates.map((template) => (
        <div
          onClick={() => onLoadTemplate(template.name)}
          key={template._id}
          className='flex-shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-4 py-2 rounded-md'
        >
          {template.name}
        </div>
      ))}
    </div>
  );
};

export default TemplateList;
