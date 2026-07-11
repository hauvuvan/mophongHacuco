export function getRoofContainerDims(roof) {
  if (roof.shape === 'trapezoid') {
    return { w: Math.max(roof.w, roof.w2 || roof.w), h: roof.h };
  }
  return { w: roof.w, h: roof.h };
}

export function getRoofPolygon(roof) {
  const w = roof.w;
  const h = roof.h;
  if (roof.shape === 'rectangle') {
    return [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h }
    ];
  } else if (roof.shape === 'triangle') {
    return [
      { x: w / 2, y: 0 },
      { x: w, y: h },
      { x: 0, y: h }
    ];
  } else if (roof.shape === 'trapezoid') {
    const w2 = roof.w2 || w;
    const wMax = Math.max(w, w2);
    const xTopLeft = (wMax - w2) / 2;
    const xTopRight = xTopLeft + w2;
    const xBotLeft = (wMax - w) / 2;
    const xBotRight = xBotLeft + w;
    return [
      { x: xTopLeft, y: 0 },
      { x: xTopRight, y: 0 },
      { x: xBotRight, y: h },
      { x: xBotLeft, y: h }
    ];
  } else if (roof.shape === 'rhombus') {
    return [
      { x: w / 2, y: 0 },
      { x: w, y: h / 2 },
      { x: w / 2, y: h },
      { x: 0, y: h / 2 }
    ];
  }
  return [];
}

export function isPointInsidePolygon(x, y, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x, yi = vs[i].y;
    const xj = vs[j].x, yj = vs[j].y;
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isMachineInRoof(m, roof) {
  const poly = getRoofPolygon(roof);
  const corners = [
    { x: m.x, y: m.y },
    { x: m.x + m.w, y: m.y },
    { x: m.x + m.w, y: m.y + m.h },
    { x: m.x, y: m.y + m.h }
  ];
  return corners.every(c => isPointInsidePolygon(c.x, c.y, poly));
}

export function isOutOfBounds(m, roof) {
  return !isMachineInRoof(m, roof);
}

export function rectsOverlap(a, b) {
  const EPS = 0.001;
  return !(a.x + a.w <= b.x + EPS || b.x + b.w <= a.x + EPS || a.y + a.h <= b.y + EPS || b.y + b.h <= a.y + EPS);
}

export function getRoofArea(roof) {
  if (roof.shape === 'rectangle') return roof.w * roof.h;
  if (roof.shape === 'triangle') return 0.5 * roof.w * roof.h;
  if (roof.shape === 'trapezoid') return 0.5 * (roof.w + (roof.w2 || roof.w)) * roof.h;
  if (roof.shape === 'rhombus') return 0.5 * roof.w * roof.h;
  return 0;
}

export function getLayoutCandidate(roof, mw, mh, gap) {
  const poly = getRoofPolygon(roof);
  const dims = getRoofContainerDims(roof);
  
  const cols = Math.max(0, Math.floor((dims.w + gap) / (mw + gap)));
  const rows = Math.max(0, Math.floor((dims.h + gap) / (mh + gap)));
  
  const list = [];
  if (cols > 0 && rows > 0) {
    const usedW = cols * mw + (cols - 1) * gap;
    const usedH = rows * mh + (rows - 1) * gap;
    const offsetX = (dims.w - usedW) / 2;
    const offsetY = (dims.h - usedH) / 2;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cand = { x: offsetX + c * (mw + gap), y: offsetY + r * (mh + gap), w: mw, h: mh };
        if (isMachineInRoof(cand, roof)) {
          list.push(cand);
        }
      }
    }
  }
  return list;
}
