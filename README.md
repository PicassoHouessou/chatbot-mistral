# Chatbot Mistral

A conversational web application powered by a large language model (LLM), enabling context-aware AI interactions directly in the browser.

[Lire en français](README.fr.md)

![Screenshot](docs/screenshot.png)

## Features

- Authentication
- Chat with Mistral AI
- Conversation history persisted in MongoDB (per user)
- Multi-conversation management (create, rename, delete)
- Markdown rendering in AI responses
- Responsive dark UI

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for MongoDB)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/PicassoHouessou/chatbot-mistral
cd chatbot-mistral
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in the values:

```env
# Get your API key at https://console.mistral.ai/
MISTRAL_API_KEY=your_mistral_api_key

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# MongoDB connection string (matches docker-compose defaults)
MONGODB_URI=mongodb://admin:password@localhost:27018/chatbot?authSource=admin
```

### 4. Start MongoDB

```bash
docker compose up -d
```

### 5. Seed the database

```bash
npx tsx scripts/seed.ts
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Username | Password |
|----------|----------|
| picasso  | password |
| delphine | password |
| raoul    | password |

## Tech stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS**
- **NextAuth v4** — Authentication
- **Mistral AI SDK** (`@mistralai/mistralai`)
- **MongoDB 7** + **Mongoose** — Data persistence
- **Docker** — Local database
- **react-markdown** + **remark-gfm** — Markdown rendering
- **bcryptjs** — Password hashing
- **Lucide React** — Icons

*Project developed as part of the Agile Methods course — EILCO.*
