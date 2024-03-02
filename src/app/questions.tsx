'use client'
 
import { useEffect, useState } from 'react';

interface Question {
  text: string;
}
 
export default function QuestionsAggregated() {
  const [questions, setQuestions] = useState<Question[]>([]);

  // TODO: fetch questions from Redis
 
  return (
    <div>
      {questions.map(q => (
        <div key={q.text}>{q.text}</div>
      ))}
    </div>
  )
}