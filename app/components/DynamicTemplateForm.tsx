'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveAs } from 'file-saver';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateField {
  templateName?: string;
  value: string | string[][];
  include: boolean;
  type?: string;
  content?: string | string[][];
}

interface TemplateInput {
  [key: string]: TemplateField;
}

interface DynamicTemplateFormProps {
  initialData: TemplateInput[];
  initialTemplateName: string;
  onSubmit: (formData: TemplateInput[]) => void;
}

function DynamicTemplateForm({
  initialTemplateName,
  initialData,
  onSubmit,
}: DynamicTemplateFormProps) {
  const [inputs, setInputs] = useState<TemplateInput[]>([]);
  const [templateName, setTemplateName] = useState<string>(initialTemplateName);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData.length > 0) {
      const processedData = initialData.map((page) => {
        return Object.entries(page).reduce((acc, [key, field]) => {
          if (field.type === 'table') {
            // テーブルデータの処理
            let tableContent: string[][];
            if (Array.isArray(field.value)) {
              if (field.value.length > 0 && Array.isArray(field.value[0])) {
                tableContent = field.value as string[][];
              } else {
                tableContent = field.value as string[][];
              }
            } else {
              tableContent = [['']];
            }
            acc[key] = {
              templateName: templateName,
              value: tableContent,
              include: true,
              type: 'table',
              content: tableContent,
            };
          } else {
            // その他のフィールドの処理
            acc[key] = {
              templateName: templateName,
              value: typeof field.value === 'string' ? field.value : '',
              include: true,
              type: field.type,
              content: field.content,
            };
          }
          return acc;
        }, {} as TemplateInput);
      });
      setInputs(processedData);
    } else {
      // 初期データがない場合のデフォルト値
      setInputs([
        {
          table: {
            value: [['Column1'], ['Value1']],
            include: true,
            type: 'table',
            content: [['Column1'], ['Value1']],
          },
        },
      ]);
    }
  }, [initialData, templateName]);

  const handleInputChange = (
    page: number,
    key: string,
    value: string | string[][],
    include: boolean
  ) => {
    setInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[page] = {
        ...newInputs[page],
        [key]: { ...newInputs[page][key], value, include, content: value },
      };
      return newInputs;
    });
  };
  const handleTableChange = (page: number, newValue: string[][]) => {
    handleInputChange(page, 'table', newValue, inputs[page]['table'].include);
  };

  const addPage = () => {
    setInputs((prevInputs) => [
      ...prevInputs,
      Object.keys(prevInputs[0]).reduce((acc, key) => {
        acc[key] = { value: '', include: false };
        return acc;
      }, {} as TemplateInput),
    ]);
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const removePage = (pageIndex: number) => {
    if (inputs.length > 1) {
      setInputs((prevInputs) =>
        prevInputs.filter((_, index) => index !== pageIndex)
      );
      setCurrentPage((prevPage) =>
        prevPage >= pageIndex ? prevPage - 1 : prevPage
      );
    }
  };

  const generateJSON = () => {
    const processedInputs = inputs.map((page) =>
      Object.entries(page).reduce((acc, [key, { value, include }]) => {
        if (include) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: string | string[][] })
    );

    const templateJSON = {
      templateName,
      inputs: processedInputs,
    };

    const blob = new Blob([JSON.stringify(templateJSON, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'template_inputs.json');

    toast({
      variant: 'success',
      title: 'Template JSON generated!',
      description: 'The JSON file has been downloaded.',
    });

    onSubmit(inputs);
  };

  //pdfganerateapi
  const generatePDF = async () => {
    const processedInputs = inputs.map((page) =>
      Object.entries(page).reduce((acc, [key, { value, include }]) => {
        if (include) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: string | string[][] })
    );

    const templateJSON = {
      templateName,
      inputs: processedInputs,
    };

    try {
      const response = await fetch('/api/pdf-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateJSON),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      saveAs(blob, `${templateName || 'generated'}.pdf`);

      toast({
        variant: 'success',
        title: 'PDF generated successfully!',
        description: 'The PDF file has been downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating PDF',
        description:
          'An error occurred while generating the PDF. Please try again.',
      });
    }
  };

  return (
    <div>
      <ScrollArea className='w-full h-[700px] mx-auto p-4'>
        <div className='p-4 gap-4'>
          <h1 className='text-2xl font-bold mb-4'>Dynamic Template Form</h1>

          <div className='mb-4 gap-4'>
            <Label htmlFor='templateName'>Template Name</Label>
            <Input
              id='templateName'
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder='Enter template name'
            />
          </div>

          <div className='mb-4 gap-4'>
            <Select
              value={currentPage.toString()}
              onValueChange={(value) => setCurrentPage(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select page' />
              </SelectTrigger>
              <SelectContent>
                {inputs.map((_, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    Page {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {inputs[currentPage] &&
            Object.entries(inputs[currentPage]).map(([key, field]) => (
              <div key={key} className='mb-4'>
                <div className='flex items-center gap-2'>
                  <Label htmlFor={key}>{key}</Label>
                  <Checkbox
                    id={`${key}-include`}
                    checked={field.include}
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        currentPage,
                        key,
                        field.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`${key}-include`}>Include in JSON</Label>
                </div>
                {field.type === 'table' ? (
                  <Textarea
                    id={key}
                    value={field.value as string}
                    onChange={(e) =>
                      handleInputChange(
                        currentPage,
                        key,
                        e.target.value,
                        field.include
                      )
                    }
                    placeholder={`Enter ${key}`}
                  />
                ) : (
                  <Input
                    id={key}
                    value={field.value as string}
                    onChange={(e) =>
                      handleInputChange(
                        currentPage,
                        key,
                        e.target.value,
                        field.include
                      )
                    }
                    placeholder={`Enter ${key}`}
                  />
                )}
              </div>
            ))}
          <div className='mb-4'>
            <Label htmlFor='newField'>Add New Field</Label>
            <div className='flex gap-2'>
              <Input
                id='newField'
                placeholder='Enter new field name'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const fieldName = (e.target as HTMLInputElement).value;
                    handleInputChange(currentPage, fieldName, '', true);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className='flex gap-2 mb-4'>
        <Button onClick={addPage}>Add Page</Button>
        <Button
          onClick={() => removePage(currentPage)}
          disabled={inputs.length === 1}
        >
          Remove Current Page
        </Button>
      </div>

      <Button onClick={generateJSON}>Generate JSON</Button>
      <Button onClick={generatePDF}>Submit</Button>
    </div>
  );
}

export default DynamicTemplateForm;
