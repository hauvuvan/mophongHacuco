const USERS_KEY  = 'hacuco_users';
const SESSION_KEY = 'hacuco_session';
const SALT = 'hacuco_v1_salt_2024';
export const DEFAULT_ADMIN_EMAIL = 'hauvuvan26@gmail.com';
export const DEFAULT_ADMIN_PASS  = 'Admin@2024';

export async function hashPassword(pwd){
  const enc = new TextEncoder();
  const data = enc.encode(pwd + SALT);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

export function getUsers(){
  try{
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  }catch{
    return [];
  }
}

export function saveUsers(u){
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export function getSession(){
  try{
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  }catch{
    return null;
  }
}

export function saveSession(s){
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

export async function initDefaultAdmin(){
  const users = getUsers();
  if(users.length === 0){
    const hash = await hashPassword(DEFAULT_ADMIN_PASS);
    saveUsers([{ email: DEFAULT_ADMIN_EMAIL, password: hash, role: 'admin', isDefault: true }]);
  }
}

export async function attemptLogin(email, password){
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if(!user) return null;
  const hash = await hashPassword(password);
  if(hash !== user.password) return null;
  return user;
}

export function countAdmins(){
  return getUsers().filter(u => u.role === 'admin').length;
}
