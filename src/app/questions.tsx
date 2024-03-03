"use client";

import { NO_CONTENT_HEADER, NO_QUESTION_HEADER } from "@/constants";
import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";

export function QuestionsAggregated(props: { transcripts: string[]; isProcessing: boolean }) {
    const [questions, setQuestions] = useState<string[]>([]);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
    const hasFetched = useRef(false);

    function animateOutAnsweredQuestions(q: string) {
        setAnsweredQuestions(s => {
            const newAnsweredQuestions = new Set(s);
            newAnsweredQuestions.add(q);
            return newAnsweredQuestions;
        });
        setTimeout(() => {
            setQuestions(qs => qs.filter(question => question !== q));
        }, 5000);
    }

    const fetchNextQuestion = useCallback(async () => {
        console.log('Getting new question');
        try {
        const response = await fetch("/api/question", {
            method: "POST",
            body: JSON.stringify({ transcript: props.transcripts.join(" -- ") }),
        });
        if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
        }

        if (!!response.headers.get(NO_QUESTION_HEADER) || !!response.headers.get(NO_CONTENT_HEADER)) {
            // No new question
            return;
        }

        const newQuestion: string = await response.text();
        const decoder = new TextDecoder();

        setQuestions((qs) => [...qs, newQuestion]);
        } catch (error) {
            console.error("Error fetching new question:", error);
        }
    }, [props.transcripts]);

    const computeAnsweredQuestions = useCallback(async () => {
        console.log('computeAnsweredQuestions', questions, answeredQuestions);
        const notAnsweredQuestions = computeNotAnsweredQuestions(questions, answeredQuestions);
        for (const question of notAnsweredQuestions) {
            try {
            const response = await fetch("/api/answered", {
                method: "POST",
                body: JSON.stringify({ transcript: props.transcripts.join(" -- "), question }),
            });
        
            if (!!response.headers.get(NO_CONTENT_HEADER)) {
                // Ignore question since there's no transcript
                continue;
            }
        
            const { answered }: { answered: boolean } = await response.json();
            if (answered) {
                console.log("Question has been answered:", question);
                animateOutAnsweredQuestions(question);
            }
            } catch (error) {
                console.error("Error setting a question as answered:", error);
            }
        }
    }, [answeredQuestions, props.transcripts, questions]);

    const fetchQuestionsAsked = useCallback(async () => {
            try {
                const response = await fetch("/api/questions_asked", { method: "POST" });
                const { questionsAsked }: { questionsAsked: [] } = await response.json();
                console.log("questionsAsked", questionsAsked);
                setQuestions((qs) => [...qs, ...questionsAsked]);
            } catch (error) {
                console.error("Error fetching questions asked:", error);
            }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (props.isProcessing) {
            interval = setInterval(async () => {
                await computeAnsweredQuestions();
                if (computeNotAnsweredQuestions(questions, answeredQuestions).length <= 3) {
                    console.log('fetchNextQuestion');
                    await fetchNextQuestion();
                }
            }, 3_000);
        }
        const initialFetch = async () => {
            await fetchQuestionsAsked();

        };
        if (!hasFetched.current) {
            initialFetch();
        }
        hasFetched.current = true;
        return () => clearInterval(interval);
    }, [computeAnsweredQuestions, fetchNextQuestion, fetchQuestionsAsked, questions, answeredQuestions, props.isProcessing]);

return (
    <div className="space-y-4">
        <div>
            <div className="flex flex-col gap-2">
            {questions.map((q, i) => (
                <div
                    key={`${q}-${i}`}
                    className={`p-3 rounded-md transition-all duration-500 ease-in-out transform ${
                        answeredQuestions.has(q) ? 'bg-green-100 text-green-800' : 'text-gray-100'
                    }`}
                    style={{ textDecoration: answeredQuestions.has(q) ? 'line-through' : '', opacity: answeredQuestions.has(q) ? 0 : 1, transition: 'opacity 5s ease-in-out'}}
                    onClick={() => {
                        animateOutAnsweredQuestions(q);
                    }}
                >
                <span className={`block text-sm font-medium transition-opacity duration-300 ${answeredQuestions.has(q) ? 'opacity-50' : 'opacity-100'}`}>{q}</span>
                </div>
            ))}
            </div>
        </div>
        <div className="flex space-x-4">
            <button
                className="border border-white text-white bg-transparent text-xs h-8 px-6 text-white rounded-full shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4"
                onClick={fetchNextQuestion}
            >
                Next
            </button>
            <button
                className="border border-white text-white bg-transparent text-xs h-8 px-6 text-white rounded-full shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4"
                onClick={computeAnsweredQuestions}
            >
                Check
            </button>
        </div>
    </div>
  );
}

function computeNotAnsweredQuestions(questions: string[], answeredQuestions: Set<string>) {
    return questions.filter(q => !answeredQuestions.has(q));
}
