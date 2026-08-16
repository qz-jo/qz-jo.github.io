const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const languageToggle = document.querySelector('.language-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('.site-header');
const year = document.querySelector('#year');
const hero = document.querySelector('.ai-hero');
const heroGrid = document.querySelector('.hero-grid');

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') root.classList.add('light');

const copy = {
  en: {
    title: 'Seif Elmughrabi | AI & Data Science, Backend & Automation',
    description: 'Seif Elmughrabi — Artificial Intelligence & Data Science student at Tafila Technical University focused on backend development, APIs, automation, databases, and secure software.',
    nav: ['About', 'Skills', 'Projects', 'Contact'],
    eyebrow: 'Open to internships & collaborations',
    intro: "Hi, I'm",
    introIndex: '01 / INTRO',
    disciplines: ['ARTIFICIAL INTELLIGENCE', 'DATA SCIENCE', 'BACKEND', 'AUTOMATION'],
    heroText: 'Artificial Intelligence & Data Science student at <strong>Tafila Technical University</strong>, building <strong>secure backend systems</strong>, <strong>REST APIs</strong>, database-backed applications, and <strong>automation workflows</strong>.',
    explore: 'Explore my work <span>↗</span>',
    consoleHead: 'AI_PROFILE',
    consoleLive: 'LIVE',
    consoleRows: [
      ['FIELD', 'AI + DATA SCIENCE'],
      ['UNIVERSITY', 'TAFILA TECHNICAL'],
      ['GRAD', 'EXPECTED 2027'],
      ['FOCUS', 'BACKEND + AUTOMATION']
    ],
    aboutHeading: 'About me',
    aboutLead: 'I turn ideas into practical software, with a focus on backend engineering, automation, data, and secure API design.',
    aboutP2: "I'm pursuing a B.Sc. in Artificial Intelligence & Data Science at Tafila Technical University, with expected graduation in 2027. I'm building hands-on experience through backend and full-stack projects, REST APIs, PostgreSQL-backed applications, workflow automation, debugging, and API testing.",
    aboutP3: 'My current direction is the intersection of <strong>backend engineering, AI integrations, data-driven systems, automation, application security, and cloud deployment</strong>.',
    location: 'Amman, Jordan',
    facts: [
      ['Field', 'Artificial Intelligence & Data Science'],
      ['University', 'Tafila Technical University'],
      ['Graduation', 'Expected 2027'],
      ['Languages', 'Arabic · Native / English · Excellent'],
      ['Focus', 'Backend · APIs · Automation · AI'],
      ['GitHub', '@qz-jo ↗'],
      ['LinkedIn', 'Connect ↗']
    ],
    skillsHeading: 'Tools & technologies',
    skills: [
      ['Backend', 'Building REST APIs, authentication and authorization flows, server logic, and maintainable backend services.'],
      ['Data & Databases', 'Designing and working with relational databases, SQL queries, persistence, and application data models.'],
      ['Automation', 'Creating workflow automations that connect services, process structured data, and reduce repetitive manual work.'],
      ['Programming', 'Using multiple languages to solve problems, build web applications, automate tasks, and explore AI and data-oriented development.'],
      ['API Security', 'Applying security fundamentals to APIs with validation, access control, safe database queries, headers, and traffic protection.'],
      ['Tools & Frontend', 'Testing APIs, debugging applications, using version control, and building clean responsive interfaces for practical projects.']
    ],
    projectsHeading: 'Selected projects',
    projectMeta: ['Backend · Security', 'Full-stack', 'Automation', 'Frontend · Productivity'],
    projectDescriptions: [
      'Secure Node.js and Express API with authentication, authorization, validation, rate limiting, IDOR protection, and PostgreSQL persistence.',
      'Full-stack task manager with JWT authentication, reminders, filtering, and PostgreSQL persistence, served from a single Express application.',
      'n8n workflow that receives support requests, validates them, classifies issues, assigns priority, calculates SLA deadlines, and returns structured results.',
      'Privacy-friendly browser app for tracking applications, statuses, notes, search, filtering, dashboard stats, and JSON backups without a backend.'
    ],
    journeyHeading: 'Currently building toward',
    journey: [
      ['Cloud', 'Deploying reliable applications and learning production infrastructure, hosting, and cloud workflows.'],
      ['Security', 'Strengthening authentication, authorization, secure database access, and defensive API design.'],
      ['AI + Automation', 'Connecting AI capabilities, data, and automation to useful workflows and real software products.']
    ],
    contactKicker: 'Internship, backend project, automation workflow, or technical collaboration?',
    contactHeading: "Let's build something useful.",
    contactText: "I'm open to opportunities where I can contribute technically, learn from real engineering work, and continue building experience in AI, data, backend development, and automation.",
    footer: 'Designed & built by Seif Elmughrabi.',
    themeDark: 'Switch to dark theme',
    themeLight: 'Switch to light theme',
    menuOpen: 'Open navigation',
    menuClose: 'Close navigation',
    langLabel: 'Switch to Arabic'
  },
  ar: {
    title: 'سيف المغربي | الذكاء الاصطناعي وعلم البيانات',
    description: 'سيف المغربي — طالب ذكاء اصطناعي وعلم بيانات في جامعة الطفيلة التقنية، يركز على تطوير الـBackend وواجهات API والأتمتة وقواعد البيانات وأمان التطبيقات.',
    nav: ['عني', 'المهارات', 'المشاريع', 'تواصل'],
    eyebrow: 'متاح للتدريب والتعاون على المشاريع',
    intro: 'مرحباً، أنا',
    introIndex: '01 / البداية',
    disciplines: ['الذكاء الاصطناعي', 'علم البيانات', 'BACKEND', 'الأتمتة'],
    heroText: 'طالب <strong>ذكاء اصطناعي وعلم بيانات</strong> في <strong>جامعة الطفيلة التقنية</strong>، أبني <strong>أنظمة Backend آمنة</strong> و<strong>واجهات REST API</strong> وتطبيقات تعتمد على قواعد البيانات وحلول <strong>أتمتة</strong>.',
    explore: 'شاهد مشاريعي <span>↗</span>',
    consoleHead: 'ملف_تقني',
    consoleLive: 'مباشر',
    consoleRows: [
      ['التخصص', 'AI + DATA SCIENCE'],
      ['الجامعة', 'TAFILA TECHNICAL'],
      ['التخرج', 'EXPECTED 2027'],
      ['التركيز', 'BACKEND + AUTOMATION']
    ],
    aboutHeading: 'عني',
    aboutLead: 'أحوّل الأفكار إلى برمجيات عملية، مع تركيز على هندسة الـBackend والأتمتة والبيانات وتصميم واجهات API آمنة.',
    aboutP2: 'أدرس بكالوريوس الذكاء الاصطناعي وعلم البيانات في جامعة الطفيلة التقنية، ومن المتوقع تخرجي في 2027. أبني خبرة عملية من خلال مشاريع Backend وFull-stack وواجهات REST API وتطبيقات PostgreSQL وأتمتة سير العمل وتصحيح الأخطاء واختبار الـAPI.',
    aboutP3: 'اتجاهي الحالي يجمع بين <strong>هندسة الـBackend وتكاملات الذكاء الاصطناعي والأنظمة المعتمدة على البيانات والأتمتة وأمان التطبيقات والنشر السحابي</strong>.',
    location: 'عمّان، الأردن',
    facts: [
      ['التخصص', 'الذكاء الاصطناعي وعلم البيانات'],
      ['الجامعة', 'جامعة الطفيلة التقنية'],
      ['التخرج', 'متوقع 2027'],
      ['اللغات', 'العربية · اللغة الأم / الإنجليزية · ممتاز'],
      ['التركيز', 'Backend · APIs · Automation · AI'],
      ['GitHub', '@qz-jo ↗'],
      ['LinkedIn', 'تواصل ↗']
    ],
    skillsHeading: 'الأدوات والتقنيات',
    skills: [
      ['Backend', 'بناء REST APIs وأنظمة المصادقة والصلاحيات ومنطق الخادم وخدمات Backend قابلة للتطوير والصيانة.'],
      ['البيانات وقواعد البيانات', 'تصميم والعمل مع قواعد البيانات العلائقية واستعلامات SQL والتخزين ونمذجة بيانات التطبيقات.'],
      ['الأتمتة', 'إنشاء تدفقات عمل تربط الخدمات وتعالج البيانات المنظمة وتقلل الأعمال اليدوية المتكررة.'],
      ['البرمجة', 'استخدام عدة لغات لحل المشاكل وبناء تطبيقات الويب وأتمتة المهام والتطوير المرتبط بالذكاء الاصطناعي والبيانات.'],
      ['أمان الـAPI', 'تطبيق أساسيات الأمان من خلال التحقق من المدخلات والصلاحيات والاستعلامات الآمنة وHeaders والحماية من إساءة استخدام الطلبات.'],
      ['الأدوات والواجهات', 'اختبار الـAPIs وتصحيح الأخطاء واستخدام Git وبناء واجهات متجاوبة ونظيفة للمشاريع العملية.']
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
      ['Cloud', 'نشر تطبيقات موثوقة وتطوير فهمي للبنية التحتية والاستضافة وبيئات الإنتاج السحابية.'],
      ['الأمان', 'تقوية معرفتي بالمصادقة والصلاحيات والوصول الآمن لقواعد البيانات وتصميم APIs دفاعية وآمنة.'],
      ['AI + Automation', 'ربط قدرات الذكاء الاصطناعي والبيانات والأتمتة بتدفقات عمل مفيدة ومنتجات برمجية حقيقية.']
    ],
    contactKicker: 'فرصة تدريب، مشروع Backend، أتمتة، أو تعاون تقني؟',
    contactHeading: 'خلينا نبني شيء مفيد.',
    contactText: 'متاح للفرص التي أقدر فيها أساهم تقنياً وأتعلم من عمل هندسي حقيقي وأطوّر خبرتي في الذكاء الاصطناعي والبيانات والـBackend والأتمتة.',
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

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setHTML(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

function syncThemeIcon() {
  const isLight = root.classList.contains('light');
  themeIcon.textContent = isLight ? '☾' : '☼';
  const t = copy[currentLanguage];
  themeToggle.setAttribute('aria-label', isLight ? t.themeDark : t.themeLight);
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
    setTextIn(row.querySelector('span'), t.consoleRows[i][0]);
    setTextIn(row.querySelector('strong'), t.consoleRows[i][1]);
  });

  setText('#about .section-heading h2', t.aboutHeading);
  setText('.about-copy .lead', t.aboutLead);
  const aboutParagraphs = document.querySelectorAll('.about-copy p');
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = t.aboutP2;
  if (aboutParagraphs[2]) aboutParagraphs[2].innerHTML = t.aboutP3;
  setText('.profile-line span', t.location);

  document.querySelectorAll('.quick-facts > div').forEach((row, i) => {
    if (!t.facts[i]) return;
    const dt = row.querySelector('dt');
    const dd = row.querySelector('dd');
    if (dt) dt.textContent = t.facts[i][0];
    if (dd) {
      const link = dd.querySelector('a');
      if (link) link.textContent = t.facts[i][1];
      else dd.textContent = t.facts[i][1];
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
  setText('.footer p:first-child', t.footer);

  localStorage.setItem('portfolio-lang', lang);
  syncThemeIcon();
  menuToggle.setAttribute('aria-label', navLinks.classList.contains('open') ? t.menuClose : t.menuOpen);
}

function setTextIn(element, value) {
  if (element) element.textContent = value;
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

// Very light parallax only; no particle canvas or heavy background processing.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (hero && heroGrid && !reducedMotion.matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroGrid.style.transform = `translate(${x * -7}px, ${y * -5}px)`;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    heroGrid.style.transform = 'translate(0, 0)';
  });
}