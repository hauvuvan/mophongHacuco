import React from 'react';
import Stats from './Stats';
import { Button } from './ui/Button';
import { Input, Select, Label } from './ui/Input';
import { cn } from '../lib/utils';

function SidebarSection({ label, stepNum, stepColor = 'bg-[var(--color-primary)]', children }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="border-t border-[var(--color-border)] py-4">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0', stepColor)}>
            {stepNum}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]">{label}</span>
        </div>
        <span className="text-[10px] text-[var(--color-muted-foreground)]">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

function FieldGroup({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">{hint}</p>}
    </div>
  );
}

export default function Sidebar({
  machines, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, moneyInput, setMoneyInput,
  elecType, setElecType, elecVoltage, setElecVoltage,
  elecAdminTarget, setElecAdminTarget, elecInputType, setElecInputType,
  elecKwhBT, setElecKwhBT, elecKwhCD, setElecKwhCD, elecKwhTD, setElecKwhTD, calculatedMoney,
  seasonCoef, setSeasonCoef, panelWattage, setPanelWattage,
  roofs, setRoofs, machW, setMachW, machH, setMachH, gap, setGap,
  totalKwh, dailyConsumptionKwh, requiredKwp, requiredPanelCount,
  onAddRoof, onDeleteRoof, onAutoLayout, onAddPanel,
  onRemoveSelectedPanel, onClearAllPanels, selectedMachineId
}) {
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('84') && val.length > 2) val = '0' + val.slice(2);
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    setCustomerPhone(val.slice(0, 10));
  };

  const handleMoneyChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setMoneyInput(num ? num.toLocaleString('vi-VN') : '');
  };

  const updateRoofField = (roofId, field, val) => {
    setRoofs(prev => prev.map(r => {
      if (r.id !== roofId) return r;
      const updated = { ...r, [field]: field === 'shape' ? val : Math.max(0.1, parseFloat(val) || 0.1) };
      if (field === 'shape' && val === 'trapezoid' && updated.w2 == null) updated.w2 = updated.w;
      return updated;
    }));
  };

  return (
    <aside className="w-72 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-card)] flex flex-col h-full overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">HACUCO</p>
        <h2 className="text-sm font-semibold text-[var(--color-foreground)] mt-0.5 leading-snug">
          Ước tính & mô phỏng lắp pin mặt trời
        </h2>
      </div>

      <div className="px-5 flex-1 pb-6">
        {/* Step 0: Customer */}
        <SidebarSection label="Thông tin khách hàng" stepNum="1">
          <FieldGroup label="Tên khách hàng">
            <Input type="text" value={customerName} placeholder="Nhập tên khách hàng" onChange={(e) => setCustomerName(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Số điện thoại">
            <Input type="text" value={customerPhone} placeholder="Ví dụ: 0912345678" onChange={handlePhoneChange} />
            {customerPhone && customerPhone.length < 10 && (
              <p className="text-xs text-amber-600">* Số điện thoại phải gồm 10 chữ số bắt đầu từ số 0</p>
            )}
          </FieldGroup>
          <FieldGroup label="Địa chỉ lắp đặt">
            <Input type="text" value={customerAddress} placeholder="Nhập địa chỉ lắp đặt" onChange={(e) => setCustomerAddress(e.target.value)} />
          </FieldGroup>
        </SidebarSection>

        {/* Step 1: Electricity */}
        <SidebarSection label="Tiền điện của bạn" stepNum="2">
          <FieldGroup label="Nhóm đối tượng khách hàng">
            <Select value={elecType} onChange={e => {
              setElecType(e.target.value);
              setElecVoltage('<6');
              setElecInputType('money');
            }}>
              <option value="dan_dung">Điện sinh hoạt (Dân dụng)</option>
              <option value="san_xuat">Điện sản xuất</option>
              <option value="kinh_doanh">Điện kinh doanh</option>
              <option value="hanh_chinh">Điện hành chính sự nghiệp</option>
            </Select>
          </FieldGroup>

          {elecType === 'hanh_chinh' && (
            <FieldGroup label="Phân loại">
              <Select value={elecAdminTarget} onChange={e => setElecAdminTarget(e.target.value)}>
                <option value="benh_vien">Bệnh viện, nhà trẻ, trường học...</option>
                <option value="chieu_sang">Chiếu sáng CC, cơ quan NN...</option>
              </Select>
            </FieldGroup>
          )}

          {(elecType === 'san_xuat' || elecType === 'kinh_doanh' || elecType === 'hanh_chinh') && (
            <FieldGroup label="Cấp điện áp">
              <Select value={elecVoltage} onChange={e => setElecVoltage(e.target.value)}>
                {elecType === 'san_xuat' && <option value="110+">Từ 110 kV trở lên</option>}
                {(elecType === 'san_xuat' || elecType === 'kinh_doanh') && <option value="22-110">Từ 22 kV đến dưới 110 kV</option>}
                {elecType === 'kinh_doanh' && <option value="22+">Từ 22 kV trở lên</option>}
                {(elecType === 'san_xuat' || elecType === 'kinh_doanh') && <option value="6-22">Từ 6 kV đến dưới 22 kV</option>}
                {elecType === 'hanh_chinh' && <option value="6+">Từ 6 kV trở lên</option>}
                <option value="<6">Dưới 6 kV</option>
              </Select>
            </FieldGroup>
          )}

          {(elecType === 'san_xuat' || elecType === 'kinh_doanh') && (
            <FieldGroup label="Cách nhập liệu">
              <Select value={elecInputType} onChange={e => setElecInputType(e.target.value)}>
                <option value="money">Nhập tổng tiền (Ước lượng)</option>
                <option value="kwh">Nhập chi tiết 3 khung giờ</option>
              </Select>
            </FieldGroup>
          )}

          {elecInputType === 'money' || elecType === 'dan_dung' || elecType === 'hanh_chinh' ? (
            <FieldGroup label="Số tiền hoá đơn">
              <div className="money-input-row">
                <input type="text" inputMode="numeric" value={moneyInput} onChange={handleMoneyChange} />
                <span className="unit">đ</span>
              </div>
            </FieldGroup>
          ) : (
            <div className="flex gap-2">
              <FieldGroup label="kWh Bình thường"><Input type="number" value={elecKwhBT} onChange={e => setElecKwhBT(e.target.value)} /></FieldGroup>
              <FieldGroup label="kWh Cao điểm"><Input type="number" value={elecKwhCD} onChange={e => setElecKwhCD(e.target.value)} /></FieldGroup>
              <FieldGroup label="kWh Thấp điểm"><Input type="number" value={elecKwhTD} onChange={e => setElecKwhTD(e.target.value)} /></FieldGroup>
            </div>
          )}

          <div className="inline-result">
            <span className="l">Tổng số điện / tháng</span>
            <span className="v">{totalKwh.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kWh</span>
          </div>
          <div className="inline-result hero">
            <span className="l">Số điện / ngày (÷30)</span>
            <span className="v">{dailyConsumptionKwh.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kWh</span>
          </div>
          
          {elecInputType === 'kwh' && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
              Tiền điện chưa VAT: {calculatedMoney.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ
            </p>
          )}
          
          {elecType === 'dan_dung' && <p className="text-xs text-[var(--color-muted-foreground)]">Tính ngược theo biểu giá sinh hoạt 6 bậc.</p>}
          {(elecType === 'san_xuat' || elecType === 'kinh_doanh') && elecInputType === 'money' && <p className="text-xs text-[var(--color-muted-foreground)]">Dùng tỷ lệ phân bổ mặc định: 57.14% BT, 17.86% CĐ, 25% TĐ.</p>}
        </SidebarSection>

        {/* Step 2: Required capacity */}
        <SidebarSection label="Công suất & số lượng pin" stepNum="3">
          <FieldGroup label="Số giờ nắng quy đổi">
            <div className="flex gap-1">
              {[{ label: 'Cao điểm', sub: 'Mùa hè · 3,5', val: 3.5 }, { label: 'Trung bình', sub: 'Cả năm · 3', val: 3 }, { label: 'Mùa đông', sub: 'Ít nắng · 2,5', val: 2.5 }].map(s => (
                <button key={s.val} type="button" className={cn('season-btn', seasonCoef === s.val && 'active')} onClick={() => setSeasonCoef(s.val)}>
                  <span className="t">{s.label}</span>
                  <span className="c">{s.sub}</span>
                </button>
              ))}
            </div>
          </FieldGroup>
          <FieldGroup label="Công suất mỗi tấm pin (Wp)">
            <Input type="number" value={panelWattage} min="1" step="5" onChange={(e) => setPanelWattage(parseFloat(e.target.value) || 0)} />
          </FieldGroup>
          <div className="inline-result">
            <span className="l">Công suất cần lắp</span>
            <span className="v">{requiredKwp.toFixed(2)} kWp</span>
          </div>
          <div className="inline-result hero">
            <span className="l">Số lượng pin cần lắp</span>
            <span className="v">{requiredPanelCount} tấm</span>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            Công suất cần lắp = số điện/ngày ÷ số giờ nắng quy đổi.
          </p>
        </SidebarSection>

        {/* Step 3: Roof shape */}
        <SidebarSection label="Hình dạng mái" stepNum="4" stepColor="bg-[var(--color-foreground)]">
          <div className="space-y-2.5">
            {roofs.map(roof => (
              <div key={roof.id} className="rounded-lg border border-[var(--color-border)] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
                  <span className="text-xs font-semibold">{roof.name}</span>
                  {roofs.length > 1 && (
                    <button type="button" onClick={() => onDeleteRoof(roof.id)} className="text-xs text-[var(--color-destructive)] hover:underline">Xóa</button>
                  )}
                </div>
                <div className="p-3 space-y-2 bg-[var(--color-card)]">
                  <FieldGroup label="Hình dạng">
                    <Select value={roof.shape} onChange={(e) => updateRoofField(roof.id, 'shape', e.target.value)}>
                      <option value="rectangle">Hình chữ nhật</option>
                      <option value="triangle">Hình tam giác</option>
                      <option value="trapezoid">Hình thang</option>
                      <option value="rhombus">Hình thoi</option>
                    </Select>
                  </FieldGroup>
                  <div className="flex gap-2">
                    {roof.shape === 'rectangle' && (<>
                      <FieldGroup label="Rộng W (m)"><Input type="number" value={roof.w} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)} /></FieldGroup>
                      <FieldGroup label="Dài H (m)"><Input type="number" value={roof.h} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)} /></FieldGroup>
                    </>)}
                    {roof.shape === 'triangle' && (<>
                      <FieldGroup label="Đáy W (m)"><Input type="number" value={roof.w} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)} /></FieldGroup>
                      <FieldGroup label="Cao H (m)"><Input type="number" value={roof.h} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)} /></FieldGroup>
                    </>)}
                    {roof.shape === 'trapezoid' && (<>
                      <FieldGroup label="Đáy dưới W1"><Input type="number" value={roof.w} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)} /></FieldGroup>
                      <FieldGroup label="Đáy trên W2"><Input type="number" value={roof.w2 || roof.w} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'w2', e.target.value)} /></FieldGroup>
                      <FieldGroup label="Cao H"><Input type="number" value={roof.h} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)} /></FieldGroup>
                    </>)}
                    {roof.shape === 'rhombus' && (<>
                      <FieldGroup label="Chéo ngang W"><Input type="number" value={roof.w} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)} /></FieldGroup>
                      <FieldGroup label="Chéo đứng H"><Input type="number" value={roof.h} min="0.5" step="0.1" onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)} /></FieldGroup>
                    </>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onAddRoof}>+ Thêm mái mới</Button>
        </SidebarSection>

        {/* Step 4: Panels */}
        <SidebarSection label="Xếp tấm pin trên mái" stepNum="5" stepColor="bg-[var(--color-foreground)]">
          <div className="flex gap-2">
            <FieldGroup label="Rộng tấm (m)">
              <Input type="number" value={machW} min="0.1" step="0.01" onChange={(e) => setMachW(parseFloat(e.target.value) || 0.1)} />
            </FieldGroup>
            <FieldGroup label="Dài tấm (m)">
              <Input type="number" value={machH} min="0.1" step="0.01" onChange={(e) => setMachH(parseFloat(e.target.value) || 0.1)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Khoảng cách giữa các tấm (m)">
            <Input type="number" value={gap} min="0" step="0.01" onChange={(e) => setGap(parseFloat(e.target.value) || 0)} />
          </FieldGroup>
          <Button className="w-full" onClick={onAutoLayout}>Tính toán tự động (tất cả mái)</Button>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1.5">Thêm tấm pin vào:</p>
            <div className="flex flex-wrap gap-1.5">
              {roofs.map(r => (
                <Button key={r.id} variant="outline" size="sm" onClick={() => onAddPanel(r.id)}>+ 1 tấm ({r.name})</Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="destructive" size="sm" disabled={selectedMachineId == null} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveSelectedPanel(selectedMachineId); }} className="flex-1">
              Xóa tấm đã chọn
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClearAllPanels(); }} className="flex-1">Xóa tất cả</Button>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            Kéo tấm để di chuyển, bấm <strong>↻</strong> hoặc double‑click để xoay. Viền đỏ = chồng lấn.
          </p>
        </SidebarSection>

        {/* Step 5: Results */}
        <SidebarSection label="Kết quả thiết kế" stepNum="✓" stepColor="bg-emerald-600">
          <Stats machines={machines} roofs={roofs} panelWattage={panelWattage} requiredPanelCount={requiredPanelCount} dailyConsumptionKwh={dailyConsumptionKwh} isSidebar={true} />
        </SidebarSection>
      </div>
    </aside>
  );
}
