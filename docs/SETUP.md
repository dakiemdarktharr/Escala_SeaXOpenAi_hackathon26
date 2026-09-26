# Escala setup

## Prerequisites

- Node.js 20.19 or newer;
- npm;
- Git.

The project uses Next.js, React, the MongoDB Node.js driver, and the OpenAI SDK. `package-lock.json` is checked in, so use `npm ci` for a reproducible install.

## Local setup

From the repository root:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Edit `.env.local` and set `MONGODB_URI`, `MONGODB_DB`, and `OPENAI_API_KEY`. The example defaults are `MONGODB_DB=escala`, `OPENAI_MODEL=gpt-5.6-luna`, `OPENAI_REASONING_EFFORT=xhigh`, `ESCALA_DATA_MODE=mongodb`, and `ESCALA_OPENAI_MODE=live`. Keep `ESCALA_ENABLE_EXTERNAL_SEND=false`.

Percent-encode reserved characters in the MongoDB username or password before putting them in a URI. Never print the URI in terminal logs, commit `.env.local`, or expose the OpenAI key to browser code. `DEEPSEEK_API_KEY` belongs only to the separate Claude Code backend worker. `VERCEL_TOKEN` is optional and only needed when operating the Vercel CLI directly.

## MongoDB Atlas access

The Escala Production environment connects to Atlas through Vercel. A successful `GET /api/health` returns HTTP 200 and reports `database: connected`; `GET /api/inbox` returns the persisted inbox threads. If the database is unavailable, check the URI host, database user/password, Atlas project, and the cluster's IP access list.

Production currently relies on a temporary Atlas network-access exception that automatically expires October 1, 2026. This may allow broader network access than intended and is not the final production network policy. No fixed outbound IP is configured for this Vercel project; replace the temporary exception with a suitable restricted egress/network setup before expiry.

## Vercel Production

The Vercel project is connected to the GitHub repository. Configure production variables in Vercel Project Settings and mark credentials as Secret. After changing variables, redeploy the latest production commit or create a new production deployment; saved environment changes do not alter existing deployments.

For a new deployment, verify all of the following:

1. Vercel marks the production deployment Ready.
2. The production homepage returns HTTP 200.
3. `/api/health` reports MongoDB connected.
4. `/api/inbox` returns HTTP 200 and the expected demo threads.

An `llm: configured` health result means the runtime configuration is present; it does not by itself prove that an OpenAI generation request has succeeded.

## Verification commands

Run from the repository root:

```powershell
npm test
npm run lint
npm run typecheck
npm run validate:demo
npm run build
```

`npm run validate:demo` checks fixture structure, unique IDs, required scenarios, and knowledge-document references. Automated policy tests run under `npm test`.

## Product boundary

The MVP uses synthetic buyer conversations and synthetic seller knowledge. It does not require Shopee credentials, send messages to buyers, or mutate marketplace orders. Recommendation policy remains deterministic and the seller makes the final decision.
