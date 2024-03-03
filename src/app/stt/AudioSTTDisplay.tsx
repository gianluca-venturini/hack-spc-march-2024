"use client";

import { useState } from "react";
import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay(props: { transcript: string | null, setTranscript: (text: string) => void }) {

  // TODO: do whatever you like with the transcript
  const onReceiveTranscript = (text: string) => {
    props.setTranscript(text);
  };

  return (
    <div>
      <AudioSTTControls onSubmitTranscript={onReceiveTranscript} />
      <div className="mt-4">{props.transcript}</div>
    </div>
  );
}
