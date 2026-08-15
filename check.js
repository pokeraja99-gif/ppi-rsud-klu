const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ where: { username: { contains: 'nurianto' } } })
  .then(u => console.log(JSON.stringify(u, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
