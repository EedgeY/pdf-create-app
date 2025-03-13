import type { Metadata } from 'next';
import { Suspense } from 'react';
import PDFDesignerApp from './components/Designer';

export const metadata: Metadata = {
  title: 'pdfmeベースの帳票を作成',
  description: 'pdfmeベースの帳票を作成ツール',
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PDFDesignerApp />
    </Suspense>
  );
}
