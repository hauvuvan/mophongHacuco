import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { Dialog, DialogBody, DialogFooter } from './ui/Dialog';

export default function Dashboard({ simulations, onCreateSimulation, onDeleteSimulation, onSelectSimulation, onRenameSimulation }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [simToDelete, setSimToDelete] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const name = newSimName.trim() || `Dự án mới — ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
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
    if (e?.preventDefault) e.preventDefault();
    if (renameName.trim()) onRenameSimulation(id, renameName.trim());
    setRenamingId(null);
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* PageHeader */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Mô phỏng của tôi</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Quản lý và thiết kế các phương án lắp đặt pin mặt trời
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Tạo mô phỏng mới
        </Button>
      </div>

      {/* Empty state */}
      {simulations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)] py-16 flex flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl">📐</span>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Chưa có mô phỏng nào</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-sm">
            Bấm nút "Tạo mô phỏng mới" ở góc trên bên phải để bắt đầu thiết kế phương án đầu tiên.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-2">Bắt đầu ngay</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {simulations.map(sim => {
            const totalRoofs = sim.roofs?.length || 0;
            const totalPanels = sim.machines?.length || 0;
            const totalPowerKwp = (totalPanels * (sim.panelWattage || 630)) / 1000;

            return (
              <Card
                key={sim.id}
                className="cursor-pointer hover:border-[var(--color-foreground)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                onClick={() => onSelectSimulation(sim.id)}
              >
                <CardContent className="flex flex-col gap-3 flex-1">
                  {/* Icon + title */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center text-xl shrink-0">☀️</div>
                    <div className="flex-1 min-w-0">
                      {renamingId === sim.id ? (
                        <form
                          onSubmit={(e) => handleRenameSubmit(sim.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex gap-1.5"
                        >
                          <Input
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            autoFocus
                            onBlur={(e) => handleRenameSubmit(sim.id, e)}
                            className="h-7 text-sm"
                          />
                          <Button type="submit" size="sm" className="h-7 px-2">Lưu</Button>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-sm font-semibold text-[var(--color-foreground)] leading-tight">{sim.name}</h3>
                          <button
                            type="button"
                            onClick={(e) => startRename(sim, e)}
                            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5"
                            title="Đổi tên"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <div className="text-xs text-[var(--color-muted-foreground)] mt-1 space-y-0.5">
                        <div>Tạo: {fmtDate(sim.createdAt || sim.updatedAt)}</div>
                        <div>Sửa: {fmtDate(sim.updatedAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer info */}
                  {(sim.customerName || sim.customerPhone || sim.customerAddress) && (
                    <div className="text-xs bg-[var(--color-secondary)] rounded-md px-3 py-2 space-y-0.5 border border-[var(--color-border)]">
                      {sim.customerName && <div><span className="text-[var(--color-muted-foreground)]">KH:</span> <strong>{sim.customerName}</strong></div>}
                      {sim.customerPhone && <div><span className="text-[var(--color-muted-foreground)]">SĐT:</span> <strong>{sim.customerPhone}</strong></div>}
                      {sim.customerAddress && <div><span className="text-[var(--color-muted-foreground)]">Địa chỉ:</span> <strong>{sim.customerAddress}</strong></div>}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">{totalRoofs}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">Số mái</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">{totalPanels}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">Số tấm pin</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--color-foreground)]">{totalPowerKwp.toFixed(2)} kWp</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">Công suất</span>
                    </div>
                  </div>
                </CardContent>

                {/* Actions */}
                <div
                  className="flex justify-end gap-2 px-5 pb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); startRename(sim, e); }}
                    title="Đổi tên"
                    className="w-9 h-8 p-0"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSimToDelete(sim)}
                    title="Xóa"
                    className="w-9 h-8 p-0 text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white"
                  >
                    🗑️
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo mô phỏng lắp đặt mới">
        <form onSubmit={handleCreateSubmit}>
          <DialogBody>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newSimName">Tên mô phỏng / Tên dự án</Label>
              <Input
                id="newSimName"
                placeholder="Ví dụ: Dự án biệt thự chú Ba, Mô phỏng xưởng A..."
                value={newSimName}
                onChange={(e) => setNewSimName(e.target.value)}
                autoFocus
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Hủy</Button>
            <Button type="submit">Tạo dự án</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={!!simToDelete} onClose={() => setSimToDelete(null)} title="Xóa thiết kế này?" maxWidth="max-w-sm">
        <DialogBody>
          <p className="text-sm text-[var(--color-foreground)]">
            Thao tác này sẽ xóa vĩnh viễn thiết kế <strong>{simToDelete?.name}</strong> và không thể hoàn tác.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSimToDelete(null)}>Hủy</Button>
          <Button
            variant="destructive"
            onClick={() => { onDeleteSimulation(simToDelete.id); setSimToDelete(null); }}
          >
            Xóa vĩnh viễn
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
