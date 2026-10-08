# Saif AL-Moghrabi — Data Analytics & BI Portfolio

A bilingual portfolio for **Saif AL-Moghrabi / سيف المغربي**, a Data Analytics & BI Intern and Artificial Intelligence student in Amman. It presents professional experience, Power BI reporting and data modeling, PostgreSQL, APIs, and n8n automation.

## Live site

- Portfolio: https://saif.codes
- GitHub: https://github.com/qz-jo
- Arabic portfolio: https://saif.codes/ar/
- LinkedIn: https://www.linkedin.com/in/saif-al-moghrabi/

## Experience highlights

- Particle formation Hero with an immediate lightweight particle set and a 2.2-second introduction
- Lossless WebP portrait matching the supplied master PNG pixel for pixel
- Premium monochrome meeting CTA controlled by one `MEETING_URL` constant
- Static English and Arabic pages, full RTL support, and seamless particle transitions when switching languages
- Accessible side navigation on desktop and mobile
- Three professional experience entries from the LinkedIn profile
- SEIF.OS portfolio assistant grounded in verified project and profile content
- Project matcher leading with Power BI analytics, with paths into PostgreSQL, APIs, automation, and supporting web projects
- Documented data and software case studies and a source-linked Proof of Work section
- Command palette with keyboard navigation (`Ctrl/Cmd + K`)
- Optional GitHub public-repository count
- Reduced-motion support, keyboard accessibility, and responsive layouts
- Privacy-friendly contact flow that prepares a local email draft without sending data to a form service
- SEO metadata, structured data, sitemap, robots file, social preview, PWA manifest, and custom 404 page

## Data and engineering work — September 2026

Eight case studies lead with two documented Power BI learning projects and include six software projects that demonstrate databases, APIs, automation, and web engineering. Nova Tech and the E-commerce REST API share a repository but remain separate implementations. Power BI case studies describe publicly shared work; their PBIX files and source datasets are not published here.

| Case study | Current scope | Demo / source |
| --- | --- | --- |
| E-commerce REST API | Secured Express + Neon PostgreSQL backend; frontend integration pending | [Source](https://github.com/qz-jo/ecommerce-api) |
| Nova Tech | React storefront, mock data and demo authentication; no API or payment integration | [Demo](https://saif.codes/ecommerce-api/) · [Source](https://github.com/qz-jo/ecommerce-api/tree/main/frontend) |
| ProctorLab | Educational assessment and visible session-local browser event logs; no media recording | [Demo](https://saif.codes/proctor-lab/) · [Source](https://github.com/qz-jo/proctor-lab) |
| Smart Task Manager | Express + PostgreSQL task manager; production AI suggestions disabled | [Source](https://github.com/qz-jo/smart-task-manager) |
| IT Support Ticket Triage | Rules-based n8n workflow with sample payloads and executable tests | [Source](https://github.com/qz-jo/n8n-it-support-ticket-triage) |
| Job Application Tracker | Published browser app with localStorage, JSON backups, and dark mode | [Demo](https://saif.codes/job-application-tracker/) · [Source](https://github.com/qz-jo/job-application-tracker) |
| Automotive Showroom Analytics | Power BI training-data report across sales, inventory, service, customers, and vehicle exploration | [Case study](case-studies/automotive-showroom-power-bi.md) |
| HR Headcount & Attrition | Power BI workforce metrics and interactive analysis | [Case study](case-studies/hr-analytics-power-bi.md) |

Software descriptions were checked against public source and GitHub Actions on 28 August 2026. The Power BI descriptions come from Saif's LinkedIn project posts and profile. The storefront's [verification checklist](https://github.com/qz-jo/ecommerce-api/blob/main/frontend/TASK_TEST_RESULTS.md) distinguishes tested flows from implemented features. Private repositories are not included.

## Verification

No package installation is required. With Node.js 20 or newer:

```sh
node --check assets/app.js
node --test tests/portfolio.test.mjs tests/seo.test.mjs
```

The tests cover bilingual round trips, project matching, assistant routing, case-study counts, static links, indexable Arabic content, reciprocal language links, profile schema, asset references, and lossless compressed particle samples. They complement browser checks of the sidebar, portrait formation, language transitions, and responsive layout.

## Localized content

`index.html` contains the English source. Arabic strings live in `assets/app.js`. After changing either, regenerate the static Arabic document with `python scripts/build-locales.py` (requires Python with `lxml` and Node.js). This also preserves the English strings needed to switch languages without reloading the portrait. Each locale has its own canonical URL and reciprocal `hreflang` links, and both URLs are listed in `sitemap.xml`.

## Technical approach

The site is intentionally framework-free: semantic HTML, modern CSS, and vanilla JavaScript. It is served as a static GitHub Pages build with no API keys, build pipeline, cookies, analytics, or third-party form processor.

The optional GitHub pulse uses GitHub's public API with a static fallback if the request is unavailable or rate-limited.

## Meeting link

Set `MEETING_URL` once near the top of `assets/app.js`. Every Hero, navigation, contact, command-palette, and SEIF.OS meeting action uses that single value. Until a real scheduling link is connected, the controls take visitors to the contact section instead of opening a fake booking page.

## Media credit

The optimized background clip is derived from **“Digital animation showcasing a glowing circuit board with techno elements”** by Soumya on Pexels: https://www.pexels.com/video/sequencing-white-lights-on-a-black-surface-2792370/

The clip is self-hosted at 720p without audio and optimized for fast playback. Visitors who prefer reduced motion receive the static poster instead.

Previous versions remain recoverable from the repository history.
