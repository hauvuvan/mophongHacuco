import React from 'react';
import { Badge } from './ui/Badge';

export default function Stats({ machines, roofs, panelWattage, requiredPanelCount, dailyConsumptionKwh, isSidebar }) {
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
  const breakDowns = roofs.map(r => `${r.name}: ${machines.filter(m => m.section === r.id).length}`);

  let verdictTone = 'muted';
  let verdictText = '—';
  if (dailyConsumptionKwh <= 0) {
    verdictText = 'Chưa nhập tiền điện ở bước 1';
  } else if (requiredPanelCount === 0) {
    verdictText = 'Chưa tính được số tấm cần lắp';
  } else if (machines.length >= requiredPanelCount) {
    const extra = machines.length - requiredPanelCount;
    verdictText = extra > 0 ? `Đủ, dư ${extra} tấm` : 'Vừa đủ số tấm cần lắp';
    verdictTone = 'success';
  } else {
    verdictText = `Còn thiếu ${requiredPanelCount - machines.length} tấm`;
    verdictTone = 'warning';
  }

  const content = (
    <div className="space-y-3">
      {/* Stats */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[var(--color-muted-foreground)]">Số tấm đang xếp trên mái</span>
          <span className="text-xl font-bold text-[var(--color-foreground)]">{machines.length}</span>
        </div>
        {breakDowns.length > 0 && (
          <p className="text-xs text-[var(--color-muted-foreground)]">{breakDowns.join(' · ')}</p>
        )}
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[var(--color-muted-foreground)]">Công suất đã xếp</span>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{totalKwp.toFixed(2)} kWp</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[var(--color-muted-foreground)]">Tỉ lệ phủ mái</span>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">
            {roomArea > 0 ? Math.round((usedArea / roomArea) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Coverage card */}
      <div className="rounded-lg border border-[var(--color-border)] p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-muted-foreground)]">Cần lắp</span>
          <span className="font-semibold">{requiredPanelCount} tấm</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--color-muted-foreground)]">Đang xếp trên mái</span>
          <span className="font-semibold">{machines.length} tấm</span>
        </div>
        <div className="coverage-bar">
          <div className="fill" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="flex justify-center">
          <Badge tone={verdictTone}>{verdictText}</Badge>
        </div>
      </div>
    </div>
  );

  if (isSidebar) return content;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--color-foreground)]">Kết quả thiết kế</h3>
      {content}
    </div>
  );
}
