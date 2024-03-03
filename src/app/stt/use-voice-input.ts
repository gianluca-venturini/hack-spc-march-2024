import { useCallback, useEffect, useRef, useState } from "react";
import hark from "hark";
import { useMicrophone } from "./use-microphone";

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

  const processAudio = useCallback(() => {
    let combinedBlob = new Blob(blobArrayRef.current, {
      type: MIME_TYPE,
    });
    onAudioData(combinedBlob, MIME_TYPE);
    blobArrayRef.current = []; // Clear the array for the next recording segment
  }, [onAudioData]);

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
    harker.on("speaking", () => {
      setDetectedSpeech(true);
      blobArrayRef.current = []; // Reset the blob array for a new sentence
    });
    harker.on("stopped_speaking", () => {
      processAudio(); // Process the recorded audio when the speaker stops
    });
    harkerRef.current = harker;

    const recorderOptions = {
      mimeType: MIME_TYPE,
    };

    const recorder = new MediaRecorder(microphone, recorderOptions);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
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
  }, [acquireMicrophone, processAudio]);

  const cleanup = useCallback(() => {
    harkerRef.current?.stop();
    harkerRef.current = null;

    if (recorderRef.current) {
      recorderRef.current.ondataavailable = null;
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    setIsRecording(false);
    setIsDisabled(false);
    setDetectedSpeech(false);
    releaseMicrophone();
  }, [releaseMicrophone]);

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
    stopRecording: cleanup,
  };
};
