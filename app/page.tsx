import React from 'react';
import DesinView from './components/Designer';

export default async function Home() {
  return (
    <div className='flex '>
      <DesinView templates={[]} />
    </div>
  );
}
