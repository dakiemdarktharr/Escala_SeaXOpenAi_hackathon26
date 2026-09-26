# Escala

Escala is a seller-support MVP for marketplace operations. It turns buyer messages into evidence-backed recommendations in an original seller workspace inspired by Shopee Seller Centre. Escala is not affiliated with Shopee.

## MVP capabilities

- A responsive, prioritized inbox with conversation, evidence, and activity panels.
- MongoDB Atlas persistence for synthetic demo conversations and seller decisions.
- OpenAI Responses API assistance for interpreting messages and drafting recommendations.
- A deterministic risk and policy engine that controls the recommended next action.
- Evidence references and an audit trail for recommendations and seller decisions.

The MVP does not connect to Shopee, send messages to buyers, or change orders. Demo conversations and knowledge-base content are synthetic; recommendation quality and urgency ranking have not been validated with sellers.

## Production status

The live app is available at [escala-gold.vercel.app](https://escala-gold.vercel.app). The production deployment currently uses commit `be09cc7`.

On September 24, 2026, the production homepage returned HTTP 200, `/api/health` reported `ok` with MongoDB connected, and `/api/inbox` returned seven conversations. The health endpoint reports the LLM as configured when its environment settings are present; that status alone does not confirm a successful OpenAI generation request.

**Temporary Atlas network exception:** Production currently relies on a temporary Atlas allow-list rule that expires on October 1, 2026. This may allow broader network access than intended; replace it with a restricted egress path before expiry. No fixed outbound IP is configured for this Vercel project.

## Run locally

Prerequisites: Node.js 20.19 or newer, npm, and Git. Copy the example environment file, fill in the required values, then install and start the app:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Keep real credentials in the ignored `.env.local` file; never commit that file or paste secrets into source code.

### Environment variables

The primary Escala runtime settings are:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string. Percent-encode special characters in the database password. |
| `MONGODB_DB` | Database name; the example uses `escala`. |
| `OPENAI_API_KEY` | Server-side OpenAI API key for Escala. |
| `OPENAI_MODEL` | OpenAI model; current default is `gpt-5.6-luna`. |
| `OPENAI_REASONING_EFFORT` | Reasoning effort; current default is `xhigh`. |
| `ESCALA_DATA_MODE` | Set to `mongodb` to use Atlas persistence. |
| `ESCALA_OPENAI_MODE` | Set to `live` to use the OpenAI integration. |
| `ESCALA_ENABLE_EXTERNAL_SEND` | Keep `false`; the MVP does not send buyer messages. |
| `ESCALA_CONFIDENCE_THRESHOLD` | Minimum confidence used by deterministic policy; example default is `0.90`. |

`DEEPSEEK_API_KEY` is only for the separate Claude Code backend worker; it is not used for Escala runtime requests. `VERCEL_TOKEN` is only needed if you choose to use the Vercel CLI directly. Git-connected Vercel deployments do not require it in `.env.local`.

## Verification commands

Run these before proposing a code deployment:

```powershell
npm test
npm run lint
npm run typecheck
npm run validate:demo
npm run build
```

The main runtime checks are:

- `GET /api/health` — reports application, database, and LLM configuration status without returning credentials.
- `GET /api/inbox` — loads the persisted inbox threads.

If the health endpoint reports MongoDB unavailable, check the URI host, database user and password, Atlas IP access list, and whether the app was redeployed after changing its environment variables. Do not print a connection string while troubleshooting.

## Deploy to Vercel

The `escala` Vercel project is connected to this GitHub repository. Production variables are configured in Vercel Project Settings; keep secrets there as Secret values. After changing an environment variable, create a new production deployment or redeploy the current production commit so the runtime receives the new value.

Before deployment, use the verification commands above. Confirm the deployment is Ready, then check the production homepage, `/api/health`, and `/api/inbox`. Do not commit credentials, Atlas exports, or real customer messages.

## Project docs

- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deterministic policy](docs/POLICY.md)
- [RAG knowledge base](docs/RAG-KNOWLEDGE-BASE.md)
- [Demo script](docs/DEMO-SCRIPT.md)
- [Setup guide](docs/SETUP.md)
- [Shopee Seller Centre design references](docs/DESIGN_REFERENCES_SHOPEE.md)
- [Earlier determination-engine contract](docs/DETERMINATION-ENGINE.md)
