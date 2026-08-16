const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const languageToggle = document.querySelector('.language-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.site-header');
const year = document.querySelector('#year');
const hero = document.querySelector('.ai-hero');
const heroVideo = document.querySelector('.hero-video');
const heroGrid = document.querySelector('.hero-grid');
const neuralCanvas = document.querySelector('#neural-canvas');

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') root.classList.add('light');

const copy = {
  en: {
    title: 'Seif Elmughrabi | AI & Data Science, Backend & Automation',
    description: 'Seif Elmughrabi — Artificial Intelligence & Data Science student building backend systems, APIs, automation workflows, and practical software projects.',
    nav: ['About', 'Skills', 'Projects', 'Contact'],
    eyebrow: 'Open to internships & collaborations',
    intro: "Hi, I'm",
    introIndex: '01 / INTRO',
    disciplines: ['ARTIFICIAL INTELLIGENCE', 'DATA SCIENCE', 'BACKEND', 'AUTOMATION'],
    heroText: 'Artificial Intelligence & Data Science student building <strong>backend systems</strong>, <strong>APIs</strong>, and <strong>automation workflows</strong> that solve real problems.',
    explore: 'Explore my work <span>↗</span>',
    consoleHead: 'AI_PROFILE',
    consoleLive: 'LIVE',
    consoleRows: [
      ['FIELD', 'AI + DATA SCIENCE'],
      ['BUILD', 'BACKEND SYSTEMS'],
      ['AUTOMATE', 'n8n WORKFLOWS'],
      ['SHIP', 'REAL PROJECTS']
    ],
    aboutHeading: 'About me',
    aboutLead: 'I like turning ideas into working software — especially when the project combines logic, automation, data, and useful user experiences.',
    aboutP2: "I'm studying Artificial Intelligence & Data Science and building hands-on experience through full-stack and backend projects, REST APIs, database-backed applications, and workflow automation. I care about clean structure, security fundamentals, and shipping projects that can actually be used.",
    aboutP3: 'My current direction is the intersection of <strong>backend engineering, AI integrations, automation, and cloud deployment</strong>.',
    location: 'Amman, Jordan',
    facts: [
      ['Field', 'Artificial Intelligence & Data Science'],
      ['Graduation', 'Expected 2027'],
      ['Focus', 'Backend · Automation · AI'],
      ['GitHub', '@qz-jo ↗']
    ],
    skillsHeading: 'Tools & technologies',
    skills: [
      ['Backend', 'Building APIs, authentication flows, server logic, and database-backed applications.'],
      ['Data', 'Working with relational data, persistence, queries, and application data models.'],
      ['Automation', 'Designing repeatable workflows that connect systems and reduce manual work.'],
      ['Development', 'Shipping practical projects with version control, responsive interfaces, and AI-assisted workflows.']
    ],
    projectsHeading: 'Selected projects',
    projectMeta: ['Backend · Security', 'Full-stack', 'Automation', 'Frontend · Productivity'],
    projectDescriptions: [
      'Secure Node.js and Express API with authentication, authorization, input validation, rate limiting, IDOR protection, and PostgreSQL persistence.',
      'Full-stack task manager with JWT authentication, reminders, filtering, and PostgreSQL persistence, served from a single Express application.',
      'n8n workflow that receives support requests, validates them, classifies issues, assigns priority, calculates SLA deadlines, and returns structured results.',
      'Privacy-friendly browser app for tracking applications, statuses, notes, search, filtering, dashboard stats, and JSON backups without a backend.'
    ],
    journeyHeading: 'Currently building toward',
    journey: [
      ['Cloud', 'Deploying reliable applications and understanding production infrastructure.'],
      ['Security', 'Strengthening application security, authentication, authorization, and safe API design.'],
      ['AI + Automation', 'Connecting AI capabilities to practical workflows and real software products.']
    ],
    contactKicker: 'Have a project, internship, or collaboration in mind?',
    contactHeading: "Let's build something useful.",
    contactText: "I'm interested in opportunities where I can learn fast, contribute technically, and ship real work.",
    connect: 'Connect on GitHub <span>↗</span>',
    footer: 'Designed & built by Seif Elmughrabi.',
    themeDark: 'Switch to dark theme',
    themeLight: 'Switch to light theme',
    menuOpen: 'Open navigation',
    menuClose: 'Close navigation',
    langLabel: 'Switch to Arabic'
  },
  ar: {
    title: 'سيف المغربي | الذكاء الاصطناعي وعلم البيانات',
    description: 'سيف المغربي — طالب في تخصص الذكاء الاصطناعي وعلم البيانات، يطوّر أنظمة Backend وواجهات API وحلول أتمتة ومشاريع برمجية عملية.',
    nav: ['عني', 'المهارات', 'المشاريع', 'تواصل'],
    eyebrow: 'متاح للتدريب والتعاون على المشاريع',
    intro: 'مرحباً، أنا',
    introIndex: '01 / البداية',
    disciplines: ['الذكاء الاصطناعي', 'علم البيانات', 'BACKEND', 'الأتمتة'],
    heroText: 'طالب في تخصص <strong>الذكاء الاصطناعي وعلم البيانات</strong>، أبني <strong>أنظمة Backend</strong> و<strong>واجهات API</strong> و<strong>حلول أتمتة</strong> لحل مشاكل حقيقية.',
    explore: 'شاهد مشاريعي <span>↗</span>',
    consoleHead: 'ملف_تقني',
    consoleLive: 'مباشر',
    consoleRows: [
      ['التخصص', 'AI + DATA SCIENCE'],
      ['أبني', 'BACKEND SYSTEMS'],
      ['أؤتمت', 'n8n WORKFLOWS'],
      ['الهدف', 'REAL PROJECTS']
    ],
    aboutHeading: 'عني',
    aboutLead: 'أحب تحويل الأفكار إلى برامج تعمل فعلياً، خصوصاً عندما يجمع المشروع بين المنطق والأتمتة والبيانات وتجربة مستخدم مفيدة.',
    aboutP2: 'أدرس تخصص الذكاء الاصطناعي وعلم البيانات، وأبني خبرة عملية من خلال مشاريع Full-stack وBackend وواجهات REST API وتطبيقات تعتمد على قواعد البيانات وأتمتة سير العمل. أهتم ببنية الكود النظيفة وأساسيات الأمان وإنهاء مشاريع قابلة للاستخدام فعلياً.',
    aboutP3: 'تركيزي الحالي يجمع بين <strong>Backend Engineering وتكاملات الذكاء الاصطناعي والأتمتة والنشر السحابي</strong>.',
    location: 'عمّان، الأردن',
    facts: [
      ['التخصص', 'الذكاء الاصطناعي وعلم البيانات'],
      ['التخرج', 'متوقع 2027'],
      ['التركيز', 'Backend · Automation · AI'],
      ['GitHub', '@qz-jo ↗']
    ],
    skillsHeading: 'الأدوات والتقنيات',
    skills: [
      ['Backend', 'بناء واجهات API وأنظمة تسجيل الدخول ومنطق الخادم والتطبيقات المرتبطة بقواعد البيانات.'],
      ['البيانات', 'العمل مع البيانات العلائقية والتخزين والاستعلامات ونمذجة بيانات التطبيقات.'],
      ['الأتمتة', 'تصميم تدفقات عمل تربط الأنظمة ببعضها وتقلل العمل اليدوي المتكرر.'],
      ['التطوير', 'بناء ونشر مشاريع عملية باستخدام Git وواجهات متجاوبة وأدوات تطوير مدعومة بالذكاء الاصطناعي.']
    ],
    projectsHeading: 'مشاريع مختارة',
    projectMeta: ['Backend · Security', 'Full-stack', 'Automation', 'Frontend · Productivity'],
    projectDescriptions: [
      'واجهة REST API آمنة مبنية بـ Node.js وExpress وتدعم المصادقة والصلاحيات والتحقق من المدخلات وتحديد معدل الطلبات وحماية IDOR والتخزين في PostgreSQL.',
      'مدير مهام Full-stack يدعم JWT والتنبيهات والتصفية والتخزين في PostgreSQL، ويتم تقديم الواجهة والخادم من تطبيق Express واحد.',
      'Workflow باستخدام n8n يستقبل طلبات الدعم ويتحقق منها ويصنف المشاكل ويحدد الأولوية ويحسب مهلة SLA ثم يعيد نتيجة منظمة.',
      'تطبيق متصفح يركز على الخصوصية لمتابعة طلبات التوظيف والحالات والملاحظات والبحث والتصفية والإحصائيات والنسخ الاحتياطي بصيغة JSON بدون Backend.'
    ],
    journeyHeading: 'ما أعمل على تطويره حالياً',
    journey: [
      ['Cloud', 'نشر تطبيقات موثوقة وفهم البنية التحتية المستخدمة في بيئات الإنتاج.'],
      ['الأمان', 'تطوير معرفتي بأمان التطبيقات والمصادقة والصلاحيات وتصميم واجهات API بشكل آمن.'],
      ['AI + Automation', 'ربط قدرات الذكاء الاصطناعي بتدفقات عمل عملية ومنتجات برمجية حقيقية.']
    ],
    contactKicker: 'عندك مشروع أو فرصة تدريب أو فكرة للتعاون؟',
    contactHeading: 'خلينا نبني شيء مفيد.',
    contactText: 'مهتم بالفرص التي تسمح لي بالتعلم بسرعة والمساهمة تقنياً والعمل على مشاريع حقيقية.',
    connect: 'تواصل معي على GitHub <span>↗</span>',
    footer: 'تصميم وتطوير سيف المغربي.',
    themeDark: 'الوضع الداكن',
    themeLight: 'الوضع الفاتح',
    menuOpen: 'فتح القائمة',
    menuClose: 'إغلاق القائمة',
    langLabel: 'Switch to English'
  }
};

let currentLanguage = localStorage.getItem('portfolio-lang') || 'en';
if (!copy[currentLanguage]) currentLanguage = 'en';

function syncThemeIcon() {
  const isLight = root.classList.contains('light');
  themeIcon.textContent = isLight ? '☾' : '☼';
  const t = copy[currentLanguage];
  themeToggle.setAttribute('aria-label', isLight ? t.themeDark : t.themeLight);
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setHTML(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

function applyLanguage(lang) {
  currentLanguage = lang;
  const t = copy[lang];
  const isArabic = lang === 'ar';

  root.lang = lang;
  root.dir = isArabic ? 'rtl' : 'ltr';
  document.title = t.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);

  languageToggle.textContent = isArabic ? 'EN' : 'AR';
  languageToggle.setAttribute('aria-label', t.langLabel);
  languageToggle.title = isArabic ? 'English' : 'العربية';

  document.querySelectorAll('.nav-links a').forEach((link, i) => {
    if (t.nav[i]) link.textContent = t.nav[i];
  });

  setHTML('.eyebrow', `<span class="status-dot"></span> ${t.eyebrow}`);
  setText('.intro', t.intro);
  setText('.name-index', t.introIndex);
  document.querySelectorAll('.discipline-track > span').forEach((item, i) => {
    if (t.disciplines[i]) item.textContent = t.disciplines[i];
  });
  setHTML('.hero-text', t.heroText);
  setHTML('.hero-actions .primary', t.explore);
  setText('.console-head > span:first-child', t.consoleHead);
  setText('.console-live', t.consoleLive);
  document.querySelectorAll('.console-row').forEach((row, i) => {
    if (!t.consoleRows[i]) return;
    const label = row.querySelector('span');
    const value = row.querySelector('strong');
    if (label) label.textContent = t.consoleRows[i][0];
    if (value) value.textContent = t.consoleRows[i][1];
  });

  setText('#about .section-heading h2', t.aboutHeading);
  setText('.about-copy .lead', t.aboutLead);
  const aboutParagraphs = document.querySelectorAll('.about-copy p');
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = t.aboutP2;
  if (aboutParagraphs[2]) aboutParagraphs[2].innerHTML = t.aboutP3;
  setText('.profile-line span', t.location);

  document.querySelectorAll('.quick-facts > div').forEach((row, i) => {
    const dt = row.querySelector('dt');
    const dd = row.querySelector('dd');
    if (!t.facts[i]) return;
    if (dt) dt.textContent = t.facts[i][0];
    if (dd) {
      if (i === 3) {
        const link = dd.querySelector('a');
        if (link) link.textContent = t.facts[i][1];
      } else {
        dd.textContent = t.facts[i][1];
      }
    }
  });

  setText('#skills .section-heading h2', t.skillsHeading);
  document.querySelectorAll('.skill-card').forEach((card, i) => {
    if (!t.skills[i]) return;
    const heading = card.querySelector('h3');
    const paragraph = card.querySelector('p');
    if (heading) heading.textContent = t.skills[i][0];
    if (paragraph) paragraph.textContent = t.skills[i][1];
  });

  setText('#projects .section-heading h2', t.projectsHeading);
  document.querySelectorAll('.project').forEach((project, i) => {
    const meta = project.querySelector('.project-meta span:nth-child(2)');
    const paragraph = project.querySelector('.project-body p');
    if (meta && t.projectMeta[i]) meta.textContent = t.projectMeta[i];
    if (paragraph && t.projectDescriptions[i]) paragraph.textContent = t.projectDescriptions[i];
  });

  setText('.journey .section-heading h2', t.journeyHeading);
  document.querySelectorAll('.journey-item').forEach((item, i) => {
    if (!t.journey[i]) return;
    const label = item.querySelector('span');
    const paragraph = item.querySelector('p');
    if (label) label.textContent = t.journey[i][0];
    if (paragraph) paragraph.textContent = t.journey[i][1];
  });

  setText('.contact-kicker', t.contactKicker);
  setText('.contact-card h2', t.contactHeading);
  const contactBody = document.querySelector('.contact-card > p:not(.contact-kicker)');
  if (contactBody) contactBody.textContent = t.contactText;
  setHTML('.contact-actions .primary', t.connect);
  setText('.footer p:first-child', t.footer);

  localStorage.setItem('portfolio-lang', lang);
  syncThemeIcon();
  menuToggle.setAttribute('aria-label', navLinks.classList.contains('open') ? t.menuClose : t.menuOpen);
}

applyLanguage(currentLanguage);

themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('portfolio-theme', root.classList.contains('light') ? 'light' : 'dark');
  syncThemeIcon();
});

languageToggle.addEventListener('click', () => {
  applyLanguage(currentLanguage === 'en' ? 'ar' : 'en');
});

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? copy[currentLanguage].menuClose : copy[currentLanguage].menuOpen);
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', copy[currentLanguage].menuOpen);
  });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

year.textContent = new Date().getFullYear();

// Cinematic background video
if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
}

// Lightweight pointer parallax for the hero media.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (hero && !reducedMotion.matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (heroGrid) heroGrid.style.transform = `translate(${x * -12}px, ${y * -9}px)`;
    if (heroVideo) heroVideo.style.transform = `scale(1.055) translate(${x * -5}px, ${y * -4}px)`;
  });

  hero.addEventListener('pointerleave', () => {
    if (heroGrid) heroGrid.style.transform = 'translate(0, 0)';
    if (heroVideo) heroVideo.style.transform = 'scale(1.03) translate(0, 0)';
  });
}

// Neural-network particle layer.
if (neuralCanvas && !reducedMotion.matches) {
  const ctx = neuralCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;
  const pointer = { x: -9999, y: -9999 };

  function createParticle() {
    const speed = 0.18 + Math.random() * 0.32;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 0.7 + Math.random() * 1.5
    };
  }

  function resizeCanvas() {
    const rect = neuralCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    neuralCanvas.width = Math.max(1, Math.floor(width * dpr));
    neuralCanvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const targetCount = width < 700 ? 30 : 58;
    particles = Array.from({ length: targetCount }, createParticle);
  }

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const pointerDistance = Math.hypot(dx, dy);
      if (pointerDistance < 150 && pointerDistance > 0) {
        p.vx -= (dx / pointerDistance) * 0.0025;
        p.vy -= (dy / pointerDistance) * 0.0025;
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,242,197,.72)';
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 132) {
          const alpha = (1 - distance / 132) * 0.26;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(126,164,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    animationFrame = requestAnimationFrame(drawNetwork);
  }

  resizeCanvas();
  drawNetwork();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  hero?.addEventListener('pointermove', (event) => {
    const rect = neuralCanvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  hero?.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) {
      cancelAnimationFrame(animationFrame);
      if (heroVideo) heroVideo.pause();
    }
  });
} else if (heroVideo && reducedMotion.matches) {
  heroVideo.pause();
}
