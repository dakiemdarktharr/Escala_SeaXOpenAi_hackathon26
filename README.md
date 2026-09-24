# Escala

**Escala — AI Action Recommender for Marketplace Sellers**

> Scale seller support, not seller risk.

Repository: [github.com/dakiemdarktharr/Escala_SeaXOpenAi_hackathon26](https://github.com/dakiemdarktharr/Escala_SeaXOpenAi_hackathon26)

Escala is a hackathon prototype for marketplace sellers. It turns incoming buyer messages into a grounded, explainable next action: automatically reply to a routine question, prepare a seller draft, ask for missing information, or escalate a risky case.

## Current status

This repository is at **Phase 0 — setup and project framing**. The documentation and synthetic demo fixtures are ready; the web dashboard, model adapter, retrieval implementation, and policy runtime are not implemented yet.

The intended first vertical slice is:

```text
Seeded message → RAG evidence → risk/urgency classification
→ deterministic policy action → visible reason/evidence → audit timeline
```

The urgency ranking is a transparent prototype ranking, not a validated business metric. The demo uses local synthetic data and keeps external message sends disabled.

## Run the setup validation

Prerequisites: Node.js 20 or newer and Git.

```powershell
npm run validate:demo
```

No dependency installation is required for this Phase 0 validation. See [docs/SETUP.md](docs/SETUP.md) for the current setup and the planned application start command.

## Product and design documents

- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deterministic policy](docs/POLICY.md)
- [RAG knowledge base](docs/RAG-KNOWLEDGE-BASE.md)
- [Judge-facing demo script](docs/DEMO-SCRIPT.md)
- [Setup guide](docs/SETUP.md)
- [Decision log](docs/DECISIONS.md)
- [Hackathon compliance](docs/HACKATHON-COMPLIANCE.md)

## Demo data

- [Synthetic messages](data/demo/messages.json)
- [Versioned knowledge base](data/demo/knowledge-base.json)

The fixtures cover a safe FAQ, an ambiguous request, payment/refund risk, a delivery deadline, complaint/cancellation escalation, missing retrieval evidence, and model failure fallback.

## What is real, mocked, synthetic, and not implemented

| Area | Phase 0 status |
| --- | --- |
| Product framing and policy boundaries | Real project decisions documented here |
| Message and knowledge-base content | Synthetic, written for the Escala demo |
| Marketplace integration | Not implemented; no live Shopee OAuth or message send |
| Retrieval | Planned local adapter using the versioned JSON fixture |
| LLM interpretation/drafting | Planned OpenAI adapter with mock fallback |
| Risk and action policy | Planned deterministic module, independent of the LLM |
| Seller UI and audit timeline | Not implemented yet |
| Accuracy, urgency quality, and adoption | Unvalidated; no production claims |

## Compliance boundary

Escala is a new build in this workspace. Its implementation, UI, data, workflow details, and demo will be created for the hackathon and will not reuse DOCRELAY or SAND source code or artifacts. See [docs/HACKATHON-COMPLIANCE.md](docs/HACKATHON-COMPLIANCE.md).

## Scope discipline

Authentication, multi-tenancy, live channel integrations, mobile clients, background workers, billing, and production infrastructure are explicitly deferred until the core vertical slice works end to end.
