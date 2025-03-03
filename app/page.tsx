import type { Metadata } from 'next';
import { Suspense } from 'react';
import DesinerApp from './components/Designer';

export const metadata: Metadata = {
  title: 'Inbox',
  description:
    'Automatically match incoming invoices or receipts to the correct transaction.',
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
