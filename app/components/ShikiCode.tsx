'use client';

import React, { useEffect, useState, useRef } from 'react';
import { codeToHtml, type BundledLanguage, type BundledTheme } from 'shiki';

interface ShikiCodeProps {
  code: string;
  language?: BundledLanguage;
  theme?: BundledTheme;
  className?: string;
  lineNumbers?: boolean;
  autoScroll?: boolean;
  maxHeight?: string;
}

export function ShikiCode({
  code,
  language = 'json',
  theme = 'material-theme-palenight',
  className = '',
  lineNumbers = true,
  autoScroll = true,
  maxHeight = '100%',
}: ShikiCodeProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自動スクロール機能
  useEffect(() => {
    if (autoScroll && scrollRef.current && code) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100); // 少し遅延を入れてDOM更新後に確実にスクロールされるようにする
    }
  }, [code, autoScroll, highlightedCode]);

  useEffect(() => {
    const highlightCode = async () => {
      if (!code) {
        setHighlightedCode('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const html = await codeToHtml(code, {
          lang: language,
          theme: theme,
          transformers: [
            {
              line: (node) => {
                if (lineNumbers) {
                  return {
                    ...node,
                    properties: {
                      ...node.properties,
                      className: [
                        ...(Array.isArray(node.properties?.className)
                          ? node.properties.className
                          : []),
                        'line',
                      ],
                    },
                  };
                }
                return node;
              },
            },
          ],
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('コードのハイライトに失敗しました:', error);
        // エラー時はプレーンテキストとして表示
        setHighlightedCode(`<pre class="plain-text">${escapeHtml(code)}</pre>`);
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [code, language, theme, lineNumbers]);

  // HTMLエスケープ用のヘルパー関数
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return (
    <div
      className={`shiki-outer-wrapper ${className}`}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        ref={scrollRef}
        className='shiki-wrapper'
        style={{
          height: '100%',
          maxHeight,
          width: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {isLoading && !highlightedCode ? (
          <div className='flex items-center justify-center p-4 h-full'>
            <div>コードをロード中...</div>
          </div>
        ) : (
          <div
            className={`shiki-container ${lineNumbers ? 'line-numbers' : ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
      <style jsx global>{`
        .shiki-wrapper {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }

        .shiki-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .shiki-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }

        .shiki-wrapper::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: 3px solid transparent;
        }

        .shiki-container {
          margin: 0;
          padding: 0.5rem;
          font-family: 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New',
            monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          tab-size: 2;
          counter-reset: line;
          width: fit-content;
          min-width: 100%;
        }

        .shiki {
          background-color: transparent !important;
          overflow-x: auto;
          min-width: 100%;
        }

        .line-numbers .line {
          display: block;
          position: relative;
          padding-left: 3rem;
          white-space: pre;
        }

        .line-numbers .line::before {
          counter-increment: line;
          content: counter(line);
          position: absolute;
          left: 0;
          top: 0;
          width: 2rem;
          text-align: right;
          color: rgba(115, 138, 148, 0.6);
        }

        .plain-text {
          white-space: pre-wrap;
          font-family: 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New',
            monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #d4d4d4;
        }
      `}</style>
    </div>
  );
}
