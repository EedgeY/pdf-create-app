import React from 'react';
import DesinView from './components/Designer';

import { GET } from './api/mongo-list/route';

export default async function Home() {
  const response = await GET();
  const data = await response.json();
  return (
    <div className='flex '>
      <DesinView templates={data} />
    </div>
  );
}
