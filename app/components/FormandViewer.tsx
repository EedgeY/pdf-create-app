'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Template, checkTemplate, getInputFromTemplate } from '@pdfme/common';
import { Form, Viewer } from '@pdfme/ui';
import {
  getFontsData,
  getTemplateByPreset,
  handleLoadTemplate,
  generatePDF,
  isJsonString,
} from '../helper';
import { Input } from '@/components/ui/input';

const headerHeight = 71;

type Mode = 'form' | 'viewer';

const initTemplate = () => {
  let template: Template = getTemplateByPreset(
    localStorage.getItem('templatePreset') || ''
  );
  try {
    const templateString = localStorage.getItem('template');
    if (!templateString) {
      return template;
    }
    const templateJson = JSON.parse(templateString);
    checkTemplate(templateJson);
    template = templateJson as Template;
  } catch {
    localStorage.removeItem('template');
  }
  return template;
};

function App() {
  const uiRef = useRef<HTMLDivElement | null>(null);
  const uiInstanceRef = useRef<Form | Viewer | null>(null);
  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem('mode') as Mode) ?? 'form'
  );
  const modeRef = useRef(mode);

  const buildUi = useCallback(async () => {
    const template = initTemplate();
    let inputs = getInputFromTemplate(template);
    try {
      const inputsString = localStorage.getItem('inputs');
      if (inputsString) {
        const inputsJson = JSON.parse(inputsString);
        inputs = inputsJson;
      }
    } catch {
      localStorage.removeItem('inputs');
    }

    const font = await getFontsData();

    if (uiRef.current) {
      if (uiInstanceRef.current) {
        uiInstanceRef.current.destroy();
        uiInstanceRef.current = null;
      }

      uiInstanceRef.current = new (modeRef.current === 'form' ? Form : Viewer)({
        domContainer: uiRef.current,
        template,
        inputs,
        options: {
          font,
          labels: { clear: '消去' },
          theme: {
            token: {
              colorPrimary: '#25c2a0',
            },
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    buildUi();

    return () => {
      if (uiInstanceRef.current) {
        uiInstanceRef.current.destroy();
        uiInstanceRef.current = null;
      }
    };
  }, [mode, buildUi]);

  const onChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Mode;
    setMode(value);
    localStorage.setItem('mode', value);
  }, []);

  const onGetInputs = useCallback(() => {
    if (uiInstanceRef.current) {
      const inputs = uiInstanceRef.current.getInputs();
      alert(JSON.stringify(inputs, null, 2));
      alert('Dumped as console.log');
      console.log(inputs);
    }
  }, []);

  const onSetInputs = useCallback(() => {
    if (uiInstanceRef.current) {
      const prompt = window.prompt('Enter Inputs JSONString') || '';
      try {
        const json = isJsonString(prompt) ? JSON.parse(prompt) : [{}];
        uiInstanceRef.current.setInputs(json);
      } catch (e) {
        alert(e);
      }
    }
  }, []);

  const onSaveInputs = useCallback(() => {
    if (uiInstanceRef.current) {
      const inputs = uiInstanceRef.current.getInputs();
      localStorage.setItem('inputs', JSON.stringify(inputs));
      alert('Saved!');
    }
  }, []);

  const onResetInputs = useCallback(() => {
    localStorage.removeItem('inputs');
    if (uiInstanceRef.current) {
      const template = initTemplate();
      uiInstanceRef.current.setInputs(getInputFromTemplate(template));
    }
  }, []);

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 1rem',
          fontSize: 'small',
        }}
      >
        <strong>Form, Viewer</strong>
        <span style={{ margin: '0 1rem' }}>:</span>
        <div>
          <Input
            type='radio'
            onChange={onChangeMode}
            id='form'
            value='form'
            checked={mode === 'form'}
          />
          <label htmlFor='form'>Form</label>
          <input
            type='radio'
            onChange={onChangeMode}
            id='viewer'
            value='viewer'
            checked={mode === 'viewer'}
          />
          <label htmlFor='viewer'>Viewer</label>
        </div>
        <label style={{ width: 180 }}>
          Load Template
          <input
            type='file'
            accept='application/json'
            onChange={(e) => handleLoadTemplate(e, uiInstanceRef.current)}
          />
        </label>
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={onGetInputs}>Get Inputs</button>
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={onSetInputs}>Set Inputs</button>
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={onSaveInputs}>Save Inputs</button>
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={onResetInputs}>Reset Inputs</button>
        <span style={{ margin: '0 1rem' }}>/</span>
        <button onClick={() => generatePDF(uiInstanceRef.current)}>
          Generate PDF
        </button>
      </header>
      <div
        ref={uiRef}
        style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
      />
    </div>
  );
}

export default App;
