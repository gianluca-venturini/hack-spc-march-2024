import { useCallback, useEffect, useRef } from "react";

/**
 * A hook that provides a public API for recording audio from the microphone.
 */
export const useMicrophone = () => {
  const microphoneRef = useRef<MediaStream | null>(null);

  /**
   * Returns a MediaStream object that represents the current state of the microphone,
   * and triggers a permission prompt if the user hasn't already granted access.
   */
  const acquireMicrophone = useCallback(async () => {
    console.log("Requesting microphone access");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (stream) {
        microphoneRef.current = stream;
        return stream;
      }
    } catch (error) {
      console.error("Microphone access denied", error);
    }
  }, []);

  /**
   * Releases microphone access and stops the stream.
   */
  const releaseMicrophone = useCallback(async () => {
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach((track) => track.stop());
      microphoneRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      releaseMicrophone();
    };
  }, [releaseMicrophone]);

  /**
   * Return helpers/public API
   */
  return {
    hasMicrophone: !!microphoneRef.current,
    acquireMicrophone,
    releaseMicrophone,
  };
};
