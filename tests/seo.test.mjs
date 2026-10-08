import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
const en=readFileSync(new URL('index.html',root),'utf8');
const ar=readFileSync(new URL('ar/index.html',root),'utf8');
function canonical(text){return text.match(/<link rel="canonical" href="([^"]+)"/)?.[1]}
function schema(text){return JSON.parse(text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1])}
test('English and Arabic are indexable documents with reciprocal language URLs',()=>{
 assert.equal(canonical(en),'https://saif.codes/');assert.equal(canonical(ar),'https://saif.codes/ar/');
 for(const text of [en,ar]){
  assert.match(text.slice(0,1024),/<meta charset="UTF-8"/);
  assert.match(text,/<link rel="alternate" hreflang="en" href="https:\/\/saif.codes\/"/);
  assert.match(text,/<link rel="alternate" hreflang="ar" href="https:\/\/saif.codes\/ar\/"/);
  assert.doesNotMatch(text,/<meta name="robots" content="[^\"]*noindex/);
 }
 assert.match(en,/<html lang="en" dir="ltr"/);assert.match(ar,/<html lang="ar" dir="rtl"/);
 assert.match(ar,/<span[^>]*data-i18n="heroLine1"[^>]*>من البيانات الخام<\/span>/);
 assert.match(ar,/<h2[^>]*data-i18n="experienceTitle"[^>]*>خبرات تدعم مشاريعي\.<\/h2>/);
 assert.match(en,/<a[^>]*id="languageToggle"[^>]*href="\/ar\/"/);
 assert.match(ar,/<a[^>]*id="languageToggle"[^>]*href="\/"/);
});
test('profile schema identifies the same person by Arabic and English names',()=>{
 for(const [text,language] of [[en,'en'],[ar,'ar']]){
  const data=schema(text);assert.equal(data['@type'],'ProfilePage');assert.equal(data.inLanguage,language);
  assert.equal(data.url,canonical(text));assert.equal(data.mainEntity['@type'],'Person');
  assert.equal(data.mainEntity.name,'Saif AL-Moghrabi');assert.ok(data.mainEntity.alternateName.includes('سيف المغربي'));
  assert.ok(data.mainEntity.sameAs.includes('https://www.linkedin.com/in/saif-al-moghrabi/'));
 }
});
test('localized pages keep asset paths and English restoration data valid',()=>{
 for(const text of [en,ar])for(const match of text.matchAll(/(?:src|href)="(\/(?:assets|fonts)\/[^"?#]+)(?:\?[^"#]*)?"/g))assert.ok(existsSync(new URL(match[1].slice(1),root)),match[1]);
 const data=JSON.parse(ar.match(/<script type="application\/json" id="english-content">([\s\S]*?)<\/script>/)?.[1]);
 assert.equal(data.text.heroLine1,'From raw data');assert.equal(data.text.markaziaRole,'Data Analytics & BI Intern');
 const sitemap=readFileSync(new URL('sitemap.xml',root),'utf8');assert.match(sitemap,/<loc>https:\/\/saif.codes\/ar\/<\/loc>/);
});
test('compressed formation samples preserve every original particle byte',()=>{
 assert.deepEqual(gunzipSync(readFileSync(new URL('assets/portrait-samples-v2.bin.gz',root))),readFileSync(new URL('assets/portrait-samples-v2.bin',root)));
});
