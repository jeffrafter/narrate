"use client";

import { useChat } from "ai/react";
import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { Message } from "ai";

export default function Chat() {
  const finish = (content: string) => {
    setStatus("saying");
    fetch("/api/narrate/say", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
      .then((response) => {
        // There is a streaming mpeg audio response, create an audio element and play it
        console.log("response", response);
        return response.blob();
      })
      .then((blob) => {
        setStatus("ready");
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      });
  };

  const { messages, setInput, handleSubmit } = useChat({
    api: "/api/narrate/analyze",
    onFinish: (message: Message) => {
      finish(message.content);
    },
  });

  const webcamRef = useRef(null as any);
  const formRef = useRef(null as any);
  const [imgSrc, setImgSrc] = useState(null as string | null);
  const [audioSrc, setAudioSrc] = useState(null as string | null);
  const [status, setStatus] = useState("ready");
  const [frontFacing, setFrontFacing] = useState(true);

  const retake = () => {
    setImgSrc(null);
  };

  // create a capture function
  const capture = useCallback(
    (e: any) => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      setInput("Describe this image");
      setImgSrc(imageSrc);
      submitForm(e);
    },
    [webcamRef, formRef]
  );

  const submitForm = (e: any) => {
    // Encode the image as jpeg base64
    if (!imgSrc) return;
    setStatus("analyzing");
    handleSubmit(e, {
      data: {
        imageUrl: imgSrc as string,
      },
    });
  };

  const videoConstraints = {
    width: 250,
    height: 250,
    facingMode: frontFacing ? "user" : "environment",
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <form onSubmit={submitForm}>
        <div
          className="webcam-container border-b-orange-50 w-[250px] h-[250px] bg-gray-100"
          onClick={() => {
            setFrontFacing(!frontFacing);
          }}
        >
          <Webcam
            videoConstraints={videoConstraints}
            audio={false}
            height={250}
            width={250}
            ref={webcamRef}
            mirrored={true}
            screenshotFormat="image/jpeg"
          />
        </div>
        <div className="btn-container mt-2">
          <button
            onClick={capture}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Capture photo
          </button>
        </div>
        <br />
        <div>
          <div className="w-[250px] h-[250px] border-emerald-50">
            {imgSrc && <img src={imgSrc} alt="webcam" />}
            <br />
            {status === "analyzing" && <div>David is watching...</div>}
            {status === "saying" && <div>David is warming up his voice...</div>}
          </div>
          {audioSrc && (
            <div className="py-4">
              <audio controls autoPlay playsInline src={audioSrc}></audio>
            </div>
          )}
          {messages.length > 0
            ? messages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap my-2">
                  {m.role !== "user" && m.content}
                </div>
              ))
            : null}
        </div>
      </form>
    </div>
  );
}
