import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const { password, name, role, unit } = body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (unit !== undefined) updateData.unit = unit;
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (session.user.id === userId.toString()) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
