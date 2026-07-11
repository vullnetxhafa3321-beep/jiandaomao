import { useNavigate } from 'react-router-dom';
import { Layout, BackHeader } from '../components/UI';
import { HandDrawnCat } from '../components/HandDrawnCat';

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

  const takeHomeWithPets = [
    '新猫与原住民隔离 7–14 天，独立食盆、水碗、猫砂盆',
    '通过门缝交换气味，再短时间见面，观察是否哈气、打架',
    '确认双方疫苗、驱虫完成后再逐步接触',
    '如有狗狗，先让猫有高处躲避空间，切勿强行凑近',
  ];

  const takeHomeAlone = [
    '先安置在安静独立房间，提供躲藏处（航空箱/纸箱）',
    '立刻检查封窗封阳台，防止应激逃窜',
    '24 小时内预约体检 + 驱虫，不要急于洗澡',
    '准备幼猫/成猫粮、猫砂，观察进食排泄是否正常',
  ];

  return (
    <Layout className="pb-8">
      <BackHeader title="安全须知" onBack={() => navigate(-1)} />

      <div className="px-5 space-y-4">
        <div className="frog-card-green p-5 text-center">
          <HandDrawnCat size={56} className="mx-auto mb-2" />
          <h2 className="font-black text-xl text-[var(--frog-ink)]">救助前请先阅读</h2>
          <p className="text-sm text-[var(--frog-stone)] mt-1">保护自己，也保护小猫</p>
        </div>

        {items.map((item) => (
          <div key={item.title} className="frog-card p-4 flex gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="font-bold text-[var(--frog-ink)]">{item.title}</h3>
              <p className="text-sm text-[var(--frog-stone)] mt-1">{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="frog-card-wood p-4">
          <h3 className="font-bold text-[var(--frog-ink)] mb-2">🏠 临时带回家 · 已有其他宠物</h3>
          <ul className="text-xs text-[var(--frog-ink)] space-y-1.5">
            {takeHomeWithPets.map((tip) => (
              <li key={tip}>· {tip}</li>
            ))}
          </ul>
        </div>

        <div className="frog-card p-4">
          <h3 className="font-bold text-[var(--frog-ink)] mb-2">🏠 临时带回家 · 无其他宠物</h3>
          <ul className="text-xs text-[var(--frog-stone)] space-y-1.5">
            {takeHomeAlone.map((tip) => (
              <li key={tip}>· {tip}</li>
            ))}
          </ul>
        </div>

        <button type="button" className="frog-btn-green w-full py-4 font-black" onClick={() => navigate(-1)}>
          我已了解
        </button>
      </div>
    </Layout>
  );
}
