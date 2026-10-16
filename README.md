# @fraziym/promochu

Professional Gmail farm + cold email outreach platform. Account health tracking, warmup automation, multi-step sequences, AI personalization, analytics.

## Gmail Farm

Managed pool of Gmail accounts with:
- Health states: NEW → WARMING_UP → HEALTHY → (DEGRADED → COOLING_DOWN → RECOVERING) → BANNED
- Warmup schedule: 5/day → 10/day → 20/day → 30/day over 14 days
- Auto-cooldown: bounce >5% → 24h, complaint >0.1% → 48h
- Smart rotation: health-based + niche matching (not round-robin)
- Hard rate cap: prevents account burn

## Multi-step Sequences

Day 1: Intro (AI) → Day 3: Follow-up → Day 7: Social proof → Day 12: Breakup. Auto-stop on reply/unsubscribe/bounce.

## Analytics

Open tracking, click tracking, reply detection (IMAP), bounce parsing, per-account + per-campaign breakdown.

## Security (@fraziym/xorgis)

- Credential vault — app passwords encrypted (post-quantum crypto)
- Content scanner — scans for leaked secrets BEFORE sending
- Audit log — tamper-proof Merkle chain
- CAN-SPAM + GDPR compliance

## CLI

promochu start / farm list / farm add / farm warmup / --import-leads / --stats

## Database

SQLite (better-sqlite3) — local, ACID, queryable.

## Ecosystem

- @fraziym/xorvoid (error tracking + auto-retry)
- @fraziym/xorgis (secret scanning + crypto + compliance)
- @fraziym/axoniz (AI email personalization)

All optional — auto-detected if installed.

## License

MIT
