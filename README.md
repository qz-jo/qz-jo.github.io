# Saif AL-Moghrabi — Intelligent Developer Portfolio V2

A cinematic, bilingual portfolio for **Saif AL-Moghrabi**, an AI & Data Science student focused on backend engineering and automation in Amman, Jordan.

## Live site

- Portfolio: https://saif.codes
- GitHub: https://github.com/qz-jo
- LinkedIn: https://www.linkedin.com/in/saif-almograbe-8847723aa

## Experience highlights

- Cinematic, self-hosted circuit-board hero video with a lightweight neural-canvas layer
- Responsive portrait-led Hero using Saif's supplied photo and optimized WebP sources
- Premium monochrome meeting CTA controlled by one `MEETING_URL` constant
- English and Arabic interfaces with full RTL support
- SEIF.OS portfolio assistant grounded in verified project and profile content
- Smart project matcher for backend security, React frontends, browser testing, automation, full-stack, and privacy-first work
- Expandable engineering case studies and a source-linked Proof of Work section
- Command palette with keyboard navigation (`Ctrl/Cmd + K`)
- Live Amman clock and optional GitHub public-repository count
- Motion controls, reduced-motion support, keyboard accessibility, and responsive layouts
- Privacy-friendly contact flow that prepares a local email draft without sending data to a form service
- SEO metadata, structured data, sitemap, robots file, social preview, PWA manifest, and custom 404 page

## Featured work — August 2026

Six case studies are drawn from five public project repositories. Nova Tech and the E-commerce REST API share a repository but remain separate implementations.

| Case study | Current scope | Demo / source |
| --- | --- | --- |
| E-commerce REST API | Secured Express + Neon PostgreSQL backend; frontend integration pending | [Source](https://github.com/qz-jo/ecommerce-api) |
| Nova Tech | React storefront, mock data and demo authentication; no API or payment integration | [Demo](https://saif.codes/ecommerce-api/) · [Source](https://github.com/qz-jo/ecommerce-api/tree/main/frontend) |
| ProctorLab | Educational assessment and visible session-local browser event logs; no media recording | [Demo](https://saif.codes/proctor-lab/) · [Source](https://github.com/qz-jo/proctor-lab) |
| Smart Task Manager | Express + PostgreSQL task manager; production AI suggestions disabled | [Source](https://github.com/qz-jo/smart-task-manager) |
| IT Support Ticket Triage | Rules-based n8n workflow with sample payloads and executable tests | [Source](https://github.com/qz-jo/n8n-it-support-ticket-triage) |
| Job Application Tracker | Published browser app with localStorage, JSON backups, and dark mode | [Demo](https://saif.codes/job-application-tracker/) · [Source](https://github.com/qz-jo/job-application-tracker) |

Descriptions were checked against public source and GitHub Actions on 28 August 2026. The storefront's [verification checklist](https://github.com/qz-jo/ecommerce-api/blob/main/frontend/TASK_TEST_RESULTS.md) distinguishes tested flows from implemented features. Private repositories are not included.

## Verification

No package installation is required. With Node.js 20 or newer:

```sh
node --check assets/app.js
node --test tests/portfolio.test.mjs
```

The unit tests cover bilingual round trips, project matching and pressed states, assistant routing, case-study counts, and static link integrity. They do not replace browser or visual testing.

## Technical approach

The site is intentionally framework-free: semantic HTML, modern CSS, and vanilla JavaScript. It is served as a static GitHub Pages build with no API keys, build pipeline, cookies, analytics, or third-party form processor.

The optional GitHub pulse uses GitHub's public API with a static fallback if the request is unavailable or rate-limited.

## Meeting link

Set `MEETING_URL` once near the top of `assets/app.js`. Every Hero, navigation, contact, command-palette, and SEIF.OS meeting action uses that single value. Until a real scheduling link is connected, the controls take visitors to the contact section instead of opening a fake booking page.

## Media credit

The optimized background clip is derived from **“Digital animation showcasing a glowing circuit board with techno elements”** by Soumya on Pexels: https://www.pexels.com/video/sequencing-white-lights-on-a-black-surface-2792370/

The clip is self-hosted at 720p without audio and optimized for fast playback. Visitors who prefer reduced motion receive the static poster instead.

Previous versions remain recoverable from the repository history.
