const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Connect Calendly, Cal.com, Google Appointment Scheduling, or another booking page here.
const MEETING_URL = "https://cal.com/qz-jo/30min";

const state = {
  language: document.documentElement.lang === "ar" ? "ar" : "en",
  motion: localStorage.getItem("saif-motion") || (matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on"),
  lastFocus: null,
  toastTimer: null,
};

const arabic = {
  skip: "انتقل إلى المحتوى",
  brandRole: "تحليل بيانات · ذكاء أعمال",
  heroRole: "متدرب تحليل بيانات وذكاء أعمال",
  navExperience: "الخبرات",
  navEducation: "التعليم والشهادات",
  navigationTitle: "القائمة",
  commandExperience: "استكشف الخبرات المهنية",
  viewExperience: "استكشف خبراتي",
  experienceTitle: "خبرات تدعم مشاريعي.",
  markaziaDate: "سبتمبر 2026 — الآن",
  markaziaMeta: "مجموعة المركزية · تدريب · عمّان، حضوري",
  markaziaRole: "متدرب تحليل بيانات وذكاء أعمال",
  markaziaPoint1: "تحويل متطلبات تقارير قطاع السيارات إلى تحليلات في Power BI.",
  markaziaPoint2: "تنظيف البيانات باستخدام Power Query وبناء العلاقات ونماذج بأسلوب المخطط النجمي.",
  markaziaPoint3: "إنشاء مقاييس DAX ولوحات تفاعلية لتوضيح أداء الأعمال.",
  markaziaPoint4: "توثيق مشكلات البيانات وقرارات النمذجة ومراجعة الأسئلة المفتوحة مع المشرف.",
  experienceModeling: "نمذجة البيانات",
  batDate: "يوليو — سبتمبر 2026",
  batMeta: "bat techno · تدريب · عمّان",
  batRole: "متدرب ميداني",
  batBody: "أتممت التدريب الميداني الجامعي واكتسبت احتكاكًا عمليًا بالبيانات وتحليلها في بيئة مهنية، بما مهّد لتركيزي الحالي على تحليل البيانات وذكاء الأعمال.",
  freelanceDate: "ديسمبر 2025 — مايو 2026",
  freelanceMeta: "عمل مستقل · عمل حر · عمّان",
  freelanceRole: "مطور Backend للويب — عمل حر",
  freelancePoint1: "تطوير وظائف الخادم وربط قواعد PostgreSQL وواجهات REST API.",
  freelancePoint2: "تنفيذ المصادقة والصلاحيات والتحقق والتعامل الآمن مع البيانات.",
  freelancePoint3: "اختبار واجهات API وتصحيحها وتوثيقها باستخدام Postman وGit/GitHub.",
  freelancePoint4: "تنفيذ المشاريع باستقلالية من التخطيط إلى التطبيق.",
  navAbout: "عني",
  navCapabilities: "قدراتي",
  navWork: "المشاريع",
  navJourney: "المسيرة",
  navContact: "تواصل",
  scheduleMeetingShort: "احجز اجتماعًا",
  command: "تنقّل",
  available: "مشغول حاليًا بالتدريب",
  intro: "مرحبًا، أنا سيف — من عمّان، الأردن.",
  heroLine1: "من البيانات الخام",
  heroLine2: "إلى قرارات واضحة.",
  heroLead: "أعمل على Power BI وSQL ونمذجة البيانات وأطوّر مساري نحو هندسة البيانات.",
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
  signalIntro: "مشاريع توضح كيف أنظف البيانات وأنمذجها وأحوّلها إلى تحليل مفيد، وما أتعلمه في الطريق.",
  publicRepos: "مستودعات GitHub عامة",
  featuredSystems: "دراسات مشاريع",
  capabilityTracks: "مسارات تقنية",
  verifiedCredential: "شهادة موثقة",
  aboutTitle: "من أسئلة الأعمال إلى تقارير واضحة.",
  location: "عمّان · الأردن",
  aboutLead: "أنا طالب ذكاء اصطناعي في جامعة الطفيلة التقنية ومتدرب تحليل بيانات وذكاء أعمال بعمّان.",
  aboutBody1: "أحوّل متطلبات تقارير الأعمال إلى تحليلات في Power BI، بدءًا من تحضير البيانات في Power Query ونمذجة العلاقات، وصولًا إلى مقاييس DAX واللوحات التفاعلية. أوثّق مشكلات البيانات والقرارات وأراجع الأسئلة المفتوحة مع المشرف.",
  aboutBody2: "إلى جانب التقارير، أبني تطبيقات تعتمد على PostgreSQL وواجهات REST API وتدفقات n8n. أركز على قواعد تحقق واضحة ومخرجات مفيدة وتوثيق يسهل فهم كل مشروع.",
  study: "الدراسة",
  studyValue: "بكالوريوس الذكاء الاصطناعي",
  workMode: "مجال العمل",
  workModeValue: "تحليل بيانات · ذكاء أعمال · نمذجة بيانات",
  languages: "اللغات",
  languagesValue: "العربية · اللغة الأم / الإنجليزية · ممتازة",
  availability: "تركيزي الحالي",
  availabilityValue: "مشغول حاليًا بالتدريب",
  viewLinkedIn: "عرض ملف LinkedIn",
  viewCv: "عرض الملف المهني",
  capTitle: "مهارات بيانات موثقة بالمشاريع.",
  capAiTitle: "تحضير البيانات",
  capAiBody: "تنظيف وتحويل البيانات التدريبية في Power Query، ثم فحص الأعمدة والعلاقات قبل بناء التقرير.",
  deliverLabel: "ما أستطيع تنفيذه",
  capAiDeliver: "خطوات تنظيف موثقة وجداول جاهزة للتحليل في مشاريع Power BI التدريبية.",
  capBackendTitle: "SQL ونمذجة البيانات",
  capBackendBody: "نماذج علائقية في PostgreSQL وPower BI مع الانتباه للمفاتيح والعلاقات ومسارات الفلترة وسلامة الاستعلامات.",
  capBackendDeliver: "تطبيقات مدعومة بـPostgreSQL ونماذج تحليلية بعلاقات تخدم سؤال التقرير.",
  capAutomationTitle: "أتمتة تدفق البيانات",
  capAutomationBody: "تدفقات Webhook تتحقق من JSON الوارد وتطبق قواعد واضحة وتعيد مخرجات منظمة.",
  capAutomationDeliver: "تدفقات n8n وتكاملات APIs موثقة تشكل أساسًا لتدفقات بيانات أكثر قابلية للتكرار.",
  capDataTitle: "ذكاء الأعمال والمقاييس",
  capDataBody: "تقارير Power BI بمقاييس DAX وفلاتر تفاعلية وتعريفات واضحة لمؤشرات العمل.",
  capDataDeliver: "تقارير السيارات والموارد البشرية تحوّل بيانات تدريبية منظفة إلى مشاهد قابلة للاستكشاف.",
  workTitle: "من مصدر البيانات إلى معلومة مفيدة.",
  workIntro: "ابدأ بمشاريع التحليل، ثم استكشف عملي في قواعد البيانات وAPIs والأتمتة الذي يدعم مساري الهندسي.",
  matcherLabel: "استكشف حسب المهارة",
  matcherQuestion: "أي جزء من تدفق البيانات يهمك؟",
  matchSecurity: "أساسيات APIs",
  matchFrontend: "واجهة ويب",
  matchBrowser: "أحداث المتصفح",
  matchAutomation: "أتمتة",
  matchFullstack: "تطبيق PostgreSQL",
  matchLocal: "أداة بيانات محلية",
  matchAnalytics: "Power BI ونمذجة",
  labelAnalytics: "POWER BI · تحليل السيارات",
  labelHR: "POWER BI · تحليل الموارد البشرية",
  projectShowroomBody: "تقرير متعدد الصفحات مبني على بيانات تدريبية لمعرض سيارات: نظرة تنفيذية ومبيعات ومخزون وصيانة ورؤى العملاء واستكشاف الماركات والطرازات.",
  projectShowroomProof: "تنظيف في Power Query ونموذج بيانات ومقاييس DAX وفلاتر وتفاصيل Drillthrough وتلميحات وBookmarks وتنقل. ملف PBIX والبيانات غير منشورين.",
  projectHRBody: "تقرير تفاعلي عن الموظفين يتناول العدد والإنهاءات ومعدل الدوران ومتوسط الراتب والعمر والتوزيع حسب القسم والجنس والتعيينات الشهرية.",
  projectHRProof: "Power Query ونمذجة البيانات وDAX وفلاتر للقسم والموقع وحالة التوظيف. ملف PBIX وبيانات الموظفين غير منشورين.",
  readCaseStudy: "اقرأ دراسة المشروع",
  typeAnalytics: "تطبيق عملي في تحليل البيانات",
  timelineAnalyticsTitle: "نمذجة البيانات والتقارير في Power BI",
  timelineAnalyticsBody: "أنجزت تقارير تحليلية لمعرض سيارات والموارد البشرية باستخدام Power Query ونمذجة البيانات وDAX، مع فلاتر تفاعلية ومشاهد تفصيلية للتقارير.",
  recommended: "الأنسب لك",
  inspectCase: "افتح المشروع",
  labelBackendSecurity: "BACKEND · أمان",
  labelFrontend: "REACT · تجارة إلكترونية",
  labelBrowser: "واجهات المتصفح · تعلّم الأمان",
  projectAugust2026: "أغسطس 2026",
  labelFullstack: "FULL-STACK · إنتاجية",
  labelAutomation: "أتمتة · عمليات",
  labelLocal: "ويب · خصوصية أولًا",
  projectEcomBody: "واجهة Node.js وExpress مبنية حول حدود صلاحيات واضحة: مصادقة وأدوار وتحقق وتحديد معدل الطلبات وحماية IDOR وأخطاء آمنة وتخزين PostgreSQL.",
  proof: "الدليل",
  projectEcomProof: "مراجعة أمان ومجموعة Postman قابلة لإعادة الاستخدام. أُضيفت واجهة متجر React منفصلة إلى المستودع في أغسطس 2026.",
  projectStorefrontBody: "متجر React متجاوب يضم 20 منتجًا تجريبيًا، مع بحث وفلاتر مجمعة وترتيب وتقسيم صفحات وسلة محفوظة محليًا وإتمام طلب ومسارات للعميل والمشرف.",
  projectStorefrontProof: "نجاح CI والنشر على GitHub Pages، مع توثيق فحوص التفاعل والتجاوب بعروض 1440 و768 و390 بكسل.",
  projectProctorBody: "محاكاة تعليمية لاختبار مدته 80 دقيقة تضم ستة أسئلة تجريبية وفحصًا اختياريًا للكاميرا والميكروفون وسجلًا ظاهرًا لنشاط المتصفح.",
  projectProctorProof: "منشور على GitHub Pages. يسجل بيانات أحداث النسخ والقص واللصق والتركيز وظهور التبويب وملء الشاشة محليًا، مع تصدير JSON.",
  projectTaskBody: "مدير مهام Full-stack ضمن خدمة واحدة، يدعم JWT والتنبيهات والتصفية وتهيئة قاعدة البيانات تلقائيًا والتخزين في PostgreSQL.",
  projectTaskProof: "واجهة وAPI من المصدر نفسه، وإعداد إنتاج موثق، وHealth endpoint يساعد على النشر.",
  projectAutomationBody: "Workflow جاهز للاستيراد في n8n يتحقق من التذاكر ويصنف خمس فئات ويحدد الأولوية ويحسب مهلة SLA ويعيد JSON منظمًا.",
  projectAutomationProof: "Workflow بلا بيانات اعتماد، مع عينات وقواعد شفافة واختبارات آلية لسيناريوهات الفرز.",
  projectJobsBody: "تطبيق متصفح خفيف لتتبع طلبات التوظيف والحالات والملاحظات والبحث والتصفية والإحصائيات ونسخ JSON الاحتياطية، بلا حساب أو Backend.",
  projectJobsProof: "منشور على GitHub Pages مع تخزين محلي ونسخ JSON احتياطية ووضع داكن، دون حساب أو Backend.",
  openCaseStudy: "عرض التفاصيل الهندسية",
  caseProblem: "المشكلة",
  caseBuilt: "ما الذي بنيته",
  caseArchitecture: "الهندسة",
  caseDecisions: "القرارات الهندسية",
  caseResult: "النتيجة",
  caseScope: "النطاق الحالي",
  viewGithub: "اعرض الدليل على GitHub",
  viewStorefrontCase: "استكشف واجهة متجر React",
  viewTestChecklist: "اقرأ قائمة التحقق والاختبارات",
  openStorefrontDemo: "جرّب واجهة المتجر",
  openProctorDemo: "استكشف محاكاة الاختبار",
  openTrackerDemo: "جرّب متعقب طلبات التوظيف",
  ecomProblem: "واجهة تجارة إلكترونية قائمة احتاجت حدود ثقة واضحة بين المستخدمين والأدوار والمنتجات والطلبات.",
  ecomBuilt: "واجهة Express تركز على الأمان مع مسارات محمية وتحقق وضوابط ملكية وتخزين PostgreSQL.",
  ecomArchitecture: "Routes ← التحقق والمصادقة ← Controllers ← استعلامات آمنة ← Neon PostgreSQL.",
  ecomDecisions: "التحقق من JWT وفحص الأدوار مباشرة وRBAC وحماية IDOR وتحديد المعدل وHelmet وCORS وأخطاء آمنة.",
  ecomResult: "مراجعة أمان موثقة وخطة Postman قابلة لإعادة الاستخدام تغطي الصلاحيات وحالات الفشل المطلوبة.",
  ecomScope: "توجد الـAPI وواجهة Nova Tech في المستودع نفسه. تستخدم الواجهة بيانات تجريبية حاليًا، وربطها بالـAPI مهمة لاحقة.",
  storefrontProblem: "بناء واجهة تسوق متكاملة بتنقل واضح ومكونات قابلة لإعادة الاستخدام وحالات مفيدة للتحميل والفراغ والخطأ والنجاح.",
  storefrontBuilt: "تصفح منتجات وسلة تراعي المخزون وتحقق من إتمام الطلب وتسجيل دخول وحساب تجريبي وملفات مستخدمين وإدارة محلية للمشرف.",
  storefrontArchitecture: "صفحات React Router ← مكونات مشتركة وحالة عبر Context ← بيانات تجريبية محلية وlocalStorage، مع بناء عبر Vite.",
  storefrontDecisions: "التصفية قبل الترتيب وتقسيم الصفحات، وحساب إجمالي السلة من الكميات، واحترام حدود المخزون، ودعم تحديث الروابط المباشرة على GitHub Pages.",
  storefrontResult: "واجهة Task 4 منشورة مع قائمة تحقق مرتبطة بالمصدر تميز بين التفاعلات المفحوصة والميزات المنفذة.",
  storefrontScope: "بيانات تجريبية فقط. تسجيل الدخول والأدوار والطلبات وإتمام الشراء للمحاكاة، دون ربط API أو قاعدة بيانات أو بوابة دفع.",
  proctorProblem: "توضيح مراقبة الاختبارات بعرض أحداث المتصفح التي تلاحظها الصفحة للمشارك نفسه.",
  proctorBuilt: "لوحة بداية وموافقة وفحص أجهزة وأسئلة بمؤقت ونتائج وسجل نشاط محلي قابل للتنزيل بصيغة JSON.",
  proctorArchitecture: "تدير React وTypeScript مراحل الاختبار. تحفظ مستمعات أحداث المتصفح بيانات الأحداث في sessionStorage، ويبني Vite نسخة Pages.",
  proctorDecisions: "أذونات وسائط اختيارية وسجل أحداث ظاهر وتنظيف مستمعات الأحداث وتخزين داخل الجلسة. لا يُحفظ أو يُرفع نص الحافظة أو الصوت أو الفيديو.",
  proctorResult: "مختبر تعليمي عام للاختبار المصرح به لسلوك المتصفح وحدود مراقبة الاختبارات.",
  proctorScope: "محاكاة تعليمية؛ الأحداث لا تثبت الغش، والتطبيق لا يكتشف لقطات شاشة نظام التشغيل ولا يسجل الوسائط.",
  taskProblem: "تتبع المهام غالبًا يوزع الواجهة والـAPI والنشر على أجزاء متحركة أكثر من اللازم.",
  taskBuilt: "مدير مهام محمي بالمصادقة مع تنبيهات وتصفية وتهيئة تلقائية للجداول وتخزين PostgreSQL.",
  taskArchitecture: "خدمة Express واحدة تقدم الواجهة الثابتة والـAPI وتعمل مع PostgreSQL من المصدر نفسه.",
  taskDecisions: "مصادقة JWT وحد أدنى 32 حرفًا للمفتاح ودعم SSL وCORS مقيد وHealth endpoint.",
  taskResult: "نظام Full-stack مدمج يمكن نشره كخدمة Node واحدة مع قاعدة بيانات مُدارة.",
  taskScope: "اقتراحات الذكاء الاصطناعي معطلة في الإنتاج لحين تنفيذ مزود مستضاف. تعمل ميزات إدارة المهام بشكل مستقل عنها.",
  automationProblem: "تخسر فرق الدعم وقتًا في مراجعة كل تذكرة واردة وتحديد أولويتها يدويًا.",
  automationBuilt: "تدفق Webhook جاهز للاستيراد يتحقق من الطلبات ويصنف المشكلات ويحدد الأولوية ويحسب SLA.",
  automationArchitecture: "POST webhook ← التحقق والقواعد ← التصنيف وحساب SLA ← استجابة JSON منظمة.",
  automationDecisions: "استخدام Nodes الأساسية في n8n فقط، بلا بيانات اعتماد، مع تقييم قواعد الأمان أولًا وفئات واضحة ومخرجات قابلة لإعادة الاستخدام.",
  automationResult: "عملية فرز أولية متسقة ومرفقة بعينات وتوثيق واختبارات آلية.",
  jobsProblem: "يحتاج الباحث عن عمل مكانًا واحدًا لتتبع الطلبات والحالات والروابط والتواريخ وملاحظات المتابعة.",
  jobsBuilt: "لوحة متجاوبة للإضافة والتعديل والحذف والبحث وتصفية الحالات والإحصائيات والنسخ الاحتياطية.",
  jobsArchitecture: "واجهة متصفح بلا Framework تحفظ السجلات في localStorage وتصدر أو تستعيد JSON عند الطلب.",
  jobsDecisions: "بلا حساب أو Backend أو قاعدة بيانات أو API key أو نقل صامت للبيانات؛ المستخدم يتحكم بكل نسخة احتياطية.",
  jobsResult: "أداة متصفح منشورة تعمل محليًا أيضًا، وتبقي سجلات التقديم على جهاز المستخدم ما لم يصدّر نسخة احتياطية.",
  proofTitle: "دليل، لا ادعاءات تسويقية.",
  proofIntro: "أوضح نطاق كل مشروع ودليله، بما فيه ما لا يزال قيد التطوير أو لم يُنشر.",
  proofReposTitle: "مصدر عام",
  proofReposBody: "ثماني دراسات حالة تشمل Power BI ومشاريع برمجية عامة، مع وصف واضح للنطاق والأدلة المتاحة.",
  inspectGithub: "افحص GitHub",
  proofSecurityTitle: "دراسة مشروع Power BI",
  proofSecurityBody: "توضح دراسة معرض السيارات نطاق التقرير والتنظيف في Power Query والنمذجة وDAX وما لم يُنشر من ملفات.",
  inspectEvidence: "افحص الدليل",
  proofTestsTitle: "سيناريوهات آلية",
  proofTestsBody: "يتضمن تدفق n8n اختبارات لقواعد التحقق والتصنيف والأولوية والمخرجات المنظمة.",
  inspectTests: "افحص الاختبارات",
  proofDocsTitle: "توثيق تقني",
  proofDocsBody: "يفصل التوثيق بين المشاريع المنشورة والبيانات التدريبية والعمل الذي لا يزال قيد التطوير.",
  readDocs: "اقرأ التوثيق",
  approachTitle: "كيف أتعامل مع مسألة بيانات.",
  stepUnderstand: "أفهم",
  stepUnderstandBody: "أحدد السؤال والمصدر ومستوى التفصيل والمخرجات المتوقعة.",
  stepModel: "أصمّم",
  stepModelBody: "أحدد المفاتيح والعلاقات ومعنى كل مقياس.",
  stepBuild: "أبني",
  stepBuildBody: "أنظف البيانات وأحوّلها ثم أبني المقاييس والمشاهد المفيدة.",
  stepValidate: "أتحقق",
  stepValidateBody: "أفحص جودة البيانات والمجاميع والفلاتر والحالات الطرفية.",
  stepShip: "أنشر وأتعلّم",
  stepShipBody: "أوثق الافتراضات وأوضح الأسئلة التي يجيب عنها التقرير.",
  journeyTitle: "التعليم والشهادات.",
  educationDate: "2022 — يوليو 2027 (متوقع)",
  viewCredential: "اعرض الشهادة",
  dateCurrent: "2025 — الآن",
  typeWork: "عمل مستقل",
  timelineWorkTitle: "عمل Backend وقواعد البيانات",
  timelineWorkBody: "تطبيق عملي على نماذج PostgreSQL وتكاملات REST API والتحقق والاختبار والتوثيق التقني.",
  typeProjects: "تطبيق تقني",
  timelineProjectsTitle: "مشاريع APIs وأتمتة",
  timelineProjectsBody: "مشاريع عامة تشمل تطبيقات PostgreSQL وREST APIs وتدفقات n8n وأدوات المتصفح وواجهات React.",
  date2027: "متوقع 2027",
  typeEducation: "التعليم",
  timelineEducationTitle: "بكالوريوس الذكاء الاصطناعي",
  timelineEducationBody: "جامعة الطفيلة التقنية. أبني خبرة عملية في تحليل البيانات وذكاء الأعمال عبر Power BI وExcel وPower Query وDAX ونمذجة البيانات، بالتوازي مع Python وقواعد البيانات وREST APIs وأساسيات الذكاء الاصطناعي.",
  dateMay2026: "مايو 2026",
  typeCredential: "شهادة",
  timelineCredentialBody: "شهادة Google الصادرة في مايو 2026، برقم اعتماد 24563886.",
  contactTitle: "لنبنِ شيئًا مفيدًا.",
  contactBody: "أركز حاليًا على التدريب. للاستفسارات المهنية المتعلقة بتحليل البيانات أو Power BI أو SQL أو الأتمتة، أرسل لي نطاق العمل والجدول الزمني.",
  copyEmail: "انسخ البريد",
  formName: "اسمك",
  formEmail: "بريدك الإلكتروني",
  formSubject: "ماذا سنبني؟",
  formMessage: "بعض التفاصيل",
  optionBackend: "مشروع بيانات",
  optionAutomation: "أتمتة بيانات",
  optionInternship: "فرصة تدريب",
  optionCollaboration: "تعاون تقني",
  openEmail: "افتح مسودة البريد",
  formNote: "سيفتح تطبيق البريد لديك والرسالة مجهزة؛ لن يُرسل شيء تلقائيًا.",
  namePlaceholder: "الاسم",
  messagePlaceholder: "احكِ لي عن المشكلة والهدف والوقت المتوقع…",
  footerBuilt: "صُمّم وبُني بعناية",
  backTop: "العودة للأعلى",
  askSaif: "اسأل SEIF.OS",
  assistantSubtitle: "دليل مشاريع البيانات والهندسة",
  assistantWelcome: "اسأل عن Power BI أو نمذجة البيانات أو SQL أو الأتمتة أو مسار التعلم الحالي.",
  assistantQ1: "أقوى مشروع بيانات؟",
  assistantQ2: "خبرته في الأتمتة؟",
  assistantQ3: "ما الجديد في مشاريعه؟",
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

const pageCopy = $("#english-content");
const englishCopy = pageCopy ? JSON.parse(pageCopy.textContent) : { text: {}, placeholders: {} };
const originalText = new Map();
$$('[data-i18n]').forEach((element) => {
  const key = element.dataset.i18n;
  if (!originalText.has(key)) originalText.set(key, englishCopy.text[key] || element.textContent.trim());
});

const originalPlaceholders = new Map();
$$('[data-i18n-placeholder]').forEach((element) => {
  const key = element.dataset.i18nPlaceholder;
  if (!originalPlaceholders.has(key)) originalPlaceholders.set(key, englishCopy.placeholders[key] || element.getAttribute("placeholder") || "");
});

function setLanguage(language, persist = true) {
  if (persist && typeof window !== "undefined" && window.heroExperience?.changeLanguage(() => setLanguage(language, false))) {
    localStorage.setItem("saif-language", language);
    return;
  }
  state.language = language;
  const isArabic = language === "ar";
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.title = isArabic ? "سيف المغربي | Saif AL-Moghrabi — تحليل البيانات وذكاء الأعمال" : "Saif AL-Moghrabi | سيف المغربي — Data Analytics & BI";

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
  toggle.setAttribute("href", isArabic ? "/" : "/ar/");
  toggle.setAttribute("hreflang", isArabic ? "en" : "ar");
  toggle.setAttribute("lang", isArabic ? "en" : "ar");
  toggle.setAttribute("aria-label", isArabic ? "Switch to English" : "التبديل إلى العربية");
  $("#menuToggle")?.setAttribute("aria-label", isArabic ? "فتح القائمة" : "Open navigation");
  $("#menuClose")?.setAttribute("aria-label", isArabic ? "إغلاق القائمة" : "Close navigation");
  if (persist) localStorage.setItem("saif-language", language);
  if (typeof window !== "undefined") {
    const path = isArabic ? "/ar/" : "/";
    const pageURL = `https://saif.codes${path}`;
    const description = isArabic
      ? "سيف المغربي، متدرب تحليل بيانات وذكاء أعمال وطالب ذكاء اصطناعي. استكشف خبراته ومشاريعه في Power BI وSQL ونمذجة البيانات والأتمتة."
      : "Saif AL-Moghrabi, Data Analytics & BI Intern and AI student. Explore his experience, Power BI dashboards, SQL, data modeling, and automation projects.";
    $('link[rel="canonical"]')?.setAttribute("href", pageURL);
    $('meta[name="description"]')?.setAttribute("content", description);
    $('meta[property="og:url"]')?.setAttribute("content", pageURL);
    $('meta[property="og:locale"]')?.setAttribute("content", isArabic ? "ar_JO" : "en_US");
    $('meta[property="og:locale:alternate"]')?.setAttribute("content", isArabic ? "en_US" : "ar_JO");
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) $(selector)?.setAttribute("content", document.title);
    for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) $(selector)?.setAttribute("content", description);
    if (["/", "/index.html", "/ar/", "/ar/index.html"].includes(window.location.pathname)) {
      window.history.replaceState(window.history.state, "", path + window.location.search + window.location.hash);
    }
  }
  updateClock();
}

const matcherMap = {
  security: { title: "E-commerce REST API", target: "#project-ecommerce" },
  frontend: { title: "Nova Tech", target: "#project-storefront" },
  browser: { title: "ProctorLab", target: "#project-proctor" },
  automation: { title: "IT Support Ticket Triage", target: "#project-automation" },
  fullstack: { title: "Smart Task Manager", target: "#project-task" },
  local: { title: "Job Application Tracker", target: "#project-jobs" },
  analytics: { title: "Automotive Showroom & HR Analytics", target: "#project-showroom" },
};

function chooseProject(type) {
  if (!Object.prototype.hasOwnProperty.call(matcherMap, type)) type = "analytics";
  const match = matcherMap[type];
  $$("[data-match]").forEach((button) => {
    const selected = button.dataset.match === type;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $$("[data-project]").forEach((card) => card.classList.toggle("is-recommended", card.dataset.project === type && "#" + card.getAttribute("id") === match.target));
  $("#matcherResultTitle").textContent = match.title;
  $("#matcherResultLink").setAttribute("href", match.target);
}

const answers = {
  en: {
    experience: {
      text: "Saif is a Data Analytics & BI Intern at Markazia Group (September 2026–present). He completed field training at bat techno (July–September 2026) and worked as a freelance Backend Web Developer (December 2025–May 2026). His current internship covers Power Query, data modeling, DAX, Power BI reporting, and documenting data issues and decisions.",
      label: "Explore professional experience",
      href: "#experience",
    },
    frontend: {
      text: "Nova Tech is Saif's React + Vite storefront: 20 demo products, search, filters, sorting, a persistent cart, checkout, and customer/admin flows. It is published on GitHub Pages. It uses mock data; API, database, and payment integration are not included.",
      label: "Explore Nova Tech",
      href: "#project-storefront",
    },
    browser: {
      text: "ProctorLab is an educational React/TypeScript assessment simulator with an 80-minute timer, six sample questions, optional media preflight, and visible copy/paste, focus, visibility, and fullscreen event logs. Metadata stays in the browser session, with JSON export. It does not record media or prove cheating.",
      label: "Explore ProctorLab",
      href: "#project-proctor",
    },
    backend: {
      text: "Saif’s strongest backend proof is the E-commerce REST API: JWT, RBAC, validation, parameterized PostgreSQL queries, rate limiting, Helmet, safe errors, and ownership protection. The repository now also contains Nova Tech, a separate mock-data React frontend whose API integration is pending.",
      label: "Inspect the backend case",
      href: "#project-ecommerce",
    },
    automation: {
      text: "The IT Support Ticket Triage workflow is his clearest automation case: a credential-free n8n webhook flow that validates requests, classifies five issue types, assigns priority, calculates SLA, and returns structured JSON.",
      label: "Inspect the automation case",
      href: "#project-automation",
    },
    fullstack: {
      text: "Smart Task Manager combines authenticated tasks, reminders, filters, PostgreSQL, and the frontend in one Express service, with automatic database setup and a health endpoint. AI suggestions are disabled in production until a hosted provider is implemented.",
      label: "Inspect Smart Task Manager",
      href: "#project-task",
    },
    local: {
      text: "Job Application Tracker is published on GitHub Pages and keeps application records in localStorage. It supports search, status filters, statistics, dark mode, and explicit JSON backup and restore without an account or backend.",
      label: "Inspect the local-first app",
      href: "#project-jobs",
    },
    skills: {
      text: "Saif’s data path combines Power Query, Power BI, DAX, SQL, PostgreSQL, Python, REST APIs, and n8n. His published software projects show how he works with databases, JSON, validation, and automation; larger production data pipelines are a learning goal.",
      label: "View the capability map",
      href: "#capabilities",
    },
    ai: {
      text: "Saif studies Artificial Intelligence and is building toward data engineering. His current evidence includes Power BI modeling and reporting, PostgreSQL-backed applications, API work, and n8n automation. Production-scale data pipelines are not claimed.",
      label: "See his current direction",
      href: "#about",
    },
    education: {
      text: "Saif is pursuing a B.Sc. in Artificial Intelligence at Tafila Technical University (2022–July 2027, expected). He also holds Google’s Introduction to Generative AI credential, issued in May 2026.",
      label: "View the journey",
      href: "#journey",
    },
    hire: {
      text: "Saif is developing a data engineering foundation through Power Query, Power BI, SQL, PostgreSQL, APIs, and automation. His portfolio shows analytical reports alongside documented software projects, with scope and gaps stated clearly.",
      label: "See the proof",
      href: "#work",
    },
    contact: {
      text: "Saif is currently busy with training. For professional enquiries about data analysis, Power BI, SQL, or automation, share the scope and timeline through the contact section or LinkedIn.",
      label: "Go to contact",
      href: "#contact",
    },
    meeting: {
      text: "Use any Schedule a Meeting button to open Saif’s booking page. If the booking link is still being connected, email him from the contact section.",
      label: "Schedule a meeting",
      href: MEETING_URL || "#contact",
    },
    projects: {
      text: "Start with two Power BI case studies: automotive showroom analysis using training data and an HR headcount and attrition dashboard. Then explore the PostgreSQL applications, secure REST API, and n8n ticket-triage workflow.",
      label: "Explore selected work",
      href: "#work",
    },
    fallback: {
      text: "Ask about Saif’s professional experience, field training, freelance Backend work, Power BI reports, SQL, PostgreSQL, or automation projects.",
      label: "Explore the portfolio",
      href: "#work",
    },
  },
  ar: {
    experience: {
      text: "سيف متدرب تحليل بيانات وذكاء أعمال في مجموعة المركزية منذ سبتمبر 2026. أتمّ تدريبًا ميدانيًا في bat techno من يوليو إلى سبتمبر 2026، وعمل مطور Backend مستقلًا من ديسمبر 2025 إلى مايو 2026. يشمل تدريبه الحالي Power Query ونمذجة البيانات وDAX وتقارير Power BI وتوثيق مشكلات البيانات والقرارات.",
      label: "استكشف الخبرات المهنية",
      href: "#experience",
    },
    frontend: {
      text: "Nova Tech هو متجر React وVite لسيف: 20 منتجًا تجريبيًا وبحث وفلاتر وترتيب وسلة محفوظة وإتمام طلب ومسارات عميل ومشرف. منشور على GitHub Pages ويستخدم بيانات تجريبية، دون ربط API أو قاعدة بيانات أو بوابة دفع.",
      label: "استكشف Nova Tech",
      href: "#project-storefront",
    },
    browser: {
      text: "ProctorLab محاكاة تعليمية بـReact وTypeScript لاختبار مدته 80 دقيقة وستة أسئلة، مع فحص وسائط اختياري وسجل ظاهر للنسخ واللصق والتركيز وظهور التبويب وملء الشاشة. بيانات الأحداث تبقى داخل جلسة المتصفح مع تصدير JSON؛ لا يسجل الوسائط ولا يثبت الغش.",
      label: "استكشف ProctorLab",
      href: "#project-proctor",
    },
    backend: {
      text: "أقوى دليل Backend لدى سيف هو E-commerce REST API: مصادقة JWT وRBAC وتحقق واستعلامات PostgreSQL آمنة وتحديد معدل الطلبات وHelmet وحماية الملكية. يضم المستودع الآن Nova Tech أيضًا، وهي واجهة React منفصلة ببيانات تجريبية لم تُربط بالـAPI بعد.",
      label: "افتح مشروع الـBackend",
      href: "#project-ecommerce",
    },
    automation: {
      text: "أوضح مشروع أتمتة هو IT Support Ticket Triage: تدفق n8n بلا بيانات اعتماد يتحقق من الطلبات ويصنف خمس فئات ويحدد الأولوية ويحسب SLA ويعيد JSON منظمًا.",
      label: "افتح مشروع الأتمتة",
      href: "#project-automation",
    },
    fullstack: {
      text: "يجمع Smart Task Manager المهام المحمية والتنبيهات والتصفية وPostgreSQL والواجهة ضمن خدمة Express واحدة، مع تهيئة تلقائية للبيانات وHealth endpoint. اقتراحات AI معطلة في الإنتاج لحين تنفيذ مزود مستضاف.",
      label: "افتح Smart Task Manager",
      href: "#project-task",
    },
    local: {
      text: "Job Application Tracker منشور على GitHub Pages ويحفظ سجلات التقديم في localStorage. يدعم البحث وتصفية الحالات والإحصائيات والوضع الداكن ونسخ JSON الاحتياطية واستعادتها، بلا حساب أو Backend.",
      label: "افتح التطبيق المحلي",
      href: "#project-jobs",
    },
    skills: {
      text: "يجمع مسار سيف Power Query وPower BI وDAX وSQL وPostgreSQL وPython وREST APIs وn8n. تظهر مشاريعه البرمجية التعامل مع قواعد البيانات وJSON والتحقق والأتمتة؛ أما تدفقات البيانات الإنتاجية الكبيرة فهي هدف تعلّم حالي.",
      label: "اعرض خريطة القدرات",
      href: "#capabilities",
    },
    ai: {
      text: "يدرس سيف الذكاء الاصطناعي ويبني مسارًا نحو هندسة البيانات. الأدلة الحالية تشمل نمذجة وتقارير Power BI وتطبيقات PostgreSQL وAPIs وأتمتة n8n، دون ادعاء خبرة في تدفقات بيانات إنتاجية كبيرة.",
      label: "اعرض اتجاهه الحالي",
      href: "#about",
    },
    education: {
      text: "يدرس سيف بكالوريوس الذكاء الاصطناعي في جامعة الطفيلة التقنية منذ 2022، والتخرج المتوقع في يوليو 2027. ويحمل شهادة Introduction to Generative AI من Google، الصادرة في مايو 2026.",
      label: "اعرض المسيرة",
      href: "#journey",
    },
    hire: {
      text: "يبني سيف أساس هندسة البيانات عبر Power Query وPower BI وSQL وPostgreSQL وAPIs والأتمتة. يوضح الموقع تقارير تحليلية ومشاريع برمجية موثقة، مع بيان نطاق كل منها وما يحتاجه من تطوير.",
      label: "شاهد الدليل",
      href: "#work",
    },
    contact: {
      text: "سيف مشغول حاليًا بالتدريب. للاستفسارات المهنية عن تحليل البيانات أو Power BI أو SQL أو الأتمتة، شارك نطاق العمل والجدول الزمني عبر قسم التواصل أو LinkedIn.",
      label: "اذهب للتواصل",
      href: "#contact",
    },
    meeting: {
      text: "استخدم أي زر لحجز اجتماع لفتح صفحة المواعيد. إذا كان رابط الحجز لا يزال قيد الربط، أرسل بريدًا من قسم التواصل.",
      label: "احجز اجتماعًا",
      href: MEETING_URL || "#contact",
    },
    projects: {
      text: "ابدأ بدراستي Power BI: تحليل معرض سيارات ببيانات تدريبية وتقرير الموارد البشرية. ثم استكشف تطبيقات PostgreSQL وواجهة REST API الآمنة وتدفق n8n لفرز تذاكر الدعم.",
      label: "استكشف المشاريع",
      href: "#work",
    },
    fallback: {
      text: "اسأل عن خبرات سيف المهنية أو التدريب الميداني أو عمله الحر في Backend أو تقارير Power BI ومشاريع SQL وPostgreSQL والأتمتة.",
      label: "استكشف الموقع",
      href: "#work",
    },
  },
};

function classifyQuestion(value) {
  const query = value.toLowerCase().trim();
  if (/proctor[\s-]?lab|proctoring|assessment|clipboard|fullscreen|screenshot|بروكتور|مراقبة|محاكاة|لصق|لقطات الشاشة|اختبار المتصفح/.test(query)) return "browser";
  if (/nova[\s-]?tech|front.?end|react|storefront|shopping|checkout|cart|نوفا|رياكت|ريأكت|متجر|تسوق|سلة|واجهة/.test(query)) return "frontend";
  if (/experience|career|markazia|bat techno|خبرات|خبرة|مركزية|المركزية|تدريب ميداني/.test(query)) return "experience";
  if (/backend|api|security|secure|auth|jwt|rbac|ecommerce|أمان|امن|باك|خلفي|مصادقة/.test(query)) return "backend";
  if (/automat|n8n|workflow|ticket|triage|sla|أتمت|اتمت|تذكرة|تذاكر/.test(query)) return "automation";
  if (/full.?stack|task|manager|مهام|فول/.test(query)) return "fullstack";
  if (/privacy|local|job|application|tracker|خصوص|وظيف|توظيف|محلي/.test(query)) return "local";
  if (/stack|skill|tech|language|tool|تقني|مهار|لغة|أداة|اداة/.test(query)) return "skills";
  if (/education|study|university|graduate|degree|certificate|دراس|جامع|تخرج|شهاد/.test(query)) return "education";
  if (/why|hire|choose|fit|employ|لماذا|ليش|اختار|توظف/.test(query)) return "hire";
  if (/meeting|schedule|book|calendar|calendly|cal\.com|موعد|اجتماع|احجز|حجز/.test(query)) return "meeting";
  if (/contact|email|available|intern|freelance|connect|تواصل|بريد|متاح|تدريب|عمل حر/.test(query)) return "contact";
  if (/data eng|pipeline|etl|elt|power bi|dashboard|analytics|dax|sql|postgres|modeling|هندسة بيانات|هندسة البيانات|تحليل|لوحة|داشبورد|نمذجة/.test(query)) return "projects";
  if (/project|work|portfolio|latest|recent|updates?|new|مشروع|مشاريع|جديد|تحديث|أعمال|اعمال|بورتفوليو/.test(query)) return "projects";
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
  if(button) {
  button.innerHTML = isOff
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>';
  button.setAttribute("aria-label", isOff ? "Resume motion" : "Pause motion");
  button.title = isOff ? "Resume motion" : "Pause motion";
  }
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
  return; // The portrait WebGL module owns Hero motion.
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
      $$(".side-nav-links a").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
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
  $("#languageToggle").addEventListener("click", event => {
    event.preventDefault();
    setLanguage(state.language === "en" ? "ar" : "en");
  });
  $("#motionToggle")?.addEventListener("click", () => {
    state.motion = state.motion === "on" ? "off" : "on";
    localStorage.setItem("saif-motion", state.motion);
    setupMotion();
    if (state.motion === "on" && canvasActive) startNeuralField();
    else stopNeuralField();
  });

  const menuToggle = $("#menuToggle");
  const nav = $("#primaryNav");
  menuToggle.addEventListener("click", () => {
    nav.showModal();
    nav.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("panel-open");
  });
  nav.addEventListener("close", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("panel-open");
    menuToggle.focus({preventScroll:true});
  });
  $("#menuClose").addEventListener("click", () => nav.close());
  $$("#primaryNav a").forEach((link) => link.addEventListener("click", () => nav.close()));
  nav.addEventListener("click", event => {
    if(event.target!==nav)return;
    const r=nav.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)nav.close();
  });

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

  $("#commandTrigger")?.addEventListener("click", openCommandPalette);
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
      nav.close();
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
