'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ReactCodeEditor from '../components/ReactCodeEditor';
import { svgToPngDataURL } from '../plugins/react-tailwind';
import { useImageStore } from '../store/imageStore';
import { Button } from '../components/ui/button';

const ReactEditorPage = () => {
  const router = useRouter();
  const { setGeneratedImage } = useImageStore();

  // SVGをPNGに変換し、ストアに保存して遷移する関数
  const handleGenerateSvg = async (svgElement: SVGElement) => {
    try {
      const dataUrl = await svgToPngDataURL(svgElement);
      console.log('SVG変換成功:', dataUrl.substring(0, 50) + '...');

      // 状態管理ストアに画像データを保存
      setGeneratedImage(dataUrl);

      // 少し遅延してからデザイナーページに遷移
      setTimeout(() => {
        router.push('/');
      }, 500);

      return dataUrl;
    } catch (error) {
      console.error('SVG変換エラー:', error);
      throw error;
    }
  };

  // デザイナーページに戻る
  const handleBackToDesigner = () => {
    router.push('/');
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>ReactコードからPDFを生成</h1>
        <Button onClick={handleBackToDesigner} variant='outline'>
          デザイナーに戻る
        </Button>
      </div>

      <p className='mb-6'>
        以下のエディタにReact+Tailwind
        CSSのコードを記述し、右側にプレビュー表示されます。
        「SVG生成」ボタンをクリックすると、プレビューをSVGに変換し、それをPDF用の画像データに変換します。
      </p>
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <ReactCodeEditor onGenerateSvg={handleGenerateSvg} />
      </div>
    </div>
  );
};

export default ReactEditorPage;
