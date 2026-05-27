import 'dotenv/config'
import { PrismaClient, RoleName } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const roles = await Promise.all(
    [RoleName.STUDENT, RoleName.STAFF, RoleName.COORDINATOR, RoleName.ADMIN].map(
      async (name) => {
        const created = await prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        console.log(`  Role: ${created.name}`);
        return created;
      },
    ),
  );

  const requestTypes = [
    {
      name: 'Certificado',
      description: 'Solicitud de certificado académico',
      estimatedDays: 3,
    },
    {
      name: 'Homologación',
      description: 'Solicitud de homologación de materias',
      estimatedDays: 15,
    },
    {
      name: 'Cancelación',
      description: 'Cancelación de materias o semestre',
      estimatedDays: 5,
    },
    {
      name: 'Paz y salvo',
      description: 'Solicitud de paz y salvo institucional',
      estimatedDays: 3,
    },
    {
      name: 'Recurso',
      description: 'Recurso de apelación sobre una nota o decisión',
      estimatedDays: 10,
    },
  ];

  for (const rt of requestTypes) {
    const created = await prisma.requestType.upsert({
      where: { name: rt.name },
      update: {},
      create: rt,
    });
    console.log(`  RequestType: ${created.name}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
