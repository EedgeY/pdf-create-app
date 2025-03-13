import { Plugins } from '@pdfme/common';
import { reactTailwind, svgToPngDataURL } from './react-tailwind';
import { image, text } from '@pdfme/schemas';
import { link } from './link';
import { recharts } from './recharts';
import { vegaLiteChart } from './vega-lite-chart';
import { mindmap } from './mindmap';
export const plugins: Plugins = {
  text,
  image,
  link,
  recharts,
  'react-tailwind': reactTailwind,
  'vega-lite-chart': vegaLiteChart,
  mindmap,
};

export { svgToPngDataURL };
