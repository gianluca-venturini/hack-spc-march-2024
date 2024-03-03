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

  const processAudio = useCallback(() => {
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
      };

      // this triggers the ondataavailable event, so we can extract the audio data
      recorderRef.current.stop();

      // restart the recorder so we can keep listening
      recorderRef.current.start();
    }
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
      console.log(">>> SPEAKING");
      setDetectedSpeech(true);
    });
    harker.on("stopped_speaking", () => {
      console.log(">>> STOPPED SPEAKING");
      processAudio();
    });
    harkerRef.current = harker;

    const recorderOptions = {
      type: "audio",
      sampleRate: AUDIO_SAMPLERATE,
      mimeType: "audio/webm",
      threshold: VOLUME_THRESHOLD,
    };

    const recorder = new MediaRecorder(microphone, recorderOptions);
    recorderRef.current = recorder;

    recorder.start();
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
