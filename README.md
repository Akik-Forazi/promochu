# @fraziym/promochu

**AI-powered cold email automation with sender rotation, analytics tracking, and FRAZIYM ecosystem integration.**

## What is Promochu?

Promochu automates personalized cold email outreach at scale:
- **Sender rotation** — cycle through multiple Gmail accounts to avoid rate limits
- **Template variables** — personalize with {{firstName}}, {{lastName}}, {{company}}, etc.
- **Lead tracking** — JSON database tracks who was emailed, who opened, who clicked
- **Rate limiting** — configurable emails/hour/account with automatic delays
- **Analytics** — open tracking (pixel), click tracking, bounce detection
- **AI content** — optionally use @fraziym/axoniz to generate personalized email bodies
- **Security** — @fraziym/xorgis scans for credential leaks before sending
- **Error tracking** — @fraziym/xorvoid captures failures and auto-retries

## Quick start

```bash
npm install @fraziym/promochu
```

```env
# .env
SENDER_ACCOUNTS="sender1@gmail.com:apppassword1,sender2@gmail.com:apppassword2"
LEADS_FILE="./leads.json"
RATE_PER_HOUR_PER_ACCOUNT=30
FROM_NAME="Your Name"
SUBJECT_TEMPLATE="Special offer for {{firstName}}"
```

```bash
promochu start
```

## CLI

```bash
promochu start           # start sending campaign
promochu --import-leads  # import leads from JSON
promochu --stats         # show campaign statistics
promochu --campaign      # create a new campaign
```

## FRAZIYM ecosystem integration

| Package | Role in Promochu | Required? |
|---|---|---|
| `@fraziym/xorvoid` | Error tracking — captures send failures, auto-retries | Optional |
| `@fraziym/xorgis` | Security — scans email content for credential leaks before sending | Optional |
| `@fraziym/axoniz` | AI — generates personalized email bodies from lead data | Optional |

If these packages are installed, Promochu auto-detects them and activates their features.

## Architecture

```
leads.json → Promochu → sender rotation → Gmail (nodemailer)
                ↓              ↑
            analytics    ┌─────┴──────┐
         (open/click)   │ xorgis scan │ (blocks credential leaks)
            ↓           └────────────┘
         database.json       ↓
       (tracking)      ┌─────┴──────┐
                       │ xorvoid   │ (captures send failures)
                       └────────────┘
                            ↓
                       ┌─────┴──────┐
                       │ axoniz AI  │ (generates personalized body)
                       └────────────┘
```

## License

MIT
