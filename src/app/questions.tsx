'use client'
 
import { useEffect, useState } from 'react';

interface Question {
  text: string;
}
 
export function QuestionsAggregated() {
  const [questions, setQuestions] = useState<Question[]>([
  ]);

  useEffect(() => {
    const fetchData = async () => {
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
          setQuestions(prevQuestions => {
            if (prevQuestions.length === 0) {
              return [{ text: chunk }];
            }
            return [{ text: prevQuestions[0].text + chunk }];
          });
          // Read the next chunk
          reader.read().then(processText);
        });
      } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
      }
    };

    fetchData();
  }, []);
 
  return (
    <div>
      {questions.map(q => (
        <div key={q.text}>{q.text}</div>
      ))}
    </div>
  )
}