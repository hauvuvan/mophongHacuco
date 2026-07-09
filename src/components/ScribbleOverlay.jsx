import React, { useState, useEffect, useRef } from 'react';

export default function ScribbleOverlay({ scribbles = [], onScribblesChange }) {
  const [isActive, setIsActive] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#E1601F'); // Orange signal as default drawing color
  const [lineWidth, setLineWidth] = useState(3);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const allPaths = useRef(scribbles);
  const currentPath = useRef(null);

  const paletteColors = [
    { name: 'Red', hex: '#C6392E' },
    { name: 'Orange', hex: '#E1601F' },
    { name: 'Blue', hex: '#1E3A5F' },
    { name: 'Green', hex: '#2E7D32' },
    { name: 'Purple', hex: '#6A1B9A' },
    { name: 'Charcoal', hex: '#263238' }
  ];

  // Set canvas size to window size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save current scale relative to size
    const prevW = canvas.width;
    const prevH = canvas.height;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Redraw with scale correction if needed, or just redraw
    redraw();
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    allPaths.current = scribbles;
    redraw();
  }, [scribbles]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    allPaths.current.forEach(path => {
      if (path.points.length < 1) return;
      ctx.beginPath();
      ctx.lineWidth = path.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.strokeStyle = path.color;
        ctx.globalCompositeOperation = 'source-over';
      }
      
      const start = path.points[0];
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < path.points.length; i++) {
        const p = path.points[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    });
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const handlePointerDown = (e) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    isDrawing.current = true;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    currentPath.current = {
      color,
      lineWidth,
      tool,
      points: [{ x, y }]
    };
    
    // Set pointer capture to receive events outside boundaries
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || !isActive) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // Must be opaque for destination-out
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    currentPath.current.points.push({ x, y });
  };

  const handlePointerUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentPath.current) {
      const updatedPaths = [...allPaths.current, currentPath.current];
      allPaths.current = updatedPaths;
      currentPath.current = null;
      if (onScribblesChange) onScribblesChange(updatedPaths);
    }
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleClearAll = () => {
    setShowConfirm(true);
  };

  const confirmClearAll = () => {
    allPaths.current = [];
    redraw();
    setShowConfirm(false);
    if (onScribblesChange) onScribblesChange([]);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`sketch-canvas ${isActive ? 'active' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          cursor: isActive ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default'
        }}
      />
      
      <div className={`scribble-dock ${isActive ? 'dock-active' : ''}`}>
        <button
          type="button"
          className={`dock-btn toggle-draw-btn ${isActive ? 'active' : ''}`}
          onClick={() => {
            setIsActive(!isActive);
            setShowPalette(false);
          }}
          title={isActive ? 'Tắt chế độ vẽ nháp' : 'Bật chế độ vẽ nháp'}
        >
          ✏️ <span className="dock-btn-label">{isActive ? 'Tắt nháp' : 'Vẽ nháp'}</span>
        </button>

        {isActive && (
          <>
            <div className="dock-divider" />
            
            <button
              type="button"
              className={`dock-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Bút vẽ"
            >
              🖊️
            </button>
            
            <button
              type="button"
              className={`dock-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Tẩy nét vẽ"
            >
              🧽
            </button>

            <div className="dock-divider" />

            {/* Color picker */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="color-dot-active"
                style={{ backgroundColor: tool === 'eraser' ? '#FFF' : color, border: '1px solid #CCC' }}
                onClick={() => setShowPalette(!showPalette)}
                title="Chọn màu"
                disabled={tool === 'eraser'}
              />
              
              {showPalette && (
                <div className="color-palette-popover">
                  {paletteColors.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      className="color-palette-dot"
                      style={{ backgroundColor: c.hex }}
                      onClick={() => {
                        setColor(c.hex);
                        setShowPalette(false);
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Size controls */}
            <select
              className="dock-select"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
              title="Độ dày nét"
              style={{ width: '54px', fontSize: '11px', padding: '2px 4px' }}
            >
              <option value={2}>2px</option>
              <option value={4}>4px</option>
              <option value={8}>8px</option>
              <option value={16}>16px</option>
            </select>

            <div className="dock-divider" />
            
            <button
              type="button"
              className="dock-btn btn-trash"
              onClick={handleClearAll}
              title="Xóa toàn bộ"
            >
              🗑️
            </button>
          </>
        )}
      </div>

      {showConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-title">
              ⚠️ Xóa toàn bộ nét vẽ?
            </div>
            <div className="confirm-modal-body">
              Thao tác này sẽ dọn sạch tất cả các nét phác thảo trên bản vẽ nháp của bạn và không thể hoàn tác.
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={confirmClearAll}
              >
                Xóa sạch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
