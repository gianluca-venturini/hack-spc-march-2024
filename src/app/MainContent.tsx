"use client";

import { QuestionsAggregated } from "./questions";
import React, { useState } from "react";
import AudioSTTDisplay from "./stt/AudioSTTDisplay";

export function MainContent() {
  const [transcripts, setTranscripts] = useState<string[]>([
    "Harry Potter is playing Quidditch, my the dearest place on the world is Italy, the house of my parents. My family has 15 dogs and my sister has two.",
  ]);

  return (
    <main className="flex flex-col items-center justify-between p-24 h-screen">
      <QuestionsAggregated transcripts={transcripts} />
      <AudioSTTDisplay
        transcripts={transcripts}
        setTranscripts={setTranscripts}
      />
    </main>
  );
}
