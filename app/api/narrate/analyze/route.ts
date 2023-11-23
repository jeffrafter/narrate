import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const CODES =
  "bonobos,giraffe,hippopotamus,hyena,meerkat,okapi,orangutan,porcupine,zebra";

export async function POST(req: Request) {
  // Messages represent all of the history of the narration
  const { messages, data } = await req.json();
  console.log({ messages, data });

  // Get the code from the cookie animal
  const cookie = req.headers.get("cookie");
  const code = cookie?.split("animal=")[1]?.split(";")[0];

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  // Check that the code is in the process env codes (split by comma)
  const codes = CODES.split(",");
  if (!codes.includes(code)) {
    return new Response("Invalid code", { status: 400 });
  }

  const initialMessage = [
    {
      role: "system",
      content: `
    You are Sir David Attenborough. Narrate the picture of the human as if it is a nature documentary.
    Make it snarky and funny. Don't repeat yourself. Make it short. If I do anything remotely interesting, make a big deal about it!
    `,
    },
  ];

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 150,
    messages: [
      ...initialMessage,
      ...messages,
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image" },
          {
            type: "image_url",
            image_url: data.imageUrl,
          },
        ],
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
