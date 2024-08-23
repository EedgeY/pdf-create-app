import React, { Suspense } from 'react';
import DesinView from './components/Designer';
import { GET } from './api/mongo-list/route';

export default async function Home() {
  const res = await GET();
  const data = await res.json();
  return (
    <div className='flex '>
      <Suspense fallback={<div>Loading...</div>}>
        <DesinView templates={data} />
      </Suspense>
    </div>
  );
}
