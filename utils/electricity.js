export const TIER_PRICES = [
  { from: 0,   to: 50,       price: 1984 },
  { from: 50,  to: 100,      price: 2050 },
  { from: 100, to: 200,      price: 2380 },
  { from: 200, to: 300,      price: 2998 },
  { from: 300, to: 400,      price: 3350 },
  { from: 400, to: Infinity, price: 3460 },
];

export const PRICES = {
  san_xuat: {
    '110+': { bt: 1811, td: 1146, cd: 3266 },
    '22-110': { bt: 1833, td: 1190, cd: 3398 },
    '6-22': { bt: 1899, td: 1234, cd: 3508 },
    '<6': { bt: 1987, td: 1300, cd: 3640 },
  },
  kinh_doanh: {
    '22+': { bt: 2887, td: 1609, cd: 5025 },
    '6-22': { bt: 3108, td: 1829, cd: 5202 },
    '<6': { bt: 3152, td: 1918, cd: 5422 },
  },
  hanh_chinh: {
    'benh_vien': { '6+': 1940, '<6': 2072 },
    'chieu_sang': { '6+': 2138, '<6': 2226 },
  }
};

// Số giờ theo khung (Tuần 168h)
export const HOURS_PER_WEEK = {
  bt: 96,
  cd: 30,
  td: 42,
  total: 168
};
