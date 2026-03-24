import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const operatorEmail = process.env.OPERATOR_EMAIL ?? "operator@wedprint.com";
  const operatorPassword = process.env.OPERATOR_SEED_PASSWORD ?? "changeme123!";

  const existing = await db.user.findUnique({ where: { email: operatorEmail } });

  if (existing) {
    console.log(`Operator already exists: ${operatorEmail}`);
    return;
  }

  const operator = await db.user.create({
    data: {
      email: operatorEmail,
      name: "WedPrint Operator",
      role: "operator",
      passwordHash: hashSync(operatorPassword, 12),
    },
  });

  console.log(`Created operator: ${operator.email}`);
  console.log(`Password: ${operatorPassword}`);
  console.log("IMPORTANT: Change your password after first login!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
