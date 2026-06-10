const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const https = require('https');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// ══════════════════════════════════════════════════════════════════
// PERMANENT STORAGE via JSONBin.io (free, external, never wipes)
// Setup: 
//   1. Go to jsonbin.io → Sign up free → API Keys → copy Master Key
//   2. In Vercel dashboard → Settings → Environment Variables → add:
//      JSONBIN_KEY  =  your master key (starts with $2b$...)
//      JSONBIN_BIN  =  (leave empty first time, auto-created on first save)
// ══════════════════════════════════════════════════════════════════

// ── HARDCODED PERSISTENT STORAGE ──────────────────────────────
const JSONBIN_KEY = process.env.JSONBIN_KEY || '$2a$10$MFBw1ppwi1lDvOq9UwR3ZeJfpT8rloKdrHQiRMR1s5mA7qedKAVku';
const JSONBIN_BIN = process.env.JSONBIN_BIN || '6a28e11ada38895dfea44c87';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT = process.env.VERCEL_PROJECT_ID || 'prj_mpOE7BHc5B04ExLZzn50ZBRkpuPN';
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || 'team_bK3DuWHqm78H2RJSY75Ay9pr';

// Make HTTPS request
function httpsReq(options, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { res({ status: r.statusCode, body: JSON.parse(d) }); }
        catch(e) { res({ status: r.statusCode, body: d }); }
      });
    });
    req.on('error', rej);
    if (data) req.write(data);
    req.end();
  });
}

// Vercel env var sync removed — bin ID is hardcoded

// Load state from JSONBin
async function loadFromJSONBin() {
  if (!JSONBIN_KEY || !JSONBIN_BIN) return null;
  try {
    const r = await httpsReq({
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN}/latest`,
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    if (r.status === 200 && r.body?.record?.seeded) {
      console.log('✅ Loaded from JSONBin, savedAt:', r.body.record.savedAt);
      return r.body.record;
    }
  } catch(e) { console.log('JSONBin load error:', e.message); }
  return null;
}

// Save state to JSONBin (PUT always — bin ID is hardcoded)
async function saveToJSONBin(state) {
  const toSave = {
    seeded: true, savedAt: state.savedAt,
    companies: state.companies, setups: state.setups,
    submissions: state.submissions, weekMultipliers: state.weekMultipliers,
    actST: state.actST, ledger: state.ledger || [], dissolved: state.dissolved || [],
    news: state.news.slice(0, 20),
    gallery: (state.gallery || []).map(g => ({...g, photo: (g.photo||'').slice(0,100)})),
    credentials: state.credentials.filter(c => c.role !== 'admin')
  };
  try {
    const r = await httpsReq({
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN}`,
      method: 'PUT',
      headers: { 'X-Master-Key': JSONBIN_KEY, 'Content-Type': 'application/json' }
    }, toSave);
    if (r.status === 200) console.log('✅ Saved to JSONBin at', new Date().toISOString());
    else console.log('JSONBin save status:', r.status, JSON.stringify(r.body).slice(0,100));
  } catch(e) { console.log('JSONBin save error:', e.message); }
}

// ── DEFAULT DATA ──────────────────────────────────────────────────
const DC = [
  {id:1,name:'Timeless Ventures',ticker:'TVV',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:2,name:'Ciara World Ltd.',ticker:'CWL',val:500,chg:0,h:[500],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:3,name:'9D Brothers Ltd.',ticker:'9DB',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:4,name:'RN Capital Ventures',ticker:'RNC',val:800,chg:0,h:[800],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:5,name:'RR Enterprise',ticker:'RRE',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:6,name:'Dviti Jewels',ticker:'DVJ',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:7,name:'White Ink',ticker:'WHI',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}},
  {id:8,name:'Friends and Company',ticker:'FAC',val:1000,chg:0,h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}}
];
const DST = [
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
const DP = [
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
const DT = [
  {id:1,name:'Timeless Ventures',color:'#FFD700',members:[{name:'Atit Shah'},{name:'Margik Doshi'},{name:'Virag Shah'},{name:'Jenil Shah'},{name:'Parth Shah'},{name:'Yash Vora'},{name:'Hetanshi Shah'}]},
  {id:2,name:'Ciara World Ltd.',color:'#00E5FF',members:[{name:'Kushal Chokshi'},{name:'Gopi Shah'},{name:'Dharmik Mehta'},{name:'AR. Shruti Jain'},{name:'Chirag Vagrecha'},{name:'Preet Jain'}]},
  {id:3,name:'9D Brothers Ltd.',color:'#7C3AED',members:[{name:'Mayank Jain'},{name:'Jay Balu'},{name:'Smit Shah'},{name:'Fenil Shah'},{name:'Nil Shah'},{name:'Viral Shah'}]},
  {id:4,name:'RN Capital Ventures',color:'#F0134D',members:[{name:'Romit Nanavati'},{name:'Saloni Jain'},{name:'Tirth Shah'},{name:'Kaival Dholakia'},{name:'Mukesh Bafna'},{name:'Vikas Mehta'}]},
  {id:5,name:'RR Enterprise',color:'#448AFF',members:[{name:'Rushil Shah'},{name:'Shitul Doshi'},{name:'Linesh Babariya'},{name:'Darshit Shah'},{name:'Akansha Talesra'},{name:'Vishal Sheth'}]},
  {id:6,name:'Dviti Jewels',color:'#FF6B35',members:[{name:'Sagar Shah'},{name:'Rahul Shah'},{name:'Aakash Panchal'},{name:'Anjali Shah'},{name:'Mehul Shah'},{name:'Kathan Doshi'}]},
  {id:7,name:'White Ink',color:'#00BCD4',members:[{name:'Sarthak Shah'},{name:'JINEN UDANI'},{name:'Avisha Shah'},{name:'Vatsal Mehta'},{name:'Khushbu Shah'},{name:'Kushal Bhansali'},{name:'Nirdesh Shah'}]},
  {id:8,name:'Friends and Company',color:'#9C27B0',members:[{name:'Vaibhav Shah'},{name:'Vatsal Shah'},{name:'Priyesh Shah'},{name:'Jasmin Vakheria'},{name:'Dr Karishma Mehta'},{name:'Priyanka Shah'}]}
];
const DCR = [
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

// ── INIT DB ──────────────────────────────────────────────────────
function freshDB() {
  return {
    seeded: false, savedAt: null,
    companies: JSON.parse(JSON.stringify(DC)),
    teams: JSON.parse(JSON.stringify(DT)),
    participants: JSON.parse(JSON.stringify(DP)),
    credentials: JSON.parse(JSON.stringify(DCR)),
    setups: JSON.parse(JSON.stringify(DST)),
    submissions: [], gallery: [], ledger: [], dissolved: [],
    weekMultipliers: [{wk:'W-01',bull:1.0,bear:1.0},{wk:'W-02',bull:1.2,bear:0.8},{wk:'W-03',bull:1.5,bear:0.7},{wk:'W-04',bull:2.0,bear:0.5}],
    news: [{t:'KVL Season 01 is LIVE — 8 ventures competing!',up:true},{t:'Welcome to Kohinoor Ventures League — JBN LT05',up:true}],
    actST: 'L1'
  };
}

if (!global._DB) global._DB = freshDB();
const DB = global._DB;

// Load from JSONBin on cold start (async init)
let _loaded = false;
async function ensureLoaded() {
  if (_loaded || DB.seeded) return;
  _loaded = true;
  const saved = await loadFromJSONBin();
  if (saved) {
    DB.companies = saved.companies || DB.companies;
    DB.setups = saved.setups || DB.setups;
    DB.submissions = saved.submissions || DB.submissions;
    DB.weekMultipliers = saved.weekMultipliers || DB.weekMultipliers;
    DB.actST = saved.actST || DB.actST;
    DB.ledger = saved.ledger || DB.ledger;
    DB.dissolved = saved.dissolved || DB.dissolved;
    DB.news = saved.news || DB.news;
    // Restore participant credentials
    if (saved.credentials && saved.credentials.length) {
      const admins = DB.credentials.filter(c => c.role === 'admin');
      DB.credentials = [...admins, ...saved.credentials.filter(c => c.role !== 'admin')];
    }
    DB.seeded = true;
    DB.savedAt = saved.savedAt;
  }
}

// ── MIDDLEWARE ──────────────────────────────────────────────────
// Load state from JSONBin before every request
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) await ensureLoaded();
  next();
});

function auth(req,res,next){const t=req.headers['x-kvl-token'];if(!t)return res.status(401).json({error:'No token'});const u=DB.credentials.find(c=>c.id===t);if(!u)return res.status(401).json({error:'Invalid token'});req.user=u;next();}
function adm(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});next();}

app.get('/api/health',(req,res)=>res.json({ok:true,ts:new Date().toISOString(),savedAt:DB.savedAt,seeded:DB.seeded,jsonbin:!!JSONBIN_KEY}));

app.post('/api/login',(req,res)=>{
  const{u,p}=req.body;
  const user=DB.credentials.find(c=>c.u===u&&c.p===p);
  if(!user)return res.status(401).json({error:'Invalid credentials'});
  res.json({token:user.id,user:{id:user.id,u:user.u,role:user.role,co:user.co,name:user.name,pos:user.pos}});
});

app.get('/api/state',auth,(req,res)=>{
  res.json({companies:DB.companies,teams:DB.teams,participants:DB.participants,setups:DB.setups,submissions:DB.submissions,gallery:DB.gallery||[],ledger:DB.ledger||[],dissolved:DB.dissolved||[],weekMultipliers:DB.weekMultipliers,news:DB.news,actST:DB.actST,savedAt:DB.savedAt,seeded:DB.seeded,credentials:req.user.role==='admin'?DB.credentials:[]});
});

app.post('/api/state',auth,adm,(req,res)=>{
  const{companies,teams,participants,setups,submissions,gallery,ledger,dissolved,weekMultipliers,news,actST,credentials}=req.body;
  if(companies&&companies.length)DB.companies=companies;
  if(teams&&teams.length)DB.teams=teams;
  if(participants&&participants.length)DB.participants=participants;
  if(setups&&setups.length)DB.setups=setups;
  if(submissions!=null){if(submissions.length>=DB.submissions.length)DB.submissions=submissions;else{const ids=new Set(DB.submissions.map(s=>s.id));const n=submissions.filter(s=>!ids.has(s.id));if(n.length)DB.submissions=[...DB.submissions,...n];}}
  if(gallery!=null){if(gallery.length>=(DB.gallery||[]).length)DB.gallery=gallery;else{const ids=new Set((DB.gallery||[]).map(g=>g.photo));const n=gallery.filter(g=>!ids.has(g.photo));if(n.length)DB.gallery=[...(DB.gallery||[]),...n];}}
  if(ledger!=null){if(ledger.length>=(DB.ledger||[]).length)DB.ledger=ledger;else{const ids=new Set((DB.ledger||[]).map(l=>l.id));const n=ledger.filter(l=>!ids.has(l.id));if(n.length)DB.ledger=[...(DB.ledger||[]),...n];}}
  if(dissolved)DB.dissolved=dissolved;
  if(weekMultipliers&&weekMultipliers.length)DB.weekMultipliers=weekMultipliers;
  if(news&&news.length)DB.news=news;
  if(actST)DB.actST=actST;
  if(credentials&&credentials.length){const admins=DB.credentials.filter(c=>c.role==='admin');DB.credentials=[...admins,...credentials.filter(c=>c.role!=='admin')];}
  DB.seeded=true; DB.savedAt=new Date().toISOString();
  saveToJSONBin(DB); // Persist to external storage — survives forever
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
  saveToJSONBin(DB);
  res.json({ok:true,sub});
});

app.post('/api/approve/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='approved';
  const pts=Number(sub.pts)||0;
  const co=DB.companies.find(c=>c.name===(sub.co||'').trim()||c.name.trim()===(sub.co||'').trim());
  if(co){const old=co.val||1000;co.val=Math.max(100,old+pts);co.chg=parseFloat(((co.val-old)/old*100).toFixed(1));co.h.push(co.val);if(co.h.length>20)co.h.shift();}
  if(sub.photo){if(!DB.gallery)DB.gallery=[];const ex=DB.gallery.find(g=>g.photo===sub.photo);if(ex)ex.status='approved';else DB.gallery.push({photo:sub.photo,co:sub.co,by:sub.participant,type:sub.type,date:sub.date,status:'approved'});}
  if(!DB.ledger)DB.ledger=[];
  DB.ledger.push({id:uuidv4(),co:sub.co,member:sub.participant,pts,reason:sub.type+' APPROVED',type:'APPROVAL',date:new Date().toLocaleString('en-IN'),by:req.user.u});
  DB.news.unshift({t:`✅ ${sub.co} — ${sub.type} APPROVED · ${pts>=0?'+':''}${pts} pts · ${sub.participant}`,up:pts>=0});
  if(DB.news.length>30)DB.news=DB.news.slice(0,30);
  DB.savedAt=new Date().toISOString();
  saveToJSONBin(DB);
  res.json({ok:true,companies:DB.companies,gallery:DB.gallery});
});

app.post('/api/reject/:id',auth,adm,(req,res)=>{
  const sub=DB.submissions.find(s=>s.id===req.params.id);
  if(!sub)return res.status(404).json({error:'Not found'});
  sub.status='rejected';DB.savedAt=new Date().toISOString();saveToJSONBin(DB);res.json({ok:true});
});

app.post('/api/credentials',auth,adm,(req,res)=>{
  if(DB.credentials.find(c=>c.u===req.body.u))return res.status(400).json({error:'Username exists'});
  const c={...req.body,id:req.body.id||uuidv4()};DB.credentials.push(c);saveToJSONBin(DB);res.json(c);
});
app.delete('/api/credentials/:id',auth,adm,(req,res)=>{
  const c=DB.credentials.find(x=>x.id===req.params.id);
  if(c?.role==='admin')return res.status(403).json({error:'Cannot delete admin'});
  DB.credentials=DB.credentials.filter(x=>x.id!==req.params.id);saveToJSONBin(DB);res.json({ok:true});
});

app.use(express.static(path.join(__dirname,'../public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));
module.exports=app;
