# PR2 — Chester learner funnel (staged lead-gen, UI only)

`/chester` is a **local lead-generation funnel** for learner drivers in the
Chester region. It is not a product homepage and intentionally avoids
SaaS / startup framing.

## Strategic shape

The primary job is to capture **local learner demand by area**, build a
**waiting list**, and prove **instructor demand** for the region. The
Cruzi app appears as a **secondary offer** once a learner has joined the
waitlist — never before.

The funnel has 5 stages in total. This PR ships the public-facing first
three (no backend, no payments, no auth):

| Stage | Where | What happens |
|------:|-------|--------------|
| 1 | `/chester` — `landing` view | Regional local instructor lead capture: hero + lead form (name, email, phone, area). |
| 2 | `/chester` — `submitted` view | Calm pivot: "Right now, all local instructors are fully booked." Waitlist spot acknowledged. |
| 3 | `/chester` — `submitted` view (inline below) | "While you wait — start practising with family." Family Practice Access £9.99. |
| 4 | `/chester/start` (placeholder) | Real Stripe checkout + account creation lands here in **PR3 + PR4**. |
| 5 | `/chester/welcome` | Success state — built in **PR4**. |

## Terminology rules (locked)

- ✅ "Family Practice", "Start Family Practice", "Practise with family while you wait"
- ✅ "Family Practice Access — £9.99"
- ✅ "Guided private driving sessions", "Parent / family supervision support"
- ❌ Never: "Practice Mode", "AI coach", "learning ecosystem", "platform"

## Regional framing

Chester is the **hub**, not the only city. The hero, areas section, and
form `<select>` cover Chester city centre, Hoole, Upton, Blacon, Saltney,
Boughton, Vicars Cross, Christleton, Ellesmere Port, Queensferry,
Wrexham, Flintshire, plus "other nearby area".

## Design rules (matches `src/pages/Index.tsx`)

- `SiteNav` for nav, inline minimal footer
- Inline styles only — no Tailwind class soup, no shadcn `Button`/`Card`/`Input`
- Plus Jakarta Sans 800 headlines (dynamic `<link>` injection) + Inter body
- Hardcoded constants `BG / GLASS / GLASS_B / P / P_SEC / TEXT / MUTED` — no new colours
- Glass cards (24 px radius, lavender hairline, blur 20)
- `SectionPill` chip eyebrow on every section
- `btn-pulse` only on the **primary** conversion CTA (lead form submit, Family Practice CTA)
- **One quiet orb in the hero only** — no orbs sprayed across the page
- Hero is ~70vh — headline + subhead + form + CTA visible above the fold on a laptop
- Compact `@media (max-width: 900px)` collapse for the 2-col hero
- `fadeUp` motion (y:24, 0.55s easeOut, viewport once)

## Funnel state

Funnel context is held in `sessionStorage` under the key
`cruzi.chester.funnel.v1` as JSON:

```ts
{
  firstName: string;
  email: string;
  phone: string;
  area: string;
  interestedInFamilyPractice: boolean;
  joinedAt: string; // ISO timestamp
}
```

- Written on lead-form submit (`interestedInFamilyPractice: false`).
- Flipped to `true` when the user clicks **"Start Family Practice"** —
  then `/chester/start` is opened.
- Read by `/chester/start` to confirm the waitlist spot, name the area
  and personalise the message. If absent (cold landing), `/chester/start`
  nudges the visitor back to `/chester`.

PR3 will lift this same shape into the backend (Supabase) and PR4 will
hand it off to Stripe checkout.

## Files in this PR

- `src/pages/ChesterLearnerPage.tsx` — staged-funnel page (landing + submitted views)
- `src/pages/ChesterStartPlaceholder.tsx` — Family Practice handoff page
- `src/App.tsx` — adds `<Route path="/chester/start" …/>` (+2 lines)
- `docs/chester/PR2-README.md` — this file

## Out of scope (deferred)

- ❌ Backend, Supabase persistence, edge functions → **PR3**
- ❌ Account creation, password capture → **PR3**
- ❌ Stripe checkout, success page → **PR4**
- ❌ Production DB migration → not yet (PR1 schema sits in `main` but is not pushed live)
- ❌ Mobile repo changes
- ❌ Instructor dashboard work
