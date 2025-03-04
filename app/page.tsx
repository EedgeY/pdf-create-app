import type { Metadata } from 'next';
import { Suspense } from 'react';
import DesinerApp from './components/Designer';

export const metadata: Metadata = {
  title: 'pdfmeベースの帳票を作成',
  description: 'pdfmeベースの帳票を作成ツール',
};

export default function Page() {
  return (
    <div className='container mb-52'>
      <Suspense fallback={<div>Loading...</div>}>
        <DesinerApp />
      </Suspense>
    </div>
  );
}
