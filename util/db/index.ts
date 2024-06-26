import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    errorFormat: "minimal",
  });
} else {
  // See also https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
  (globalThis as any)["prisma"] =
    (globalThis as any)["prisma"] ||
    new PrismaClient({
      errorFormat: "pretty",
    });
  prisma = (globalThis as any)["prisma"];
}

export default prisma;
