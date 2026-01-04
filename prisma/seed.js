import prisma from "../src/utils/prisma-client.js"; 

async function main() {
  await prisma.activityLog.createMany({
    data: [
      {
        action: "LOGIN",
        entity: "User",
        entityId: 1,
        details: "User logged in successfully",
        userId: 1,
      },
      {
        action: "CREATE_ORDER",
        entity: "Order",
        entityId: 101,
        details: "Order created for 3 items",
        userId: 1,
      },
      {
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: 1,
        details: "User updated profile picture",
        userId: 1,
      },
    ],
  });

  console.log("Seeded activity logs!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
