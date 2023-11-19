"use client";

import { useChat } from "ai/react";
import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { Message } from "ai";

export default function Chat() {
  const finish = (content: string) => {
    console.log("finished");
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
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
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
  const [imgSrc, setImgSrc] = useState(null);

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

    handleSubmit(e, {
      data: {
        imageUrl: imgSrc as string,
      },
    });
  };

  const videoConstraints = {
    width: 250,
    height: 250,
    facingMode: "user",
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === "user" ? "User: " : "David: "}
              {m.content}
            </div>
          ))
        : null}

      <form onSubmit={submitForm}>
        <div className="webcam-container">
          <div className="w-[250px] h-[250px] border-emerald-50">
            {imgSrc ? (
              <img src={imgSrc} alt="webcam" />
            ) : (
              <Webcam
                videoConstraints={videoConstraints}
                audio={false}
                height={250}
                width={250}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
              />
            )}
          </div>
          <div className="btn-container">
            <button onClick={capture}>Capture photo</button>
          </div>
        </div>
      </form>
    </div>
  );
}
