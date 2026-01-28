(()=>{var e={};e.id=542,e.ids=[542],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},4735:e=>{"use strict";e.exports=require("events")},9021:e=>{"use strict";e.exports=require("fs")},1630:e=>{"use strict";e.exports=require("http")},5591:e=>{"use strict";e.exports=require("https")},3873:e=>{"use strict";e.exports=require("path")},1997:e=>{"use strict";e.exports=require("punycode")},7910:e=>{"use strict";e.exports=require("stream")},6136:e=>{"use strict";e.exports=require("timers")},9551:e=>{"use strict";e.exports=require("url")},8354:e=>{"use strict";e.exports=require("util")},1185:e=>{"use strict";e.exports=require("worker_threads")},4075:e=>{"use strict";e.exports=require("zlib")},3024:e=>{"use strict";e.exports=require("node:fs")},7075:e=>{"use strict";e.exports=require("node:stream")},7830:e=>{"use strict";e.exports=require("node:stream/web")},7495:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>m,routeModule:()=>l,serverHooks:()=>p,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>d});var i={};r.r(i),r.d(i,{GET:()=>u});var n=r(2706),s=r(8203),a=r(5994),o=r(2971);async function u(e){let{searchParams:t}=new URL(e.url),r=t.get("companyOrEvent")??void 0,i=await (0,o.$)({companyOrEvent:r});return Response.json(i)}let l=new n.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/brief/route",pathname:"/api/brief",filename:"route",bundlePath:"app/api/brief/route"},resolvedPagePath:"/home/ubuntu/clawd/projects/signalforge/apps/web/app/api/brief/route.ts",nextConfigOutput:"standalone",userland:i}),{workAsyncStorage:c,workUnitAsyncStorage:d,serverHooks:p}=l;function m(){return(0,a.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:d})}},6487:()=>{},8335:()=>{},2706:(e,t,r)=>{"use strict";e.exports=r(4870)},2971:(e,t,r)=>{"use strict";r.d(t,{$:()=>n});var i=r(3341);async function n(e){let t=(0,i.Lf)().prepare(`SELECT i.title, i.url, i.source, COALESCE(i.publishedAt, i.createdAt) as ts,
              a.summary, a.impact, a.predictionsJson
       FROM items i
       LEFT JOIN analyses a ON a.itemId = i.id
       ORDER BY ts DESC
       LIMIT 12`).all(),r=e.companyOrEvent?t.filter(t=>String(t.title??"").toLowerCase().includes(e.companyOrEvent.toLowerCase())||String(t.summary??"").toLowerCase().includes(e.companyOrEvent.toLowerCase())):t;return{generatedAt:Date.now(),focus:e.companyOrEvent??null,items:r.map(e=>({title:e.title??null,url:e.url??null,source:String(e.source??""),ts:Number(e.ts),summary:e.summary??null,impact:e.impact??null,predictions:e.predictionsJson?JSON.parse(e.predictionsJson):[]}))}}},3341:(e,t,r)=>{"use strict";r.d(t,{Lf:()=>g,t4:()=>y});var i=r(5658);let n=require("better-sqlite3");var s=r.n(n),a=r(3024),o=r.n(a);let u=require("node:path");var l=r.n(u);let c=i.Ik({SQLITE_PATH:i.Yj().default("./data/signalforge.sqlite"),OPENAI_API_KEY:i.Yj().optional(),OPENAI_MODEL:i.Yj().default("gpt-4o-mini"),OPENAI_BASE_URL:i.Yj().optional(),SOURCES_JSON:i.Yj().default("[]"),RSSHUB_BASE_URL:i.Yj().default("https://rsshub.app"),NITTER_BASE_URL:i.Yj().default("https://nitter.net")}).parse(process.env);var d=r(8397);let p=new(r.n(d)());function m(e,t){return e.replace(/\/$/,"")+"/"+t.replace(/^\//,"")}async function E(e,t){return"rss"===e.kind?h(e):"web"===e.kind?T(e):"twitter"===e.kind?A(e,t):[]}async function h(e){return((await p.parseURL(e.url)).items??[]).map(t=>{let r=t.link??void 0,i=t.isoDate?Date.parse(t.isoDate):t.pubDate?Date.parse(t.pubDate):void 0,n=r??`${e.name}:${t.guid??t.title??Math.random().toString(36).slice(2)}`,s=t.contentSnippet??t.content??t["content:encoded"]??void 0;return{id:n,source:e.name,kind:"rss",title:t.title??void 0,url:r,publishedAt:Number.isFinite(i)?i:void 0,content:s,raw:t}})}async function A(e,t){let r;let i=e.provider??"auto";for(let n of function(e){let t=e.handle.replace(/^@/,"").trim(),r=m(e.rsshubBaseUrl,`/twitter/user/${encodeURIComponent(t)}`),i=m(e.nitterBaseUrl,`/${encodeURIComponent(t)}/rss`);return"rsshub"===e.provider?[r]:"nitter"===e.provider?[i]:[r,i]}({handle:e.handle,provider:i,rsshubBaseUrl:t.rsshubBaseUrl,nitterBaseUrl:t.nitterBaseUrl}))try{return((await p.parseURL(n)).items??[]).map(t=>{let r=t.link??void 0,i=t.isoDate?Date.parse(t.isoDate):t.pubDate?Date.parse(t.pubDate):void 0,n=r??`${e.name}:${t.guid??t.title??Math.random().toString(36).slice(2)}`,s=t.contentSnippet??t.content??t["content:encoded"]??void 0;return{id:n,source:e.name,kind:"twitter",title:t.title??void 0,url:r,publishedAt:Number.isFinite(i)?i:void 0,content:s,raw:t}})}catch(e){r=e}throw r??Error("No twitter feed candidate succeeded")}async function T(e){let t=await fetch(e.url,{headers:{"user-agent":"signalforge/0.2 (+https://github.com/dhirajnikam/signalforge)"}}),r=await t.text(),i=e.url,n=r.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim(),s=r.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,6e3);return[{id:i,source:e.name,kind:"web",title:n,url:e.url,publishedAt:Date.now(),content:s,raw:{url:e.url,status:t.status}}]}var S=r(7590);let O=i.Ik({summary:i.Yj(),entities:i.YO(i.Ik({name:i.Yj(),type:i.k5(["company","person","org","place","ticker","event","other"]).default("other"),relevance:i.ai().min(0).max(1).default(.5)})),sentiment:i.ai().min(-1).max(1),impact:i.Yj(),predictions:i.YO(i.Ik({scenario:i.Yj(),horizonHours:i.ai().int().min(1).max(168),probability:i.ai().min(0).max(1),confidence:i.k5(["low","medium","high"])}))});async function f(e){let t;let{item:r,companyOrEvent:i}=e,n=c.OPENAI_API_KEY??process.env.OPENAI_API_KEY,s=c.OPENAI_BASE_URL??process.env.OPENAI_BASE_URL;if(!n)return{summary:(r.title??"Update")+(r.url?` (${r.url})`:""),entities:[],sentiment:0,impact:"No LLM detected in environment; running in no-LLM mode.",predictions:[]};let a=new S.Ay({apiKey:n,baseURL:s}),o=i?`
Focus requested: ${i}`:"",u=`You are SignalForge, a high-signal analyst.

Input item:
- source: ${r.source}
- title: ${r.title??""}
- url: ${r.url??""}
- publishedAt: ${r.publishedAt?new Date(r.publishedAt).toISOString():""}
- content: ${r.content??""}
${o}

Return STRICT JSON matching this schema:
{
  "summary": string,
  "entities": [{"name": string, "type": "company"|"person"|"org"|"place"|"ticker"|"event"|"other", "relevance": number 0..1}],
  "sentiment": number -1..1,
  "impact": string,
  "predictions": [{"scenario": string, "horizonHours": number, "probability": number 0..1, "confidence": "low"|"medium"|"high"}]
}

Rules:
- Be concise but insightful.
- If uncertain, reduce probability and confidence.
- Prefer 2-4 predictions max.
`,l=await a.chat.completions.create({model:c.OPENAI_MODEL,messages:[{role:"system",content:"You output only valid JSON."},{role:"user",content:u}],temperature:.3}),d=l.choices[0]?.message?.content??"{}";try{t=JSON.parse(d)}catch{let e=d.match(/\{[\s\S]*\}/);t=e?JSON.parse(e[0]):{}}return O.parse(t)}let b=null;function g(){return b||(b=function(e){let t=l().dirname(e);t&&"."!==t&&!o().existsSync(t)&&o().mkdirSync(t,{recursive:!0});let r=new(s())(e);return r.pragma("journal_mode = WAL"),r.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT,
      url TEXT,
      publishedAt INTEGER,
      content TEXT,
      rawJson TEXT,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      itemId TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      entitiesJson TEXT,
      sentiment REAL,
      impact TEXT,
      predictionsJson TEXT,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(itemId) REFERENCES items(id) ON DELETE CASCADE
    );
  `),r}(c.SQLITE_PATH)),b}async function y(e){let t=function(e){try{let t=JSON.parse(e);return i.YO(i.gM("kind",[i.Ik({kind:i.eu("rss"),name:i.Yj(),url:i.Yj().url()}),i.Ik({kind:i.eu("web"),name:i.Yj(),url:i.Yj().url()}),i.Ik({kind:i.eu("twitter"),name:i.Yj(),handle:i.Yj(),provider:i.k5(["rsshub","nitter","auto"]).optional()})])).parse(t)}catch{return[]}}(c.SOURCES_JSON),r=[];for(let e of t)try{for(let t of(await E(e,{rsshubBaseUrl:c.RSSHUB_BASE_URL,nitterBaseUrl:c.NITTER_BASE_URL})))g().prepare(`
    INSERT INTO items (id, source, kind, title, url, publishedAt, content, rawJson, createdAt)
    VALUES (@id, @source, @kind, @title, @url, @publishedAt, @content, @rawJson, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      source=excluded.source,
      kind=excluded.kind,
      title=excluded.title,
      url=excluded.url,
      publishedAt=excluded.publishedAt,
      content=excluded.content,
      rawJson=excluded.rawJson
  `).run({id:t.id,source:t.source,kind:t.kind,title:t.title??null,url:t.url??null,publishedAt:t.publishedAt??null,content:t.content??null,rawJson:JSON.stringify(t.raw??null),createdAt:Date.now()}),r.push(t)}catch(t){console.error("source failed",e,t)}let n=g().prepare("SELECT id, source, kind, title, url, publishedAt, content, rawJson, createdAt FROM items ORDER BY COALESCE(publishedAt, createdAt) DESC LIMIT 15").all();for(let t of n){let r={id:t.id,source:t.source,kind:t.kind,title:t.title??void 0,url:t.url??void 0,publishedAt:t.publishedAt??void 0,content:t.content??void 0,raw:t.rawJson?JSON.parse(t.rawJson):null},i=await f({item:r,companyOrEvent:e});g().prepare(`
      INSERT INTO analyses (itemId, summary, entitiesJson, sentiment, impact, predictionsJson, updatedAt)
      VALUES (@itemId, @summary, @entitiesJson, @sentiment, @impact, @predictionsJson, @updatedAt)
      ON CONFLICT(itemId) DO UPDATE SET
        summary=excluded.summary,
        entitiesJson=excluded.entitiesJson,
        sentiment=excluded.sentiment,
        impact=excluded.impact,
        predictionsJson=excluded.predictionsJson,
        updatedAt=excluded.updatedAt
    `).run({itemId:r.id,summary:i.summary,entitiesJson:JSON.stringify(i.entities),sentiment:i.sentiment,impact:i.impact,predictionsJson:JSON.stringify(i.predictions),updatedAt:Date.now()})}return{ingested:r.length,analyzed:Math.min(n.length,15)}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[994,117],()=>r(7495));module.exports=i})();