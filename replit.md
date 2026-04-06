# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Shopify Theme

A complete Shopify Online Store 2.0 theme (`omniweb-revenue-theme/`) is included:
- 40 files, ~206 KB total
- Layout, templates (JSON), sections, snippets, assets, config, locales
- Full product page, collection page, cart drawer, FAQ, testimonials, trust badges, upsell
- Vanilla JS (no dependencies), fully mobile responsive
- Shopify CLI compatible — see `omniweb-revenue-theme/README.md`

## AI Sales Widget Backend

The API server (`artifacts/api-server/`) is extended with these endpoints:

| Endpoint | Description |
|----------|-------------|
| `POST /api/chat` | AI chat — accepts `{ sessionId, message, shopId, pageContext }`, returns AI reply |
| `POST /api/voice` | ElevenLabs TTS — accepts `{ text, voiceId }`, streams audio (requires `ELEVENLABS_API_KEY`) |
| `GET /api/widget-config/:shopId` | Widget settings (greeting, color, voice, persona) |
| `PUT /api/widget-config/:shopId` | Update widget settings |
| `GET /api/voices` | Available ElevenLabs voice list |
| `GET /api/voices-status` | ElevenLabs connection status + live voices if connected |
| `GET /api/conversations/:shopId` | Recent chat sessions |

**Key files:**
- `artifacts/api-server/src/lib/session-store.ts` — in-memory conversation history
- `artifacts/api-server/src/lib/widget-config-store.ts` — per-shop widget config (default + overrides)
- `artifacts/api-server/src/middleware/api-key.ts` — API key validation middleware
- `artifacts/api-server/src/routes/chat.ts` — OpenAI chat endpoint
- `artifacts/api-server/src/routes/voice.ts` — ElevenLabs voice endpoint (stub if no key)
- `artifacts/api-server/src/routes/widget-config.ts` — config + conversations endpoints

**Env vars needed:**
- `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — set automatically via Replit AI integrations
- `ELEVENLABS_API_KEY` — add when ready to enable voice (user to provide)
- `WIDGET_API_KEY` — optional; defaults to `dev-widget-key` in dev

**Note:** ElevenLabs integration was intentionally deferred. Voice endpoint returns clear 503 until `ELEVENLABS_API_KEY` is set.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
