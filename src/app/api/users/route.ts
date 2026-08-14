import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        unit: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role || "USER",
        unit,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      }
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
