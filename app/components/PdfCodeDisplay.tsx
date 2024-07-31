import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
      throw new Error(\`HTTP error! - status: \${response.status}, message: \${(await response.json()).message}\`);
    }

    const pdfBlob = await response.blob();
    console.log("PDF generated successfully:", pdfBlob);
    return pdfBlob;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
}

(async () => {
  const pdf = await generatePdf();
  if (pdf) {
    const arrayBuffer = await pdf.arrayBuffer();
    fs.writeFileSync(path.join(process.cwd(), \`\${Date.now()}.pdf\`), Buffer.from(arrayBuffer));
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
    <div className='mt-4 mx-10'>
      <ScrollArea className='h-[600px] max-w-6xl'>
        <h2 className='text-lg font-semibold mb-2'>PDF Generation Code</h2>
        <pre className='bg-gray-100 p-4 rounded-md overflow-x-auto'>
          <code>{pdfGenerationCode}</code>
        </pre>
        <ScrollBar />
      </ScrollArea>

      <Button onClick={copyToClipboard} className='mt-2'>
        {isCopied ? 'Copied!' : 'Copy Code'}
      </Button>
    </div>
  );
};

export default PdfCodeDisplay;
