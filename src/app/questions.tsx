'use client'
 
import { useEffect, useState } from 'react';

interface Question {
  text: string;
}
 
export function QuestionsAggregated() {
  const [questions, setQuestions] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setQuestions('');
      try {
        const response = await fetch('/api/questions');
        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        reader.read().then(function processText({ done, value }) {
          if (done) {
            console.log('Stream complete');
            return;
          }
          const chunk = decoder.decode(value, {stream: true});
          setQuestions(prevQuestions => prevQuestions + chunk);
          reader.read().then(processText);
        });
      } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
      }
    };

    fetchData();
  }, []);
 
  return (
    <div className="flex flex-col gap-4">
      {questions.split('\n').map(q => (
        <div key={q}>{q}</div>
      ))}
    </div>
  )
}