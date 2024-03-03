"use client";

import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay({
  transcripts,
  setTranscripts,
}: {
  transcripts: string[];
  setTranscripts: (newTranscripts: string[]) => void;
}) {
  const onReceiveTranscript = (text: string) => {
    setTranscripts([text, ...transcripts]);
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
