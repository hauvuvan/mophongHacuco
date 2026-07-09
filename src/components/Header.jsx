import React, { useState } from 'react';
import {
  clearSession,
  getUsers,
  saveUsers,
  hashPassword,
  countAdmins
} from '../utils/auth';

export default function Header({ user, onLogout, currentSimulationId, onBackToDashboard }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [pwNew, setPwNew] = useState({});
  const [pwConfirm, setPwConfirm] = useState({});
  const [pwError, setPwError] = useState({});
  const [pwSuccess, setPwSuccess] = useState({});

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  const openAdminModal = () => {
    setUserList(getUsers());
    setAddError('');
    setAddSuccess('');
    setShowAdminModal(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!newUserEmail || !newUserPassword) {
      setAddError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newUserPassword.length < 6) {
      setAddError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    const currentUsers = getUsers();
    if (currentUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase().trim())) {
      setAddError('Email này đã tồn tại.');
      return;
    }

    const hashed = await hashPassword(newUserPassword);
    const updated = [...currentUsers, {
      email: newUserEmail.trim(),
      password: hashed,
      role: newUserRole,
      isDefault: false
    }];
    saveUsers(updated);
    setUserList(updated);
    setNewUserEmail('');
    setNewUserPassword('');
    setAddSuccess(`✓ Đã thêm tài khoản: ${newUserEmail}`);
  };

  const handleToggleRole = (targetEmail) => {
    const currentUsers = getUsers();
    const target = currentUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (!target) return;

    if (target.role === 'admin' && countAdmins() <= 1) {
      return; // Cannot demote last admin
    }

    target.role = target.role === 'admin' ? 'user' : 'admin';
    saveUsers(currentUsers);
    setUserList(currentUsers);
  };

  const handleDeleteUser = (targetEmail) => {
    if (targetEmail.toLowerCase() === user.email.toLowerCase()) return;
    const currentUsers = getUsers().filter(u => u.email.toLowerCase() !== targetEmail.toLowerCase());
    saveUsers(currentUsers);
    setUserList(currentUsers);
  };

  const handleChangePassword = async (targetEmail) => {
    const newPassword = pwNew[targetEmail] || '';
    const confirm = pwConfirm[targetEmail] || '';
    
    setPwError({ ...pwError, [targetEmail]: '' });
    setPwSuccess({ ...pwSuccess, [targetEmail]: '' });

    if (newPassword.length < 6) {
      setPwError({ ...pwError, [targetEmail]: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirm) {
      setPwError({ ...pwError, [targetEmail]: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    const currentUsers = getUsers();
    const u = currentUsers.find(x => x.email.toLowerCase() === targetEmail.toLowerCase());
    if (!u) return;

    u.password = await hashPassword(newPassword);
    u.isDefault = false;
    saveUsers(currentUsers);

    // Clear inputs
    setPwNew({ ...pwNew, [targetEmail]: '' });
    setPwConfirm({ ...pwConfirm, [targetEmail]: '' });

    // Show success briefly
    setPwSuccess({ ...pwSuccess, [targetEmail]: '✓ Đã cập nhật mật khẩu.' });
    setTimeout(() => {
      setPwSuccess(prev => ({ ...prev, [targetEmail]: '' }));
    }, 2500);
  };

  return (
    <>
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="header-brand">HACUCO</div>
          {currentSimulationId && (
            <button
              className="btn-header btn-header-outline"
              onClick={onBackToDashboard}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="btn-header-text-long">← Quay lại trang chủ</span>
              <span className="btn-header-text-short">← Trang chủ</span>
            </button>
          )}
        </div>
        <div className="header-user">
          <span className="header-email">{user?.email}</span>
          <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
            {user?.role === 'admin' ? 'Admin' : 'Người dùng'}
          </span>
          {user?.role === 'admin' && (
            <button className="btn-header" onClick={openAdminModal}>
              <span className="btn-header-text-long">Quản lý người dùng</span>
              <span className="btn-header-text-short">Quản lý</span>
            </button>
          )}
          <button className="btn-header btn-header-outline" onClick={handleLogout}>
            <span className="btn-header-text-long">Đăng xuất</span>
            <span className="btn-header-text-short">Thoát</span>
          </button>
        </div>
      </header>

      {showAdminModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowAdminModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quản lý người dùng</h2>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>✕</button>
            </div>

            <div>
              <p className="modal-section-title">Danh sách tài khoản</p>
              <div id="userList">
                {userList.length === 0 ? (
                  <p className="no-users-note">Chưa có tài khoản nào.</p>
                ) : (
                  userList.map((u) => {
                    const isSelf = u.email.toLowerCase() === user.email.toLowerCase();
                    const isLastAdmin = u.role === 'admin' && countAdmins() === 1;

                    return (
                      <div key={u.email} style={{ marginBottom: '8px' }}>
                        <div className="user-row">
                          <span className="user-email">{u.email}</span>
                          <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ fontSize: '10px' }}>
                            {u.role === 'admin' ? 'Admin' : 'Người dùng'}
                          </span>
                          {isSelf && <span className="user-self">(Bạn)</span>}
                          
                          <button
                            className="btn-sm btn-sm-secondary"
                            disabled={isLastAdmin && u.role === 'admin'}
                            title={isLastAdmin && isSelf ? 'Không thể hạ quyền admin duy nhất' : ''}
                            onClick={() => handleToggleRole(u.email)}
                          >
                            {u.role === 'admin' ? '→ Người dùng' : '→ Admin'}
                          </button>
                          
                          <button
                            className="btn-sm btn-sm-secondary"
                            onClick={() => {
                              const el = document.getElementById(`pw-form-${u.email.replace(/[@.]/g, '-')}`);
                              if (el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
                            }}
                          >
                            Đổi mật khẩu
                          </button>

                          {!isSelf && (
                            <button className="btn-sm btn-sm-danger" onClick={() => handleDeleteUser(u.email)}>
                              Xóa
                            </button>
                          )}
                        </div>

                        {/* Inline password change form */}
                        <div
                          className="change-pw-inline"
                          id={`pw-form-${u.email.replace(/[@.]/g, '-')}`}
                          style={{ display: 'none', flexDirection: 'column' }}
                        >
                          <div className="field-row" style={{ gap: '8px' }}>
                            <div className="field">
                              <label>Mật khẩu mới</label>
                              <input
                                type="password"
                                placeholder="Ít nhất 6 ký tự"
                                value={pwNew[u.email] || ''}
                                onChange={(e) => setPwNew({ ...pwNew, [u.email]: e.target.value })}
                              />
                            </div>
                            <div className="field">
                              <label>Xác nhận</label>
                              <input
                                type="password"
                                placeholder="Nhập lại"
                                value={pwConfirm[u.email] || ''}
                                onChange={(e) => setPwConfirm({ ...pwConfirm, [u.email]: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          {pwError[u.email] && <div className="change-pw-error">{pwError[u.email]}</div>}
                          {pwSuccess[u.email] && <div className="success-msg" style={{ color: 'var(--green)' }}>{pwSuccess[u.email]}</div>}
                          
                          <button
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '7px 12px', alignSelf: 'flex-start', marginTop: '6px' }}
                            onClick={() => handleChangePassword(u.email)}
                          >
                            Lưu mật khẩu
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <hr className="divider" />

            <form className="add-user-form" onSubmit={handleAddUser}>
              <p className="modal-section-title">Thêm người dùng mới</p>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Quyền</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                    <option value="user">Người dùng</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              {addError && <div className="add-user-error">{addError}</div>}
              {addSuccess && <div className="success-msg">{addSuccess}</div>}
              
              <button className="btn-primary" type="submit">Thêm người dùng</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
