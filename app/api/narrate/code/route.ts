import prisma from "@/util/db";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Messages represent all of the history of the narration
  const { code } = await req.json();

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  // Check that the code is in the process env codes (split by comma)
  const user = await prisma.user.findUnique({
    where: {
      token: code,
    },
  });
  if (!user) {
    return new Response("Invalid code", { status: 400 });
  }

  // Add a cookie to the response
  const response = new Response(JSON.stringify({ code }));
  response.headers.set("Set-Cookie", `animal=${code}; SameSite=None; Secure`);

  return response;
}
