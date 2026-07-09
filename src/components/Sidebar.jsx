import React from 'react';
import Stats from './Stats';

export default function Sidebar({
  machines,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  moneyInput,
  setMoneyInput,
  seasonCoef,
  setSeasonCoef,
  panelWattage,
  setPanelWattage,
  roofs,
  setRoofs,
  machW,
  setMachW,
  machH,
  setMachH,
  gap,
  setGap,
  totalKwh,
  dailyConsumptionKwh,
  requiredKwp,
  requiredPanelCount,
  onAddRoof,
  onDeleteRoof,
  onAutoLayout,
  onAddPanel,
  onRemoveSelectedPanel,
  onClearAllPanels,
  selectedMachineId
}) {
  const [collapsedSections, setCollapsedSections] = React.useState({
    step0: false,
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false
  });

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Keep only digits
    if (val.startsWith('84') && val.length > 2) {
      val = '0' + val.slice(2);
    }
    if (val.length > 0 && val[0] !== '0') {
      val = '0' + val;
    }
    setCustomerPhone(val.slice(0, 10));
  };

  const handleMoneyChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setMoneyInput(num ? num.toLocaleString('vi-VN') : '');
  };

  const updateRoofField = (roofId, field, val) => {
    setRoofs(prev => prev.map(r => {
      if (r.id === roofId) {
        const updated = { ...r, [field]: Math.max(0.1, parseFloat(val) || 0.1) };
        if (field === 'shape' && val === 'trapezoid' && updated.w2 == null) {
          updated.w2 = updated.w;
        }
        return updated;
      }
      return r;
    }));
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="eyebrow">HACUCO</span>
        <h1>Ước tính & mô phỏng lắp pin mặt trời</h1>
      </div>

      {/* STEP 0: CUSTOMER INFO */}
      <div className="step money">
        <div className="step-head" onClick={() => toggleSection('step0')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num">0</span>
            <h2>Thông tin khách hàng</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{collapsedSections.step0 ? '▶' : '▼'}</span>
        </div>
        
        <div style={{ display: collapsedSections.step0 ? 'none' : 'block', marginTop: '12px' }}>
          <div className="field">
            <label htmlFor="custName">Tên khách hàng</label>
            <input
              type="text"
              id="custName"
              value={customerName}
              placeholder="Nhập tên khách hàng"
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="custPhone">Số điện thoại</label>
              <input
                type="text"
                id="custPhone"
                value={customerPhone}
                placeholder="Ví dụ: 0912345678"
                onChange={handlePhoneChange}
              />
              {customerPhone && customerPhone.length < 10 && (
                <div style={{ color: 'var(--amber)', fontSize: '11px', marginTop: '4px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  * Số điện thoại phải gồm 10 chữ số bắt đầu từ số 0
                </div>
              )}
            </div>
          </div>
          <div className="field">
            <label htmlFor="custAddr">Địa chỉ lắp đặt</label>
            <input
              type="text"
              id="custAddr"
              value={customerAddress}
              placeholder="Nhập địa chỉ lắp đặt"
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* STEP 1: MONEY */}
      <div className="step money">
        <div className="step-head" onClick={() => toggleSection('step1')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num">1</span>
            <h2>Tiền điện của bạn</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{collapsedSections.step1 ? '▶' : '▼'}</span>
        </div>
        
        <div style={{ display: collapsedSections.step1 ? 'none' : 'block', marginTop: '12px' }}>
          <div className="field">
            <label htmlFor="moneyInput">Số tiền hoá đơn</label>
            <div className="money-input-row">
              <input
                type="text"
                id="moneyInput"
                inputMode="numeric"
                value={moneyInput}
                onChange={handleMoneyChange}
              />
              <span className="unit">đ</span>
            </div>
          </div>

          <div className="inline-result">
            <span className="l">Tổng số điện / tháng</span>
            <span className="v" id="totalKwhInline">
              {totalKwh.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kWh
            </span>
          </div>
          <div className="inline-result hero">
            <span className="l">Số điện / ngày (÷30)</span>
            <span className="v" id="dailyKwhInline">
              {dailyConsumptionKwh.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kWh
            </span>
          </div>
          <div className="hint">Tính ngược theo biểu giá điện sinh hoạt 6 bậc.</div>
        </div>
      </div>

      {/* STEP 2: REQUIRED CAPACITY */}
      <div className="step money">
        <div className="step-head" onClick={() => toggleSection('step2')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num">2</span>
            <h2>Công suất & số lượng pin cần lắp</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{collapsedSections.step2 ? '▶' : '▼'}</span>
        </div>
        
        <div style={{ display: collapsedSections.step2 ? 'none' : 'block', marginTop: '12px' }}>
          <div className="field">
            <label>Số giờ nắng quy đổi (theo mùa)</label>
            <div className="season-picker" id="seasonPicker">
              <button
                type="button"
                className={`season-btn ${seasonCoef === 3.5 ? 'active' : ''}`}
                onClick={() => setSeasonCoef(3.5)}
              >
                <span className="t">Cao điểm</span>
                <span className="c">Mùa hè · 3,5</span>
              </button>
              <button
                type="button"
                className={`season-btn ${seasonCoef === 3 ? 'active' : ''}`}
                onClick={() => setSeasonCoef(3)}
              >
                <span className="t">Trung bình</span>
                <span className="c">Cả năm · 3</span>
              </button>
              <button
                type="button"
                className={`season-btn ${seasonCoef === 2.5 ? 'active' : ''}`}
                onClick={() => setSeasonCoef(2.5)}
              >
                <span className="t">Mùa đông</span>
                <span className="c">Ít nắng · 2,5</span>
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="panelWattage">Công suất mỗi tấm pin (Wp)</label>
            <input
              type="number"
              id="panelWattage"
              value={panelWattage}
              min="1"
              step="5"
              onChange={(e) => setPanelWattage(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="inline-result">
            <span className="l">Công suất cần lắp</span>
            <span className="v" id="requiredKwpEl">{requiredKwp.toFixed(2)} kWp</span>
          </div>
          <div className="inline-result hero">
            <span className="l">Số lượng pin cần lắp</span>
            <span className="v" id="requiredPanelsEl">{requiredPanelCount} tấm</span>
          </div>
          <div className="hint">
            Công suất cần lắp = số điện/ngày ÷ số giờ nắng quy đổi. Số lượng pin cần lắp = công suất cần lắp ÷ công suất mỗi tấm.
          </div>
        </div>
      </div>

      {/* STEP 3: ROOF */}
      <div className="step roof">
        <div className="step-head" onClick={() => toggleSection('step3')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num">3</span>
            <h2>Hình dạng mái</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{collapsedSections.step3 ? '▶' : '▼'}</span>
        </div>
        
        <div style={{ display: collapsedSections.step3 ? 'none' : 'block', marginTop: '12px' }}>
          <div id="roofListContainer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roofs.map(roof => (
              <div className="roof-card" key={roof.id}>
                <div className="roof-card-header">
                  <span className="roof-card-title">{roof.name}</span>
                  {roofs.length > 1 && (
                    <button
                      type="button"
                      className="btn-sm btn-sm-danger"
                      style={{ padding: '2px 6px' }}
                      onClick={() => onDeleteRoof(roof.id)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <div className="field">
                  <label>Hình dạng</label>
                  <select
                    className="roof-shape-select"
                    value={roof.shape}
                    onChange={(e) => updateRoofField(roof.id, 'shape', e.target.value)}
                  >
                    <option value="rectangle">Hình chữ nhật</option>
                    <option value="triangle">Hình tam giác</option>
                    <option value="trapezoid">Hình thang</option>
                    <option value="rhombus">Hình thoi</option>
                  </select>
                </div>
                <div className="field-row">
                  {roof.shape === 'rectangle' && (
                    <>
                      <div className="field">
                        <label>Rộng W (m)</label>
                        <input
                          type="number"
                          value={roof.w}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Dài dốc H (m)</label>
                        <input
                          type="number"
                          value={roof.h}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {roof.shape === 'triangle' && (
                    <>
                      <div className="field">
                        <label>Đáy W (m)</label>
                        <input
                          type="number"
                          value={roof.w}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Chiều cao H (m)</label>
                        <input
                          type="number"
                          value={roof.h}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {roof.shape === 'trapezoid' && (
                    <>
                      <div className="field">
                        <label>Đáy dưới W1 (m)</label>
                        <input
                          type="number"
                          value={roof.w}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Đáy trên W2 (m)</label>
                        <input
                          type="number"
                          value={roof.w2 || roof.w}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'w2', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Chiều cao H (m)</label>
                        <input
                          type="number"
                          value={roof.h}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {roof.shape === 'rhombus' && (
                    <>
                      <div className="field">
                        <label>Chéo ngang W (m)</label>
                        <input
                          type="number"
                          value={roof.w}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'w', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Chéo đứng H (m)</label>
                        <input
                          type="number"
                          value={roof.h}
                          min="0.5"
                          step="0.1"
                          onChange={(e) => updateRoofField(roof.id, 'h', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn-secondary"
            id="addRoofBtn"
            style={{ marginTop: '4px', width: '100%' }}
            onClick={onAddRoof}
          >
            + Thêm mái mới
          </button>
        </div>
      </div>

      {/* STEP 4: PANELS */}
      <div className="step roof">
        <div className="step-head" onClick={() => toggleSection('step4')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num">4</span>
            <h2>Xếp tấm pin trên mái</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{collapsedSections.step4 ? '▶' : '▼'}</span>
        </div>
        
        <div style={{ display: collapsedSections.step4 ? 'none' : 'block', marginTop: '12px' }}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="machW">Rộng tấm (m)</label>
              <input
                type="number"
                id="machW"
                value={machW}
                min="0.1"
                step="0.01"
                onChange={(e) => setMachW(parseFloat(e.target.value) || 0.1)}
              />
            </div>
            <div className="field">
              <label htmlFor="machH">Dài tấm (m)</label>
              <input
                type="number"
                id="machH"
                value={machH}
                min="0.1"
                step="0.01"
                onChange={(e) => setMachH(parseFloat(e.target.value) || 0.1)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="gap">Khoảng cách giữa các tấm (m)</label>
            <input
              type="number"
              id="gap"
              value={gap}
              min="0"
              step="0.01"
              onChange={(e) => setGap(parseFloat(e.target.value) || 0)}
            />
          </div>
          <button
            className="btn-primary"
            id="autoLayoutBtn"
            style={{ width: '100%' }}
            onClick={onAutoLayout}
          >
            Tính toán tự động (tất cả mái)
          </button>
          <div
            style={{
              fontSize: '11.5px',
              color: 'var(--muted)',
              marginTop: '6px',
              fontFamily: "'IBM Plex Mono', monospace"
            }}
          >
            Thêm tấm pin vào:
          </div>
          <div className="btn-row" id="addPanelButtonsRow">
            {roofs.map(r => (
              <button
                key={r.id}
                className="btn-secondary"
                type="button"
                onClick={() => onAddPanel(r.id)}
              >
                + 1 tấm ({r.name})
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button
              className="btn-danger"
              id="removeSelectedBtn"
              disabled={selectedMachineId == null}
              onClick={onRemoveSelectedPanel}
            >
              Xóa tấm đã chọn
            </button>
            <button className="btn-secondary" id="clearBtn" onClick={onClearAllPanels}>
              Xóa tất cả
            </button>
          </div>
          <div className="hint">
            Kéo tấm để di chuyển, bấm <b>↻</b> hoặc double‑click vào từng tấm để xoay riêng. Nút "Xoay tất cả" nằm ngay phía trên mỗi mái ở khung mô phỏng bên phải. Viền đỏ = chồng lấn hoặc không nằm hoàn toàn trong mái.
          </div>
        </div>
      </div>

      {/* STEP 5: KẾT QUẢ */}
      <div className="step roof" style={{ borderBottom: 'none' }}>
        <div
          className="step-head"
          onClick={() => toggleSection('step5')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="step-num" style={{ background: 'var(--green)' }}>✓</span>
            <h2>Kết quả thiết kế</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {collapsedSections.step5 ? '▶' : '▼'}
          </span>
        </div>
        
        <div style={{ display: collapsedSections.step5 ? 'none' : 'block', marginTop: '12px' }}>
          <Stats
            machines={machines}
            roofs={roofs}
            panelWattage={panelWattage}
            requiredPanelCount={requiredPanelCount}
            dailyConsumptionKwh={dailyConsumptionKwh}
            isSidebar={true}
          />
        </div>
      </div>
    </aside>
  );
}
