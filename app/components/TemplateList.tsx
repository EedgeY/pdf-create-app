'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { List } from 'lucide-react';
import React, { useState } from 'react';

interface PdfData {
  _id: string;
  name: string;
  data: any;
  updated_at: string;
}

interface TemplateListProps {
  templates: PdfData[];
  onLoadTemplate: (name: string) => void;
}
const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onLoadTemplate,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const handleTemplateLoad = (name: string) => {
    onLoadTemplate(name);
    setIsSheetOpen(false);
  };
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger
              onClick={() => setIsSheetOpen(true)}
              className='size-sm bg-primary text-white  rounded-md flex justify-center items-center'
            >
              <List className='w-5 h-5 text-fuchsia-600 font-bold' />
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>テンプレートリスト</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>テンプレート一覧</SheetTitle>
        </SheetHeader>

        <ScrollArea className='w-full h-[80%] '>
          <div className='flex flex-col items-center py-4 gap-6'>
            {templates.map((template) => (
              <div
                onClick={() => handleTemplateLoad(template.name)}
                key={template._id}
                className='flex-shrink-0 w-full text-center hover:bg-muted-foreground  border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-4 py-2 rounded-md'
              >
                {template.name}
                {template.updated_at}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateList;
