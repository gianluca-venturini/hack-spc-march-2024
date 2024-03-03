"use client";

import React, { useCallback, useState } from "react";
import { nanoid } from "ai";
import { useVoiceInput } from "./use-voice-input";

export function AudioSTTControls({
  onSubmitTranscript,
}: {
  onSubmitTranscript: (text: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onAudioData = useCallback(
    async (audioData: Blob, mimeType: string) => {
      setIsProcessing(true);
      const newUrl = URL.createObjectURL(audioData);
      const transcript = await performSttPost(audioData);
      console.log(
        "Voice recognition result",
        ["transcript", `|${transcript}|`],
        ["local blob url", newUrl]
      );
      setUrl(newUrl);
      setIsProcessing(false);
      if (transcript) {
        onSubmitTranscript(transcript);
      }
    },
    [onSubmitTranscript]
  );

  const {
    startRecording,
    stopRecording,
    isAvailable,
    isRecording,
    isDisabled,
  } = useVoiceInput({
    onAudioData,
  });

  return (
    <div
      className={isRecording ? "relative text-right" : "relative text-center"}
    >
      <>
        {isAvailable && (
          <button
            className={
              isRecording
                ? "h-16 w-16 text-sm bg-red-500 hover:bg-red-600 text-white px-4 rounded-full"
                : "h-32 w-32 text-lg bg-green-500 hover:bg-green-600 text-white px-4 rounded-full p-6"
            }
            onClick={isRecording ? stopRecording : startRecording}
            disabled={false}
          >
            {isRecording ? "Stop" : "Start"}
          </button>
        )}
      </>
    </div>
  );
}

async function performSttPost(blob: Blob): Promise<string> {
  const formData = new FormData();
  const fileExtension = blob.type.split("/")[1];
  formData.append("file", blob, `${nanoid()}.${fileExtension}`);

  const result = await fetch("/api/stt", {
    method: "POST",
    body: formData,
  }).catch((error) => {
    console.error("Error:", error);
  });

  if (result) {
    if (result.status >= 400) {
      console.error("Error:", result.status, result.statusText);
    } else {
      return await result.text();
    }
  }
  return "";
}
