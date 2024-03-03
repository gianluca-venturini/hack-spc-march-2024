import React from "react";
import AudioSTTDisplay from "./AudioSTTDisplay";

export default async function Tts() {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8">
      <AudioSTTDisplay />
    </div>
  );
}
