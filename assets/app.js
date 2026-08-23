const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Connect Calendly, Cal.com, Google Appointment Scheduling, or another booking page here.
const MEETING_URL = "https://cal.com/qz-jo/30min";

const state = {
  language: localStorage.getItem("saif-language") === "ar" ? "ar" : "en",
  motion: localStorage.getItem("saif-motion") || (matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on"),
  lastFocus: null,
  toastTimer: null,
};

const arabic = {
  skip: "انتقل إلى المحتوى",
  brandRole: "ذكاء اصطناعي · BACKEND · أتمتة",
  navAbout: "عني",
  navCapabilities: "قدراتي",
  navWork: "المشاريع",
  navJourney: "المسيرة",
  navContact: "تواصل",
  scheduleMeetingShort: "احجز اجتماعًا",
  command: "تنقّل",
  available: "متاح للتدريب والعمل الحر والتعاون التقني",
  intro: "مرحبًا، أنا سيف — من عمّان، الأردن.",
  heroLine1: "أبني الأنظمة التي",
  heroLine2: "تقف خلف المنتجات الذكية.",
  heroLead: "طالب ذكاء اصطناعي وعلم بيانات أركز على هندسة Backend الآمنة، وتطبيقات الويب المعتمدة على البيانات، والأتمتة التي تختصر العمل المتكرر.",
  exploreWork: "استكشف أبرز المشاريع",
  askPortfolio: "اسأل SEIF.OS",
  scheduleMeeting: "احجز اجتماعًا",
  liveProfile: "ملف مباشر",
  statusAvailable: "الحالة: متاح",
  field: "التخصص",
  focus: "التركيز",
  university: "الجامعة",
  graduation: "التخرج",
  tryQuery: "جرّب اختصارًا ذكيًا",
  queryBackend: "أقوى دليل على الـBackend؟",
  queryAutomation: "أرني أعمال الأتمتة",
  scroll: "تابع لاكتشاف الدليل",
  signalIntro: "موقع صُمّم ليجيب بسرعة عن سؤال واحد: ماذا يستطيع سيف أن يبني فعلًا؟",
  publicRepos: "مستودعات GitHub عامة",
  featuredSystems: "دراسات حالة هندسية",
  capabilityTracks: "مسارات تقنية",
  verifiedCredential: "شهادة موثقة",
  aboutTitle: "هندسة بفضول. وتنفيذ بانضباط.",
  location: "عمّان · الأردن",
  aboutLead: "أنا طالب ذكاء اصطناعي وعلم بيانات، وأتعلّم ببناء برمجيات مفيدة وقابلة للصيانة.",
  aboutBody1: "يجتمع عملي عند نقطة الـBackend والبيانات والأتمتة وأمان التطبيقات. أبني REST APIs وتطبيقات مدعومة بـPostgreSQL وأدوات متصفح محلية وWorkflows عبر n8n.",
  aboutBody2: "أقوّي حاليًا الصلة بين تكاملات الذكاء الاصطناعي والأنظمة البرمجية الموثوقة، مع اهتمام عملي بالاختبار والتصحيح والأمان والنشر.",
  study: "الدراسة",
  studyValue: "بكالوريوس الذكاء الاصطناعي وعلم البيانات",
  workMode: "مجال العمل",
  workModeValue: "Backend · Full-stack · أتمتة",
  languages: "اللغات",
  languagesValue: "العربية · اللغة الأم / الإنجليزية · ممتازة",
  availability: "التوفر",
  availabilityValue: "تدريب · عمل حر · تعاون تقني",
  viewLinkedIn: "عرض ملف LinkedIn",
  viewCv: "عرض السيرة الذاتية",
  capTitle: "ليست قائمة كلمات رنانة؛ بل خريطة لما أستطيع تنفيذه.",
  capAiTitle: "الذكاء الاصطناعي والأنظمة الذكية",
  capAiBody: "تكاملات ذكاء اصطناعي عملية مبنية حول مدخلات منظمة ومخرجات مفيدة وتدفقات يمكن الاعتماد عليها، لا ذكاء اصطناعي للزينة.",
  deliverLabel: "ما أستطيع تنفيذه",
  capAiDeliver: "ميزات منتجات مدعومة بالذكاء الاصطناعي ونماذج أولية معتمدة على البيانات وطبقات Workflows ذكية.",
  capBackendTitle: "هندسة Backend",
  capBackendBody: "REST APIs مع مصادقة وصلاحيات وتحقق وأخطاء متوقعة وحدود ثقة واضحة.",
  capBackendDeliver: "أساسات API آمنة وخدمات محمية بالمصادقة وهندسة Backend تراعي بيئة الإنتاج.",
  capAutomationTitle: "الأتمتة",
  capAutomationBody: "Workflows تعتمد على Webhooks للتحقق من المدخلات وربط الخدمات وإرجاع بيانات منظمة وتقليل العمل المتكرر.",
  capAutomationDeliver: "تدفقات n8n وتكاملات APIs وأنظمة فرز وأتمتة قابلة للتكرار لعمليات الأعمال.",
  capDataTitle: "البيانات والأمان",
  capDataBody: "نمذجة علائقية وSQL آمن ووصول محمي لقاعدة البيانات وتصميم صلاحيات وتحقق على مستوى التطبيق.",
  capDataDeliver: "تطبيقات مدعومة بـPostgreSQL مع نماذج بيانات واضحة وقواعد ملكية وضوابط أمان.",
  workTitle: "مشاريع تثبت طريقة تفكيري.",
  workIntro: "اختر ما تحتاجه، وسيقودك الموقع إلى أقوى دليل مناسب.",
  matcherLabel: "مطابق المشاريع الذكي",
  matcherQuestion: "ما الذي تبحث عنه؟",
  matchSecurity: "API آمنة",
  matchAutomation: "أتمتة",
  matchFullstack: "Full-stack",
  matchLocal: "أداة تركز على الخصوصية",
  recommended: "الأنسب لك",
  inspectCase: "افتح المشروع",
  labelBackendSecurity: "BACKEND · أمان",
  labelFullstack: "FULL-STACK · إنتاجية",
  labelAutomation: "أتمتة · عمليات",
  labelLocal: "ويب · خصوصية أولًا",
  projectEcomBody: "واجهة Node.js وExpress مبنية حول حدود صلاحيات واضحة: مصادقة وأدوار وتحقق وتحديد معدل الطلبات وحماية IDOR وأخطاء آمنة وتخزين PostgreSQL.",
  proof: "الدليل",
  projectEcomProof: "مراجعة أمان موثقة وخطة اختبارات Postman ومسارات ملكية محمية وإعداد بأسلوب إنتاجي.",
  projectTaskBody: "مدير مهام Full-stack ضمن خدمة واحدة، يدعم JWT والتنبيهات والتصفية وتهيئة قاعدة البيانات تلقائيًا والتخزين في PostgreSQL.",
  projectTaskProof: "واجهة وAPI من المصدر نفسه، وإعداد إنتاج موثق، وHealth endpoint يساعد على النشر.",
  projectAutomationBody: "Workflow جاهز للاستيراد في n8n يتحقق من التذاكر ويصنف خمس فئات ويحدد الأولوية ويحسب مهلة SLA ويعيد JSON منظمًا.",
  projectAutomationProof: "Workflow بلا بيانات اعتماد، مع عينات وقواعد شفافة واختبارات آلية لسيناريوهات الفرز.",
  projectJobsBody: "تطبيق متصفح خفيف لتتبع طلبات التوظيف والحالات والملاحظات والبحث والتصفية والإحصائيات ونسخ JSON الاحتياطية، بلا حساب أو Backend.",
  projectJobsProof: "تخزين محلي وتصدير واستيراد JSON واضح وواجهة متجاوبة، بلا API keys أو نقل خارجي للبيانات.",
  openCaseStudy: "عرض التفاصيل الهندسية",
  caseProblem: "المشكلة",
  caseBuilt: "ما الذي بنيته",
  caseArchitecture: "الهندسة",
  caseDecisions: "القرارات الهندسية",
  caseResult: "النتيجة",
  viewGithub: "اعرض الدليل على GitHub",
  ecomProblem: "واجهة تجارة إلكترونية قائمة احتاجت حدود ثقة واضحة بين المستخدمين والأدوار والمنتجات والطلبات.",
  ecomBuilt: "واجهة Express تركز على الأمان مع مسارات محمية وتحقق وضوابط ملكية وتخزين PostgreSQL.",
  ecomArchitecture: "Routes ← التحقق والمصادقة ← Controllers ← استعلامات آمنة ← Neon PostgreSQL.",
  ecomDecisions: "التحقق من JWT وفحص الأدوار مباشرة وRBAC وحماية IDOR وتحديد المعدل وHelmet وCORS وأخطاء آمنة.",
  ecomResult: "مراجعة أمان موثقة وخطة Postman قابلة لإعادة الاستخدام تغطي الصلاحيات وحالات الفشل المطلوبة.",
  taskProblem: "تتبع المهام غالبًا يوزع الواجهة والـAPI والنشر على أجزاء متحركة أكثر من اللازم.",
  taskBuilt: "مدير مهام محمي بالمصادقة مع تنبيهات وتصفية وتهيئة تلقائية للجداول وتخزين PostgreSQL.",
  taskArchitecture: "خدمة Express واحدة تقدم الواجهة الثابتة والـAPI وتعمل مع PostgreSQL من المصدر نفسه.",
  taskDecisions: "مصادقة JWT وحد أدنى 32 حرفًا للمفتاح ودعم SSL وCORS مقيد وHealth endpoint.",
  taskResult: "نظام Full-stack مدمج يمكن نشره كخدمة Node واحدة مع قاعدة بيانات مُدارة.",
  automationProblem: "تخسر فرق الدعم وقتًا في مراجعة كل تذكرة واردة وتحديد أولويتها يدويًا.",
  automationBuilt: "تدفق Webhook جاهز للاستيراد يتحقق من الطلبات ويصنف المشكلات ويحدد الأولوية ويحسب SLA.",
  automationArchitecture: "POST webhook ← التحقق والقواعد ← التصنيف وحساب SLA ← استجابة JSON منظمة.",
  automationDecisions: "استخدام Nodes الأساسية في n8n فقط، بلا بيانات اعتماد، مع تقييم قواعد الأمان أولًا وفئات واضحة ومخرجات قابلة لإعادة الاستخدام.",
  automationResult: "عملية فرز أولية متسقة ومرفقة بعينات وتوثيق واختبارات آلية.",
  jobsProblem: "يحتاج الباحث عن عمل مكانًا واحدًا لتتبع الطلبات والحالات والروابط والتواريخ وملاحظات المتابعة.",
  jobsBuilt: "لوحة متجاوبة للإضافة والتعديل والحذف والبحث وتصفية الحالات والإحصائيات والنسخ الاحتياطية.",
  jobsArchitecture: "واجهة متصفح بلا Framework تحفظ السجلات في localStorage وتصدر أو تستعيد JSON عند الطلب.",
  jobsDecisions: "بلا حساب أو Backend أو قاعدة بيانات أو API key أو نقل صامت للبيانات؛ المستخدم يتحكم بكل نسخة احتياطية.",
  jobsResult: "أداة مفيدة تضع الخصوصية أولًا وتعمل محليًا وتحفظ بيانات الطلبات داخل متصفح المستخدم.",
  proofTitle: "دليل، لا ادعاءات تسويقية.",
  proofIntro: "العمل عام وقابل للفحص وموثق ومرتبط بالتنفيذ، بلا شهادات عملاء مختلقة.",
  proofReposTitle: "مصدر عام",
  proofReposBody: "ستة مستودعات عامة تكشف الكود وبنية المشاريع وسجل التنفيذ.",
  inspectGithub: "افحص GitHub",
  proofSecurityTitle: "مراجعة أمان وخطة API",
  proofSecurityBody: "يوثق مشروع E-commerce API المصادقة وRBAC وحماية IDOR وSQL الآمن وتحديد المعدل وخطة اختبار Postman.",
  inspectEvidence: "افحص الدليل",
  proofTestsTitle: "سيناريوهات آلية",
  proofTestsBody: "يتضمن Workflow فرز التذاكر اختبارات قابلة للتنفيذ للتحقق والأمان والأعطال والوصول والفوترة والحالات العامة.",
  inspectTests: "افحص الاختبارات",
  proofDocsTitle: "توثيق تقني",
  proofDocsBody: "يشرح كل مشروع مختار الإعداد والهندسة والقيود وخيارات الأمان وما يمكن إضافته لاحقًا.",
  readDocs: "اقرأ التوثيق",
  approachTitle: "كيف أحوّل المشكلة إلى نظام يمكن الاعتماد عليه.",
  stepUnderstand: "أفهم",
  stepUnderstandBody: "أحدد سير العمل الحقيقي والمستخدمين وحالات الفشل.",
  stepModel: "أصمّم",
  stepModelBody: "أعرّف البيانات والحدود والأدوار والسلوك المتوقع.",
  stepBuild: "أبني",
  stepBuildBody: "أنفذ أصغر نظام مفيد بطريقة نظيفة.",
  stepValidate: "أتحقق",
  stepValidateBody: "أختبر الصلاحيات والمدخلات والحالات الطرفية والمخرجات.",
  stepShip: "أنشر وأتعلّم",
  stepShipBody: "أوثق وأنشر وأراقب ثم أحسّن.",
  journeyTitle: "أبني عمقًا تقنيًا، نظامًا بعد نظام.",
  dateCurrent: "2025 — الآن",
  typeWork: "عمل مستقل",
  timelineWorkTitle: "تطوير Backend للويب بعمل حر",
  timelineWorkBody: "تطوير ميزات الخادم ونماذج PostgreSQL وتكاملات REST API ومسارات المصادقة والتحقق والاختبار وتصحيح الأخطاء والتوثيق التقني.",
  typeProjects: "تطبيق تقني",
  timelineProjectsTitle: "مشاريع Backend وFull-stack وأتمتة",
  timelineProjectsBody: "بناء أنظمة عامة وموثقة في أمان APIs وتطبيقات PostgreSQL وأدوات المتصفح وأتمتة n8n.",
  date2027: "متوقع 2027",
  typeEducation: "التعليم",
  timelineEducationTitle: "بكالوريوس الذكاء الاصطناعي وعلم البيانات",
  timelineEducationBody: "جامعة الطفيلة التقنية — أبني خبرة برمجية عملية بالتوازي مع الدراسة الأكاديمية في الذكاء الاصطناعي والبيانات.",
  dateMay2026: "مايو 2026",
  typeCredential: "شهادة",
  timelineCredentialBody: "شهادة Google برقم اعتماد 24563886، ومدرجة في السيرة الذاتية المثبتة على LinkedIn.",
  contactTitle: "لنبنِ شيئًا مفيدًا.",
  contactBody: "متاح للتدريب والعمل الحر في الـBackend ومشاريع الأتمتة والتعاونات التقنية.",
  copyEmail: "انسخ البريد",
  formName: "اسمك",
  formEmail: "بريدك الإلكتروني",
  formSubject: "ماذا سنبني؟",
  formMessage: "بعض التفاصيل",
  optionBackend: "مشروع Backend",
  optionAutomation: "Workflow أتمتة",
  optionInternship: "فرصة تدريب",
  optionCollaboration: "تعاون تقني",
  openEmail: "افتح مسودة البريد",
  formNote: "سيفتح تطبيق البريد لديك والرسالة مجهزة؛ لن يُرسل شيء تلقائيًا.",
  namePlaceholder: "الاسم",
  messagePlaceholder: "احكِ لي عن المشكلة والهدف والوقت المتوقع…",
  footerBuilt: "صُمّم وبُني بعناية",
  backTop: "العودة للأعلى",
  askSaif: "اسأل SEIF.OS",
  assistantSubtitle: "طبقة ذكاء البورتفوليو",
  assistantWelcome: "اسأل عن أقوى مشاريع سيف أو تقنياته أو دراسته أو توفره أو اتجاهه الحالي.",
  assistantQ1: "أقوى دليل Backend؟",
  assistantQ2: "خبرته في الأتمتة؟",
  assistantQ3: "لماذا أختار سيف؟",
  assistantQ4: "كيف أتواصل معه؟",
  assistantQ5: "كيف أحجز اجتماعًا؟",
  assistantLabel: "اسأل البورتفوليو",
  assistantPlaceholder: "اسأل عن المهارات أو المشاريع أو التوفر…",
  assistantNote: "سريع وخاص ويعتمد على محتوى هذا الموقع الموثق.",
  commandTitle: "انتقل لأي مكان",
  commandPlaceholder: "اكتب أمرًا…",
  commandAbout: "اذهب إلى نبذة عني",
  commandWork: "استكشف المشاريع المختارة",
  commandAssistant: "اسأل مساعد البورتفوليو",
  commandContact: "ابدأ محادثة",
  commandMeeting: "احجز اجتماعًا",
  commandGithub: "افتح GitHub",
  commandLanguage: "غيّر اللغة",
  commandHint: "↑ ↓ للتنقل · Enter للاختيار · Esc للإغلاق",
};

const originalText = new Map();
$$('[data-i18n]').forEach((element) => {
  const key = element.dataset.i18n;
  if (!originalText.has(key)) originalText.set(key, element.textContent.trim());
});

const originalPlaceholders = new Map();
$$('[data-i18n-placeholder]').forEach((element) => {
  const key = element.dataset.i18nPlaceholder;
  if (!originalPlaceholders.has(key)) originalPlaceholders.set(key, element.getAttribute("placeholder") || "");
});

function setLanguage(language, persist = true) {
  state.language = language;
  const isArabic = language === "ar";
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.title = isArabic ? "Saif Almograbe — الذكاء الاصطناعي والـBackend والأتمتة" : "Saif Almograbe — AI, Backend & Automation";

  $$('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = isArabic && arabic[key] ? arabic[key] : originalText.get(key) || element.textContent;
  });

  $$('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.setAttribute("placeholder", isArabic && arabic[key] ? arabic[key] : originalPlaceholders.get(key) || "");
  });

  const toggle = $("#languageToggle");
  toggle.textContent = isArabic ? "EN" : "AR";
  toggle.setAttribute("aria-label", isArabic ? "Switch to English" : "التبديل إلى العربية");
  if (persist) localStorage.setItem("saif-language", language);
  updateClock();
}

const matcherMap = {
  security: { title: "E-commerce REST API", target: "#project-ecommerce" },
  automation: { title: "IT Support Ticket Triage", target: "#project-automation" },
  fullstack: { title: "Smart Task Manager", target: "#project-task" },
  local: { title: "Job Application Tracker", target: "#project-jobs" },
};

function chooseProject(type) {
  const match = matcherMap[type] || matcherMap.security;
  $$("[data-match]").forEach((button) => button.classList.toggle("active", button.dataset.match === type));
  $$("[data-project]").forEach((card) => card.classList.toggle("is-recommended", card.dataset.project === type));
  $("#matcherResultTitle").textContent = match.title;
  $("#matcherResultLink").setAttribute("href", match.target);
}

const answers = {
  en: {
    backend: {
      text: "Saif’s strongest backend proof is the E-commerce REST API. It covers JWT authentication, RBAC, input validation, parameterized PostgreSQL queries, rate limiting, Helmet, safe errors, and ownership protection.",
      label: "Inspect the backend case",
      href: "#project-ecommerce",
    },
    automation: {
      text: "The IT Support Ticket Triage workflow is his clearest automation case: a credential-free n8n webhook flow that validates requests, classifies five issue types, assigns priority, calculates SLA, and returns structured JSON.",
      label: "Inspect the automation case",
      href: "#project-automation",
    },
    fullstack: {
      text: "Smart Task Manager shows full-stack delivery in one deployable Express service: authenticated tasks, reminders, filters, PostgreSQL persistence, automatic database setup, and a production health endpoint.",
      label: "Inspect Smart Task Manager",
      href: "#project-task",
    },
    local: {
      text: "Job Application Tracker demonstrates privacy-first product thinking. It runs in the browser, keeps data in localStorage, supports search and filters, and offers explicit JSON backup and restore.",
      label: "Inspect the local-first app",
      href: "#project-jobs",
    },
    skills: {
      text: "His working stack includes JavaScript, Python, Node.js, Express, PostgreSQL, SQL, n8n, REST APIs, Git, GitHub, and Postman—plus practical JWT, RBAC, validation, CORS, Helmet, and API-security patterns.",
      label: "View the capability map",
      href: "#capabilities",
    },
    ai: {
      text: "AI and Data Science are Saif’s academic field. His practical direction is connecting useful AI integrations to dependable backend, data, and automation systems without overstating work that is not yet shipped.",
      label: "See his current direction",
      href: "#about",
    },
    education: {
      text: "Saif is pursuing a B.Sc. in Artificial Intelligence & Data Science at Tafila Technical University, with expected graduation in 2027. He also holds Google’s Introduction to Generative AI credential.",
      label: "View the journey",
      href: "#journey",
    },
    hire: {
      text: "Saif combines an AI and data foundation with practical backend delivery. His portfolio shows secure API thinking, PostgreSQL work, full-stack execution, automation, testing, documentation, and a habit of learning by shipping.",
      label: "See the proof",
      href: "#work",
    },
    contact: {
      text: "Saif is open to internships, freelance backend work, automation projects, and technical collaborations. You can schedule a meeting, send an email, or use LinkedIn and GitHub.",
      label: "Go to contact",
      href: "#contact",
    },
    meeting: {
      text: "Use any Schedule a Meeting button to open Saif’s booking page. If the booking link is still being connected, email him from the contact section.",
      label: "Schedule a meeting",
      href: MEETING_URL || "#contact",
    },
    projects: {
      text: "Four projects are featured: a security-focused E-commerce API, Smart Task Manager, an n8n IT ticket triage workflow, and a privacy-first Job Application Tracker.",
      label: "Explore selected work",
      href: "#work",
    },
    fallback: {
      text: "I can answer from Saif’s verified portfolio. Try asking about backend security, automation, full-stack work, technologies, education, availability, or his strongest project.",
      label: "Explore the portfolio",
      href: "#work",
    },
  },
  ar: {
    backend: {
      text: "أقوى دليل لدى سيف في الـBackend هو مشروع E-commerce REST API. يشمل مصادقة JWT وصلاحيات RBAC والتحقق من المدخلات واستعلامات PostgreSQL الآمنة وتحديد معدل الطلبات وHelmet وأخطاء آمنة وحماية ملكية الموارد.",
      label: "افتح مشروع الـBackend",
      href: "#project-ecommerce",
    },
    automation: {
      text: "أوضح مشروع أتمتة هو IT Support Ticket Triage: تدفق n8n بلا بيانات اعتماد يتحقق من الطلبات ويصنف خمس فئات ويحدد الأولوية ويحسب SLA ويعيد JSON منظمًا.",
      label: "افتح مشروع الأتمتة",
      href: "#project-automation",
    },
    fullstack: {
      text: "يُظهر Smart Task Manager قدرة Full-stack ضمن خدمة Express واحدة قابلة للنشر: مهام محمية بالمصادقة وتنبيهات وتصفية وتخزين PostgreSQL وتهيئة تلقائية للبيانات وHealth endpoint.",
      label: "افتح Smart Task Manager",
      href: "#project-task",
    },
    local: {
      text: "يعكس Job Application Tracker تفكيرًا يضع الخصوصية أولًا؛ يعمل داخل المتصفح ويحفظ البيانات محليًا ويدعم البحث والتصفية والنسخ الاحتياطي والاستعادة عبر JSON.",
      label: "افتح التطبيق المحلي",
      href: "#project-jobs",
    },
    skills: {
      text: "يعمل سيف باستخدام JavaScript وPython وNode.js وExpress وPostgreSQL وSQL وn8n وREST APIs وGit وGitHub وPostman، مع تطبيقات عملية لـJWT وRBAC والتحقق وCORS وHelmet وأمان APIs.",
      label: "اعرض خريطة القدرات",
      href: "#capabilities",
    },
    ai: {
      text: "الذكاء الاصطناعي وعلم البيانات هما تخصص سيف الأكاديمي. اتجاهه العملي هو ربط تكاملات AI المفيدة بأنظمة Backend وبيانات وأتمتة يمكن الاعتماد عليها، دون المبالغة في أعمال لم تُنشر بعد.",
      label: "اعرض اتجاهه الحالي",
      href: "#about",
    },
    education: {
      text: "يدرس سيف بكالوريوس الذكاء الاصطناعي وعلم البيانات في جامعة الطفيلة التقنية، والتخرج المتوقع عام 2027. ويحمل أيضًا شهادة Introduction to Generative AI من Google.",
      label: "اعرض المسيرة",
      href: "#journey",
    },
    hire: {
      text: "يجمع سيف بين أساس أكاديمي في الذكاء الاصطناعي والبيانات وتنفيذ عملي للـBackend. يثبت موقعه فهم أمان APIs وPostgreSQL وFull-stack والأتمتة والاختبار والتوثيق والتعلم عبر البناء.",
      label: "شاهد الدليل",
      href: "#work",
    },
    contact: {
      text: "سيف متاح للتدريب والعمل الحر في الـBackend ومشاريع الأتمتة والتعاون التقني. يمكنك حجز اجتماع أو إرسال بريد أو استخدام LinkedIn وGitHub.",
      label: "اذهب للتواصل",
      href: "#contact",
    },
    meeting: {
      text: "استخدم أي زر لحجز اجتماع لفتح صفحة المواعيد. إذا كان رابط الحجز لا يزال قيد الربط، أرسل بريدًا من قسم التواصل.",
      label: "احجز اجتماعًا",
      href: MEETING_URL || "#contact",
    },
    projects: {
      text: "يعرض الموقع أربعة مشاريع: E-commerce API تركز على الأمان، وSmart Task Manager، وWorkflow لفرز تذاكر الدعم عبر n8n، وJob Application Tracker يضع الخصوصية أولًا.",
      label: "استكشف المشاريع",
      href: "#work",
    },
    fallback: {
      text: "أجيب من محتوى موقع سيف الموثق. جرّب أن تسأل عن أمان الـBackend أو الأتمتة أو Full-stack أو التقنيات أو الدراسة أو التوفر أو أقوى مشروع.",
      label: "استكشف الموقع",
      href: "#work",
    },
  },
};

function classifyQuestion(value) {
  const query = value.toLowerCase().trim();
  if (/backend|api|security|secure|auth|jwt|rbac|ecommerce|أمان|امن|باك|خلفي|مصادقة/.test(query)) return "backend";
  if (/automat|n8n|workflow|ticket|triage|sla|أتمت|اتمت|تذكرة|تذاكر/.test(query)) return "automation";
  if (/full.?stack|task|manager|مهام|فول/.test(query)) return "fullstack";
  if (/privacy|local|job|application|tracker|خصوص|وظيف|توظيف|محلي/.test(query)) return "local";
  if (/stack|skill|tech|language|tool|تقني|مهار|لغة|أداة|اداة/.test(query)) return "skills";
  if (/education|study|university|graduate|degree|certificate|دراس|جامع|تخرج|شهاد/.test(query)) return "education";
  if (/why|hire|choose|fit|employ|لماذا|ليش|اختار|توظف/.test(query)) return "hire";
  if (/meeting|schedule|book|calendar|calendly|cal\.com|موعد|اجتماع|احجز|حجز/.test(query)) return "meeting";
  if (/contact|email|available|intern|freelance|connect|تواصل|بريد|متاح|تدريب|عمل حر/.test(query)) return "contact";
  if (/project|work|portfolio|مشروع|أعمال|اعمال|بورتفوليو/.test(query)) return "projects";
  if (/\bai\b|artificial|data science|machine|ذكاء|بيانات/.test(query)) return "ai";
  return "fallback";
}

function appendAssistantMessage(type, text, answer = null) {
  const wrapper = document.createElement("div");
  wrapper.className = `assistant-message ${type}`;
  const icon = document.createElement("span");
  icon.textContent = type === "bot" ? "✦" : "YOU";
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  if (answer?.href) {
    const link = document.createElement("a");
    link.href = answer.href;
    link.textContent = `${answer.label} ↘`;
    if (/^https:\/\//i.test(answer.href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.addEventListener("click", closeAssistant);
    paragraph.append(document.createElement("br"), link);
  }
  wrapper.append(icon, paragraph);
  $("#assistantLog").append(wrapper);
  $("#assistantLog").scrollTop = $("#assistantLog").scrollHeight;
  return wrapper;
}

function answerQuestion(question, preset = null) {
  const clean = question.trim();
  if (!clean) return;
  appendAssistantMessage("user", clean);
  const loading = appendAssistantMessage("bot", state.language === "ar" ? "أراجع أقوى دليل مناسب…" : "Matching this to the strongest evidence…");
  window.setTimeout(() => {
    loading.remove();
    const intent = preset || classifyQuestion(clean);
    const answer = answers[state.language][intent] || answers[state.language].fallback;
    appendAssistantMessage("bot", answer.text, answer);
  }, state.motion === "off" ? 10 : 420);
}

function openAssistant(preset = null) {
  state.lastFocus = document.activeElement;
  $("#assistantPanel").classList.add("open");
  $("#assistantBackdrop").classList.add("open");
  $("#assistantPanel").setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  window.setTimeout(() => $("#assistantInput").focus(), 120);
  if (preset) {
    const prompts = {
      backend: state.language === "ar" ? "ما أقوى دليل على خبرة سيف في الـBackend؟" : "What is Saif’s strongest backend proof?",
      automation: state.language === "ar" ? "أرني أقوى مشروع أتمتة." : "Show me Saif’s strongest automation work.",
    };
    answerQuestion(prompts[preset] || preset, preset);
  }
}

function closeAssistant() {
  $("#assistantPanel").classList.remove("open");
  $("#assistantBackdrop").classList.remove("open");
  $("#assistantPanel").setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  if (state.lastFocus instanceof HTMLElement) state.lastFocus.focus();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function openMeetingOrFallback() {
  if (MEETING_URL) {
    window.open(MEETING_URL, "_blank", "noopener,noreferrer");
    return;
  }
  showToast(state.language === "ar" ? "رابط الحجز قيد الربط — استخدم البريد مؤقتًا" : "Booking link is being connected — use email for now");
  $("#contact")?.scrollIntoView({ behavior: state.motion === "off" ? "auto" : "smooth" });
}

function setupMeetingLinks() {
  $$('[data-meeting-link]').forEach((link) => {
    if (MEETING_URL) {
      link.href = MEETING_URL;
      delete link.dataset.configPending;
      return;
    }
    link.href = "#contact";
    link.dataset.configPending = "true";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openMeetingOrFallback();
    });
  });
}

function updateClock() {
  const time = new Intl.DateTimeFormat(state.language === "ar" ? "ar-JO" : "en-GB", {
    timeZone: "Asia/Amman",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  $("#ammanClock").textContent = state.language === "ar" ? `عمّان · ${time}` : `AMMAN · ${time}`;
}

function setupMotion() {
  const root = document.documentElement;
  const video = $("#heroVideo");
  root.dataset.motion = state.motion;
  const button = $("#motionToggle");
  const isOff = state.motion === "off";
  button.innerHTML = isOff
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>';
  button.setAttribute("aria-label", isOff ? "Resume motion" : "Pause motion");
  button.title = isOff ? "Resume motion" : "Pause motion";
  if (isOff) video.pause();
  else video.play().catch(() => {});
}

const canvas = $("#neuralCanvas");
const canvasContext = canvas.getContext("2d");
let neuralNodes = [];
let animationFrame = 0;
let canvasActive = true;
let pointer = { x: 0, y: 0, active: false };

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = rect.width < 700 ? 20 : 38;
  neuralNodes = Array.from({ length: count }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    size: 0.6 + Math.random() * 1.2,
  }));
}

function drawNeuralField() {
  if (!canvasActive || state.motion === "off") {
    animationFrame = 0;
    return;
  }
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvasContext.clearRect(0, 0, width, height);

  for (let index = 0; index < neuralNodes.length; index += 1) {
    const node = neuralNodes[index];
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < -10 || node.x > width + 10) node.vx *= -1;
    if (node.y < -10 || node.y > height + 10) node.vy *= -1;

    if (pointer.active) {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 190 && distance > 0) {
        node.x -= (dx / distance) * 0.08;
        node.y -= (dy / distance) * 0.08;
      }
    }

    for (let next = index + 1; next < neuralNodes.length; next += 1) {
      const other = neuralNodes[next];
      const distance = Math.hypot(node.x - other.x, node.y - other.y);
      if (distance < 145) {
        canvasContext.beginPath();
        canvasContext.strokeStyle = `rgba(97, 232, 255, ${(1 - distance / 145) * 0.18})`;
        canvasContext.lineWidth = 0.6;
        canvasContext.moveTo(node.x, node.y);
        canvasContext.lineTo(other.x, other.y);
        canvasContext.stroke();
      }
    }

    canvasContext.beginPath();
    canvasContext.fillStyle = "rgba(166, 244, 255, 0.48)";
    canvasContext.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    canvasContext.fill();
  }
  animationFrame = requestAnimationFrame(drawNeuralField);
}

function startNeuralField() {
  if (!animationFrame && state.motion === "on") animationFrame = requestAnimationFrame(drawNeuralField);
}

function stopNeuralField() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  canvasContext.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function initObservers() {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
  $$(".reveal").forEach((element) => revealObserver.observe(element));

  const heroObserver = new IntersectionObserver(([entry]) => {
    canvasActive = entry.isIntersecting;
    if (entry.isIntersecting && state.motion === "on") {
      $("#heroVideo").play().catch(() => {});
      startNeuralField();
    } else {
      $("#heroVideo").pause();
      stopNeuralField();
    }
  }, { threshold: 0.08 });
  heroObserver.observe($("#home"));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$(".nav-links a").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-30% 0px -60%", threshold: 0 });
  $$("main section[id]").forEach((section) => sectionObserver.observe(section));
}

function openCommandPalette() {
  const dialog = $("#commandPalette");
  if (!dialog.open && !dialog.hasAttribute("open")) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      dialog.classList.add("fallback-open");
      $("#commandBackdrop").classList.add("open");
    }
  }
  $("#commandInput").value = "";
  filterCommands("");
  window.setTimeout(() => $("#commandInput").focus(), 40);
}

function closeCommandPalette() {
  const dialog = $("#commandPalette");
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else dialog.removeAttribute("open");
  dialog.classList.remove("fallback-open");
  $("#commandBackdrop").classList.remove("open");
}

function filterCommands(value) {
  const query = value.toLowerCase().trim();
  const visible = [];
  $$(".command-list button").forEach((button) => {
    const show = !query || button.textContent.toLowerCase().includes(query);
    button.hidden = !show;
    button.classList.remove("selected");
    if (show) visible.push(button);
  });
  if (visible[0]) visible[0].classList.add("selected");
}

function executeCommand(button) {
  const type = button.dataset.command;
  const target = button.dataset.target;
  closeCommandPalette();
  if (type === "section") $(target)?.scrollIntoView({ behavior: state.motion === "off" ? "auto" : "smooth" });
  if (type === "external") window.open(target, "_blank", "noopener,noreferrer");
  if (type === "meeting") openMeetingOrFallback();
  if (type === "assistant") openAssistant();
  if (type === "language") setLanguage(state.language === "en" ? "ar" : "en");
}

function setupInteractions() {
  $("#languageToggle").addEventListener("click", () => setLanguage(state.language === "en" ? "ar" : "en"));
  $("#motionToggle").addEventListener("click", () => {
    state.motion = state.motion === "on" ? "off" : "on";
    localStorage.setItem("saif-motion", state.motion);
    setupMotion();
    if (state.motion === "on" && canvasActive) startNeuralField();
    else stopNeuralField();
  });

  const menuToggle = $("#menuToggle");
  const nav = $("#primaryNav");
  menuToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("panel-open", open);
  });
  $$("#primaryNav a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("panel-open");
  }));

  $$("[data-match]").forEach((button) => button.addEventListener("click", () => chooseProject(button.dataset.match)));

  $$("[data-open-assistant]").forEach((button) => button.addEventListener("click", () => openAssistant(button.dataset.assistantPrompt || null)));
  $("#assistantClose").addEventListener("click", closeAssistant);
  $("#assistantBackdrop").addEventListener("click", closeAssistant);
  $$("[data-question]").forEach((button) => button.addEventListener("click", () => answerQuestion(button.textContent, button.dataset.question)));
  $("#assistantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#assistantInput");
    answerQuestion(input.value);
    input.value = "";
  });

  $("#commandTrigger").addEventListener("click", openCommandPalette);
  $("#commandClose").addEventListener("click", closeCommandPalette);
  $("#commandBackdrop").addEventListener("click", closeCommandPalette);
  $("#commandPalette").addEventListener("click", (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) closeCommandPalette();
  });
  $("#commandInput").addEventListener("input", (event) => filterCommands(event.target.value));
  $$(".command-list button").forEach((button) => button.addEventListener("click", () => executeCommand(button)));

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key === "Escape" && ($("#commandPalette").open || $("#commandPalette").hasAttribute("open"))) {
      event.preventDefault();
      closeCommandPalette();
      return;
    }
    if (event.key === "Escape" && $("#assistantPanel").classList.contains("open")) closeAssistant();
    if (event.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("panel-open");
      menuToggle.focus();
    }
    if (!$("#commandPalette").open || !["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
    const visible = $$(".command-list button").filter((button) => !button.hidden);
    if (!visible.length) return;
    const current = visible.findIndex((button) => button.classList.contains("selected"));
    if (event.key === "Enter") {
      event.preventDefault();
      executeCommand(visible[Math.max(0, current)]);
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const next = (current + direction + visible.length) % visible.length;
    visible.forEach((button, index) => button.classList.toggle("selected", index === next));
    visible[next].scrollIntoView({ block: "nearest" });
  });

  $("#copyEmail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("saifnabel800@gmail.com");
      showToast(state.language === "ar" ? "تم نسخ البريد الإلكتروني" : "Email copied to clipboard");
    } catch {
      showToast("saifnabel800@gmail.com");
    }
  });

  $("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Portfolio inquiry");
    const message = String(data.get("message") || "").trim();
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:saifnabel800@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  $("#backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: state.motion === "off" ? "auto" : "smooth" }));

  const hero = $("#home");
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  });
  hero.addEventListener("pointerleave", () => { pointer.active = false; });

  if (matchMedia("(pointer: fine)").matches) {
    const portraitPicture = $("#heroPortraitStage picture");
    hero.addEventListener("pointermove", (event) => {
      if (state.motion === "off" || !portraitPicture) return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      portraitPicture.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.012)`;
    });
    hero.addEventListener("pointerleave", () => {
      if (portraitPicture) portraitPicture.style.transform = "";
    });

    $$(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        if (state.motion === "off") return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }
}

let previousScroll = 0;
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const current = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    $("#scrollProgress").style.width = `${max > 0 ? (current / max) * 100 : 0}%`;
    const header = $("#siteHeader");
    header.classList.toggle("scrolled", current > 28);
    const shouldHide = current > previousScroll && current > 420 && !$("#primaryNav").classList.contains("open") && !$("#assistantPanel").classList.contains("open");
    header.classList.toggle("hidden", shouldHide);
    previousScroll = current;
    ticking = false;
  });
}

async function loadGitHubPulse() {
  try {
    const response = await fetch("https://api.github.com/users/qz-jo/repos?type=owner&per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;
    const repositories = await response.json();
    const publicOriginals = repositories.filter((repository) => !repository.fork && !repository.archived);
    if (publicOriginals.length) $("#publicRepoCount").textContent = String(publicOriginals.length);
  } catch {
    // The static fallback remains accurate enough if GitHub rate-limits this optional enhancement.
  }
}

function init() {
  $("#year").textContent = String(new Date().getFullYear());
  setLanguage(state.language, false);
  setupMotion();
  setupMeetingLinks();
  setupInteractions();
  resizeCanvas();
  initObservers();
  startNeuralField();
  updateClock();
  window.setInterval(updateClock, 60_000);
  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  loadGitHubPulse();
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

init();
