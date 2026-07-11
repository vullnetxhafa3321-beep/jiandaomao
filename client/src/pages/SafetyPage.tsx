import { useNavigate } from 'react-router-dom';
import { Layout, BackHeader } from '../components/UI';

export default function SafetyPage() {
  const navigate = useNavigate();

  const items = [
    {
      icon: '🚫',
      title: '勿徒手抓野猫',
      desc: '建议使用诱捕笼、航空箱或厚手套，避免被抓伤咬伤。',
    },
    {
      icon: '🩹',
      title: '注意人身安全',
      desc: '若被猫抓咬，立即用肥皂水冲洗伤口并就医，必要时接种狂犬疫苗。',
    },
    {
      icon: '📦',
      title: '运输注意事项',
      desc: '使用航空箱/猫包，保持通风，勿长时间密闭。猫放后排，勿放副驾驶。',
    },
    {
      icon: '🦠',
      title: '传染病症状',
      desc: '发现流鼻涕、眼屎、消瘦、呼吸困难等症状，请联系专业救助机构。',
    },
    {
      icon: '⚖️',
      title: '平台免责声明',
      desc: '本平台仅提供信息参考，不构成医疗建议。医院优惠以院方现场为准。',
    },
    {
      icon: '🚗',
      title: '滴滴宠物出行',
      desc: '跳转滴滴后，行程与费用由滴滴承担。首次使用需填写宠物档案（类型、体重）。',
    },
  ];

  return (
    <Layout className="pb-8">
      <BackHeader title="安全须知" onBack={() => navigate(-1)} />

      <div className="px-5 space-y-4">
        <div className="clay-card-blue p-5 text-center">
          <p className="text-4xl mb-2">🐱</p>
          <h2 className="font-black text-xl text-brand-dark">救助前请先阅读</h2>
          <p className="text-sm text-brand-muted mt-1">保护自己，也保护小猫</p>
        </div>

        {items.map((item) => (
          <div key={item.title} className="clay-card-white p-4 flex gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}

        <button className="fab-main w-full py-4 rounded-3xl font-black" onClick={() => navigate(-1)}>
          我已了解
        </button>
      </div>
    </Layout>
  );
}
