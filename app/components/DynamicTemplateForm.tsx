import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveAs } from 'file-saver';
import { useToast } from '@/components/ui/use-toast';

interface TemplateInput {
  [key: string]: string | string[][];
}

interface DynamicTemplateFormProps {
  initialData: TemplateInput[];
  onSubmit: (formData: TemplateInput[]) => void;
}

function DynamicTemplateForm({
  initialData,
  onSubmit,
}: DynamicTemplateFormProps) {
  const [inputs, setInputs] = useState<TemplateInput[]>(initialData);
  const [templateName, setTemplateName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { toast } = useToast();

  const handleInputChange = (
    page: number,
    key: string,
    value: string | string[][]
  ) => {
    setInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[page] = { ...newInputs[page], [key]: value };
      return newInputs;
    });
  };

  const handleTableChange = (page: number, value: string) => {
    try {
      const tableData = JSON.parse(value);
      if (
        Array.isArray(tableData) &&
        tableData.every((row) => Array.isArray(row))
      ) {
        handleInputChange(page, 'table', tableData);
      } else {
        throw new Error('Invalid table format');
      }
    } catch (error) {
      console.error('Error parsing table data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid table format. Please enter a valid 2D array.',
      });
    }
  };

  const addPage = () => {
    setInputs((prevInputs) => [...prevInputs, {}]);
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
    const templateJSON = {
      templateName,
      inputs,
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

    // Call the onSubmit prop with the current inputs
    onSubmit(inputs);
  };

  return (
    <div className='max-w-4xl min-h-dvh overscroll-y-auto   mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Dynamic Template Form</h1>

      <div className='mb-4'>
        <Label htmlFor='templateName'>Template Name</Label>
        <Input
          id='templateName'
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder='Enter template name'
        />
      </div>

      <div className='mb-4'>
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

      <div className='mb-4'>
        <Label htmlFor='table'>Table Data (2D Array JSON)</Label>
        <Textarea
          id='table'
          value={JSON.stringify(inputs[currentPage]?.table || [], null, 2)}
          onChange={(e) => handleTableChange(currentPage, e.target.value)}
          placeholder='Enter table data as JSON (e.g., [["1","Item","1","100","100"]])'
          className='h-40'
        />
      </div>

      {inputs[currentPage] &&
        Object.entries(inputs[currentPage]).map(([key, value]) => {
          if (key !== 'table') {
            return (
              <div key={key} className='mb-4'>
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  value={value as string}
                  onChange={(e) =>
                    handleInputChange(currentPage, key, e.target.value)
                  }
                  placeholder={`Enter ${key}`}
                />
              </div>
            );
          }
          return null;
        })}

      <div className='mb-4'>
        <Label htmlFor='newField'>Add New Field</Label>
        <div className='flex gap-2'>
          <Input
            id='newField'
            placeholder='Enter new field name'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const fieldName = (e.target as HTMLInputElement).value;
                handleInputChange(currentPage, fieldName, '');
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>

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
    </div>
  );
}

export default DynamicTemplateForm;
