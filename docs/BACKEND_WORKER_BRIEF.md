# Backend worker: phase 1

Implement only MongoDB connectivity and health route in this turn. Read `src/domain/contracts.ts` and `docs/POLICY.md`, then code immediately. No more package/source research.

Create exactly:

- `src/server/mongodb.ts`: cached MongoClient connection using `MONGODB_URI`/`MONGODB_DB`; typed collections for synthetic threads, recommendations, audit; short server selection timeout; helper to ping and report unavailable without exposing secrets.
- `src/server/repository.ts`: minimal idempotent Mongo seed helper using only the existing `data/demo/messages.json` and `data/demo/knowledge-base.json`. Keep seed records synthetic and do not log contents. Export needed collection accessors.
- `src/app/api/health/route.ts`: return the shared `HealthResponse`; database is connected only after an actual ping; `llm` reports configured/fallback based on server-only `OPENAI_API_KEY`; use degraded status if DB is unavailable.

Use only the `mongodb` package already installed. Do not edit contracts, frontend, root/package/config/env files. Do not use OpenAI in this phase. Do not add more files or documentation. Do not commit. Report exactly what was written.
