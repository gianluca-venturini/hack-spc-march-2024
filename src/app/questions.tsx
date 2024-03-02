'use client'
 
import { useEffect, useState } from 'react';

interface Question {
  text: string;
}
 
export function QuestionsAggregated() {
  const [questions, setQuestions] = useState<Question[]>([
    { text: 'What is the capital of France?' },
    { text: 'What is the capital of Germany?' },
    { text: 'What is the capital of Italy?' },
  ]);

  // TODO: fetch questions from Redis
 
  return (
    <div>
      {questions.map(q => (
        <div key={q.text}>{q.text}</div>
      ))}
    </div>
  )
}