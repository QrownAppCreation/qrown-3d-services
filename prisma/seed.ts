import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const operatorEmail    = process.env.OPERATOR_EMAIL          ?? "operator@wedprint.com";
  const operatorPassword = process.env.OPERATOR_SEED_PASSWORD  ?? "changeme123!";
  const passwordHash     = hashSync(operatorPassword, 12);

  // Upsert so re-running the seed updates the password hash if needed
  const operator = await db.user.upsert({
    where:  { email: operatorEmail },
    update: { passwordHash, role: "operator" },
    create: {
      email:        operatorEmail,
      name:         "WedPrint Operator",
      role:         "operator",
      passwordHash,
    },
  });

  console.log("✓ Operator user ready");
  console.log(`  Email   : ${operator.email}`);
  console.log(`  Password: ${operatorPassword}`);
  console.log(`  Role    : ${operator.role}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
