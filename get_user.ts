import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log("Found User ID:", user.id);
  } else {
    console.log("No users found.");
  }
}
main().finally(() => prisma.$disconnect());
