## Feature Implementation Instructions (Must-Follow Playbook)

These instructions are binding for every feature from now on. They enforce a mobile-first, FAANG-level approach aligned to our theme, structure, and logging standards. Follow the phases in order, check off each item, and keep the code DRY by reusing existing components, services, and types.


### Core Principles (always)
- **Mobile-first**: Design, layout, and interactions start from small screens upward. Use progressive enhancement.
- **FAANG-level rigor**: Strong type-safety, explicit contracts, defensive programming, meaningful monitoring, and performance budgets.
- **Best practices for our use cases**: Favor clarity, maintainability, accessibility, and performance over cleverness; choose patterns consistent with the repo.
- **Conform to theme**: Use our existing design tokens, colors, typography, spacing, and component look/feel.
- **Consistent logging**: Use the project’s standardized logger utilities and log levels (debug/info/warn/error) with structured context.
- **Folder/file structure**: Adhere to the existing structure and barrel exports for discoverability and clean imports.
- **DRY and reuse first**: Before creating anything net-new, survey existing components, hooks, services, types, and utilities.
- **Tested and production-ready**: Features must ship with tests, analysis, and debugging complete.
- **Accessibility**: Meet WCAG AA where possible; ensure keyboard and screen-reader support.
- **Security**: Validate inputs, sanitize outputs, avoid leaking sensitive data in logs, follow least-privilege.


### Standard Phases

#### Phase 1 — Discovery
1. Clarify acceptance criteria and constraints (business, technical, performance, accessibility).
2. Inventory what exists to reuse: components, hooks, services, types, icons, styles, layouts, analytics, logger, errors.
3. Identify domain models and contracts (types/interfaces) affected.
4. Note potential refactors or abstractions to reduce duplication later.
5. Define performance and UX success metrics (e.g., LCP/INP targets, interaction latency, bundle delta).

Deliverables:
- Short plan with reuse map (what to reuse vs. extend vs. create).
- Edge cases list and error states.


#### Phase 2 — Design (Mobile-First)
1. Draft interaction flows and states beginning at the smallest viewport.
2. Define component hierarchy and data flow; prefer composition over deep prop drilling.
3. Specify state ownership (server vs client), caching strategy, and side-effects boundaries.
4. Validate theme alignment (tokens, variants) and accessibility (roles, labels, focus order).
5. Confirm logging strategy: what events/fields to log, at which level, with correlation IDs if applicable.

Deliverables:
- Component/contract outline and responsive behavior notes.
- Event/log schema and error handling strategy.


#### Phase 3 — Implementation
1. Create or extend components with mobile-first styles; scale up with responsive breakpoints.
2. Reuse existing utilities/services/types via barrel exports; only add new modules if necessary.
3. Enforce type-safety on public interfaces; avoid `any`. Export types for reuse.
4. Add instrumentation: structured logs at meaningful points; include context, identifiers, and durations where relevant.
5. Handle errors with user-friendly UI states and developer-useful logs without leaking sensitive info.
6. Keep components pure where possible; isolate side-effects in hooks/services.
7. Maintain small, focused modules; keep functions/component bodies readable.

Checklist:
- Uses theme tokens/variants and matches app look-and-feel.
- Follows folder conventions and exports via index barrel.
- Includes loading/empty/error/success states.
- Guard clauses > deep nesting; minimal try/catch; meaningful handling.


#### Phase 4 — Verification (Testing, Analysis, Debugging)
1. Unit tests for logic and components (render, a11y roles, states, edge cases).
2. Integration tests for data flows and side-effects.
3. E2E tests for critical paths if applicable.
4. Accessibility checks (labels, contrast, tab order, focus traps, ARIA).
5. Performance checks (bundle size change, render cost, network waterfalls).
6. Cross-browser and device spot checks (mobile-first, then tablet, then desktop).
7. Log inspection: validate levels, fields, and absence of sensitive data.

Deliverables:
- Passing tests, lint clean, no new TypeScript errors.
- Documented test evidence for critical scenarios.


#### Phase 5 — Optimization and Polish
1. Optimize rendering (memoization, stable deps, virtualization when needed).
2. Optimize data fetching (dedupe, cache, prefetch, pagination, backoff, retries).
3. Defer non-critical work (code-splitting, lazy components, idle tasks).
4. Refine micro-interactions and accessibility (reduced motion, focus management).
5. Finalize content and empty-state clarity.


#### Phase 6 — Documentation and Developer Experience
1. Update/author README snippets or in-code docs where non-obvious decisions exist.
2. Document props, events, and contracts in the component/service index.
3. Update barrel exports and any relevant central registries.
4. Add usage examples if helpful for future reuse.


#### Phase 7 — Refactor Pass (MANDATORY at the end)
1. Identify duplication that emerged; extract factories/services/types/interfaces as appropriate.
2. Consolidate similar patterns into utilities and update all call sites if safe.
3. Strengthen invariants: narrow types, assert preconditions, improve error messages.
4. Re-run tests and lint; validate no regressions.


### Implementation Standards (Quick Reference)
- **Styling/Theme**: Use existing design system tokens, variants, and responsive utilities. No hardcoded colors/spacing unless tokenized first.
- **Components**: Prefer composition, prop objects over many scalars, and sensible defaults. Keep public APIs stable and typed.
- **Services**: Encapsulate external calls and side-effects. Provide typed request/response, retries with jitter, cancellation, and timeouts.
- **State**: Co-locate transient UI state; centralize server/cache state. Avoid prop drilling; use context/hook abstractions where warranted.
- **Types**: Export shared types via barrel; model domain explicitly. No `any`; prefer discriminated unions, exact objects, and readonly for contracts.
- **Errors**: Use typed error shapes; render helpful UI; ensure logging includes code, message, and context IDs.
- **Logging**: Structured logs with level, event name, correlation/request IDs, user/session where appropriate, and duration metrics.
- **Security**: Validate inputs, sanitize rendered HTML, and avoid secret exposure. Follow content security guidelines for external links/assets.
- **Accessibility**: Semantic elements, ARIA only as needed, focus management, keyboard operability, reduced motion support.
- **Performance**: Budget awareness, minimal dependencies, code-splitting, avoid unnecessary re-renders, cache aggressively when safe.
- **Barrel Exports**: Every new folder has an `index` that re-exports public modules. Avoid deep relative imports across feature boundaries.


### Pre-Flight Checklist (before marking a feature complete)
- Mobile-first UI verified on small → large screens.
- Theming correct; uses tokens and consistent variants.
- Logging present at key points; structured and level-appropriate.
- Errors handled with safe user feedback and typed error surfaces.
- Tests: unit, integration, and E2E (if applicable) passing.
- Lint/type checks clean; no dead code; no console noise other than approved logs.
- Performance acceptable; bundle delta justified and documented.
- Reuse confirmed; no unnecessary duplication.
- Barrel exports updated; docs/examples added.
- Accessibility conditions satisfied.


### Final Step (ALWAYS do this)
At the end of the feature, perform the Refactor Pass (Phase 7) to extract or improve any classes, services, factories, types, interfaces, utilities, hooks, or components discovered during implementation. Re-run tests and debugging after refactors.


### Future Improvements Prompt
If you notice areas of improvement or foresee future features, list them explicitly and ask:

“Would you like to add any of these future improvements to the FUTURE_IMPROVEMENTS.md file?”

If the answer is yes, follow that file’s rules to append them properly and prioritize as directed.


### Cross-Document Compliance (FINAL MANDATE)
At the very end of implementing any feature (after the Refactor Pass and re-testing), analyze the `Resuable_Features.md` file and follow every instruction it contains that applies to the feature. Treat those instructions as mandatory and keep the implementation consistent with them. If updates to `Resuable_Features.md` are required as part of compliance, perform them according to that file’s rules.


