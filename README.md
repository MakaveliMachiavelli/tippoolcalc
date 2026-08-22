# TipPoolCalc — Free Tip Pool Calculator for Restaurants & Bars

**Live:** https://makavelimachiavelli.github.io/tippoolcalc/

## What it is
A free, no-signup tip pool calculator that splits tips by **hours worked** or **hours × role weight (points)**, with a printable payout sheet that always balances to the cent. Pure client-side.

**Free tier:** unlimited calculations, hours & points methods, all currencies, printable payout sheet.
**PRO ($9.99 one-time):** saved teams (roster in one click), weekly payout history, CSV export for payroll.

## Buyer persona
- **Who:** managers/owners of small restaurants, bars, cafés, food trucks (US/CA/AU/UK + global) who split tips weekly; also shift leads doing tip-outs.
- **Pain:** doing tip math in Excel every week, arguments over fairness, no cheap one-time tool — the market is SaaS at $129–150/month per location.
- **Why pay $9.99:** one week of a $150/mo subscription = 15 years of TipPoolCalc PRO. Saved teams + CSV history kill the weekly Excel chore.
- **Where they hang out:** r/restaurateur, r/KitchenConfidential, r/barowners, restaurant-manager Facebook groups, "tip pooling" Google searches (high intent, weak free-tool competition).

## Demand evidence (per REVENUE GATES)
- Paid competitors: TipHaus ($129/mo via Square marketplace), 7shifts ($149.99/mo + $6/employee), Homebase (paid tiers), Toast (POS-locked), Shyft = 5 paid alternatives.
- Price umbrella: cheapest credible alternative is $129/mo — a $9.99 one-time calculator is an obvious wedge.
- SEO: "tip pool calculator", "tip splitting by hours", "tip distribution calculator" — evergreen, high-intent, and current free results are thin ad-covered pages.

## Monetization
Unlock-code PRO via card link (LemonSqueezy/Gumroad — Allen's 5-min setup, see `PAYMENTS.md`) + QR fallback. Same code-unlock mechanics as InvoicePH.

## Tech
Static HTML/CSS/vanilla JS. No build, no backend, no dependencies. Print CSS → save-as-PDF payout sheet.

## Deploy (GitHub Pages)
```bash
git init && git add -A && git commit -m "TipPoolCalc v1"
gh repo create tippoolcalc --public --source=. --push
gh api -X POST repos/MakaveliMachiavelli/tippoolcalc/pages -f "source[branch]=main" -f "source[path]=/"
```

## Owner TODO (Allen, ~5 min)
1. Sign up LemonSqueezy/Gumroad → product "TipPoolCalc PRO $9.99" → paste checkout URL into `index.html` (`id="payLink"` href) and swap `assets/pay-qr.svg`.
2. Change `PRO_CODES` in `app.js`.
3. Growth lever: answer tip-splitting questions on r/restaurateur & restaurant FB groups with genuinely useful advice + link.
