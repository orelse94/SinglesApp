import { prisma } from "../src/lib/db/prisma";

async function main() {
  const interests = [
    { name: "Wellness", slug: "wellness" },
    { name: "Travel", slug: "travel" },
    { name: "Events", slug: "events" },
    { name: "Culture", slug: "culture" },
  ];

  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { slug: interest.slug },
      update: { name: interest.name, isActive: true },
      create: interest,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });