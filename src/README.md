# Source skeleton

The application source will be added after Phase 0. The planned modules are:

- `domain/` — typed message, evidence, urgency, action, and audit models;
- `retrieval/` — local knowledge-base adapter with evidence IDs;
- `policy/` — deterministic risk, urgency, and action rules;
- `llm/` — structured extraction and drafting adapter with a mock fallback;
- `ui/` — seller inbox, evidence panel, action controls, and audit timeline.

The policy module must not depend on UI code or unrestricted model output.
