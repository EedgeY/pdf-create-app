import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PdfCodeDisplayProps {
  inputs: any[];
  templateName: string;
}

const PdfCodeDisplay: React.FC<PdfCodeDisplayProps> = ({
  inputs,
  templateName,
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const pdfGenerationCode = `
  const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
async function generatePdf() {
  try {
    const response = await fetch("https://pdf-create-server-node.onrender.com/v1/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateName: "${templateName}",
        inputs: ${JSON.stringify(inputs, null, 2)},
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`HTTP error! status: \${response.status}, message: \${errorData.message}\`);
    }
    const pdfBlob = await response.blob();
    console.log("PDF generated successfully");
    return pdfBlob;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}

(async () => {
  try {
    const pdf = await generatePdf();
    if (pdf) {
      const arrayBuffer = await pdf.arrayBuffer();
      const fileName = \`\${Date.now()}.pdf\`;
      const filePath = path.join(process.cwd(), fileName);
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      console.log(\`PDF saved to: \${filePath}\`);
      console.log('You can now use the command "open ." to open the folder containing the PDF.');
    }
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
  }
})();
`.trim();

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(pdfGenerationCode).then(
      () => {
        setIsCopied(true);
        toast({
          title: 'Code copied!',
          description:
            'The PDF generation code has been copied to your clipboard.',
          duration: 3000,
        });
        setTimeout(() => setIsCopied(false), 3000);
      },
      (err) => {
        console.error('Failed to copy code: ', err);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy the code. Please try again.',
          variant: 'destructive',
        });
      }
    );
  }, [pdfGenerationCode, toast]);

  return (
    <div className='mt-4'>
      <h2 className='text-lg font-semibold mb-2'>PDF Generation Code</h2>
      <pre className='bg-gray-100 p-4 rounded-md overflow-x-auto'>
        <code>{pdfGenerationCode}</code>
      </pre>
      <Button onClick={copyToClipboard} className='mt-2'>
        {isCopied ? 'Copied!' : 'Copy Code'}
      </Button>
    </div>
  );
};

export default PdfCodeDisplay;
