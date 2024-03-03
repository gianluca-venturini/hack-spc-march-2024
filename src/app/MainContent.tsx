"use client";

import { QuestionsAggregated } from "./questions";
import React, { useState } from "react";
import AudioSTTDisplay from "./stt/AudioSTTDisplay";

export function MainContent() {

    const [transcripts, setTranscripts] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <main className="flex flex-col items-center justify-between p-24 h-screen">
            <QuestionsAggregated transcripts={transcripts} isProcessing={isProcessing} />
            <AudioSTTDisplay
                transcripts={transcripts}
                setTranscripts={setTranscripts}
                setIsProcessing={setIsProcessing}
            />
        </main>
    );
}
