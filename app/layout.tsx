import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ReactScan } from '@/components/react-scan';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF Generator',
  description: 'Generate PDFs with React and Puppeteer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja' className='dark'>
      <ReactScan />
      <body className={`${inter.className} min-h-screen bg-background`}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
