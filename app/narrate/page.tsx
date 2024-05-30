"use client";

import { useChat } from "ai/react";
import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { Message } from "ai";

export default function Chat() {
  const [status, setStatus] = useState("ready");
  const [statusMessage, setStatusMessage] = useState("");
  const [conversation, setConversation] = useState(null as string | null);
  const [imgSrc, setImgSrc] = useState(null as string | null);
  const [audioSrc, setAudioSrc] = useState(null as string | null);
  const [frontFacing, setFrontFacing] = useState(true);
  const webcamRef = useRef(null as any);
  const formRef = useRef(null as any);

  const narrateStart = async () => {
    if (conversation) return;
    const response = await fetch("/api/narrate/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      setStatus("error");
      setStatusMessage("Failed to start conversation");
      throw new Error("Failed to start conversation");
    }
    const json = await response.json();
    setConversation(json.conversation);
  };

  const narrateAnalyze = async () => {
    if (!conversation) return;
    const response = await fetch("/api/narrate/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });
    if (!response.ok) {
      setStatus("error");
      setStatusMessage("Failed to analyze conversation");
      throw new Error("Failed to analyze conversation");
    }
    const json = await response.json();
    setConversation(json.conversation);
  };

  const streamResponseFinish = (content: string) => {
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
      streamResponseFinish(message.content);
    },
  });

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
