import { Metadata } from 'next';
import DesignerWrapper from './components/designer-wrapper';
import { Suspense } from 'react';
import CenteredLoader from '@/components/centered-loader';
import LoadingSpinner from '@/components/loading-spinner';

export const metadata: Metadata = {
  title: 'PDFデザイナー',
  description: 'PDFテンプレート作成・編集ツール',
};

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <CenteredLoader>
          <LoadingSpinner />
        </CenteredLoader>
      }
    >
      <DesignerWrapper />
    </Suspense>
  );
}
