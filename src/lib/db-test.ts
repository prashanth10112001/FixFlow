import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.$connect();

  const result = await prisma.$queryRaw`
    SELECT current_database() AS database,
           NOW() AS server_time
  `;

  console.log("Database connected successfully!");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
