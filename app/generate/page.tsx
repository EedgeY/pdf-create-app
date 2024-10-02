import React, { Suspense } from 'react';
import { GET } from '../api/mongo-list/route';
import DesignView from '../components/Designer';

export default async function Home() {
  const res = await GET();
  const data = await res.json();
  return (
    <div className='flex '>
      <Suspense fallback={<div>Loading...</div>}>
        <DesignView templates={data} />
      </Suspense>
    </div>
  );
}
