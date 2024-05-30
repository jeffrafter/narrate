"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Chat() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const submitForm = async (e: any) => {
    e.preventDefault();
    const response = await fetch("/api/narrate/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    console.log("response", response);
    if (response.ok) {
      setStatus("Success!");
      router.push("/narrate");
    } else {
      setStatus("Error!");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1>Please enter your code</h1>
      <h5>{status}</h5>
      <br />
      <form onSubmit={submitForm}>
        <input
          className="p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={code}
          placeholder="Enter your code"
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
      </form>
      <br />
      <br />
      <br />
      <Link href="/narrate" className="whitespace-pre-wrap">
        Narrate
      </Link>
    </div>
  );
}
