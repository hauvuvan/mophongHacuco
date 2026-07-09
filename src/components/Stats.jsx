import React from 'react';

export default function Stats({
  machines,
  roofs,
  panelWattage,
  requiredPanelCount,
  dailyConsumptionKwh,
  customerName,
  customerPhone,
  customerAddress,
  isSidebar
}) {
  const getRoofArea = (roof) => {
    if (roof.shape === 'rectangle') return roof.w * roof.h;
    if (roof.shape === 'triangle') return 0.5 * roof.w * roof.h;
    if (roof.shape === 'trapezoid') return 0.5 * (roof.w + roof.w2) * roof.h;
    if (roof.shape === 'rhombus') return 0.5 * roof.w * roof.h;
    return 0;
  };

  const roomArea = roofs.reduce((s, r) => s + getRoofArea(r), 0);
  const usedArea = machines.reduce((s, m) => s + m.w * m.h, 0);
  const totalKwp = (machines.length * panelWattage) / 1000;
  const pct = requiredPanelCount > 0 ? (machines.length / requiredPanelCount) * 100 : 0;

  // Breakdown counts per roof
  const breakDowns = roofs.map(r => {
    const cnt = machines.filter(m => m.section === r.id).length;
    return `${r.name}: ${cnt}`;
  });

  // Coverage verdict text and styling
  let verdictText = '—';
  let verdictColor = 'var(--muted)';
  
  if (dailyConsumptionKwh <= 0) {
    verdictText = 'Chưa nhập tiền điện ở bước 1';
    verdictColor = 'var(--muted)';
  } else if (requiredPanelCount === 0) {
    verdictText = 'Chưa tính được số tấm cần lắp';
    verdictColor = 'var(--muted)';
  } else if (machines.length >= requiredPanelCount) {
    const extra = machines.length - requiredPanelCount;
    verdictText = extra > 0 ? `Đủ, dư ${extra} tấm` : 'Vừa đủ số tấm cần lắp';
    verdictColor = 'var(--green)';
  } else {
    const thieu = requiredPanelCount - machines.length;
    verdictText = `Còn thiếu ${thieu} tấm`;
    verdictColor = 'var(--amber)';
  }

  const innerContent = (
    <>
      <div className="stats">
        <div className="stat-line big">
          <span>Số tấm đang xếp trên mái</span>
          <span className="val" id="statCount">{machines.length}</span>
        </div>
        <div className="stat-sub" id="statCountBreak">
          {breakDowns.join(' · ')}
        </div>
        <div className="stat-line">
          <span>Công suất đã xếp</span>
          <span className="val" id="statPower">{totalKwp.toFixed(2)} kWp</span>
        </div>
        <div className="stat-line">
          <span>Tỉ lệ phủ mái</span>
          <span className="val" id="statUtil">
            {roomArea > 0 ? Math.round((usedArea / roomArea) * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="coverage-card">
        <div className="row">
          <span>Cần lắp</span>
          <span className="v" id="covNeed">{requiredPanelCount} tấm</span>
        </div>
        <div className="row">
          <span>Đang xếp trên mái</span>
          <span className="v" id="covPlaced">{machines.length} tấm</span>
        </div>
        <div className="coverage-bar">
          <div
            className="fill"
            id="covFill"
            style={{ width: `${Math.min(100, pct)}%` }}
          ></div>
        </div>
        <div
          className="coverage-verdict"
          id="covVerdict"
          style={{ color: verdictColor }}
        >
          {verdictText}
        </div>
      </div>
    </>
  );

  if (isSidebar) {
    return innerContent;
  }

  return (
    <div className="step roof">
      {/* Customer Info Summary Card */}
      {(customerName || customerPhone || customerAddress) && (
        <div className="customer-info-card" style={{ marginBottom: '20px', padding: '14px', border: '1.5px solid var(--line-strong)', borderRadius: '8px', background: 'rgba(30,58,95,0.02)' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--blueprint)', marginBottom: '8px', borderBottom: '1px dashed var(--line-strong)', paddingBottom: '6px' }}>
            📋 THÔNG TIN KHÁCH HÀNG & BÁO GIÁ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {customerName && <div><span style={{ color: 'var(--muted)' }}>Khách hàng: </span><strong>{customerName}</strong></div>}
            {customerPhone && <div><span style={{ color: 'var(--muted)' }}>Số điện thoại: </span><strong>{customerPhone}</strong></div>}
            {customerAddress && <div><span style={{ color: 'var(--muted)' }}>Địa chỉ lắp đặt: </span><strong>{customerAddress}</strong></div>}
          </div>
        </div>
      )}

      <div className="step-head">
        <span className="step-num">✓</span>
        <h2>Kết quả</h2>
      </div>
      
      {innerContent}
    </div>
  );
}
