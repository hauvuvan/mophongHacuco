import React, { useState } from 'react';
import { getRoofContainerDims, getRoofPolygon, isOutOfBounds, rectsOverlap } from '../utils/geometry';
import { Button } from './ui/Button';

export default function Stage({ roofs, machines, setMachines, scale, selectedMachineId, setSelectedMachineId, onRotateMachine, onRotateAllInSection, onToggleSidebar }) {
  const [dragInfo, setDragInfo] = useState(null);

  const getShapeLabel = (shape) => {
    if (shape === 'rectangle') return 'Chữ nhật';
    if (shape === 'triangle') return 'Tam giác';
    if (shape === 'trapezoid') return 'Hình thang';
    if (shape === 'rhombus') return 'Hình thoi';
    return '';
  };

  const handlePointerDown = (e, mId) => {
    e.stopPropagation();
    setSelectedMachineId(mId);
    const m = machines.find(mm => mm.id === mId);
    if (!m) return;
    e.target.setPointerCapture(e.pointerId);
    setDragInfo({ id: mId, startPointerX: e.clientX, startPointerY: e.clientY, startX: m.x, startY: m.y });
  };

  const handlePointerMove = (e) => {
    if (!dragInfo) return;
    const dxM = (e.clientX - dragInfo.startPointerX) / scale;
    const dyM = (e.clientY - dragInfo.startPointerY) / scale;
    setMachines(prev => prev.map(item => {
      if (item.id !== dragInfo.id) return item;
      const roof = roofs.find(r => r.id === item.section);
      let newX = dragInfo.startX + dxM;
      let newY = dragInfo.startY + dyM;
      if (roof) {
        // Allow dragging outside
      }
      return { ...item, x: newX, y: newY };
    }));
  };

  const handlePointerUp = (e) => {
    if (!dragInfo) return;
    try { e.target.releasePointerCapture(e.pointerId); } catch {}
    setDragInfo(null);
  };

  return (
    <main className="stage" onClick={() => setSelectedMachineId(null)}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
        className="lg:hidden absolute top-3 left-3 z-10 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md w-9 h-9 flex items-center justify-center shadow-sm text-[var(--color-foreground)] text-base leading-none hover:bg-[var(--color-accent)] transition-colors"
        title="Mở cài đặt"
      >
        ☰
      </button>
      <div className="roof-wrap">
        {roofs.map(roof => {
          const dims = getRoofContainerDims(roof);
          const poly = getRoofPolygon(roof);
          const pxW = dims.w * scale;
          const pxH = dims.h * scale;
          const secMachines = machines.filter(m => m.section === roof.id);
          const pointsStr = poly.map(v => `${v.x * scale},${v.y * scale}`).join(' ');

          return (
            <div className="room-block" key={roof.id}>
              <div className="room-label-row">
                <span className="room-label">{roof.name} ({getShapeLabel(roof.shape)})</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onRotateAllInSection(roof.id); }}
                  className="h-7 px-2 text-xs"
                >
                  ↻ Xoay tất cả
                </Button>
              </div>

              <div className="room" style={{ width: `${pxW}px`, height: `${pxH}px` }}>
                <svg className="roof-svg" width="100%" height="100%">
                  <defs>
                    <pattern id={`gridPattern-${roof.id}`} width={scale} height={scale} patternUnits="userSpaceOnUse">
                      <rect width={scale} height={scale} fill="#FFFFFF" />
                      <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="var(--grid-line)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <polygon
                    points={pointsStr}
                    fill={`url(#gridPattern-${roof.id})`}
                    stroke="var(--color-foreground)"
                    strokeWidth="2"
                  />
                </svg>

                {secMachines.length === 0 && (
                  <div className="empty-note">Bấm "Tính toán tự động"</div>
                )}

                {secMachines.map(m => {
                  const overlap = isOutOfBounds(m, roof) || secMachines.some(other => other.id !== m.id && rectsOverlap(m, other));
                  return (
                    <div
                      key={m.id}
                      className={`machine ${m.id === selectedMachineId ? 'selected' : ''} ${overlap ? 'overlap' : ''}`}
                      style={{ left: `${m.x * scale}px`, top: `${m.y * scale}px`, width: `${m.w * scale}px`, height: `${m.h * scale}px` }}
                      onPointerDown={(e) => handlePointerDown(e, m.id)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onDoubleClick={(e) => { e.stopPropagation(); onRotateMachine(m.id); }}
                    >
                      {m.w.toFixed(2)}×{m.h.toFixed(2)}
                      <div
                        className="rot-badge"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onRotateMachine(m.id); }}
                      >
                        ↻
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
