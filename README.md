# pizzaoftheweek.com

## Developing and running

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Running the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Required env:

```
REVALIDATION_SECRET=
OPENAI_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
KV_URL=
BLOB_READ_WRITE_TOKEN=
```

Generate a revalidation secret, connect Vercel KV and Blob integration, set an OpenAI API key.

## Architecture

Recipes are generated once a week through ISR and stored in KV. This guarantess fast serving of the recipes. Images are stored in Vercel Blob Storage. AI SDK is used to run the prompts for the recipe generation using a multi-tier promot:

- Prompt 1: Generate a detailed recipe
- Prompt 2: Condense to a ingredient list
- Prompt 3: Generate image prompt from prompt 1
- Prompt 4: Generate pizza image
