"use client";

import { useState } from "react";
import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay() {
  const [transcripts, setTranscripts] = useState<string[]>([]);

  // TODO: do whatever you like with the transcripts
  const onReceiveTranscript = (text: string) => {
    setTranscripts((prevTranscripts) => [text, ...prevTranscripts]);
  };

  return (
    <div>
      <AudioSTTControls onSubmitTranscript={onReceiveTranscript} />
      <div className="mt-4 space-y-4">
        {transcripts.map((transcript, index) => (
          <div key={index}>{transcript}</div>
        ))}
      </div>
    </div>
  );
}
