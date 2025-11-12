# Responsive & Theme QA Checklist

This checklist captures the validation pass for **Phase 5** of the redesign.  
Run through the items below for every major feature area (landing, auth, dashboard, store).

---

## 1. Breakpoint Review

### 480 px (Small phones)
- Verify navigation collapses into burger + slide-in sidebar.
- Hero, cards, forms, and tables stack vertically with adequate spacing (≥16 px padding).
- Buttons and inputs span full width with 44 px tap targets.
- Tables switch to horizontal scroll without clipping.

### 768 px (Tablets)
- Navbar search bar appears, sidebar docks beside content when authenticated.
- Hero grids and product cards split into two columns.
- Forms show labels and helper text without wrapping.
- Tables retain horizontal padding; pagination controls remain touch friendly.

### 1024 px (Desktops)
- Navbar adopts full-width search + pill buttons.
- Landing sections align to the max-width container (≤1600 px) with balanced gutters.
- Forms display inline helper text; field groupings align to grid columns.
- Tables show zebra striping, sticky header contrast, and branded pagination pills.

> **Tip:** use browser dev-tools device presets or `CTRL` + `Shift` + `M` (Chrome/Edge) to cycle through viewports quickly.

---

## 2. Theme Switching

### MedSource Classic (default)
- Confirm background, headings, and CTA colors match brand palette.
- Cards, buttons, and table shells use soft shadows and green gradients.
- Input focus rings and error states show the updated brand tint.

### Winter / Luxury (DaisyUI fallbacks)
- Toggle themes via settings (or `localStorage` override) and ensure:
  - Labels, helper text, and form borders remain legible.
  - Buttons inherit DaisyUI theme hues without breaking layout.
  - Tables retain readable header/body contrast.
- Switch back to `medsource-classic` and confirm tokens reapply (`data-theme="medsource-classic"` on `<html>`).

> **Automation idea:** add Cypress or Playwright smoke tests to toggle `data-theme` and capture screenshots at the three breakpoints.

---

## 3. Visual Regression Prep

- Capture baseline screenshots (Chrome) for key routes at 480/768/1024 using `npx playwright test --update-snapshots` (or preferred tooling).
- Store baselines under `tests/visual/__screenshots__/` (planned directory) for future phases.
- Document any intentional visual deviations vs. production in PR descriptions.

---

## 4. Accessibility Spot Checks

- Keyboard tab through navigation, buttons, and form controls (visible focus ring at each step).
- Run Lighthouse → Accessibility audit; target ≥ 95 score.
- Ensure text contrast ratio meets WCAG AA (use dev-tools color picker).

---

## 5. Reporting

- Log findings in the sprint QA doc or issue tracker with screenshots.
- Flag any component requiring refinements before moving to Phase 6.

> Keep this checklist updated as new modules ship; responsive QA becomes faster when the ritual is documented.


