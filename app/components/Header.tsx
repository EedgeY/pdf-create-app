import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className='container mx-auto px-4 py-8'>
      <nav className='flex justify-between items-center'>
        <div>
          <Button asChild>
            <Link href={'/generate'}>PDFGenerator</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
