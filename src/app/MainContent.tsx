'use client';

import { QuestionsAggregated } from "./questions";
import React, { useState } from "react";
import AudioSTTDisplay from "./stt/AudioSTTDisplay";

export function MainContent() {
  const [transcript, setTranscript] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center justify-between p-24 h-screen">
        <QuestionsAggregated transcript={transcript} />
        <AudioSTTDisplay
          transcript={transcript}
          setTranscript={setTranscript}
        />
    </main>
  );
}
