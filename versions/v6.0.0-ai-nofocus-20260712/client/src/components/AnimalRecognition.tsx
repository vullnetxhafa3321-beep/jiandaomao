import { useEffect, useState } from 'react';
import {
  recognizeAnimalFile,
  type AnimalRecognitionData,
  scorePercent,
} from '../utils/baiduAI';

interface Props {
  file: File | null;
  onResult?: (data: AnimalRecognitionData) => void;
}

export function AnimalRecognition({ file, onResult }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<Array<{ name: string; score: number }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setState('idle');
      setResults([]);
      setError('');
      return;
    }

    const currentFile = file;
    let cancelled = false;

    async function run() {
      setState('loading');
      setError('');
      try {
        const data = await recognizeAnimalFile(currentFile);
        if (cancelled) return;
        setResults(data.results || []);
        setState('done');
        onResult?.(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '识别失败');
        setState('error');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (state === 'idle') return null;

  if (state === 'loading') {
    return (
      <div className="breed-ai-panel breed-ai-loading">
        <span className="breed-ai-spinner" aria-hidden />
        <span>AI 识别品种中…</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="breed-ai-panel breed-ai-error">
        <p className="text-xs font-bold">识别暂时不可用</p>
        <p className="text-[10px] opacity-80 mt-0.5">{error}</p>
        <p className="text-[10px] mt-1">不影响发布，可手动填写品种</p>
      </div>
    );
  }

  return (
    <div className="breed-ai-panel breed-ai-done">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-[var(--ink-900)]">品种（AI 识别）</span>
        <span className="text-[10px] font-bold text-emerald-700">✓ 已识别</span>
      </div>
      <ul className="space-y-1.5">
        {results.slice(0, 5).map((r) => (
          <li key={r.name} className="breed-score-row">
            <div className="flex justify-between text-[11px] font-bold mb-0.5">
              <span>{r.name}</span>
              <span className="text-[var(--sky-deep)]">{scorePercent(r.score)}%</span>
            </div>
            <div className="breed-score-track">
              <div className="breed-score-fill" style={{ width: `${scorePercent(r.score)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
