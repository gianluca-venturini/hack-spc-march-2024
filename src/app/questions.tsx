"use client";

import { NO_CONTENT_HEADER, NO_QUESTION_HEADER } from "@/constants";
import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";

export function QuestionsAggregated(props: { transcripts: string[] }) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);

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
                setAnsweredQuestions(s => {
                    const newAnsweredQuestions = new Set(s);
                    newAnsweredQuestions.add(question);
                    return newAnsweredQuestions;
                });
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
        const interval = setInterval(async () => {
            await computeAnsweredQuestions();
            if (computeNotAnsweredQuestions(questions, answeredQuestions).length <= 3) {
                console.log('fetchNextQuestion');
                await fetchNextQuestion();
            }
        }, 3_000);
        const initialFetch = async () => {
            await fetchQuestionsAsked();

        };
        if (!hasFetched.current) {
            initialFetch();
        }
        hasFetched.current = true;
        return () => clearInterval(interval);
    }, [computeAnsweredQuestions, fetchNextQuestion, fetchQuestionsAsked, questions, answeredQuestions]);

    return (
        <div>
            <code className="font-mono font-bold">
                <div className="flex flex-col gap-4">
                {questions.map((q, i) => (
                    <div key={i} style={{ textDecoration: answeredQuestions.has(q) ? 'line-through' : '' }}>{q}</div>
                ))}
                </div>
            </code>
            <button
                className="h-20 w-20 bg-red-500 hover:bg-red-600 text-white px-4 rounded-full p-6"
                onClick={fetchNextQuestion}
            >
                Next
            </button>
            <button
                className="h-20 w-20 bg-red-500 hover:bg-red-600 text-white px-4 rounded-full p-6"
                onClick={computeAnsweredQuestions}
            >
                Check
            </button>
        </div>
    );
}

function computeNotAnsweredQuestions(questions: string[], answeredQuestions: Set<string>) {
    return questions.filter(q => !answeredQuestions.has(q));
}
