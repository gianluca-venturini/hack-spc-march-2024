This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Interact with APIs
```
curl -vvv http://localhost:3000/api/question
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "How much free time do you have now that you are CEO of open AI?"}'
curl -X POST -vvvv http://localhost:3000/api/reset
```

## question Test set

```
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "How many dogs are there in your family?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Whats the number of dogs owned by your family?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Can you tell me the count of dogs your family has?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "How many dogs do you have in your household?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What is the total number of dogs your family keeps?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Could you share how many dogs are part of your family?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Im curious, how many dogs does your family possess?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Whats the tally of dogs under your family s care?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "How many dogs have been adopted by your family?"}' &&

curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What location do you love the most globally?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Where in the world do you feel happiest?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Which spot on Earth holds the most special place in your heart?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Whats your top destination anywhere on the planet?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Can you share your most cherished place worldwide?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Where do you hold dearest across the globe?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What is the one place in the world you favor above all?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Globally, which place do you treasure the most?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Whats the most beloved place to you on Earth?"}' &&

curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What game does Harry Potter participate in?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Which sport is associated with Harry Potter?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What is the name of the sport played by Harry Potter?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "In Harry Potter, what sport is being played?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Harry Potter is known for playing which sport?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What athletic activity does Harry Potter engage in?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "Can you tell me the sport Harry Potter is famous for playing?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "What is the specific sport that Harry Potter competes in?"}' &&
curl -X POST -vvvv http://localhost:3000/api/ingest -d '{"questionText": "In the world of Harry Potter, what sport does he take part in?"}'
```

## Demo

https://www.loom.com/share/ac6eb60e0b0f49769a05eeb1279a5427?sid=eed0adf6-f0d6-4c41-b377-eec72af0d603