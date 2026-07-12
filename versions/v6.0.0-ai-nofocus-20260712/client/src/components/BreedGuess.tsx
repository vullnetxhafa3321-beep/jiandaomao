import { useEffect, useState } from 'react';
import {
  recognizeAnimalUrl,
  scorePercent,
  type RecognitionResult,
} from '../utils/baiduAI';

interface Props {
  /** 已填写 / 入库的品种名 */
  breed?: string | null;
  /** 已入库的置信度列表 */
  scores?: RecognitionResult[] | null;
  /** 有图时可懒加载识别 */
  imageUrl?: string | null;
  /** compact：图下单行；detail：展开比例条 */
  mode?: 'compact' | 'detail';
  className?: string;
}

export function BreedGuess({
  breed,
  scores: initialScores,
  imageUrl,
  mode = 'compact',
  className = '',
}: Props) {
  const [scores, setScores] = useState<RecognitionResult[]>(initialScores || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(mode === 'detail');

  useEffect(() => {
    setScores(initialScores || []);
  }, [initialScores]);

  useEffect(() => {
    const hasScores = Boolean(initialScores && initialScores.length > 0);
    const hasBreed = Boolean(breed?.trim());
    // 详情：无分数时拉识别；列表：无品种且无分数时拉识别
    const shouldFetch =
      Boolean(imageUrl) &&
      !hasScores &&
      (mode === 'detail' || (mode === 'compact' && !hasBreed));
    if (!shouldFetch) return;

    let cancelled = false;
    setLoading(true);
    setError('');
    recognizeAnimalUrl(imageUrl!)
      .then((data) => {
        if (cancelled) return;
        setScores(data.results || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '识别失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, imageUrl, initialScores, breed]);

  const top = scores[0];
  const label = breed?.trim() || top?.name || '';
  const pct = top ? scorePercent(top.score) : null;

  if (mode === 'compact') {
    if (!label && !loading) return null;
    return (
      <div className={`breed-guess-compact ${className}`}>
        {label ? (
          <>
            <span className="breed-guess-label">{breed?.trim() ? label : `疑似${label}`}</span>
            {pct != null && <span className="breed-guess-pct">{pct}%</span>}
          </>
        ) : (
          <span className="breed-guess-label opacity-60">品种识别中…</span>
        )}
      </div>
    );
  }

  return (
    <div className={`breed-guess-detail ${className}`}>
      <button
        type="button"
        className="breed-guess-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span>
          {label ? (
            <>
              <strong>{breed?.trim() ? '品种' : 'AI 推测品种'}</strong>
              <span className="ml-1.5">{label}</span>
              {pct != null && <span className="breed-guess-pct ml-1">{pct}%</span>}
            </>
          ) : loading ? (
            'AI 识别品种中…'
          ) : error ? (
            '品种识别暂不可用'
          ) : (
            '暂无品种信息'
          )}
        </span>
        <span className="text-[10px] opacity-60">{expanded ? '收起比例' : '展开比例'}</span>
      </button>

      {expanded && (
        <div className="breed-guess-scores mt-2">
          {loading && <p className="text-[11px] text-gray-400">正在用免费动物识别 API 分析照片…</p>}
          {error && !scores.length && (
            <p className="text-[11px] text-amber-700 leading-relaxed">{error}</p>
          )}
          {scores.length > 0 && (
            <ul className="space-y-1.5">
              {scores.slice(0, 5).map((r) => (
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
          )}
          {!loading && !error && scores.length === 0 && label && (
            <p className="text-[11px] text-gray-500">已登记品种，暂无置信度明细</p>
          )}
        </div>
      )}
    </div>
  );
}
