const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// ── PERSISTENT STATE via global._DB ──────────────────────────────────────────
// KEY FIX: We store a `savedAt` timestamp. The frontend always sends its
// current timestamp when pushing state. The server only resets to defaults
// if it has NEVER been seeded. Once seeded by any client, data persists
// for the lifetime of the serverless instance (warm). On cold restart,
// the FIRST client to login re-seeds the server from their localStorage.
// This means: admin's saved state is the source of truth.

const DEFAULT_SETUPS = [
  {id:'L1',name:'Level 1 — Foundation',criteria:[
    {id:'p2p',lbl:'P2P Meeting',pts:50,on:true},
    {id:'referral',lbl:'Referral Passed',pts:75,on:true},
    {id:'business',lbl:'Business Received',pts:150,on:true},
    {id:'visitor',lbl:'Visitor Invited',pts:40,on:true},
    {id:'board',lbl:'Board Meeting',pts:30,on:true},
    {id:'joint',lbl:'Joint Board Meeting',pts:60,on:true},
    {id:'stakeholder',lbl:'Stakeholders Meet',pts:80,on:true},
    {id:'new_member',lbl:'New Member Induction',pts:200,on:true},
    {id:'no_show',lbl:'No Activity (Penalty)',pts:-100,on:true}
  ]},
  {id:'L2',name:'Level 2 — Advanced',criteria:[
    {id:'p2p',lbl:'P2P Meeting',pts:75,on:true},
    {id:'referral',lbl:'Referral Passed',pts:100,on:true},
    {id:'business',lbl:'Business Received',pts:250,on:true},
    {id:'visitor',lbl:'Visitor Invited',pts:60,on:true},
    {id:'board',lbl:'Board Meeting',pts:50,on:true},
    {id:'joint',lbl:'Joint Board Meeting',pts:90,on:true},
    {id:'stakeholder',lbl:'Stakeholders Meet',pts:120,on:true},
    {id:'new_member',lbl:'New Member Induction',pts:300,on:true},
    {id:'no_show',lbl:'No Activity (Penalty)',pts:-150,on:true}
  ]}
];

const DEFAULT_COMPANIES = [
  {id:1,name:'Timeless Ventures',ticker:'TVV',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:2,name:'Ciara World Ltd.',ticker:'CWL',val:500,chg:0.0,h:[500],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:3,name:'9D Brothers Ltd.',ticker:'9DB',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:4,name:'RN Capital Ventures',ticker:'RNC',val:800,chg:0.0,h:[800],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:5,name:'RR Enterprise',ticker:'RRE',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:6,name:'Dviti Jewels',ticker:'DVJ',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:7,name:'White Ink',ticker:'WHI',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:8,name:'Friends and Company',ticker:'FAC',val:1000,chg:0.0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}}
];

const DEFAULT_CREDS = [
  {id:'harshit_s',u:'harshit.s',p:'harkebi@1',role:'admin',co:'KEBI',part:'Harshit Shah',name:'Harshit Shah',pos:'KEBI'},
  {id:'nikesh_s',u:'nikesh.s',p:'nikkebi@2',role:'admin',co:'KEBI',part:'Nikesh Shah',name:'Nikesh Shah',pos:'KEBI'},
  {id:'rupesh_s',u:'rupesh.s',p:'rupkebi@3',role:'admin',co:'KEBI',part:'Rupesh Shah',name:'Rupesh Shah',pos:'KEBI'},
  {id:'kaushal_s',u:'kaushal.s',p:'kaukebi@4',role:'admin',co:'KEBI',part:'Kaushal Shah',name:'Kaushal Shah',pos:'KEBI'},
  {id:'pratik_p',u:'pratik.p',p:'prakebi@5',role:'admin',co:'KEBI',part:'Pratik Shah',name:'Pratik Shah',pos:'KEBI'},
  {id:'atit_s',u:'atit.s',p:'tva007',role:'participant',co:'Timeless Ventures',part:'Atit Shah',name:'Atit Shah',pos:'Chairman'},
  {id:'margik_d',u:'margik.d',p:'tvm004',role:'participant',co:'Timeless Ventures',part:'Margik Doshi',name:'Margik Doshi',pos:'CEO'},
  {id:'virag_s',u:'virag.s',p:'tvv001',role:'participant',co:'Timeless Ventures',part:'Virag Shah',name:'Virag Shah',pos:'Vice Chairman'},
  {id:'jenil_s',u:'jenil.s',p:'tvj003',role:'participant',co:'Timeless Ventures',part:'Jenil Shah',name:'Jenil Shah',pos:'CFO'},
  {id:'parth_s',u:'parth.s',p:'tvp005',role:'participant',co:'Timeless Ventures',part:'Parth Shah',name:'Parth Shah',pos:'CMO'},
  {id:'yash_v',u:'yash.v',p:'tvy006',role:'participant',co:'Timeless Ventures',part:'Yash Vora',name:'Yash Vora',pos:'CHRO'},
  {id:'hetanshi_s',u:'hetanshi.s',p:'tvh002',role:'participant',co:'Timeless Ventures',part:'Hetanshi Shah',name:'Hetanshi Shah',pos:'CTO'},
  {id:'kushal_c',u:'kushal.c',p:'ciak006',role:'participant',co:'Ciara World Ltd.',part:'Kushal Chokshi',name:'Kushal Chokshi',pos:'Chairman'},
  {id:'gopi_s',u:'gopi.s',p:'ciag001',role:'participant',co:'Ciara World Ltd.',part:'Gopi Shah',name:'Gopi Shah',pos:'CEO'},
  {id:'dharmik_m',u:'dharmik.m',p:'ciad004',role:'participant',co:'Ciara World Ltd.',part:'Dharmik Mehta',name:'Dharmik Mehta',pos:'Vice Chairman'},
  {id:'shruti_j',u:'shruti.j',p:'cias002',role:'participant',co:'Ciara World Ltd.',part:'AR. Shruti Jain',name:'AR. Shruti Jain',pos:'CFO'},
  {id:'chirag_v',u:'chirag.v',p:'ciac003',role:'participant',co:'Ciara World Ltd.',part:'Chirag Vagrecha',name:'Chirag Vagrecha',pos:'CMO'},
  {id:'preet_j',u:'preet.j',p:'ciap005',role:'participant',co:'Ciara World Ltd.',part:'Preet Jain',name:'Preet Jain',pos:'CHRO & CTO'},
  {id:'mayank_j',u:'mayank.j',p:'9dm006',role:'participant',co:'9D Brothers Ltd.',part:'Mayank Jain',name:'Mayank Jain',pos:'Chairman & CFO'},
  {id:'jay_b',u:'jay.b',p:'9dj001',role:'participant',co:'9D Brothers Ltd.',part:'Jay Balu',name:'Jay Balu',pos:'CEO'},
  {id:'smit_s',u:'smit.s',p:'9ds002',role:'participant',co:'9D Brothers Ltd.',part:'Smit Shah',name:'Smit Shah',pos:'Vice Chairman'},
  {id:'fenil_s',u:'fenil.s',p:'9df003',role:'participant',co:'9D Brothers Ltd.',part:'Fenil Shah',name:'Fenil Shah',pos:'CTO'},
  {id:'nil_s',u:'nil.s',p:'9dn004',role:'participant',co:'9D Brothers Ltd.',part:'Nil Shah',name:'Nil Shah',pos:'CMO'},
  {id:'viral_s',u:'viral.s',p:'9dv005',role:'participant',co:'9D Brothers Ltd.',part:'Viral Shah',name:'Viral Shah',pos:'CHRO'},
  {id:'romit_n',u:'romit.n',p:'rnr006',role:'participant',co:'RN Capital Ventures',part:'Romit Nanavati',name:'Romit Nanavati',pos:'Chairman'},
  {id:'saloni_j',u:'saloni.j',p:'rns002',role:'participant',co:'RN Capital Ventures',part:'Saloni Jain',name:'Saloni Jain',pos:'CEO'},
  {id:'tirth_s',u:'tirth.s',p:'rnt003',role:'participant',co:'RN Capital Ventures',part:'Tirth Shah',name:'Tirth Shah',pos:'CFO & Vice Chairman'},
  {id:'kaival_d',u:'kaival.d',p:'rnk004',role:'participant',co:'RN Capital Ventures',part:'Kaival Dholakia',name:'Kaival Dholakia',pos:'CMO'},
  {id:'mukesh_b',u:'mukesh.b',p:'rnm001',role:'participant',co:'RN Capital Ventures',part:'Mukesh Bafna',name:'Mukesh Bafna',pos:'CHRO'},
  {id:'vikas_m',u:'vikas.m',p:'rnv005',role:'participant',co:'RN Capital Ventures',part:'Vikas Mehta',name:'Vikas Mehta',pos:'CTO'},
  {id:'rushil_s',u:'rushil.s',p:'rrr006',role:'participant',co:'RR Enterprise',part:'Rushil Shah',name:'Rushil Shah',pos:'Chairman'},
  {id:'shitul_d',u:'shitul.d',p:'rrs004',role:'participant',co:'RR Enterprise',part:'Shitul Doshi',name:'Shitul Doshi',pos:'CEO'},
  {id:'linesh_b',u:'linesh.b',p:'rrl001',role:'participant',co:'RR Enterprise',part:'Linesh Babariya',name:'Linesh Babariya',pos:'CHRO & Vice Chairman'},
  {id:'darshit_s',u:'darshit.s',p:'rrd002',role:'participant',co:'RR Enterprise',part:'Darshit Shah',name:'Darshit Shah',pos:'CFO'},
  {id:'akansha_t',u:'akansha.t',p:'rra003',role:'participant',co:'RR Enterprise',part:'Akansha Talesra',name:'Akansha Talesra',pos:'CMO'},
  {id:'vishal_s',u:'vishal.s',p:'rrv005',role:'participant',co:'RR Enterprise',part:'Vishal Sheth',name:'Vishal Sheth',pos:'CTO'},
  {id:'sagar_s',u:'sagar.s',p:'djs006',role:'participant',co:'Dviti Jewels',part:'Sagar Shah',name:'Sagar Shah',pos:'Chairman'},
  {id:'rahul_s',u:'rahul.s',p:'djs001',role:'participant',co:'Dviti Jewels',part:'Rahul Shah',name:'Rahul Shah',pos:'CEO'},
  {id:'aakash_p',u:'aakash.p',p:'dja003',role:'participant',co:'Dviti Jewels',part:'Aakash Panchal',name:'Aakash Panchal',pos:'CTO & Vice Chairman'},
  {id:'anjali_s',u:'anjali.s',p:'dja002',role:'participant',co:'Dviti Jewels',part:'Anjali Shah',name:'Anjali Shah',pos:'CMO'},
  {id:'mehul_s',u:'mehul.s',p:'djm004',role:'participant',co:'Dviti Jewels',part:'Mehul Shah',name:'Mehul Shah',pos:'CFO'},
  {id:'kathan_d',u:'kathan.d',p:'djk005',role:'participant',co:'Dviti Jewels',part:'Kathan Doshi',name:'Kathan Doshi',pos:'CHRO'},
  {id:'sarthak_s',u:'sarthak.s',p:'whs007',role:'participant',co:'White Ink',part:'Sarthak Shah',name:'Sarthak Shah',pos:'Chairman'},
  {id:'jinen_u',u:'jinen.u',p:'whj004',role:'participant',co:'White Ink',part:'JINEN UDANI',name:'JINEN UDANI',pos:'CEO'},
  {id:'avisha_s',u:'avisha.s',p:'wha001',role:'participant',co:'White Ink',part:'Avisha Shah',name:'Avisha Shah',pos:'Vice Chairman'},
  {id:'vatsal_m',u:'vatsal.m',p:'whv003',role:'participant',co:'White Ink',part:'Vatsal Mehta',name:'Vatsal Mehta',pos:'CFO'},
  {id:'khushbu_s',u:'khushbu.s',p:'whk002',role:'participant',co:'White Ink',part:'Khushbu Shah',name:'Khushbu Shah',pos:'CMO'},
  {id:'kushal_b',u:'kushal.b',p:'whk005',role:'participant',co:'White Ink',part:'Kushal Bhansali',name:'Kushal Bhansali',pos:'CHRO'},
  {id:'nirdesh_s',u:'nirdesh.s',p:'whn006',role:'participant',co:'White Ink',part:'Nirdesh Shah',name:'Nirdesh Shah',pos:'CTO'},
  {id:'vaibhav_s',u:'vaibhav.s',p:'facv006',role:'participant',co:'Friends and Company',part:'Vaibhav Shah',name:'Vaibhav Shah',pos:'Chairman'},
  {id:'vatsal_s',u:'vatsal.s',p:'facv003',role:'participant',co:'Friends and Company',part:'Vatsal Shah',name:'Vatsal Shah',pos:'CEO'},
  {id:'priyesh_s',u:'priyesh.s',p:'facp004',role:'participant',co:'Friends and Company',part:'Priyesh Shah',name:'Priyesh Shah',pos:'CTO & Vice Chairman'},
  {id:'jasmin_v',u:'jasmin.v',p:'facj001',role:'participant',co:'Friends and Company',part:'Jasmin Vakheria',name:'Jasmin Vakheria',pos:'CFO'},
  {id:'karishma_m',u:'karishma.m',p:'facm002',role:'participant',co:'Friends and Company',part:'Dr Karishma Mehta',name:'Dr Karishma Mehta',pos:'CMO'},
  {id:'priyanka_s',u:'priyanka.s',p:'facp005',role:'participant',co:'Friends and Company',part:'Priyanka Shah',name:'Priyanka Shah',pos:'CHRO'}
];

// Initialize DB — only reset to defaults if truly empty (first ever boot)
if (!global._DB) {
  global._DB = {
    seeded: false,          // ← KEY: false = waiting for first client seed
    savedAt: null,          // ← timestamp of last save from any client
    companies: JSON.parse(JSON.stringify(DEFAULT_COMPANIES)),
    teams: [],
    participants: [],
    credentials: JSON.parse(JSON.stringify(DEFAULT_CREDS)),
    setups: JSON.parse(JSON.stringify(DEFAULT_SETUPS)),
    submissions: [],
    gallery: [],
    ledger: [],
    dissolved: [],
    weekMultipliers: [{wk:'W-01',bull:1.0,bear:1.0},{wk:'W-02',bull:1.2,bear:0.8},{wk:'W-03',bull:1.5,bear:0.7},{wk:'W-04',bull:2.0,bear:0.5}],
    news: [
      {t:'KVL Season 01 is LIVE — 8 ventures competing for market supremacy!',up:true},
      {t:'Welcome to Kohinoor Ventures League — JBN LT05 Season 01',up:true}
    ],
    currentWeek: 'W-01',
    actST: 'L1'
  };
}
const DB = global._DB;

// Auth middleware
function auth(req,res,next){
  const t=req.headers['x-kvl-token'];
  if(!t)return res.status(401).json({error:'No token'});
  const u=DB.credentials.find(c=>c.id===t);
  if(!u)return res.status(401).json({error:'Invalid token'});
  req.user=u;next();
}
function adm(req,res,next){
  if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});
  next();
}

// Health
app.get('/api/health',(req,res)=>res.json({ok:true,ts:new Date().toISOString(),savedAt:DB.savedAt,seeded:DB.seeded}));

// Login
app.post('/api/login',(req,res)=>{
  const{u,p}=req.body;
  const user=DB.credentials.find(c=>c.u===u&&c.p===p);
  if(!user)return res.status(401).json({error:'Invalid credentials'});
  res.json({
    token:user.id,
    user:{id:user.id,u:user.u,role:user.role,co:user.co,part:user.part,name:user.name,pos:user.pos},
    serverSeeded: DB.seeded   // ← tells frontend if server has real data
  });
});

// GET full state — returns server state
// If server was cold-reset (seeded=false), client should push its localStorage data
app.get('/api/state',auth,(req,res)=>{
  res.json({
    companies:DB.companies,
    teams:DB.teams,
    participants:DB.participants,
    setups:DB.setups,
    submissions:DB.submissions,
    gallery:DB.gallery||[],
    ledger:DB.ledger||[],
    dissolved:DB.dissolved||[],
    weekMultipliers:DB.weekMultipliers,
    news:DB.news,
    currentWeek:DB.currentWeek,
    actST:DB.actST,
    credentials:req.user.role==='admin'?DB.credentials:[],
    savedAt:DB.savedAt,
    seeded:DB.seeded
  });
});

// POST state — any authenticated client can seed (reseed after cold start)
// Admin can push full state; participants can push their partial state to reseed
app.post('/api/state',auth,(req,res)=>{
  const isAdmin = req.user.role==='admin';
  const{companies,teams,participants,setups,submissions,gallery,ledger,
        dissolved,weekMultipliers,news,currentWeek,actST,clientSavedAt}=req.body;

  // KEY FIX: Accept state if:
  // (a) server is not yet seeded (cold start), OR
  // (b) client data is newer than server data (clientSavedAt > DB.savedAt), OR
  // (c) it's an admin push (always authoritative)
  const clientTs = clientSavedAt ? new Date(clientSavedAt).getTime() : 0;
  const serverTs = DB.savedAt ? new Date(DB.savedAt).getTime() : 0;
  const shouldAccept = !DB.seeded || isAdmin || clientTs > serverTs;

  if(!shouldAccept){
    // Server has newer data — just return current server state (client will sync)
    return res.json({ok:true,skipped:true,reason:'server_has_newer_data'});
  }

  // Update only fields that are provided and non-empty
  if(companies&&companies.length)DB.companies=companies;
  if(teams&&teams.length)DB.teams=teams;
  if(participants&&participants.length)DB.participants=participants;
  if(setups&&setups.length)DB.setups=setups;
  // Submissions: always take the larger set (never lose approved data)
  if(submissions){
    if(!DB.seeded||submissions.length>=DB.submissions.length){
      DB.submissions=submissions;
    } else {
      // Merge: keep all server submissions + any new ones from client
      const serverIds=new Set(DB.submissions.map(s=>s.id));
      const newOnes=submissions.filter(s=>!serverIds.has(s.id));
      if(newOnes.length)DB.submissions=[...DB.submissions,...newOnes];
    }
  }
  if(gallery){
    if(!DB.seeded||gallery.length>=DB.gallery.length)DB.gallery=gallery;
    else{
      const gIds=new Set(DB.gallery.map(g=>g.photo));
      const newG=gallery.filter(g=>!gIds.has(g.photo));
      if(newG.length)DB.gallery=[...DB.gallery,...newG];
    }
  }
  if(ledger){
    if(!DB.seeded||ledger.length>=DB.ledger.length)DB.ledger=ledger;
    else{
      const lIds=new Set(DB.ledger.map(l=>l.id));
      const newL=ledger.filter(l=>!lIds.has(l.id));
      if(newL.length)DB.ledger=[...DB.ledger,...newL];
    }
  }
  if(dissolved)DB.dissolved=dissolved;
  if(weekMultipliers&&weekMultipliers.length)DB.weekMultipliers=weekMultipliers;
  if(news&&news.length)DB.news=news;
  if(currentWeek)DB.currentWeek=currentWeek;
  if(actST)DB.actST=actST;

  DB.seeded=true;
  DB.savedAt=new Date().toISOString();
  res.json({ok:true,savedAt:DB.savedAt});
});

// Submit activity (participant or admin)
app.post('/api/submit',auth,(req,res)=>{
  if(req.user.role==='viewer')return res.status(403).json({error:'Viewer cannot submit'});
  const sub={...req.body,id:uuidv4(),by:req.user.id,status:'pending',date:new Date().toLocaleString('en-IN')};
  DB.submissions.push(sub);
  if(sub.photo){
    if(!DB.gallery)DB.gallery=[];
    DB.gallery.push({photo:sub.photo,co:sub.co,by:sub.participant,type:sub.type,date:sub.date,status:'pending'});
  }
  const co=DB.companies.find(c=>c.name===sub.co);
  if(co&&co.acts&&sub.tId&&sub.tId in co.acts)co.acts[sub.tId]=(co.acts[sub.tId]||0)+1;
  DB.news.unshift({t:`🔔 ${sub.participant||sub.co} submitted ${sub.type} — pending approval`,up:true});
  if(DB.news.length>30)DB.news=DB.news.slice(0,30);
  DB.seeded=true;
  DB.savedAt=new Date().toISOString();
  res.json({ok:true,sub});
});

// Approve submission — updates valuation on server immediately
app.post('/api/approve/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='approved';
  const co=DB.companies.find(c=>c.name===sub.co);
  const pts=Number(sub.pts)||0;
  if(co){
    const old=co.val||1000;
    co.val=Math.max(100,(co.val||1000)+pts);
    co.chg=parseFloat(((co.val-old)/old*100).toFixed(1));
    co.h.push(co.val);
    if(co.h.length>20)co.h.shift();
  }
  // Add approved photo to gallery
  if(sub.photo){
    if(!DB.gallery)DB.gallery=[];
    // Update existing pending entry or add new one
    const existing=DB.gallery.find(g=>g.photo===sub.photo);
    if(existing)existing.status='approved';
    else DB.gallery.push({photo:sub.photo,co:sub.co,by:sub.participant,type:sub.type,date:sub.date,status:'approved'});
  }
  if(!DB.ledger)DB.ledger=[];
  DB.ledger.push({
    id:uuidv4(),co:sub.co,member:sub.participant,pts:pts,
    reason:sub.type+' APPROVED',type:'APPROVAL',
    date:new Date().toLocaleString('en-IN'),by:req.user.u
  });
  DB.news.unshift({t:`✅ ${sub.co} — ${sub.type} APPROVED · ${pts>=0?'+':''}${pts} pts · ${sub.participant}`,up:sub.pts>=0});
  if(DB.news.length>30)DB.news=DB.news.slice(0,30);
  DB.savedAt=new Date().toISOString();
  res.json({ok:true,companies:DB.companies,gallery:DB.gallery});
});

app.post('/api/reject/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='rejected';
  DB.savedAt=new Date().toISOString();
  res.json({ok:true});
});

// Credential management (admin only)
app.post('/api/credentials',auth,adm,(req,res)=>{
  if(DB.credentials.find(c=>c.u===req.body.u))return res.status(400).json({error:'Username exists'});
  const c={...req.body,id:uuidv4()};
  DB.credentials.push(c);
  res.json(c);
});
app.delete('/api/credentials/:id',auth,adm,(req,res)=>{
  const c=DB.credentials.find(x=>x.id===req.params.id);
  if(c?.role==='admin')return res.status(403).json({error:'Cannot delete admin'});
  DB.credentials=DB.credentials.filter(x=>x.id!==req.params.id);
  res.json({ok:true});
});

// Serve frontend
app.use(express.static(path.join(__dirname,'../public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));

module.exports=app;
