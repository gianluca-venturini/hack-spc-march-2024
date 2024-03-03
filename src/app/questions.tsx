"use client";

import { NO_QUESTION_HEADER } from '@/constants';
import { useEffect, useRef, useState } from 'react';

export function QuestionsAggregated() {
    const [questions, setQuestions] = useState<string[]>([]);
    const hasFetched = useRef(false);

    const fetchNextQuestion = async () => {
        try {
            const response = await fetch('/api/question');
            if (!response.body) {
                throw new Error('ReadableStream not supported in this browser.');
            }

            if (!!response.headers.get(NO_QUESTION_HEADER)) {
                // No new question
                return;
            }

            const newQuestion: string = await response.text();
            const decoder = new TextDecoder();

            setQuestions(qs => ([...qs, newQuestion]));
        } catch (error) {
            console.error('Error fetching new question:', error);
        }
    };
    // const fetchNextQuestionStream = async () => {
    //     try {
    //         const response = await fetch('/api/question');
    //         if (!response.body) {
    //             throw new Error('ReadableStream not supported in this browser.');
    //         }

    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder();

    //         reader.read().then(function processText({ done, value }) {
    //         if (done) {
    //             console.log('Stream complete');
    //             return;
    //         }
    //         const chunk = decoder.decode(value, {stream: true});
    //             setQuestions(prevQuestions => prevQuestions + chunk);
    //             reader.read().then(processText);
    //         });
    //     } catch (error) {
    //         console.error('Error fetching new question:', error);
    //     }
    // };
    const fetchQuestionsAsked = async () => {
        try {
            const response = await fetch('/api/questions_asked', { method: 'POST' });
            const { questionsAsked }: { questionsAsked: [] } = await response.json();
            console.log('questionsAsked', questionsAsked);
            setQuestions(qs => ([...qs, ...questionsAsked]));
        } catch (error) {
            console.error('Error fetching questions asked:', error);
        }
    };

    useEffect(() => {
        const initialFetch = async () => {
            await fetchQuestionsAsked();

            // setInterval(fetchNextQuestion, 10_000);
        };
        if (!hasFetched.current) {
            initialFetch();
        }
        hasFetched.current = true;
    }, []);
    
    return (
        <div>
            <code className="font-mono font-bold">
                <div className="flex flex-col gap-4">
                    {questions.map((q, i) => (
                        <div key={i}>{q}</div>
                        ))}
                </div>
            </code>
            <button
                className="h-32 w-32 bg-red-500 hover:bg-red-600 text-white px-4 rounded-full p-6"
                onClick={fetchNextQuestion}
            >
                Next Question
            </button>
        </div>
    )
}