import prisma from "@/util/db";
import { requireUserByToken } from "@/util/requireUserByToken";
import { NextApiResponse } from "next";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request, res: NextApiResponse) {
  const { content } = await req.json();

  let user;
  try {
    user = await requireUserByToken(req);
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return new Response(JSON.stringify({ conversation }));
}
