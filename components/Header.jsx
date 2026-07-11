import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { getUsers, createUser, updateRole, removeUser, changePassword } from '@/lib/admin';

const countAdmins = (list) => list.filter(u => u.role === 'admin').length;
import { Button } from './ui/Button';
import { Input, Label, Select } from './ui/Input';
import { Badge } from './ui/Badge';
import { Dialog, DialogBody, DialogFooter } from './ui/Dialog';

export default function Header({ user, currentSimulationId, onBackToDashboard }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [pwNew, setPwNew] = useState({});
  const [pwConfirm, setPwConfirm] = useState({});
  const [pwError, setPwError] = useState({});
  const [pwSuccess, setPwSuccess] = useState({});
  const [expandedPw, setExpandedPw] = useState({});

  const handleLogout = () => signOut();

  const openAdminModal = async () => {
    setShowAdminModal(true);
    setLoadingUsers(true);
    setAddError('');
    setAddSuccess('');
    try {
      setUserList(await getUsers());
    } catch (e) {
      setAddError('Không tải được danh sách người dùng.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!newUserEmail) { setAddError('Vui lòng nhập email.'); return; }
    try {
      await createUser(newUserEmail, newUserPassword, newUserRole);
      setAddSuccess(`✓ Đã thêm tài khoản: ${newUserEmail}`);
      setNewUserEmail('');
      setNewUserPassword('');
      setUserList(await getUsers());
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleToggleRole = async (email) => {
    const target = userList.find(u => u.email === email);
    if (!target) return;
    if (target.role === 'admin' && countAdmins(userList) <= 1) return;
    const newRole = target.role === 'admin' ? 'user' : 'admin';
    try {
      await updateRole(email, newRole);
      setUserList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (email.toLowerCase() === user.email.toLowerCase()) return;
    try {
      await removeUser(email);
      setUserList(prev => prev.filter(u => u.email !== email));
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleChangePassword = async (targetEmail) => {
    const np = pwNew[targetEmail] || '';
    const cp = pwConfirm[targetEmail] || '';
    setPwError(p => ({ ...p, [targetEmail]: '' }));
    setPwSuccess(p => ({ ...p, [targetEmail]: '' }));
    if (np.length < 6) { setPwError(p => ({ ...p, [targetEmail]: 'Mật khẩu phải có ít nhất 6 ký tự.' })); return; }
    if (np !== cp) { setPwError(p => ({ ...p, [targetEmail]: 'Mật khẩu xác nhận không khớp.' })); return; }
    try {
      await changePassword(targetEmail, np);
      setPwNew(p => ({ ...p, [targetEmail]: '' }));
      setPwConfirm(p => ({ ...p, [targetEmail]: '' }));
      setPwSuccess(p => ({ ...p, [targetEmail]: '✓ Đã cập nhật mật khẩu.' }));
      setTimeout(() => setPwSuccess(p => ({ ...p, [targetEmail]: '' })), 2500);
    } catch (err) {
      setPwError(p => ({ ...p, [targetEmail]: err.message }));
    }
  };

  return (
    <>
      <header className="h-12 shrink-0 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm tracking-widest uppercase">HACUCO</span>
          {currentSimulationId && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-white/25 hover:bg-white/10 transition-colors"
            >
              ← Trang chủ
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60 hidden sm:block">{user?.email}</span>
          <Badge tone={user?.role === 'admin' ? 'danger' : 'muted'} className="text-[10px]">
            {user?.role === 'admin' ? 'Admin' : 'Người dùng'}
          </Badge>
          {user?.role === 'admin' && (
            <button
              onClick={openAdminModal}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="hidden sm:inline">Quản lý người dùng</span>
              <span className="sm:hidden">Quản lý</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-white/25 hover:bg-white/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <Dialog open={showAdminModal} onClose={() => setShowAdminModal(false)} title="Quản lý người dùng">
        <DialogBody className="space-y-0 p-0">
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3">
              Danh sách tài khoản
            </p>
            {loadingUsers ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">Đang tải…</p>
            ) : userList.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">Chưa có tài khoản nào.</p>
            ) : (
              <div className="space-y-2">
                {userList.map((u) => {
                  const isSelf = u.email.toLowerCase() === user.email.toLowerCase();
                  const isLastAdmin = u.role === 'admin' && countAdmins(userList) === 1;
                  const pwOpen = expandedPw[u.email];

                  return (
                    <div key={u.email} className="space-y-1.5">
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)]">
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-medium truncate">{u.email}</span>
                          {u.name && <span className="text-[11px] text-[var(--color-muted-foreground)] truncate">{u.name}</span>}
                        </div>
                        <span className="text-[10px] text-[var(--color-muted-foreground)] shrink-0 font-mono">{u.rawRole}</span>
                        <Badge tone={u.role === 'admin' ? 'danger' : 'muted'} className="text-[10px] shrink-0">
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        {isSelf && <span className="text-xs text-[var(--color-muted-foreground)]">(Bạn)</span>}
                        <Button variant="outline" size="sm" disabled={isLastAdmin && u.role === 'admin'} onClick={() => handleToggleRole(u.email)} className="text-[11px] h-7 px-2">
                          {u.role === 'admin' ? '→ User' : '→ Admin'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setExpandedPw(p => ({ ...p, [u.email]: !p[u.email] }))} className="text-[11px] h-7 px-2">
                          Đổi MK
                        </Button>
                        {!isSelf && (
                          <Button variant="destructive" size="sm" className="text-[11px] h-7 px-2" onClick={() => handleDeleteUser(u.email)}>
                            Xóa
                          </Button>
                        )}
                      </div>

                      {pwOpen && (
                        <div className="ml-3 pl-3 border-l border-[var(--color-border)] flex flex-col gap-2">
                          <div className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1">
                              <Label className="text-xs">Mật khẩu mới</Label>
                              <Input type="password" placeholder="Ít nhất 6 ký tự" value={pwNew[u.email] || ''} onChange={(e) => setPwNew(p => ({ ...p, [u.email]: e.target.value }))} />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <Label className="text-xs">Xác nhận</Label>
                              <Input type="password" placeholder="Nhập lại" value={pwConfirm[u.email] || ''} onChange={(e) => setPwConfirm(p => ({ ...p, [u.email]: e.target.value }))} />
                            </div>
                          </div>
                          {pwError[u.email] && <p className="text-xs text-[var(--color-destructive)]">{pwError[u.email]}</p>}
                          {pwSuccess[u.email] && <p className="text-xs text-emerald-600">{pwSuccess[u.email]}</p>}
                          <Button size="sm" className="self-start" onClick={() => handleChangePassword(u.email)}>Lưu mật khẩu</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {addError && <p className="text-xs text-[var(--color-destructive)] mt-2">{addError}</p>}
          </div>

          <hr className="border-[var(--color-border)] border-dashed" />

          <form onSubmit={handleAddUser} className="px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Thêm người dùng mới</p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="newEmail">Email</Label>
              <Input id="newEmail" type="email" placeholder="email@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="newRole">Quyền</Label>
              <Select id="newRole" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full">
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {addSuccess && <p className="text-xs text-emerald-600">{addSuccess}</p>}
            <Button type="submit">Thêm người dùng</Button>
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
}
