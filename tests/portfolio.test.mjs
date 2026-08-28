import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const source = readFileSync(new URL("../assets/app.js", import.meta.url), "utf8");
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const cards = [...html.matchAll(/<article\b([^>]*data-project="[^"]+"[^>]*)>([\s\S]*?)<\/article>/g)];

function attributes(value) {
  return Object.fromEntries([...value.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function decodeText(value) {
  return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Only the DOM contract used by translation and project matching is required.
// These are unit tests; they do not replace visual or browser testing.
function element(attrs = {}, text = "") {
  const classes = new Set((attrs.class || "").split(/\s+/).filter(Boolean));
  return {
    dataset: Object.fromEntries(Object.entries(attrs)
      .filter(([name]) => name.startsWith("data-"))
      .map(([name, value]) => [name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value])),
    textContent: decodeText(text),
    getAttribute(name) { return attrs[name] ?? null; },
    setAttribute(name, value) { attrs[name] = String(value); },
    classList: {
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const add = force ?? !classes.has(name);
        if (add) classes.add(name);
        else classes.delete(name);
        return add;
      },
    },
  };
}

function fixture() {
  const translated = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*data-i18n="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/g)]
    .map((match) => element(attributes(match[2]), match[3]));
  const placeholders = [...html.matchAll(/<[^>]*data-i18n-placeholder="[^"]+"[^>]*>/g)]
    .map((match) => element(attributes(match[0])));
  const buttons = [...html.matchAll(/<button\b[^>]*data-match="[^"]+"[^>]*>/g)]
    .map((match) => element(attributes(match[0])));
  const projects = cards.map((match) => element(attributes(match[1])));
  const elementsById = Object.fromEntries(["languageToggle", "matcherResultTitle", "matcherResultLink"].map((id) => ["#" + id, element()]));
  const selections = {
    "[data-i18n]": translated,
    "[data-i18n-placeholder]": placeholders,
    "[data-match]": buttons,
    "[data-project]": projects,
  };
  const document = {
    documentElement: { lang: "en", dir: "ltr" },
    querySelectorAll(selector) { return selections[selector] || []; },
    querySelector(selector) { return elementsById[selector] || null; },
  };
  const saved = new Map();
  const context = vm.createContext({
    document,
    localStorage: { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) },
    matchMedia: () => ({ matches: false }),
    updateClock() {},
  });
  const boundary = source.indexOf("\nfunction appendAssistantMessage(");
  assert.ok(boundary > 0, "application data and routing must be available");
  vm.runInContext(source.slice(0, boundary) + "\nglobalThis.portfolio = { arabic, answers, matcherMap, chooseProject, classifyQuestion, setLanguage };", context);
  return { ...context.portfolio, translated, placeholders, buttons, projects, elementsById, document };
}

test("case studies have unique anchors, sequential numbering, and an accurate total", () => {
  const projectIds = cards.map((match) => attributes(match[1]).id);
  assert.equal(new Set(projectIds).size, cards.length);
  const count = html.match(/<strong>(\d+)<\/strong><span data-i18n="featuredSystems"/);
  assert.equal(Number(count?.[1]), cards.length);
  cards.forEach((match, index) => {
    assert.equal(Number(match[2].match(/class="project-number"><span>(\d+)/)?.[1]), index + 1);
    for (const field of ["caseProblem", "caseBuilt", "caseArchitecture", "caseDecisions", "caseResult"]) {
      assert.ok(match[2].includes('data-i18n="' + field + '"'), projectIds[index] + " is missing " + field);
    }
    assert.match(match[2], /href="https:\/\/github\.com\/qz-jo\//);
  });
  assert.ok(projectIds.includes("project-storefront"));
  assert.ok(projectIds.includes("project-proctor"));
});

test("English to Arabic and back preserves every translation and switches direction", () => {
  const app = fixture();
  const original = app.translated.map((node) => node.textContent.trim());
  const placeholders = app.placeholders.map((node) => node.getAttribute("placeholder"));
  app.setLanguage("ar");
  assert.equal(app.document.documentElement.dir, "rtl");
  app.translated.forEach((node) => {
    const expected = app.arabic[node.dataset.i18n];
    assert.ok(expected, "Missing Arabic: " + node.dataset.i18n);
    assert.equal(node.textContent, expected);
  });
  app.placeholders.forEach((node) => assert.equal(node.getAttribute("placeholder"), app.arabic[node.dataset.i18nPlaceholder]));
  app.setLanguage("en");
  assert.equal(app.document.documentElement.dir, "ltr");
  app.translated.forEach((node, index) => assert.equal(node.textContent, original[index]));
  app.placeholders.forEach((node, index) => assert.equal(node.getAttribute("placeholder"), placeholders[index]));
});

test("each matcher selects one matching card, link, and accessible pressed state", () => {
  const app = fixture();
  for (const [type, match] of Object.entries(app.matcherMap)) {
    app.chooseProject(type);
    const active = app.buttons.filter((button) => button.classList.contains("active"));
    const recommended = app.projects.filter((card) => card.classList.contains("is-recommended"));
    assert.equal(active.length, 1);
    assert.equal(active[0].dataset.match, type);
    assert.equal(recommended.length, 1);
    assert.equal(recommended[0].dataset.project, type);
    app.buttons.forEach((button) => assert.equal(button.getAttribute("aria-pressed"), String(button === active[0])));
    assert.equal(app.elementsById["#matcherResultTitle"].textContent, match.title);
    assert.equal(app.elementsById["#matcherResultLink"].getAttribute("href"), match.target);
    assert.ok(ids.has(match.target.slice(1)));
  }
  app.chooseProject("unknown");
  assert.equal(app.elementsById["#matcherResultLink"].getAttribute("href"), "#project-ecommerce");
  assert.equal(app.buttons.filter((button) => button.getAttribute("aria-pressed") === "true").length, 1);
});

test("assistant routes new project questions before generic API or security terms", () => {
  const { classifyQuestion } = fixture();
  const examples = [
    ["Nova Tech API integration", "frontend"],
    ["React frontend", "frontend"],
    ["هل المتجر مربوط بالـAPI؟", "frontend"],
    ["واجهة رياكت", "frontend"],
    ["ProctorLab security", "browser"],
    ["proctor-lab", "browser"],
    ["privacy in ProctorLab", "browser"],
    ["محاكاة الاختبار", "browser"],
    ["بروكتور", "browser"],
    ["JWT and RBAC", "backend"],
    ["أمان الباك", "backend"],
    ["n8n workflow", "automation"],
    ["أتمتة التذاكر", "automation"],
    ["Smart Task Manager", "fullstack"],
    ["إدارة المهام", "fullstack"],
    ["Job Application Tracker", "local"],
    ["متابعة طلبات التوظيف", "local"],
    ["What are the latest projects?", "projects"],
    ["المشاريع الجديدة", "projects"],
    ["ما الجديد في مشاريعه؟", "projects"],
    ["tech stack", "skills"],
    ["احجز اجتماع", "meeting"],
  ];
  for (const [query, expected] of examples) assert.equal(classifyQuestion(query), expected, query);
});

test("assistant answers and suggestion buttons resolve in both languages", () => {
  const { answers, matcherMap } = fixture();
  const presets = [...html.matchAll(/data-question="([^"]+)"/g)].map((match) => match[1]);
  for (const language of ["en", "ar"]) {
    for (const preset of presets) assert.ok(answers[language][preset], language + ": " + preset);
    for (const answer of Object.values(answers[language])) {
      assert.ok(answer.text && answer.label);
      if (answer.href.startsWith("#")) assert.ok(ids.has(answer.href.slice(1)), answer.href);
    }
    assert.equal(answers[language].frontend.href, matcherMap.frontend.target);
    assert.equal(answers[language].browser.href, matcherMap.browser.target);
  }
});

test("page anchors and external demo links are valid static references", () => {
  for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = attributes(match[1]);
    if (attrs.href?.startsWith("#") && attrs.href !== "#") assert.ok(ids.has(attrs.href.slice(1)), attrs.href);
    if (attrs.target === "_blank") {
      assert.ok(attrs.rel?.includes("noopener"), attrs.href);
      assert.ok(attrs.rel?.includes("noreferrer"), attrs.href);
    }
    if (attrs.class?.includes("project-demo")) {
      assert.equal(new URL(attrs.href).origin, "https://saif.codes");
      assert.equal(attrs.target, "_blank");
    }
  }
});
