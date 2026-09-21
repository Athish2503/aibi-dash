# Vibe Coding Guide

## Purpose
Give AI coding assistants precise boundaries.

## Prompt template
```text
Task:
<one small feature>

Context:
<affected module>

Requirements:
<exact behavior>

Constraints:
<what must not change>

Acceptance criteria:
<testable outcomes>

Do not:
<failure modes>
```

## Rules
1. Read AGENTS.md and relevant docs first.
2. Inspect existing code before editing.
3. Make one coherent change at a time.
4. Never rewrite unrelated files.
5. Never invent APIs.
6. Never remove tests to make them pass.
7. Never hard-code secrets.
8. Never use an LLM as the analytical source of truth.
9. Do not add dependencies without justification.
10. Keep generated artifacts reproducible.

## Definition of done
- Code implemented.
- Tests added/updated.
- Tests pass.
- API/docs updated if behavior changed.
- No unrelated modifications.
- Limitations documented.
