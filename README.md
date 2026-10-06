# Saif AL-Moghrabi — Data Engineering Portfolio

A cinematic, bilingual portfolio for **Saif AL-Moghrabi**, an Artificial Intelligence student building a data engineering foundation in Amman, Jordan. The portfolio leads with Power BI modeling and analysis, then shows PostgreSQL, API, and n8n automation work.

## Live site

- Portfolio: https://saif.codes
- GitHub: https://github.com/qz-jo
- LinkedIn: https://www.linkedin.com/in/saif-al-moghrabi-8847723aa/

## Experience highlights

- Hybrid shaded portrait + UV-colored particle skin from Saif's real NextGenFace `mesh3.obj`, rooted curl clumps and curved dissolution streams
- Cinematic, skippable curved formation that reveals the face and moves the same hybrid group from center into the Hero with particle lag
- One adaptive WebGL canvas connects the Hero to restrained data streams throughout the page
- Mobile composition, static supplied-mesh poster, reduced-motion support, and paused rendering in hidden tabs
- Premium monochrome meeting CTA controlled by one `MEETING_URL` constant
- English and Arabic interfaces with full RTL support
- SEIF.OS portfolio assistant grounded in verified project and profile content
- Project matcher leading with Power BI analytics, with paths into PostgreSQL, APIs, automation, and supporting web projects
- Documented data and software case studies and a source-linked Proof of Work section
- Command palette with keyboard navigation (`Ctrl/Cmd + K`)
- Live Amman clock and optional GitHub public-repository count
- Motion controls, reduced-motion support, keyboard accessibility, and responsive layouts
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
node --check assets/particle-portrait.js
node --test tests/portfolio.test.mjs
node tools/build.mjs
```

The unit tests cover bilingual round trips, project matching and pressed states, assistant routing, case-study counts, and static link integrity. The production browser checks are in `tools/validate-browser.cjs`; see [portrait implementation and validation](docs/particle-portrait.md) for measurements, screenshots, asset generation, and exact preview commands.

## Technical approach

The site uses semantic HTML, modern CSS, vanilla JavaScript, and a locally bundled MIT-licensed Three.js renderer. It is served as static GitHub Pages files with no backend, API keys, cookies, analytics, or third-party form processor. The optional production staging command copies the deployable files into `dist/`; the repository root remains directly deployable.

The optional GitHub pulse uses GitHub's public API with a static fallback if the request is unavailable or rate-limited.

## Meeting link

Set `MEETING_URL` once near the top of `assets/app.js`. Every Hero, navigation, contact, command-palette, and SEIF.OS meeting action uses that single value. Until a real scheduling link is connected, the controls take visitors to the contact section instead of opening a fake booking page.

## Media credit

The optimized background clip is derived from **“Digital animation showcasing a glowing circuit board with techno elements”** by Soumya on Pexels: https://www.pexels.com/video/sequencing-white-lights-on-a-black-surface-2792370/

This historical clip remains in repository history/current assets for attribution and recovery. The current Hero never requests or plays it; production staging omits it. The current particle poster is rendered from Saif's supplied reconstruction, not generated from the artistic reference.

Previous versions remain recoverable from the repository history.
