import prisma from "@/util/db";

const CODES =
  "bonobos,giraffe,hippopotamus,hyena,meerkat,okapi,orangutan,porcupine,zebra";

export const requireUserByToken = async (req: Request) => {
  const cookie = req.headers.get("cookie");
  const code = cookie?.split("animal=")[1]?.split(";")[0];

  if (!code) {
    throw new Error("No code provided");
  }

  // Check that the code is in the process env codes (split by comma)
  const codes = CODES.split(",");
  if (!codes.includes(code)) {
    throw new Error("Invalid code");
  }

  const user = await prisma.user.findUnique({
    where: {
      token: code,
    },
  });

  return user;
};
