"use server";
import { db } from "./db/index";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  const data = await db.select().from(users);
  return data.map(u => ({ ...u, rawRole: u.role }));
}

export async function createUser(email, password, role) {
  try {
    await db.insert(users).values({
      email: email.toLowerCase(),
      role: role,
      isActive: true,
    });
  } catch (error) {
    if (error.code === '23505') throw new Error("Email này đã tồn tại trong hệ thống.");
    throw new Error("Lỗi khi thêm user: " + error.message);
  }
}

export async function updateRole(email, newRole) {
  await db.update(users).set({ role: newRole }).where(eq(users.email, email.toLowerCase()));
}

export async function removeUser(email) {
  await db.delete(users).where(eq(users.email, email.toLowerCase()));
}

export async function changePassword(email, newPassword) {
  throw new Error("Hệ thống hiện dùng Google Login nên không lưu mật khẩu.");
}

export async function countAdmins(userList) {
  return userList.filter(u => u.role === 'admin').length;
}
