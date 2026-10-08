"""Publish equivalent static English/Arabic documents, without a runtime redirect."""
from pathlib import Path
from lxml import html, etree
import json, re, subprocess
ROOT=Path(__file__).resolve().parent.parent
extract="const fs=require('fs'),vm=require('vm');const s=fs.readFileSync('assets/app.js','utf8');process.stdout.write(JSON.stringify(vm.runInNewContext(s.slice(s.indexOf('const arabic = {'),s.indexOf('\\nconst pageCopy ='))+';arabic')));"
translations=json.loads(subprocess.check_output(['node','-e',extract],cwd=ROOT,text=True,encoding='utf-8'))
source=(ROOT/'index.html').read_text(encoding='utf-8')
source=re.sub(r'(/assets/(?:app|portrait-hero)\.(?:js|css))\?v=[^"\s]+',r'\1?v=20261008-release',source)
doc=html.document_fromstring(source)
head=doc.find('head')
person=json.loads(doc.xpath('//script[@type="application/ld+json"]')[0].text)
if person.get('@type')=='ProfilePage': person=person['mainEntity']
person.pop('@context',None)
person['alternateName']=['سيف المغربي','Saif Al-Moghrabi']
profile={'@context':'https://schema.org','@type':'ProfilePage','@id':'https://saif.codes/#profile','url':'https://saif.codes/','inLanguage':'en','mainEntity':person}
doc.xpath('//script[@type="application/ld+json"]')[0].text=json.dumps(profile,ensure_ascii=False,indent=2)
en_title='Saif AL-Moghrabi | سيف المغربي — Data Analytics & BI'
ar_title='سيف المغربي | Saif AL-Moghrabi — تحليل البيانات وذكاء الأعمال'
en_description='Saif AL-Moghrabi, Data Analytics & BI Intern and AI student. Explore his experience, Power BI dashboards, SQL, data modeling, and automation projects.'
ar_description='سيف المغربي، متدرب تحليل بيانات وذكاء أعمال وطالب ذكاء اصطناعي. استكشف خبراته ومشاريعه في Power BI وSQL ونمذجة البيانات والأتمتة.'
def meta(tree,name,content,kind='name'):
    matches=tree.xpath(f'//meta[@{kind}="{name}"]')
    for node in matches: node.set('content',content)
def metadata(tree,language):
    title,desc=(ar_title,ar_description) if language=='ar' else (en_title,en_description)
    url='https://saif.codes/ar/' if language=='ar' else 'https://saif.codes/'
    tree.find('head/title').text=title
    meta(tree,'description',desc)
    meta(tree,'og:title',title,'property');meta(tree,'og:description',desc,'property');meta(tree,'og:url',url,'property')
    meta(tree,'og:locale','ar_JO' if language=='ar' else 'en_US','property')
    meta(tree,'og:locale:alternate','en_US' if language=='ar' else 'ar_JO','property')
    meta(tree,'twitter:title',title);meta(tree,'twitter:description',desc)
    tree.xpath('//link[@rel="canonical"]')[0].set('href',url)
    structured=json.loads(tree.xpath('//script[@type="application/ld+json"]')[0].text)
    structured.update({'@id':url+'#profile','url':url,'inLanguage':language})
    tree.xpath('//script[@type="application/ld+json"]')[0].text=json.dumps(structured,ensure_ascii=False,indent=2)
metadata(doc,'en')
def save(tree,path):
    path.write_text(html.tostring(tree,encoding='unicode',doctype='<!doctype html>')+'\n',encoding='utf-8')
save(doc,ROOT/'index.html')
original={'text':{},'placeholders':{}}
for node in doc.xpath('//*[@data-i18n]'): original['text'].setdefault(node.get('data-i18n'),node.text_content().strip())
for node in doc.xpath('//*[@data-i18n-placeholder]'): original['placeholders'].setdefault(node.get('data-i18n-placeholder'),node.get('placeholder',''))
ar=html.document_fromstring(html.tostring(doc,encoding='unicode'))
ar.set('lang','ar');ar.set('dir','rtl')
for node in ar.xpath('//*[@data-i18n]'):
    value=translations.get(node.get('data-i18n'))
    if value is not None:
        for child in list(node): node.remove(child)
        node.text=value
for node in ar.xpath('//*[@data-i18n-placeholder]'):
    value=translations.get(node.get('data-i18n-placeholder'))
    if value is not None: node.set('placeholder',value)
toggle=ar.xpath('//*[@id="languageToggle"]')[0]
toggle.text='EN';toggle.set('href','/');toggle.set('hreflang','en');toggle.set('lang','en');toggle.set('aria-label','Switch to English')
ar.xpath('//*[@id="menuToggle"]')[0].set('aria-label','فتح القائمة')
ar.xpath('//*[@id="menuClose"]')[0].set('aria-label','إغلاق القائمة')
data=etree.Element('script',type='application/json',id='english-content')
data.text=json.dumps(original,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
ar.find('head').append(data)
metadata(ar,'ar')
(ROOT/'ar').mkdir(exist_ok=True)
save(ar,ROOT/'ar/index.html')
print(f'Static Arabic page built; {len(original["text"])} English strings retained for seamless switching.')
