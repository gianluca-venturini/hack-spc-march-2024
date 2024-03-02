import React, { useCallback } from "react";
import { nanoid } from "ai";

/**
 * @param {object} props
 * @param {function} props.onSubmit - callback called when the audio transcript is ready
 */
export function AudioSTT({
  onSubmit,
}: {
  onSubmit: (text: string) => Promise<void>;
}) {
  const handleVoiceTypingTranscript = useCallback(
    (text: string) => {
      if (text) {
        onSubmit(text);
      }
    },
    [onSubmit]
  );

  return (
    <div className="relative">
      <VoiceTypingProvider onTranscriptReady={handleVoiceTypingTranscript}>
        <VoiceTypingContext.Consumer>
          {(voiceTyping) => (
            <>
              {voiceTyping.isAvailable && (
                <button
                  className="h-10 w-10"
                  onClick={
                    voiceTyping.isRecording
                      ? voiceTyping.stopRecording
                      : voiceTyping.startRecording
                  }
                  disabled={voiceTyping.isMicDisabled}
                >
                  {voiceTyping.isRecording ? "STOP" : "RECORD"}
                </button>
              )}
            </>
          )}
        </VoiceTypingContext.Consumer>
      </VoiceTypingProvider>
    </div>
  );
}

async function performSttPost(blob: Blob): Promise<string> {
  const formData = new FormData();
  const fileExtension = getFileExtension(mimeType);
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
