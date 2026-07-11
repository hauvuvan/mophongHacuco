"use server";

import { db } from "./db/index";
import { solarSimulations } from "./db/schema";
import { eq, desc } from "drizzle-orm";

export async function loadSimulations(userEmail) {
  try {
    const data = await db
      .select()
      .from(solarSimulations)
      .where(eq(solarSimulations.userEmail, userEmail.toLowerCase()))
      .orderBy(desc(solarSimulations.updatedAt));
      
    return data.map(rowToSim);
  } catch (error) {
    console.error("Failed to load simulations:", error);
    throw error;
  }
}

export async function saveSimulation(sim, userEmail) {
  try {
    await db
      .insert(solarSimulations)
      .values({
        id: sim.id,
        userEmail: userEmail.toLowerCase(),
        name: sim.name,
        data: sim,
        updatedAt: new Date(),
        createdAt: sim.createdAt ? new Date(sim.createdAt) : new Date(),
      })
      .onConflictDoUpdate({
        target: solarSimulations.id,
        set: {
          name: sim.name,
          data: sim,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Failed to save simulation:", error);
    throw error;
  }
}

export async function deleteSimulation(id) {
  try {
    await db.delete(solarSimulations).where(eq(solarSimulations.id, id));
  } catch (error) {
    console.error("Failed to delete simulation:", error);
    throw error;
  }
}

function rowToSim(row) {
  return {
    ...(row.data || {}),
    id: row.id,
    name: row.name,
    createdAt: row.createdAt?.toISOString(),
    updatedAt: row.updatedAt?.toISOString(),
  };
}
