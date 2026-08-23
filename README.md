# Saif Almograbe — Intelligent Developer Portfolio V2

A cinematic, bilingual portfolio for **Saif Almograbe**, an AI & Data Science student focused on backend engineering and automation in Amman, Jordan.

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
- Smart project matcher for backend security, automation, full-stack, and privacy-first work
- Expandable engineering case studies and a source-linked Proof of Work section
- Command palette with keyboard navigation (`Ctrl/Cmd + K`)
- Live Amman clock and optional GitHub public-repository count
- Motion controls, reduced-motion support, keyboard accessibility, and responsive layouts
- Privacy-friendly contact flow that prepares a local email draft without sending data to a form service
- SEO metadata, structured data, sitemap, robots file, social preview, PWA manifest, and custom 404 page

## Technical approach

The site is intentionally framework-free: semantic HTML, modern CSS, and vanilla JavaScript. It is served as a static GitHub Pages build with no API keys, build pipeline, cookies, analytics, or third-party form processor.

The optional GitHub pulse uses GitHub's public API with a static fallback if the request is unavailable or rate-limited.

## Meeting link

Set `MEETING_URL` once near the top of `assets/app.js`. Every Hero, navigation, contact, command-palette, and SEIF.OS meeting action uses that single value. Until a real scheduling link is connected, the controls take visitors to the contact section instead of opening a fake booking page.

## Media credit

The optimized background clip is derived from **“Digital animation showcasing a glowing circuit board with techno elements”** by Soumya on Pexels: https://www.pexels.com/video/sequencing-white-lights-on-a-black-surface-2792370/

The clip is self-hosted at 720p without audio and optimized for fast playback. Visitors who prefer reduced motion receive the static poster instead.

Previous versions remain recoverable from the repository history.
