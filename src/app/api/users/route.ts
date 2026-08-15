import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { User } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.select({
      id: User.id,
      name: User.name,
      username: User.username,
      role: User.role,
      unit: User.unit,
      createdAt: User.createdAt,
    }).from(User).where(eq(User.isActive, true)).orderBy(desc(User.createdAt));

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, password, role, unit } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Name, username, and password are required" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await db.select().from(User).where(eq(User.username, username)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(User).values({
      name,
      username,
      password: hashedPassword,
      role: role || "USER",
      unit,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await db.select({
      id: User.id,
      name: User.name,
      username: User.username,
      role: User.role,
    }).from(User).orderBy(desc(User.id)).limit(1);

    return NextResponse.json({ success: true, data: user[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
