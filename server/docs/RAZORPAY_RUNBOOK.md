# Razorpay operations runbook (Kattraan)

Internal reference for payments, webhooks, refunds, and reconciliation.

## Endpoints and env

| Item | Value |
|------|--------|
| Create order | `POST /api/payment/razorpay/create-order` (authenticated) |
| Client verify | `POST /api/payment/razorpay/verify` (authenticated) |
| Webhook | `POST /api/webhooks/razorpay` (public; HMAC verified) |
| Webhook alias | `POST /api/payments/webhook` (compatibility alias; same handler) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Dashboard → API Keys (test vs live) |
| `RAZORPAY_WEBHOOK_SECRET` | Dashboard → Webhooks → endpoint signing secret |

Webhook body must stay **raw** for signature verification (already wired in `app.js` before `express.json()`).

## Dashboard: webhook configuration

1. URL (preferred): `https://<your-production-api-host>/api/webhooks/razorpay`
   - Compatibility alias also works: `https://<your-production-api-host>/api/payments/webhook`
2. Active events:
   - **`payment.captured`** — enrolls learner and creates an `Order` (idempotent on `paymentId`).
   - **`payment.failed`** — **no DB change**; server logs a structured line (`[Razorpay webhook] payment.failed`) for support and analytics.
3. After creating the webhook, copy the **signing secret** into `RAZORPAY_WEBHOOK_SECRET` and redeploy.

## Fulfillment behaviour

- **Happy path:** Checkout succeeds → client calls `/verify` → enrollment + `Order` row.
- **Backup path:** User closes the tab or `/verify` fails → **`payment.captured`** webhook still runs the same fulfillment (idempotent).
- **Failed payment:** Razorpay sends **`payment.failed`** → log only; user is not enrolled.

## Reconciliation

1. **Daily:** In Razorpay Dashboard → Payments, filter **captured** for the date range.
2. **In app:** MongoDB `orders` collection — match `paymentId` (Razorpay payment id) and `orderDate`.
3. **Mismatch:** Payment captured in Razorpay but no `Order` with that `paymentId`:
   - Check server logs for `[Razorpay webhook]` and `[Razorpay] verify`.
   - Confirm webhook URL and secret in production.
   - Use Razorpay **Webhook deliveries** UI to inspect payload and response code.

## Refunds

1. **Policy:** Follow your product/refund policy shown to customers on the site.
2. **Execute refund:** Razorpay Dashboard → payment → **Refund**, or Refunds API (ops/engineering).
3. **Data model:** Refunding in Razorpay does **not** automatically update Kattraan `Order` or remove `LearnerCourses`. Today that is a **manual or future-automation** step:
   - Optionally set a field on `Order` (e.g. `refundedAt` / `paymentStatus`) if you extend the schema later.
   - Access removal after refund is a product decision (support workflow).

## Customer support scripts

- **“Money debited but not enrolled”:** Ask for approximate time and email; check Razorpay payment id → Mongo `orders.paymentId` → learner enrollment. If payment **captured** and no order, check webhook logs and fix webhook config; you can trigger reconciliation or manually enroll per policy.
- **“Payment failed”:** Ask them to retry; check `payment.failed` logs for `error_code` / `error_description` (bank or network decline).

## Security and compliance

- Never log **key secret**, **webhook secret**, or full card numbers.
- Rotate keys if `.env` or secrets were exposed; update hosting env and Razorpay if keys revoked.
- Production must use **live** keys and **`CLIENT_URL`** matching the real browser origin (CSRF).

## Go-live checklist (short)

- [ ] Live KYC / settlement bank active on Razorpay
- [ ] Live `RAZORPAY_KEY_*` in production secrets
- [ ] `RAZORPAY_WEBHOOK_SECRET` set; webhook URL HTTPS; test delivery **200**
- [ ] Test capture in live with a small amount end-to-end
- [ ] Log drain / alerts on `fulfill error` and repeated `payment.failed` spikes
