import { NextApiResponse } from "next";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function POST(req: Request, res: NextApiResponse) {
  const { content } = await req.json();

  const response = await fetch(`${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: {
      accept: "audio/mpeg",
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: content,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }),
  });

  if (!response || !response.body) return;

  return response;
}

// export async function POST(req: Request, res: NextApiResponse) {
//   const { content } = await req.json();

//   const stream = new PassThrough();
//   stream.pipe(res);

//   const response = await fetch(
//     `${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}/stream`,
//     {
//       method: "POST",
//       headers: {
//         accept: "audio/mpeg",
//         "xi-api-key": ELEVENLABS_API_KEY,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         text: content,
//         model_id: "eleven_monolingual_v1",
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.5,
//         },
//       }),
//     }
//   );

//   if (!response || !response.body) return;

//   const reader = response.body.getReader();
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) {
//       // Do something with last chunk of data then exit reader
//       return res;
//     }
//     // Otherwise do something here to process current chunk
//     stream.push(value);
//   }

//   return res;
// }
