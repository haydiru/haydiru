<img src="./assets/header.svg" alt="Haidir Magribi, product engineer" width="100%">

I'm Haidir, a product engineer based in Jakarta, Indonesia. I run PT HM Tech Innovation, where I build and operate
software products on my own: specification, data model, backend, interface, store release and support.

Most of what I build is web software and mobile apps with LLM features. When several organisations share one system,
I isolate their data in the database itself, and I keep the AI provider swappable without touching product code.

I'm open to remote engineering roles and contract work.

<br>

## In production

| Product | Platform | |
|---|---|---|
| [AsapRadar](https://play.google.com/store/apps/details?id=id.asapradar.app) | Android | Haze, air quality (ISPU) and fire hotspots, mapped onto the user's commute. No ads or trackers. |
| [FlagCheck](https://play.google.com/store/apps/details?id=app.flagcheck.mobile) | Android | Reads chat screenshots and flags subtext, scam patterns and one-sided conversations. Images are not retained. |
| [PropForma Lens](https://github.com/haydiru/propforma) | Chrome extension | Builds a commercial real estate underwriting workbook from a LoopNet or Crexi listing. Every figure is a live Excel formula. Paid subscription. |
| [AO Mart](https://agenorganik.com/) | Web | Storefront for an organic food shop in Samarinda. Guests can order without an account. |
| [mrwealthai.com](https://github.com/haydiru/mrwealthai-com) | Web | Company site and product registry. Next.js 16, Zod-validated content, JSON-LD structured data. |

<br>

## Selected work

### [HR Automation](https://github.com/haydiru/HR-Automation)
`Next.js 16` `TypeScript` `Supabase` `PostgreSQL`

Recruitment SaaS that screens CVs with an LLM and scores each candidate against the criteria of a job.

- Every company is a tenant. Isolation is enforced by PostgreSQL row-level security rather than by filters in application code.
- Each company brings its own model provider and key: Gemini, OpenAI or Anthropic format, or a proxy such as OpenRouter.
- Applications arrive through a public form or from Gmail, where an Apps Script forwards attachments to a webhook guarded by a secret token.
- The distance from a candidate's home to the office is computed on the server (haversine) and can be set as a hard requirement.
- SQL migrations run automatically at deploy time through Next.js instrumentation.

### [KasirPro](https://github.com/haydiru/Kasir-Pro)
`Next.js 16` `Prisma` `PostgreSQL` `Auth.js`

Operations and reporting for a minimarket: cashier shifts, petty cash, supplier returns, attendance and payroll.

- Role-based access built on Auth.js v5 and server actions.
- A scheduled job reads payment notifications from Gmail and matches them to recorded transactions.
- The dashboard compares weekday and weekend demand and ranks cashiers on revenue and cash-count accuracy.
- Thermal receipt printing, photo evidence in blob storage, and bulk supplier import from Excel.

### [BeMind](https://github.com/haydiru/BeMind)
`Flutter` `Supabase` `LLM`

English speaking practice built from the user's own material. A CV, voice note, PDF or photo becomes a practice script.

- Teleprompter reader that runs from 60 to 300 words per minute.
- Model calls go through an edge proxy that falls back across providers (OpenRouter, DeepSeek, Gemini).
- Vocabulary review on the lock screen, and a shared library of prompt templates.

<br>

## Activity

<img src="./assets/stats.svg" alt="Commits and languages over the last 12 months, across owned, collaborator and private repositories" width="100%">

Counted from every repository I work in, including private and client repositories, and regenerated daily by
[a GitHub Action](.github/workflows/stats.yml). Private repositories are counted but never named.

<br>

## Stack

| | |
|---|---|
| Languages | TypeScript, JavaScript, Dart, SQL, C#, PHP |
| Web | Next.js (App Router, server actions), React, Tailwind CSS, shadcn/ui |
| Mobile | Flutter, Android releases on Google Play |
| Data | PostgreSQL, Supabase (auth, storage, row-level security), Prisma |
| AI | Gemini, OpenAI and Anthropic APIs, OpenRouter, schema-validated output with Zod |
| Infrastructure | Vercel, Vercel Blob, Google Apps Script, Gmail API |

<br>

## How I work

Every project starts with a written product spec (`prd.md`) and a task board kept in the repository
(`tasks_todo.md`, `tasks_in_progress.md`, `tasks_done.md`). I work alongside AI coding agents and review
everything they produce. The repositories show that process in the open.

<br>

[official@mrwealthai.com](mailto:official@mrwealthai.com) &nbsp;·&nbsp;
[LinkedIn](https://id.linkedin.com/in/haidir-magribi) &nbsp;·&nbsp;
[YouTube](https://www.youtube.com/@haidir_tech) &nbsp;·&nbsp;
[mrwealthai.com](https://mrwealthai.com) &nbsp;·&nbsp;
[Google Play](https://play.google.com/store/apps/developer?id=Hai+developer)
