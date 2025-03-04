import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className='container mx-auto px-4 py-6 relative'>
      <nav className='flex justify-between items-center'>
        <span className='text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text'>
          PDF Creator
        </span>
        <div className='flex gap-1.5 items-center'>
          <span className='text-xs text-gray-500 font-medium mr-1'>
            Powered by:
          </span>
          <a
            href='https://pdfme.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center gap-1 hover:opacity-90 transition-opacity'
          >
            <FileText className='h-3 w-3' />
            PDFME
          </a>
          <a
            href='https://openrouter.ai'
            target='_blank'
            rel='noopener noreferrer'
            className='text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center gap-1 hover:opacity-90 transition-opacity'
          >
            <Sparkles className='h-3 w-3' />
            OpenRouter
          </a>
        </div>
      </nav>
    </header>
  );
}
