import React, { useState } from 'react';
import {
  getRoofContainerDims,
  getRoofPolygon,
  isOutOfBounds,
  rectsOverlap
} from '../utils/geometry';

export default function Stage({
  roofs,
  machines,
  setMachines,
  scale,
  selectedMachineId,
  setSelectedMachineId,
  onRotateMachine,
  onRotateAllInSection
}) {
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
    setDragInfo({
      id: mId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: m.x,
      startY: m.y
    });
  };

  const handlePointerMove = (e) => {
    if (!dragInfo) return;
    const dxM = (e.clientX - dragInfo.startPointerX) / scale;
    const dyM = (e.clientY - dragInfo.startPointerY) / scale;
    
    setMachines(prev => prev.map(item => {
      if (item.id === dragInfo.id) {
        const roof = roofs.find(r => r.id === item.section);
        let newX = dragInfo.startX + dxM;
        let newY = dragInfo.startY + dyM;
        
        if (roof) {
          const dims = getRoofContainerDims(roof);
          newX = Math.max(0, Math.min(dims.w - item.w, newX));
          newY = Math.max(0, Math.min(dims.h - item.h, newY));
        }
        
        return { ...item, x: newX, y: newY };
      }
      return item;
    }));
  };

  const handlePointerUp = (e) => {
    if (!dragInfo) return;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setDragInfo(null);
  };

  return (
    <main className="stage" onClick={() => setSelectedMachineId(null)}>
      <div className="roof-wrap" id="roofWrap">
        {roofs.map(roof => {
          const dims = getRoofContainerDims(roof);
          const poly = getRoofPolygon(roof);
          const pxW = dims.w * scale;
          const pxH = dims.h * scale;
          const secMachines = machines.filter(m => m.section === roof.id);

          const pointsStr = poly.map(v => `${v.x * scale},${v.y * scale}`).join(' ');

          return (
            <div className="room-block" id={`roomBlock-${roof.id}`} key={roof.id}>
              <div className="room-label-row">
                <div className="room-label">
                  {roof.name} ({getShapeLabel(roof.shape)})
                </div>
                <button
                  type="button"
                  className="btn-rotate-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotateAllInSection(roof.id);
                  }}
                >
                  ↻ Xoay tất cả
                </button>
              </div>

              <div
                className="room"
                id={`room-${roof.id}`}
                style={{ width: `${pxW}px`, height: `${pxH}px` }}
              >
                {/* SVG for shape, grid pattern, and boundary */}
                <svg className="roof-svg" width="100%" height="100%">
                  <defs>
                    <pattern
                      id={`gridPattern-${roof.id}`}
                      width={scale}
                      height={scale}
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width={scale} height={scale} fill="#FFFFFF" />
                      <path
                        d={`M ${scale} 0 L 0 0 0 ${scale}`}
                        fill="none"
                        stroke="var(--grid-line)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <polygon
                    points={pointsStr}
                    fill={`url(#gridPattern-${roof.id})`}
                    stroke="var(--blueprint)"
                    strokeWidth="3"
                  />
                </svg>

                {secMachines.length === 0 && (
                  <div className="empty-note" style={{ display: 'flex' }}>
                    Bấm "Tính toán tự động"
                  </div>
                )}

                {secMachines.map(m => {
                  const overlap = isOutOfBounds(m, roof) || secMachines.some(other => other.id !== m.id && rectsOverlap(m, other));
                  const isSelected = m.id === selectedMachineId;

                  return (
                    <div
                      key={m.id}
                      className={`machine ${isSelected ? 'selected' : ''} ${overlap ? 'overlap' : ''}`}
                      style={{
                        left: `${m.x * scale}px`,
                        top: `${m.y * scale}px`,
                        width: `${m.w * scale}px`,
                        height: `${m.h * scale}px`
                      }}
                      onPointerDown={(e) => handlePointerDown(e, m.id)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onRotateMachine(m.id);
                      }}
                    >
                      {m.w.toFixed(2)}×{m.h.toFixed(2)}
                      <div
                        className="rot-badge"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotateMachine(m.id);
                        }}
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
