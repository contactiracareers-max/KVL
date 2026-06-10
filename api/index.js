const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const https = require('https');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// ══════════════════════════════════════════════════════════════════════
// PERMANENT PERSISTENCE via Vercel Environment Variables API
// 
// HOW IT WORKS:
//   1. On cold start: load state from KVL_STATE env var (set by previous save)
//   2. On every admin save: call Vercel API to update KVL_STATE env var
//   3. Redeploy is NOT needed — env vars update live for next request
//
// This survives:
//   ✅ Container recycles (every few hours on Vercel free tier)
//   ✅ New deployments (env vars persist across deploys)
//   ✅ Multiple serverless instances (all read same env var on boot)
//
// SETUP NEEDED (one time, in Vercel dashboard):
//   Add env var: KVL_STATE = {} (empty object, any value)
//   Add env var: VERCEL_TOKEN = your Vercel API token  
//   Add env var: VERCEL_PROJECT_ID = prj_mpOE7BHc5B04ExLZzn50ZBRkpuPN
//   Add env var: VERCEL_TEAM_ID = team_bK3DuWHqm78H2RJSY75Ay9pr
// ══════════════════════════════════════════════════════════════════════

const VERCEL_TOKEN      = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_mpOE7BHc5B04ExLZzn50ZBRkpuPN';
const VERCEL_TEAM_ID    = process.env.VERCEL_TEAM_ID    || 'team_bK3DuWHqm78H2RJSY75Ay9pr';

// Save state to Vercel env var (async, non-blocking)
function persistToVercel(state) {
  if (!VERCEL_TOKEN) return; // skip if token not configured
  try {
    const compressed = JSON.stringify({
      companies: state.companies,
      setups: state.setups,
      submissions: state.submissions,
      weekMultipliers: state.weekMultipliers,
      actST: state.actST,
      ledger: state.ledger,
      dissolved: state.dissolved,
      news: state.news.slice(0,20),
      gallery: state.gallery.map(g=>({...g, photo: g.photo?.slice(0,100)||''})), // strip base64 for size
      savedAt: state.savedAt
    });
    const value = Buffer.from(compressed).toString('base64');
    const payload = JSON.stringify({
      key: 'KVL_STATE',
      value,
      type: 'plain',
      target: ['production','preview','development']
    });
    const url = `/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}&upsert=true`;
    const req = https.request({
      hostname: 'api.vercel.com',
      path: url,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{
        if(res.statusCode===200||res.statusCode===201)
          console.log('✅ State persisted to Vercel env var');
        else
          console.log('⚠️  Vercel persist status:', res.statusCode, d.slice(0,100));
      });
    });
    req.on('error', e => console.log('Vercel persist error:', e.message));
    req.write(payload);
    req.end();
  } catch(e) { console.log('Persist error:', e.message); }
}

// Load state from KVL_STATE env var (set by previous persistToVercel call)
function loadFromEnv() {
  const raw = process.env.KVL_STATE;
  if (!raw || raw === '{}' || raw.length < 10) return null;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const state = JSON.parse(decoded);
    if (state && state.setups && state.companies) {
      console.log('✅ Loaded state from env var, savedAt:', state.savedAt);
      return state;
    }
  } catch(e) { console.log('Env load error:', e.message); }
  return null;
}

// ── DEFAULT DATA ──────────────────────────────────────────────────────
const DEFAULT_COMPANIES = [
  {id:1,name:'Timeless Ventures',ticker:'TVV',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:2,name:'Ciara World Ltd.',ticker:'CWL',val:500,chg:0,h:[500],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:3,name:'9D Brothers Ltd.',ticker:'9DB',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:4,name:'RN Capital Ventures',ticker:'RNC',val:800,chg:0,h:[800],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:5,name:'RR Enterprise',ticker:'RRE',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:6,name:'Dviti Jewels',ticker:'DVJ',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:7,name:'White Ink',ticker:'WHI',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:8,name:'Friends and Company',ticker:'FAC',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}}
];
const DEFAULT_SETUPS = [
  {id:'L1',name:'Level 1 — Foundation',criteria:[
    {id:'p2p',lbl:'P2P Meeting',pts:50,on:true},{id:'referral',lbl:'Referral Passed',pts:75,on:true},
    {id:'business',lbl:'Business Received',pts:150,on:true},{id:'visitor',lbl:'Visitor Invited',pts:40,on:true},
    {id:'board',lbl:'Board Meeting',pts:30,on:true},{id:'joint',lbl:'Joint Board Meeting',pts:60,on:true},
    {id:'stakeholder',lbl:'Stakeholders Meet',pts:80,on:true},{id:'new_member',lbl:'New Member Induction',pts:200,on:true},
    {id:'no_show',lbl:'No Activity (Penalty)',pts:-100,on:true}
  ]},
  {id:'L2',name:'Level 2 — Advanced',criteria:[
    {id:'p2p',lbl:'P2P Meeting',pts:75,on:true},{id:'referral',lbl:'Referral Passed',pts:100,on:true},
    {id:'business',lbl:'Business Received',pts:250,on:true},{id:'visitor',lbl:'Visitor Invited',pts:60,on:true},
    {id:'board',lbl:'Board Meeting',pts:50,on:true},{id:'joint',lbl:'Joint Board Meeting',pts:90,on:true},
    {id:'stakeholder',lbl:'Stakeholders Meet',pts:120,on:true},{id:'new_member',lbl:'New Member Induction',pts:300,on:true},
    {id:'no_show',lbl:'No Activity (Penalty)',pts:-150,on:true}
  ]}
];
const DEFAULT_WM = [{wk:'W-01',bull:1.0,bear:1.0},{wk:'W-02',bull:1.2,bear:0.8},{wk:'W-03',bull:1.5,bear:0.7},{wk:'W-04',bull:2.0,bear:0.5}];
const DEFAULT_NEWS = [{t:'KVL Season 01 is LIVE — 8 ventures competing!',up:true},{t:'Welcome to Kohinoor Ventures League — JBN LT05',up:true}];
const DEFAULT_PARTICIPANTS = [
  {co:'Timeless Ventures',name:'Atit Shah',pos:'Chairman'},{co:'Timeless Ventures',name:'Margik Doshi',pos:'CEO'},
  {co:'Timeless Ventures',name:'Virag Shah',pos:'Vice Chairman'},{co:'Timeless Ventures',name:'Jenil Shah',pos:'CFO'},
  {co:'Timeless Ventures',name:'Parth Shah',pos:'CMO'},{co:'Timeless Ventures',name:'Yash Vora',pos:'CHRO'},
  {co:'Timeless Ventures',name:'Hetanshi Shah',pos:'CTO'},{co:'Ciara World Ltd.',name:'Kushal Chokshi',pos:'Chairman'},
  {co:'Ciara World Ltd.',name:'Gopi Shah',pos:'CEO'},{co:'Ciara World Ltd.',name:'Dharmik Mehta',pos:'Vice Chairman'},
  {co:'Ciara World Ltd.',name:'AR. Shruti Jain',pos:'CFO'},{co:'Ciara World Ltd.',name:'Chirag Vagrecha',pos:'CMO'},
  {co:'Ciara World Ltd.',name:'Preet Jain',pos:'CHRO & CTO'},{co:'9D Brothers Ltd.',name:'Mayank Jain',pos:'Chairman & CFO'},
  {co:'9D Brothers Ltd.',name:'Jay Balu',pos:'CEO'},{co:'9D Brothers Ltd.',name:'Smit Shah',pos:'Vice Chairman'},
  {co:'9D Brothers Ltd.',name:'Fenil Shah',pos:'CTO'},{co:'9D Brothers Ltd.',name:'Nil Shah',pos:'CMO'},
  {co:'9D Brothers Ltd.',name:'Viral Shah',pos:'CHRO'},{co:'RN Capital Ventures',name:'Romit Nanavati',pos:'Chairman'},
  {co:'RN Capital Ventures',name:'Saloni Jain',pos:'CEO'},{co:'RN Capital Ventures',name:'Tirth Shah',pos:'CFO & Vice Chairman'},
  {co:'RN Capital Ventures',name:'Kaival Dholakia',pos:'CMO'},{co:'RN Capital Ventures',name:'Mukesh Bafna',pos:'CHRO'},
  {co:'RN Capital Ventures',name:'Vikas Mehta',pos:'CTO'},{co:'RR Enterprise',name:'Rushil Shah',pos:'Chairman'},
  {co:'RR Enterprise',name:'Shitul Doshi',pos:'CEO'},{co:'RR Enterprise',name:'Linesh Babariya',pos:'CHRO & Vice Chairman'},
  {co:'RR Enterprise',name:'Darshit Shah',pos:'CFO'},{co:'RR Enterprise',name:'Akansha Talesra',pos:'CMO'},
  {co:'RR Enterprise',name:'Vishal Sheth',pos:'CTO'},{co:'Dviti Jewels',name:'Sagar Shah',pos:'Chairman'},
  {co:'Dviti Jewels',name:'Rahul Shah',pos:'CEO'},{co:'Dviti Jewels',name:'Aakash Panchal',pos:'CTO & Vice Chairman'},
  {co:'Dviti Jewels',name:'Anjali Shah',pos:'CMO'},{co:'Dviti Jewels',name:'Mehul Shah',pos:'CFO'},
  {co:'Dviti Jewels',name:'Kathan Doshi',pos:'CHRO'},{co:'White Ink',name:'Sarthak Shah',pos:'Chairman'},
  {co:'White Ink',name:'JINEN UDANI',pos:'CEO'},{co:'White Ink',name:'Avisha Shah',pos:'Vice Chairman'},
  {co:'White Ink',name:'Vatsal Mehta',pos:'CFO'},{co:'White Ink',name:'Khushbu Shah',pos:'CMO'},
  {co:'White Ink',name:'Kushal Bhansali',pos:'CHRO'},{co:'White Ink',name:'Nirdesh Shah',pos:'CTO'},
  {co:'Friends and Company',name:'Vaibhav Shah',pos:'Chairman'},{co:'Friends and Company',name:'Vatsal Shah',pos:'CEO'},
  {co:'Friends and Company',name:'Priyesh Shah',pos:'CTO & Vice Chairman'},{co:'Friends and Company',name:'Jasmin Vakheria',pos:'CFO'},
  {co:'Friends and Company',name:'Dr Karishma Mehta',pos:'CMO'},{co:'Friends and Company',name:'Priyanka Shah',pos:'CHRO'}
];
const DEFAULT_TEAMS = [
  {id:1,name:'Timeless Ventures',color:'#FFD700',members:[{name:'Atit Shah'},{name:'Margik Doshi'},{name:'Virag Shah'},{name:'Jenil Shah'},{name:'Parth Shah'},{name:'Yash Vora'},{name:'Hetanshi Shah'}]},
  {id:2,name:'Ciara World Ltd.',color:'#00E5FF',members:[{name:'Kushal Chokshi'},{name:'Gopi Shah'},{name:'Dharmik Mehta'},{name:'AR. Shruti Jain'},{name:'Chirag Vagrecha'},{name:'Preet Jain'}]},
  {id:3,name:'9D Brothers Ltd.',color:'#7C3AED',members:[{name:'Mayank Jain'},{name:'Jay Balu'},{name:'Smit Shah'},{name:'Fenil Shah'},{name:'Nil Shah'},{name:'Viral Shah'}]},
  {id:4,name:'RN Capital Ventures',color:'#F0134D',members:[{name:'Romit Nanavati'},{name:'Saloni Jain'},{name:'Tirth Shah'},{name:'Kaival Dholakia'},{name:'Mukesh Bafna'},{name:'Vikas Mehta'}]},
  {id:5,name:'RR Enterprise',color:'#448AFF',members:[{name:'Rushil Shah'},{name:'Shitul Doshi'},{name:'Linesh Babariya'},{name:'Darshit Shah'},{name:'Akansha Talesra'},{name:'Vishal Sheth'}]},
  {id:6,name:'Dviti Jewels',color:'#FF6B35',members:[{name:'Sagar Shah'},{name:'Rahul Shah'},{name:'Aakash Panchal'},{name:'Anjali Shah'},{name:'Mehul Shah'},{name:'Kathan Doshi'}]},
  {id:7,name:'White Ink',color:'#00BCD4',members:[{name:'Sarthak Shah'},{name:'JINEN UDANI'},{name:'Avisha Shah'},{name:'Vatsal Mehta'},{name:'Khushbu Shah'},{name:'Kushal Bhansali'},{name:'Nirdesh Shah'}]},
  {id:8,name:'Friends and Company',color:'#9C27B0',members:[{name:'Vaibhav Shah'},{name:'Vatsal Shah'},{name:'Priyesh Shah'},{name:'Jasmin Vakheria'},{name:'Dr Karishma Mehta'},{name:'Priyanka Shah'}]}
];
const DEFAULT_CREDS = [
  {id:'harshit_s',u:'harshit.s',p:'harkebi@1',role:'admin',co:'KEBI',name:'Harshit Shah',pos:'KEBI'},
  {id:'nikesh_s',u:'nikesh.s',p:'nikkebi@2',role:'admin',co:'KEBI',name:'Nikesh Shah',pos:'KEBI'},
  {id:'rupesh_s',u:'rupesh.s',p:'rupkebi@3',role:'admin',co:'KEBI',name:'Rupesh Shah',pos:'KEBI'},
  {id:'kaushal_s',u:'kaushal.s',p:'kaukebi@4',role:'admin',co:'KEBI',name:'Kaushal Shah',pos:'KEBI'},
  {id:'pratik_p',u:'pratik.p',p:'prakebi@5',role:'admin',co:'KEBI',name:'Pratik Shah',pos:'KEBI'},
  {id:'atit_s',u:'atit.s',p:'tva007',role:'participant',co:'Timeless Ventures',name:'Atit Shah',pos:'Chairman'},
  {id:'margik_d',u:'margik.d',p:'tvm004',role:'participant',co:'Timeless Ventures',name:'Margik Doshi',pos:'CEO'},
  {id:'virag_s',u:'virag.s',p:'tvv001',role:'participant',co:'Timeless Ventures',name:'Virag Shah',pos:'Vice Chairman'},
  {id:'jenil_s',u:'jenil.s',p:'tvj003',role:'participant',co:'Timeless Ventures',name:'Jenil Shah',pos:'CFO'},
  {id:'parth_s',u:'parth.s',p:'tvp005',role:'participant',co:'Timeless Ventures',name:'Parth Shah',pos:'CMO'},
  {id:'yash_v',u:'yash.v',p:'tvy006',role:'participant',co:'Timeless Ventures',name:'Yash Vora',pos:'CHRO'},
  {id:'hetanshi_s',u:'hetanshi.s',p:'tvh002',role:'participant',co:'Timeless Ventures',name:'Hetanshi Shah',pos:'CTO'},
  {id:'kushal_c',u:'kushal.c',p:'ciak006',role:'participant',co:'Ciara World Ltd.',name:'Kushal Chokshi',pos:'Chairman'},
  {id:'gopi_s',u:'gopi.s',p:'ciag001',role:'participant',co:'Ciara World Ltd.',name:'Gopi Shah',pos:'CEO'},
  {id:'dharmik_m',u:'dharmik.m',p:'ciad004',role:'participant',co:'Ciara World Ltd.',name:'Dharmik Mehta',pos:'Vice Chairman'},
  {id:'shruti_j',u:'shruti.j',p:'cias002',role:'participant',co:'Ciara World Ltd.',name:'AR. Shruti Jain',pos:'CFO'},
  {id:'chirag_v',u:'chirag.v',p:'ciac003',role:'participant',co:'Ciara World Ltd.',name:'Chirag Vagrecha',pos:'CMO'},
  {id:'preet_j',u:'preet.j',p:'ciap005',role:'participant',co:'Ciara World Ltd.',name:'Preet Jain',pos:'CHRO & CTO'},
  {id:'mayank_j',u:'mayank.j',p:'9dm006',role:'participant',co:'9D Brothers Ltd.',name:'Mayank Jain',pos:'Chairman & CFO'},
  {id:'jay_b',u:'jay.b',p:'9dj001',role:'participant',co:'9D Brothers Ltd.',name:'Jay Balu',pos:'CEO'},
  {id:'smit_s',u:'smit.s',p:'9ds002',role:'participant',co:'9D Brothers Ltd.',name:'Smit Shah',pos:'Vice Chairman'},
  {id:'fenil_s',u:'fenil.s',p:'9df003',role:'participant',co:'9D Brothers Ltd.',name:'Fenil Shah',pos:'CTO'},
  {id:'nil_s',u:'nil.s',p:'9dn004',role:'participant',co:'9D Brothers Ltd.',name:'Nil Shah',pos:'CMO'},
  {id:'viral_s',u:'viral.s',p:'9dv005',role:'participant',co:'9D Brothers Ltd.',name:'Viral Shah',pos:'CHRO'},
  {id:'romit_n',u:'romit.n',p:'rnr006',role:'participant',co:'RN Capital Ventures',name:'Romit Nanavati',pos:'Chairman'},
  {id:'saloni_j',u:'saloni.j',p:'rns002',role:'participant',co:'RN Capital Ventures',name:'Saloni Jain',pos:'CEO'},
  {id:'tirth_s',u:'tirth.s',p:'rnt003',role:'participant',co:'RN Capital Ventures',name:'Tirth Shah',pos:'CFO & Vice Chairman'},
  {id:'kaival_d',u:'kaival.d',p:'rnk004',role:'participant',co:'RN Capital Ventures',name:'Kaival Dholakia',pos:'CMO'},
  {id:'mukesh_b',u:'mukesh.b',p:'rnm001',role:'participant',co:'RN Capital Ventures',name:'Mukesh Bafna',pos:'CHRO'},
  {id:'vikas_m',u:'vikas.m',p:'rnv005',role:'participant',co:'RN Capital Ventures',name:'Vikas Mehta',pos:'CTO'},
  {id:'rushil_s',u:'rushil.s',p:'rrr006',role:'participant',co:'RR Enterprise',name:'Rushil Shah',pos:'Chairman'},
  {id:'shitul_d',u:'shitul.d',p:'rrs004',role:'participant',co:'RR Enterprise',name:'Shitul Doshi',pos:'CEO'},
  {id:'linesh_b',u:'linesh.b',p:'rrl001',role:'participant',co:'RR Enterprise',name:'Linesh Babariya',pos:'CHRO & Vice Chairman'},
  {id:'darshit_s',u:'darshit.s',p:'rrd002',role:'participant',co:'RR Enterprise',name:'Darshit Shah',pos:'CFO'},
  {id:'akansha_t',u:'akansha.t',p:'rra003',role:'participant',co:'RR Enterprise',name:'Akansha Talesra',pos:'CMO'},
  {id:'vishal_s',u:'vishal.s',p:'rrv005',role:'participant',co:'RR Enterprise',name:'Vishal Sheth',pos:'CTO'},
  {id:'sagar_s',u:'sagar.s',p:'djs006',role:'participant',co:'Dviti Jewels',name:'Sagar Shah',pos:'Chairman'},
  {id:'rahul_s',u:'rahul.s',p:'djs001',role:'participant',co:'Dviti Jewels',name:'Rahul Shah',pos:'CEO'},
  {id:'aakash_p',u:'aakash.p',p:'dja003',role:'participant',co:'Dviti Jewels',name:'Aakash Panchal',pos:'CTO & Vice Chairman'},
  {id:'anjali_s',u:'anjali.s',p:'dja002',role:'participant',co:'Dviti Jewels',name:'Anjali Shah',pos:'CMO'},
  {id:'mehul_s',u:'mehul.s',p:'djm004',role:'participant',co:'Dviti Jewels',name:'Mehul Shah',pos:'CFO'},
  {id:'kathan_d',u:'kathan.d',p:'djk005',role:'participant',co:'Dviti Jewels',name:'Kathan Doshi',pos:'CHRO'},
  {id:'sarthak_s',u:'sarthak.s',p:'whs007',role:'participant',co:'White Ink',name:'Sarthak Shah',pos:'Chairman'},
  {id:'jinen_u',u:'jinen.u',p:'whj004',role:'participant',co:'White Ink',name:'JINEN UDANI',pos:'CEO'},
  {id:'avisha_s',u:'avisha.s',p:'wha001',role:'participant',co:'White Ink',name:'Avisha Shah',pos:'Vice Chairman'},
  {id:'vatsal_m',u:'vatsal.m',p:'whv003',role:'participant',co:'White Ink',name:'Vatsal Mehta',pos:'CFO'},
  {id:'khushbu_s',u:'khushbu.s',p:'whk002',role:'participant',co:'White Ink',name:'Khushbu Shah',pos:'CMO'},
  {id:'kushal_b',u:'kushal.b',p:'whk005',role:'participant',co:'White Ink',name:'Kushal Bhansali',pos:'CHRO'},
  {id:'nirdesh_s',u:'nirdesh.s',p:'whn006',role:'participant',co:'White Ink',name:'Nirdesh Shah',pos:'CTO'},
  {id:'vaibhav_s',u:'vaibhav.s',p:'facv006',role:'participant',co:'Friends and Company',name:'Vaibhav Shah',pos:'Chairman'},
  {id:'vatsal_s',u:'vatsal.s',p:'facv003',role:'participant',co:'Friends and Company',name:'Vatsal Shah',pos:'CEO'},
  {id:'priyesh_s',u:'priyesh.s',p:'facp004',role:'participant',co:'Friends and Company',name:'Priyesh Shah',pos:'CTO & Vice Chairman'},
  {id:'jasmin_v',u:'jasmin.v',p:'facj001',role:'participant',co:'Friends and Company',name:'Jasmin Vakheria',pos:'CFO'},
  {id:'karishma_m',u:'karishma.m',p:'facm002',role:'participant',co:'Friends and Company',name:'Dr Karishma Mehta',pos:'CMO'},
  {id:'priyanka_s',u:'priyanka.s',p:'facp005',role:'participant',co:'Friends and Company',name:'Priyanka Shah',pos:'CHRO'}
];

// ── INIT DB ──────────────────────────────────────────────────────────
function initDB() {
  if (global._DB && global._DB.seeded) return global._DB;
  // Try loading from env var (survives container recycles)
  const saved = loadFromEnv();
  if (saved) {
    global._DB = {
      seeded: true,
      savedAt: saved.savedAt,
      companies: saved.companies || JSON.parse(JSON.stringify(DEFAULT_COMPANIES)),
      teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
      participants: JSON.parse(JSON.stringify(DEFAULT_PARTICIPANTS)),
      credentials: JSON.parse(JSON.stringify(DEFAULT_CREDS)),
      setups: saved.setups || JSON.parse(JSON.stringify(DEFAULT_SETUPS)),
      submissions: saved.submissions || [],
      gallery: saved.gallery || [],
      ledger: saved.ledger || [],
      dissolved: saved.dissolved || [],
      weekMultipliers: saved.weekMultipliers || JSON.parse(JSON.stringify(DEFAULT_WM)),
      news: saved.news || JSON.parse(JSON.stringify(DEFAULT_NEWS)),
      actST: saved.actST || 'L1'
    };
    return global._DB;
  }
  // Fresh start
  global._DB = {
    seeded: false, savedAt: null,
    companies: JSON.parse(JSON.stringify(DEFAULT_COMPANIES)),
    teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
    participants: JSON.parse(JSON.stringify(DEFAULT_PARTICIPANTS)),
    credentials: JSON.parse(JSON.stringify(DEFAULT_CREDS)),
    setups: JSON.parse(JSON.stringify(DEFAULT_SETUPS)),
    submissions: [], gallery: [], ledger: [], dissolved: [],
    weekMultipliers: JSON.parse(JSON.stringify(DEFAULT_WM)),
    news: JSON.parse(JSON.stringify(DEFAULT_NEWS)),
    actST: 'L1'
  };
  return global._DB;
}

const DB = initDB();

function auth(req,res,next){const t=req.headers['x-kvl-token'];if(!t)return res.status(401).json({error:'No token'});const u=DB.credentials.find(c=>c.id===t);if(!u)return res.status(401).json({error:'Invalid token'});req.user=u;next();}
function adm(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});next();}

app.get('/api/health',(req,res)=>res.json({ok:true,ts:new Date().toISOString(),savedAt:DB.savedAt,seeded:DB.seeded,envToken:!!VERCEL_TOKEN}));

app.post('/api/login',(req,res)=>{
  const{u,p}=req.body;
  const user=DB.credentials.find(c=>c.u===u&&c.p===p);
  if(!user)return res.status(401).json({error:'Invalid credentials'});
  res.json({token:user.id,user:{id:user.id,u:user.u,role:user.role,co:user.co,name:user.name,pos:user.pos},seeded:DB.seeded});
});

app.get('/api/state',auth,(req,res)=>{
  res.json({
    companies:DB.companies,teams:DB.teams,participants:DB.participants,
    setups:DB.setups,submissions:DB.submissions,gallery:DB.gallery||[],
    ledger:DB.ledger||[],dissolved:DB.dissolved||[],weekMultipliers:DB.weekMultipliers,
    news:DB.news,actST:DB.actST,savedAt:DB.savedAt,seeded:DB.seeded,
    credentials:req.user.role==='admin'?DB.credentials:[]
  });
});

app.post('/api/state',auth,adm,(req,res)=>{
  const{companies,teams,participants,setups,submissions,gallery,ledger,
        dissolved,weekMultipliers,news,actST,credentials}=req.body;
  if(companies&&companies.length)DB.companies=companies;
  if(teams&&teams.length)DB.teams=teams;
  if(participants&&participants.length)DB.participants=participants;
  if(setups&&setups.length)DB.setups=setups;
  if(submissions!=null){if(submissions.length>=DB.submissions.length)DB.submissions=submissions;else{const ids=new Set(DB.submissions.map(s=>s.id));const n=submissions.filter(s=>!ids.has(s.id));if(n.length)DB.submissions=[...DB.submissions,...n];}}
  if(gallery!=null){if(gallery.length>=DB.gallery.length)DB.gallery=gallery;else{const ids=new Set(DB.gallery.map(g=>g.photo));const n=gallery.filter(g=>!ids.has(g.photo));if(n.length)DB.gallery=[...DB.gallery,...n];}}
  if(ledger!=null){if(ledger.length>=DB.ledger.length)DB.ledger=ledger;else{const ids=new Set(DB.ledger.map(l=>l.id));const n=ledger.filter(l=>!ids.has(l.id));if(n.length)DB.ledger=[...DB.ledger,...n];}}
  if(dissolved)DB.dissolved=dissolved;
  if(weekMultipliers&&weekMultipliers.length)DB.weekMultipliers=weekMultipliers;
  if(news&&news.length)DB.news=news;
  if(actST)DB.actST=actST;
  if(credentials&&credentials.length){const admins=DB.credentials.filter(c=>c.role==='admin');const parts=credentials.filter(c=>c.role!=='admin');DB.credentials=[...admins,...parts];}
  DB.seeded=true;
  DB.savedAt=new Date().toISOString();
  persistToVercel(DB); // ← saves to Vercel env var, survives container recycles
  res.json({ok:true,savedAt:DB.savedAt});
});

app.post('/api/submit',auth,(req,res)=>{
  if(req.user.role==='viewer')return res.status(403).json({error:'Viewer cannot submit'});
  const sub={...req.body,id:uuidv4(),by:req.user.id,status:'pending',date:new Date().toLocaleString('en-IN')};
  DB.submissions.push(sub);
  if(sub.photo){if(!DB.gallery)DB.gallery=[];DB.gallery.push({photo:sub.photo,co:sub.co,by:sub.participant,type:sub.type,date:sub.date,status:'pending'});}
  DB.news.unshift({t:`🔔 ${sub.participant||sub.co} submitted ${sub.type} — pending approval`,up:true});
  if(DB.news.length>30)DB.news=DB.news.slice(0,30);
  DB.seeded=true;DB.savedAt=new Date().toISOString();
  persistToVercel(DB);
  res.json({ok:true,sub});
});

app.post('/api/approve/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='approved';
  const pts=Number(sub.pts)||0;
  const coName=(sub.co||'').trim();
  const co=DB.companies.find(c=>c.name===coName||c.name.trim()===coName);
  if(co){const old=co.val||1000;co.val=Math.max(100,(co.val||1000)+pts);co.chg=parseFloat(((co.val-old)/old*100).toFixed(1));co.h.push(co.val);if(co.h.length>20)co.h.shift();}
  if(sub.photo){if(!DB.gallery)DB.gallery=[];const ex=DB.gallery.find(g=>g.photo===sub.photo);if(ex)ex.status='approved';else DB.gallery.push({photo:sub.photo,co:sub.co,by:sub.participant,type:sub.type,date:sub.date,status:'approved'});}
  if(!DB.ledger)DB.ledger=[];
  DB.ledger.push({id:uuidv4(),co:sub.co,member:sub.participant,pts,reason:sub.type+' APPROVED',type:'APPROVAL',date:new Date().toLocaleString('en-IN'),by:req.user.u});
  DB.news.unshift({t:`✅ ${sub.co} — ${sub.type} APPROVED · ${pts>=0?'+':''}${pts} pts · ${sub.participant}`,up:pts>=0});
  if(DB.news.length>30)DB.news=DB.news.slice(0,30);
  DB.savedAt=new Date().toISOString();
  persistToVercel(DB);
  res.json({ok:true,companies:DB.companies,gallery:DB.gallery});
});

app.post('/api/reject/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='rejected';DB.savedAt=new Date().toISOString();persistToVercel(DB);
  res.json({ok:true});
});

app.post('/api/credentials',auth,adm,(req,res)=>{
  if(DB.credentials.find(c=>c.u===req.body.u))return res.status(400).json({error:'Username exists'});
  const c={...req.body,id:req.body.id||uuidv4()};DB.credentials.push(c);persistToVercel(DB);res.json(c);
});
app.delete('/api/credentials/:id',auth,adm,(req,res)=>{
  const c=DB.credentials.find(x=>x.id===req.params.id);
  if(c?.role==='admin')return res.status(403).json({error:'Cannot delete admin'});
  DB.credentials=DB.credentials.filter(x=>x.id!==req.params.id);persistToVercel(DB);res.json({ok:true});
});

app.use(express.static(path.join(__dirname,'../public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));
module.exports=app;
