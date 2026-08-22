# PAYMENTS.md — TipPoolCalc monetization setup (Allen's ~5-minute step)

Global product → card rails are primary (LemonSqueezy recommended: instant signup, no approval, handles VAT, auto-delivers digital content).

## 1. LemonSqueezy / Gumroad (4 min)
1. Sign up (email only) → Create product:
   - Name: **TipPoolCalc PRO**
   - Price: **$9.99 one-time**
   - Product type: digital → "content" = your unlock code + instructions
2. Copy the checkout URL.
3. In `index.html`, find `<a id="payLink" href="#">💳 Pay by card →</a>` and paste your URL as `href`.
4. In `app.js` line ~7, set your code:
   ```js
   const PRO_CODES = ['TIPPOOL-PRO-999', 'TPC-DEMO'];   // ← your real code(s)
   ```
5. Commit + push:
   ```bash
   git add -A && git commit -m "wire payment link + real code" && git push
   ```

## 2. QR fallback (optional, 1 min)
Replace `assets/pay-qr.svg` with any QR your buyers can scan (PayPal.me, Venmo, GCash, Wise). Or delete the `<img>` and keep card-only.

## 3. Pricing rationale
$9.99 one-time vs TipHaus $129/mo / 7shifts $149.99/mo. Priced as an impulse buy below the "ask my partner" threshold. Test $14.99 after 50 visitors; restaurant managers are not price-sensitive at this level for a tool that kills a weekly chore.

## 4. Fulfilment
LemonSqueezy/Gumroad auto-delivers the code on purchase — zero work per sale. Manual fallback: buyer emails receipt → you reply with code.

## 5. Growth (the real lever)
- Reddit: r/restaurateur, r/barowners, r/restaurantowners — tip-splitting questions come up weekly; answer helpfully, link in profile/signature.
- Google: this page targets "tip pool calculator" long-tail; Pages sites index within days.
- Facebook: restaurant owner groups (search "restaurant owners", "bar owners" groups) — post the free tool, not the PRO.
