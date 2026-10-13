'use strict';
// Event identities track documents, not visit dates: a late-added document stays unread.
globalThis.OpoRadarEvents={
  collect(record){
    const events=[{date:record.publishedOn,title:'Bases y convocatoria',url:record.url},{date:record.boePublishedOn,title:'Publicación en el boletín',url:record.boeUrl},...(record.announcements||[]),...Object.entries(record.milestones||{}).map(([kind,e])=>({date:e.publishedOn,title:e.text||kind,url:e.url})),...(record.closure?[{date:record.closure.publishedOn,title:record.closure.text,url:record.closure.url}]:[])];
    const unique=new Map();
    for(const event of events){try{if(!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||!event.title||new URL(event.url).protocol!=='https:')continue;let hash=14695981039346656037n;for(const ch of JSON.stringify([record.id,event.date,event.url]))hash=BigInt.asUintN(64,(hash^BigInt(ch.codePointAt(0)))*1099511628211n);const id=record.id+':'+hash.toString(16);unique.set(id,{...event,id,opportunityId:record.id,opportunityTitle:record.title,organism:record.organism});}catch{}}
    return [...unique.values()].sort((a,b)=>b.date.localeCompare(a.date));
  }
};
