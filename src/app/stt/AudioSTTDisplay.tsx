"use client";

import { AudioSTTControls } from "./AudioSTTControls";
import React from "react";

export default function AudioSTTDisplay({
    transcripts,
    setTranscripts,
    setIsProcessing,
}: {
    transcripts: string[];
    setTranscripts: React.Dispatch<React.SetStateAction<string[]>>;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const onReceiveTranscript = (text: string) => {
        setTranscripts(t => ([...t, text]));
    };

    return (
        <div>
        <AudioSTTControls
            onSubmitTranscript={onReceiveTranscript}
            setIsProcessing={setIsProcessing}
        />
        <div className="mt-4 text-sm text-gray-500 space-y-4 overflow-auto flex flex-col justify-end relative" style={{ maxHeight: '20.3vh' }}>
            <div className="fade-to-black-gradient absolute top-0 left-0 w-full h-full z-10" style={{ pointerEvents: 'none', height: '50%' }}></div>
            {transcripts.map((transcript, index) => (
                <div key={index}>{transcript}</div>
            ))}
        </div>
        </div>
    );
}
