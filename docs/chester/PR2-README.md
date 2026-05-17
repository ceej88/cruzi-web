# PR 2 — Chester learner waiting list page (UI only)

Scope: a new standalone page at `/chester` for Chester-area learners,
plus the route wiring. Strictly UI — **no** account creation, **no**
Stripe, **no** backend writes, **no** mobile changes, **no** edits to
the existing instructor landing page.

## Files

- `src/pages/ChesterLearnerPage.tsx` *(new, 390 lines)* — the learner page.
- `src/App.tsx` *(+2 lines)* — registers `/chester` and imports the page.
- `docs/chester/PR2-README.md` *(new, this file)*.

## Page structure (in order)

1. **Hero** — headline “Pass Faster With Smart Driving Practice”,
   subheading per spec, primary CTA *Join Chester Waiting List*,
   secondary CTA *Download Cruzi*.
2. **Practice gap** — DVSA 22-hour guidance, Cruzi as the tool that
   makes private practice structured.
3. **What learners get** — six feature cards: Private practice support,
   AI Driving Co-Pilot, Theory prep, Show Me Tell Me, Progress tracking,
   Chester local guidance.
4. **Practice with parents** — supervising-driver framing + example
   session plan card.
5. **Chester local** — chips for Chester, Ellesmere Port, Wrexham,
   Northwich, and surrounding areas. No fake route or instructor counts.
6. **Waitlist form** — `full_name` + `email`, plus hidden `city=chester`
   and `source=chester_landing` context fields.
7. **Joined state** — “You’re on the Chester waiting list.” plus an
   *optional* Practice Pass card priced at £9.99 (one-time), CTA disabled
   with “Coming soon”.

## Submit behaviour (PR2 only)

The submit handler is a **local-only mock**: it transitions to the
joined-state UI via React state. **Nothing is written to Supabase** and
no network request is made. A small disclaimer under the form and at
the bottom of the joined state makes this explicit:

> Preview — your details aren’t being saved yet. Backend wiring lands
> in the next update.

This satisfies the brief’s rule: *“either disabled with ‘Coming soon’,
or local mock only — do not pretend real data was saved unless it
actually writes to the backend safely.”*

## Copy rules honoured

- No fake stats, testimonials, queue numbers, or instructor counts.
- No “guaranteed instructor” claims — both the local section and the
  Practice Pass card explicitly state availability is not guaranteed.
- Payment is positioned as *optional* (“start private practice while
  you wait”), never as required.
- Cruzi remains free to try.

## Design system

- Uses the Cruzi Vision tokens already shipped in PR #13: `bg-background`
  (`#F8F9FF`), `text-foreground`, `bg-primary` for primary CTAs
  (`#5300B7`), `text-primary-container` (`#6D28D9`) for accents,
  `font-inter`, `rounded-card`, `rounded-chip`, `rounded-pill`,
  `text-headline-display / -lg / -md`, `text-body-lg / -md`, `text-label-md / -sm`,
  `shadow-purple-glow` / `shadow-purple-glow-hover` for the subtle CTA glow,
  `bg-surface-container-low` for alternating sections.
- White / light background throughout, generous spacing, rounded cards,
  Inter typography, purple CTA hierarchy. No dark-mode override needed.

## Out of scope (intentionally not in this PR)

- Account creation
- Stripe / checkout / £9.99 charge
- Success / post-payment flow
- Edge functions / API routes
- Mobile repo changes
- Instructor landing page changes
- Production migration application

## What was *not* touched

- The two existing `ChesterLandingPage.tsx` files at root and `src/pages/`
  (an instructor-focused SEO page) are unchanged. They’re still not
  registered in any route.
- All other pages, components, and the Tailwind config are unchanged.

## Verification

```
$ npx tsc --noEmit
(exit 0)

$ npm run build
✓ built in 18.96s
```
