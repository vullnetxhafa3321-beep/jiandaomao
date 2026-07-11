import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { GuideStep } from '../types';
import { Layout, BackHeader, useToast } from '../components/UI';

export default function GuidePage() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const { show, toast } = useToast();

  useEffect(() => {
    api
      .guideSteps()
      .then(({ items }) => setSteps(items))
      .catch(() => show('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const step = steps[activeStep];

  return (
    <Layout className="pb-8">
      {toast}
      <BackHeader title="📋 全流程指南" onBack={() => navigate('/')} />

      <div className="px-5 space-y-4">
        <p className="text-sm text-brand-muted font-medium px-1">
          从捡到到收养，一步步来就不慌了
        </p>

        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : (
          <>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    i === activeStep
                      ? 'bg-brand-dark text-white'
                      : i < activeStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white/80 text-gray-500'
                  }`}
                >
                  {i < activeStep ? '✅ ' : ''}第{i + 1}步
                </button>
              ))}
            </div>

            {step && (
              <div className="clay-card-white p-5">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h2 className="text-lg font-black text-brand-dark mb-3">
                  第{step.step}步：{step.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{step.content}</p>

                <div className="mb-4">
                  <h3 className="font-bold text-green-700 mb-2 text-sm">✅ 要做的</h3>
                  <ul className="space-y-1">
                    {step.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-orange-600 mb-2 text-sm">❌ 千万别做</h3>
                  <ul className="space-y-1">
                    {step.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
                className="flex-1 py-3 rounded-2xl bg-white/80 text-gray-700 font-bold disabled:opacity-30"
              >
                ← 上一步
              </button>
              <button
                type="button"
                disabled={activeStep >= steps.length - 1}
                onClick={() => setActiveStep(activeStep + 1)}
                className="flex-1 py-3 rounded-2xl clay-btn-yellow font-bold disabled:opacity-30"
              >
                下一步 →
              </button>
            </div>

            {activeStep === steps.length - 1 && (
              <div className="clay-card-green p-4 text-center text-sm text-green-800 font-medium">
                🎉 你已经了解了完整流程！遇到流浪动物就不用慌了。
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
