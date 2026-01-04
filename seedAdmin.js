import prisma from "./src/utils/prisma-client.js"; // make sure this path is correct
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@gmail.com";

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const hashed = await bcrypt.hash("admin123", 10); // hash password

  await prisma.user.create({
    data: {
      name: "Nabina Dahal",
      email: email,
      password: hashed,       // <-- use hashed password here
      role: "ADMIN"
    }
  });

  console.log("Admin created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });