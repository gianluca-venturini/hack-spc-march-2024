"use client";

import { useState } from "react";
import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay() {
  const [transcript, setTranscript] = useState<string | null>(null);

  // TODO: do whatever you like with the transcript
  const onReceiveTranscript = (text: string) => {
    setTranscript(text);
  };

  return (
    <div>
      <AudioSTTControls onSubmitTranscript={onReceiveTranscript} />
      <div className="mt-4">{transcript}</div>
    </div>
  );
}
