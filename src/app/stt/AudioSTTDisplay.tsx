"use client";

import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay({
  transcripts,
  setTranscripts,
}: {
  transcripts: string[];
  setTranscripts: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const onReceiveTranscript = (text: string) => {
    setTranscripts(t => ([...t, text]));
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
