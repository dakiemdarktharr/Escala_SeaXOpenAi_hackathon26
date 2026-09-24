# Escala

Escala is a seller-support MVP for marketplace operations. It turns buyer messages into evidence-backed recommendations and presents them in a Shopee Seller Centre-inspired workspace. The interface is an original Escala design and is not affiliated with Shopee.

## Current status

The MVP includes a responsive seller inbox, synthetic support scenarios and knowledge-base data, a MongoDB persistence layer, an OpenAI Responses integration, deterministic risk policy, and seller decision audit records. External message sending and order mutation remain disabled. The smaller deterministic engine prototype and its contract tests from the repository's earlier work are preserved separately at `src/determination-engine.js`.

Production build, lint, typecheck, demo-data validation, and policy tests pass locally. A local production server returns HTTP 200. Live MongoDB Atlas connectivity has not yet been confirmed from this machine; Vercel Production variables are configured, and deployment will be verified after the GitHub push completes.

## Run locally

Prerequisites: Node.js 20.19 or newer, npm, and Git. Create `.env.local` from `.env.example`, add MongoDB and OpenAI credentials, then run:

```powershell
npm install
npm run dev
```

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run validate:demo
npm run build
```

## Project docs

- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deterministic policy](docs/POLICY.md)
- [RAG knowledge base](docs/RAG-KNOWLEDGE-BASE.md)
- [Demo script](docs/DEMO-SCRIPT.md)
- [Setup guide](docs/SETUP.md)
- [Shopee Seller Centre design references](docs/DESIGN_REFERENCES_SHOPEE.md)
- [Earlier determination-engine contract](docs/DETERMINATION-ENGINE.md)

Escala does not integrate with Shopee, send customer messages, mutate marketplace orders, or reuse DOCRELAY/SAND assets. Demo data is synthetic. Recommendation accuracy and seller trust remain unvalidated.
