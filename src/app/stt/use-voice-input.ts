import { useCallback, useEffect, useRef, useState } from "react";
import hark from "hark";
import { useMicrophone } from "./use-microphone";

const VOLUME_THRESHOLD = "-25dB";
const AUDIO_SAMPLERATE = 44100;
export const MIME_TYPE = "audio/webm";

interface UseVoiceInputProps {
  onAudioData: (audioBlob: Blob, mimeType: string) => void;
}

interface UseVoiceInputHelpers {
  isAvailable: boolean;
  isRecording: boolean;
  isDisabled: boolean;
  hasMicrophone: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
}

export const useVoiceInput = ({
  onAudioData,
}: UseVoiceInputProps): UseVoiceInputHelpers => {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const blobArrayRef = useRef<Blob[]>([]);
  const harkerRef = useRef<hark.Harker | null>(null);

  const [detectedSpeech, setDetectedSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const { acquireMicrophone, releaseMicrophone, hasMicrophone } =
    useMicrophone();

  /**
   * Start recording audio from the microphone. We'll accumulate a buffer of all audio
   * recorder up until stopRecording is called.
   */
  const startRecording = useCallback(async () => {
    setIsDisabled(true);
    const microphone = await acquireMicrophone();
    setIsDisabled(false);
    if (!microphone) {
      console.log(
        "To use voice input, ensure your microphone is enabled and grant permission."
      );
      return false;
    }

    // Set up harker to detect speech.
    // If there's no speech detected, we shouldn't send the audio to the backend.
    const harker = hark(microphone);
    harker.on("speaking", () => setDetectedSpeech(true));
    harkerRef.current = harker;

    const recorderOptions = {
      type: "audio",
      sampleRate: AUDIO_SAMPLERATE,
      mimeType: "audio/webm",
      threshold: VOLUME_THRESHOLD,
    };

    const recorder = new MediaRecorder(microphone, recorderOptions);
    recorderRef.current = recorder;

    recorderRef.current.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        blobArrayRef.current.push(event.data);
      }
    };

    // Using timeSlice is necessary for this to work on Safari and iOS.
    // While you can get audio/mp4 blobs without timeSlice, whisper cannot
    // process them.
    recorder.start(1000);
    setIsRecording(true);

    return true;
  }, [acquireMicrophone, MIME_TYPE]);

  /**
   * Tear down harker, recorder and release microphone
   */
  const cleanup = useCallback(async () => {
    if (harkerRef.current) {
      // @ts-ignore
      harkerRef.current?.off("speaking");
      harkerRef.current?.stop();
      harkerRef.current = null;
      setDetectedSpeech(false);
    }
    if (recorderRef.current) {
      recorderRef.current.ondataavailable = null;
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    setIsRecording(false);
    setIsDisabled(false);
    releaseMicrophone();
  }, [releaseMicrophone]);

  /**
   * Stop recording, release/cleanup all resources, and emit the audio blob.
   */
  const stopRecording = useCallback(() => {
    if (!detectedSpeech) {
      console.log("Sorry, I didn't hear any speech. Please try again.");
      cleanup();
      return;
    }

    if (recorderRef.current) {
      setIsDisabled(true);

      recorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          blobArrayRef.current.push(event.data);
        }
        let combinedBlob = new Blob(blobArrayRef.current, {
          type: MIME_TYPE,
        });
        onAudioData(combinedBlob, MIME_TYPE);
        blobArrayRef.current = [];
        cleanup();
      };

      recorderRef.current.stop();
    }
  }, [MIME_TYPE, detectedSpeech, cleanup, onAudioData]);

  /**
   * Cleanup on component dismount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isAvailable: !!MIME_TYPE,
    isRecording,
    isDisabled,
    hasMicrophone,
    startRecording,
    stopRecording,
  };
};
