import React, { useState } from 'react';

export default function Dashboard({
  simulations,
  onCreateSimulation,
  onDeleteSimulation,
  onSelectSimulation,
  onRenameSimulation
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [simToDelete, setSimToDelete] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const name = newSimName.trim() || `Dự án mới - ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    onCreateSimulation(name);
    setNewSimName('');
    setShowCreateModal(false);
  };

  const startRename = (sim, e) => {
    e.stopPropagation();
    setRenamingId(sim.id);
    setRenameName(sim.name);
  };

  const handleRenameSubmit = (id, e) => {
    e.preventDefault();
    if (renameName.trim()) {
      onRenameSimulation(id, renameName.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Mô phỏng của tôi</h1>
          <p className="dashboard-subtitle">Quản lý và thiết kế các phương án lắp đặt pin mặt trời</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px' }}
        >
          ➕ Tạo mô phỏng mới
        </button>
      </div>

      {simulations.length === 0 ? (
        <div className="empty-dashboard">
          <div className="empty-icon">📐</div>
          <h3>Chưa có mô phỏng nào</h3>
          <p>Bấm nút "Tạo mô phỏng mới" ở góc trên bên phải để bắt đầu thiết kế phương án đầu tiên.</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ marginTop: '12px' }}
          >
            Bắt đầu ngay
          </button>
        </div>
      ) : (
        <div className="simulations-grid">
          {simulations.map(sim => {
            const totalRoofs = sim.roofs?.length || 0;
            const totalPanels = sim.machines?.length || 0;
            
            // Calculate total power
            const panelWattage = sim.panelWattage || 630;
            const totalPowerKwp = (totalPanels * panelWattage) / 1000;

            return (
              <div
                className="sim-card"
                key={sim.id}
                onClick={() => onSelectSimulation(sim.id)}
              >
                <div className="sim-card-icon">☀️</div>
                
                <div className="sim-card-content">
                  {renamingId === sim.id ? (
                    <form
                      onSubmit={(e) => handleRenameSubmit(sim.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="rename-form"
                    >
                      <input
                        type="text"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        autoFocus
                        onBlur={(e) => handleRenameSubmit(sim.id, e)}
                      />
                      <button type="submit" className="btn-save-name">Lưu</button>
                    </form>
                  ) : (
                    <div className="sim-card-title-row">
                      <h3 className="sim-card-title">{sim.name}</h3>
                      <button
                        type="button"
                        className="btn-sim-action"
                        onClick={(e) => startRename(sim, e)}
                        title="Đổi tên"
                      >
                        ✏️
                      </button>
                    </div>
                  )}

                  <div className="sim-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '11.5px' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Tạo lúc: </span>
                      <strong style={{ color: 'var(--ink)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px' }}>
                        {new Date(sim.createdAt || sim.updatedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Cập nhật: </span>
                      <strong style={{ color: 'var(--ink)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px' }}>
                        {new Date(sim.updatedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </strong>
                    </div>
                  </div>

                  {/* Customer Info inside Card */}
                  {(sim.customerName || sim.customerPhone || sim.customerAddress) && (
                    <div className="sim-card-customer" style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(30,58,95,0.02)', border: '1px solid var(--line-strong)', borderRadius: '6px', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sim.customerName && <div><span style={{ color: 'var(--muted)' }}>Khách hàng:</span> <strong>{sim.customerName}</strong></div>}
                      {sim.customerPhone && <div><span style={{ color: 'var(--muted)' }}>SĐT:</span> <strong>{sim.customerPhone}</strong></div>}
                      {sim.customerAddress && <div><span style={{ color: 'var(--muted)' }}>Địa chỉ:</span> <strong>{sim.customerAddress}</strong></div>}
                    </div>
                  )}

                  <div className="sim-card-stats">
                    <div className="sim-stat-item">
                      <span className="sim-stat-val">{totalRoofs}</span>
                      <span className="sim-stat-lbl">Số mái</span>
                    </div>
                    <div className="sim-stat-item">
                      <span className="sim-stat-val">{totalPanels}</span>
                      <span className="sim-stat-lbl">Số tấm pin</span>
                    </div>
                    <div className="sim-stat-item">
                      <span className="sim-stat-val">{totalPowerKwp.toFixed(2)} kWp</span>
                      <span className="sim-stat-lbl">Công suất</span>
                    </div>
                  </div>
                </div>

                <div className="sim-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn-open-sim"
                    onClick={() => onSelectSimulation(sim.id)}
                  >
                    Mở thiết kế
                  </button>
                   <button
                    type="button"
                    className="btn-delete-sim"
                    onClick={() => setSimToDelete(sim)}
                    title="Xóa thiết kế"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Simulation Modal */}
      {showCreateModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <form
            className="confirm-modal-card"
            onSubmit={handleCreateSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-title">
              ➕ Tạo mô phỏng lắp đặt mới
            </div>
            <div className="field" style={{ margin: '8px 0' }}>
              <label htmlFor="newSimName">Tên mô phỏng / Tên dự án</label>
              <input
                type="text"
                id="newSimName"
                placeholder="Ví dụ: Dự án biệt thự chú Ba, Mô phỏng xưởng A..."
                value={newSimName}
                onChange={(e) => setNewSimName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                Tạo dự án
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {simToDelete && (
        <div className="confirm-modal-overlay" onClick={() => setSimToDelete(null)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-title">
              ⚠️ Xóa thiết kế này?
            </div>
            <div className="confirm-modal-body">
              Thao tác này sẽ xóa vĩnh viễn thiết kế <strong>{simToDelete.name}</strong> và mọi thông số đi kèm. Hành động này không thể hoàn tác.
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={() => setSimToDelete(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={() => {
                  onDeleteSimulation(simToDelete.id);
                  setSimToDelete(null);
                }}
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
