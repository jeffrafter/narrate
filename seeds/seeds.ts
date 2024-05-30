import prisma from "@/util/db";

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  process.exit(1);
});

// const wait = async (ms: number) => {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// };

const CODES =
  "bonobos,giraffe,hippopotamus,hyena,meerkat,okapi,orangutan,porcupine,zebra";

(async () => {
  try {
    const codes = CODES.split(",");
    // Loop through the codes and create a user for each
    for (const code of codes) {
      const user = await prisma.user.create({
        data: {
          name: code,
          token: code,
          email: `jeffrafter+${code}@gmail.com`,
        },
      });
      console.log(`Created user ${user.name}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
