const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ─── GLOBAL IN-MEMORY DB (persists within Vercel instance) ───
if (!global._KVL_DB) {
  global._KVL_DB = {
    companies: [
      {id:1,name:'Apex Ventures',ticker:'APX',val:1850,chg:4.2,h:[1200,1280,1350,1420,1380,1490,1560,1620,1700,1780,1850],acts:{p2p:12,referral:8,business:5,visitor:7,board:3,joint:2,stakeholder:1}},
      {id:2,name:'Summit Holdings',ticker:'SMT',val:1640,chg:2.8,h:[1100,1150,1200,1180,1240,1300,1350,1420,1500,1580,1640],acts:{p2p:10,referral:6,business:4,visitor:5,board:2,joint:1,stakeholder:2}},
      {id:3,name:'Delta Enterprises',ticker:'DLT',val:1520,chg:1.5,h:[1000,1050,1100,1150,1200,1250,1300,1350,1400,1460,1520],acts:{p2p:9,referral:5,business:3,visitor:6,board:2,joint:2,stakeholder:1}},
      {id:4,name:'Zenith Industries',ticker:'ZNT',val:1380,chg:-0.8,h:[1400,1380,1360,1390,1370,1350,1330,1360,1380,1390,1380],acts:{p2p:7,referral:4,business:2,visitor:4,board:1,joint:1,stakeholder:1}},
      {id:5,name:'Pinnacle Corp',ticker:'PCL',val:1250,chg:-1.6,h:[1350,1320,1300,1280,1260,1240,1220,1230,1240,1250,1250],acts:{p2p:6,referral:3,business:2,visitor:3,board:1,joint:1,stakeholder:0}},
      {id:6,name:'Orbit Capital',ticker:'ORB',val:1180,chg:-2.4,h:[1300,1280,1260,1240,1200,1180,1160,1150,1170,1180,1180],acts:{p2p:5,referral:3,business:1,visitor:2,board:1,joint:0,stakeholder:1}},
      {id:7,name:'Horizon Corp',ticker:'HRZ',val:980,chg:-5.2,h:[1100,1080,1050,1020,1000,980,950,960,970,975,980],acts:{p2p:4,referral:2,business:1,visitor:2,board:0,joint:0,stakeholder:0}},
      {id:8,name:'Vertex Group',ticker:'VTX',val:850,chg:-8.1,h:[1200,1150,1100,1050,1000,950,900,870,860,850,850],acts:{p2p:3,referral:1,business:0,visitor:1,board:0,joint:0,stakeholder:0}}
    ],
    teams: [
      {id:1,name:'Apex Ventures Ltd.',color:'#FFD700',members:[{name:'Harshit Shah',pos:['Chairman','CEO']},{name:'Priya Mehta',pos:['CFO']}]},
      {id:2,name:'Summit Holdings',color:'#00E5FF',members:[{name:'Nikesh Shah',pos:['Chairman']},{name:'Anita Desai',pos:['CEO']}]},
      {id:3,name:'Delta Enterprises',color:'#7C3AED',members:[{name:'Suresh Kumar',pos:['CEO']}]},
      {id:4,name:'Zenith Industries',color:'#F0134D',members:[{name:'Anil Sharma',pos:['Chairman','CEO']}]},
      {id:5,name:'Pinnacle Corp',color:'#448AFF',members:[{name:'Rajiv Kapoor',pos:['CEO']}]},
      {id:6,name:'Orbit Capital',color:'#FF6B35',members:[{name:'Kiran Reddy',pos:['CEO']}]},
      {id:7,name:'Horizon Corp',color:'#00BCD4',members:[{name:'Manoj Tiwari',pos:['CEO']}]},
      {id:8,name:'Vertex Group',color:'#9C27B0',members:[{name:'Sanjay Verma',pos:['CEO']}]}
    ],
    participants: [
      {co:'Apex Ventures Ltd.',name:'Harshit Shah',pos:'KEBI-Kohinoor Executive Board of India'},
      {co:'Apex Ventures Ltd.',name:'Priya Mehta',pos:'CFO'},
      {co:'Summit Holdings',name:'Nikesh Shah',pos:'Chairman'},
      {co:'Summit Holdings',name:'Anita Desai',pos:'CEO'},
      {co:'Delta Enterprises',name:'Suresh Kumar',pos:'CEO'},
      {co:'Zenith Industries',name:'Anil Sharma',pos:'Chairman'},
      {co:'Pinnacle Corp',name:'Rajiv Kapoor',pos:'CEO'},
      {co:'Orbit Capital',name:'Kiran Reddy',pos:'CEO'},
      {co:'Horizon Corp',name:'Manoj Tiwari',pos:'CEO'},
      {co:'Vertex Group',name:'Sanjay Verma',pos:'CEO'}
    ],
    setups: [
      {id:'L1',name:'Level 1 — Foundation',active:true,criteria:[
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
      {id:'L2',name:'Level 2 — Advanced',active:false,criteria:[
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
    ],
    credentials: [
    {id:'admin',u:'admin',p:'kvl@2025',role:'admin',co:'',part:'undefined',name:'undefined',pos:''},
    {id:'viewer',u:'viewer',p:'view123',role:'viewer',co:'',part:'undefined',name:'undefined',pos:''},
    {id:'xl-17802452188730',u:'virag.s',p:'manv001',role:'participant',co:'Atit Shah',part:'Virag Shah',name:'Virag Shah',pos:''},
    {id:'xl-17802452188971',u:'hetanshi.s',p:'manh002',role:'participant',co:'Atit Shah',part:'Hetanshi Shah',name:'Hetanshi Shah',pos:''},
    {id:'xl-17802452188972',u:'jenil.s',p:'manj003',role:'participant',co:'Atit Shah',part:'Jenil Shah',name:'Jenil Shah',pos:''},
    {id:'xl-17802452188973',u:'margik.d',p:'manm004',role:'participant',co:'Atit Shah',part:'Margik Doshi',name:'Margik Doshi',pos:''},
    {id:'xl-17802452188974',u:'parth.s',p:'manp005',role:'participant',co:'Atit Shah',part:'Parth Shah',name:'Parth Shah',pos:''},
    {id:'xl-17802452188975',u:'yash.v',p:'many006',role:'participant',co:'Atit Shah',part:'Yash Vora',name:'Yash Vora',pos:''},
    {id:'xl-17802452188976',u:'atit.s',p:'mana007',role:'participant',co:'Atit Shah',part:'Atit Shah',name:'Atit Shah',pos:'Chairman'},
    {id:'xl-17802452188977',u:'harshit.s',p:'harkebi@1',role:'admin',co:'KEBI',part:'Harshit Shah',name:'Harshit Shah',pos:'KEBI'},
    {id:'xl-17802452188978',u:'nikesh.s',p:'nikkebi@2',role:'admin',co:'KEBI',part:'Nikesh Shah',name:'Nikesh Shah',pos:'KEBI'},
    {id:'xl-17802452188989',u:'rupesh.s',p:'rupkebi@3',role:'admin',co:'KEBI',part:'Rupesh Shah',name:'Rupesh Shah',pos:'KEBI'},
    {id:'xl-178024521889810',u:'kaushal.s',p:'kaukebi@4',role:'admin',co:'KEBI',part:'Kaushal Shah',name:'Kaushal Shah',pos:'KEBI'},
    {id:'xl-178024521889811',u:'pratik.p',p:'prakebi@5',role:'admin',co:'KEBI',part:'Pratik Shah',name:'Pratik Shah',pos:'KEBI'},
    {id:'xl-178024521889812',u:'gopi.s',p:'ciag001',role:'participant',co:'Kushal Chokshi',part:'Gopi Shah',name:'Gopi Shah',pos:''},
    {id:'xl-178024521889813',u:'shruti.j',p:'cias002',role:'participant',co:'Kushal Chokshi',part:'AR. Shruti Jain',name:'AR. Shruti Jain',pos:''},
    {id:'xl-178024521889814',u:'chirag.v',p:'ciac003',role:'participant',co:'Kushal Chokshi',part:'Chirag Vagrecha',name:'Chirag Vagrecha',pos:''},
    {id:'xl-178024521889815',u:'dharmik.m',p:'ciad004',role:'participant',co:'Kushal Chokshi',part:'Dharmik Mehta',name:'Dharmik Mehta',pos:''},
    {id:'xl-178024521889816',u:'preet.j',p:'ciap005',role:'participant',co:'Kushal Chokshi',part:'Preet Jain',name:'Preet Jain',pos:''},
    {id:'xl-178024521889817',u:'kushal.c',p:'ciak006',role:'participant',co:'Kushal Chokshi',part:'Kushal Chokshi',name:'Kushal Chokshi',pos:'Chairman'},
    {id:'xl-178024521889818',u:'jay.b',p:'9dj001',role:'participant',co:'Mayank Jain',part:'Jay Balu',name:'Jay Balu',pos:''},
    {id:'xl-178024521889819',u:'smit.s',p:'9ds002',role:'participant',co:'Mayank Jain',part:'Smit Shah',name:'Smit Shah',pos:''},
    {id:'xl-178024521889820',u:'fenil.s',p:'9df003',role:'participant',co:'Mayank Jain',part:'Fenil Shah',name:'Fenil Shah',pos:''},
    {id:'xl-178024521889821',u:'nil.s',p:'9dn004',role:'participant',co:'Mayank Jain',part:'Nil Shah',name:'Nil Shah',pos:''},
    {id:'xl-178024521889822',u:'viral.s',p:'9dv005',role:'participant',co:'Mayank Jain',part:'Viral Shah',name:'Viral Shah',pos:''},
    {id:'xl-178024521889823',u:'mayank.j',p:'9dm006',role:'participant',co:'Mayank Jain',part:'Mayank Jain',name:'Mayank Jain',pos:'Chairman'},
    {id:'xl-178024521889824',u:'mukesh.b',p:'rnm001',role:'participant',co:'Romit Nanavati',part:'Mukesh Bafna',name:'Mukesh Bafna',pos:''},
    {id:'xl-178024521889825',u:'saloni.j',p:'rns002',role:'participant',co:'Romit Nanavati',part:'Saloni Jain',name:'Saloni Jain',pos:''},
    {id:'xl-178024521889826',u:'tirth.s',p:'rnt003',role:'participant',co:'Romit Nanavati',part:'Tirth Shah',name:'Tirth Shah',pos:''},
    {id:'xl-178024521889827',u:'kaival.d',p:'rnk004',role:'participant',co:'Romit Nanavati',part:'Kaival Dholakia',name:'Kaival Dholakia',pos:''},
    {id:'xl-178024521889828',u:'vikas.m',p:'rnv005',role:'participant',co:'Romit Nanavati',part:'Vikas Mehta',name:'Vikas Mehta',pos:''},
    {id:'xl-178024521889829',u:'romit.n',p:'rnr006',role:'participant',co:'Romit Nanavati',part:'Romit Nanavati',name:'Romit Nanavati',pos:'Chairman'},
    {id:'xl-178024521889830',u:'linesh.b',p:'rrl001',role:'participant',co:'Rushil Shah',part:'Linesh Babariya',name:'Linesh Babariya',pos:'CHRO & Vice Chairman'},
    {id:'xl-178024521889831',u:'darshit.s',p:'rrd002',role:'participant',co:'Rushil Shah',part:'Darshit Shah',name:'Darshit Shah',pos:'CFO'},
    {id:'xl-178024521889832',u:'akansha.t',p:'rra003',role:'participant',co:'Rushil Shah',part:'Akansha Talesra',name:'Akansha Talesra',pos:'CMO'},
    {id:'xl-178024521889833',u:'shitul.d',p:'rrs004',role:'participant',co:'Rushil Shah',part:'Shitul Doshi',name:'Shitul Doshi',pos:'CEO'},
    {id:'xl-178024521889834',u:'vishal.s',p:'rrv005',role:'participant',co:'Rushil Shah',part:'Vishal Sheth',name:'Vishal Sheth',pos:'CTO'},
    {id:'xl-178024521889835',u:'rushil.s',p:'rrr006',role:'participant',co:'Rushil Shah',part:'Rushil Shah',name:'Rushil Shah',pos:'Chairman'},
    {id:'xl-178024521889836',u:'rahul.s',p:'djs001',role:'participant',co:'Sagar Shah',part:'Rahul Shah',name:'Rahul Shah',pos:''},
    {id:'xl-178024521889837',u:'anjali.s',p:'dja002',role:'participant',co:'Sagar Shah',part:'Anjali Shah',name:'Anjali Shah',pos:''},
    {id:'xl-178024521889838',u:'aakash.p',p:'dja003',role:'participant',co:'Sagar Shah',part:'Aakash Panchal',name:'Aakash Panchal',pos:''},
    {id:'xl-178024521889839',u:'mehul.s',p:'djm004',role:'participant',co:'Sagar Shah',part:'Mehul Shah',name:'Mehul Shah',pos:''},
    {id:'xl-178024521889840',u:'kathan.d',p:'djk005',role:'participant',co:'Sagar Shah',part:'Kathan Doshi',name:'Kathan Doshi',pos:''},
    {id:'xl-178024521889841',u:'sagar.s',p:'djs006',role:'participant',co:'Sagar Shah',part:'Sagar Shah',name:'Sagar Shah',pos:'Chairman'},
    {id:'xl-178024521889842',u:'avisha.s',p:'wha001',role:'participant',co:'Sarthak Shah',part:'Avisha Shah',name:'Avisha Shah',pos:''},
    {id:'xl-178024521889843',u:'khushbu.s',p:'whk002',role:'participant',co:'Sarthak Shah',part:'Khushbu Shah',name:'Khushbu Shah',pos:''},
    {id:'xl-178024521889844',u:'vatsal.m',p:'whv003',role:'participant',co:'Sarthak Shah',part:'Vatsal Mehta',name:'Vatsal Mehta',pos:''},
    {id:'xl-178024521889845',u:'jinen.u',p:'whj004',role:'participant',co:'Sarthak Shah',part:'JINEN UDANI',name:'JINEN UDANI',pos:''},
    {id:'xl-178024521889846',u:'kushal.b',p:'whk005',role:'participant',co:'Sarthak Shah',part:'Kushal Bhansali',name:'Kushal Bhansali',pos:''},
    {id:'xl-178024521889847',u:'nirdesh.s',p:'whn006',role:'participant',co:'Sarthak Shah',part:'Nirdesh Shah',name:'Nirdesh Shah',pos:''},
    {id:'xl-178024521889848',u:'sarthak.s',p:'whs007',role:'participant',co:'Sarthak Shah',part:'Sarthak Shah',name:'Sarthak Shah',pos:'Chairman'},
    {id:'xl-178024521889849',u:'jasmin.v',p:'facj001',role:'participant',co:'Vaibhav Shah',part:'Jasmin Vakharia',name:'Jasmin Vakharia',pos:'CFO'},
    {id:'xl-178024521889850',u:'karishma.m',p:'facm002',role:'participant',co:'Vaibhav Shah',part:'Dr Karishma Mehta',name:'Dr Karishma Mehta',pos:'CMO'},
    {id:'xl-178024521889851',u:'vatsal.s',p:'facv003',role:'participant',co:'Vaibhav Shah',part:'Vatsal Shah',name:'Vatsal Shah',pos:'CEO'},
    {id:'xl-178024521889852',u:'priyesh.s',p:'facp004',role:'participant',co:'Vaibhav Shah',part:'Priyesh Shah',name:'Priyesh Shah',pos:'CTO & Vice Chairman'},
    {id:'xl-178024521889853',u:'priyanka.s',p:'facp005',role:'participant',co:'Vaibhav Shah',part:'Priyanka Shah',name:'Priyanka Shah',pos:'CHRO'},
    {id:'xl-178024521889854',u:'vaibhav.s',p:'facv006',role:'participant',co:'Vaibhav Shah',part:'Vaibhav Shah',name:'Vaibhav Shah',pos:'Chairman'}
  ],
    submissions: [],
    weekMultipliers: [
      {wk:'W-01',bull:1.0,bear:1.0},
      {wk:'W-02',bull:1.2,bear:0.8},
      {wk:'W-03',bull:1.5,bear:0.7},
      {wk:'W-04',bull:2.0,bear:0.5}
    ],
    news: [
      {t:'Apex Ventures closes 5 P2P meetings — BULLISH surge expected!',up:true},
      {t:'Summit Holdings Chairman passes 3 referrals — valuation up 2.8%',up:true},
      {t:'Vertex Group low activity — BANKRUPTCY RISK flagged',up:false},
      {t:'KVL Season 01 Week 3: 128 activities recorded',up:true}
    ],
    currentWeek: 'W-01'
  };
}
const DB = global._KVL_DB;

// Auth middleware
function auth(req,res,next){const t=req.headers['x-kvl-token'];if(!t)return res.status(401).json({error:'No token'});const u=DB.credentials.find(c=>c.id===t);if(!u)return res.status(401).json({error:'Invalid token'});req.user=u;next();}
function adm(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});next();}

// Health
app.get('/api/health',(req,res)=>res.json({status:'ok',ts:new Date().toISOString()}));

// Login
app.post('/api/login',(req,res)=>{const{u,p}=req.body;const user=DB.credentials.find(c=>c.u===u&&c.p===p);if(!user)return res.status(401).json({error:'Invalid credentials'});res.json({token:user.id,user:{id:user.id,u:user.u,role:user.role,co:user.co,part:user.part,name:user.name}});});

// Full data
app.get('/api/data',auth,(req,res)=>res.json({companies:DB.companies,teams:DB.teams,participants:DB.participants,setups:DB.setups,submissions:DB.submissions,weekMultipliers:DB.weekMultipliers,news:DB.news,currentWeek:DB.currentWeek}));

// Companies
app.get('/api/companies',auth,(req,res)=>res.json(DB.companies));
app.post('/api/companies',auth,adm,(req,res)=>{const co={...req.body,id:Date.now(),h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,joint:0,stakeholder:0}};DB.companies.push(co);res.json(co);});
app.put('/api/companies/:id',auth,adm,(req,res)=>{const i=DB.companies.findIndex(c=>c.id===parseInt(req.params.id));if(i<0)return res.status(404).json({error:'Not found'});DB.companies[i]={...DB.companies[i],...req.body,id:parseInt(req.params.id)};res.json(DB.companies[i]);});
app.delete('/api/companies/:id',auth,adm,(req,res)=>{DB.companies=DB.companies.filter(c=>c.id!==parseInt(req.params.id));res.json({ok:true});});

// Teams
app.get('/api/teams',auth,(req,res)=>res.json(DB.teams));
app.post('/api/teams',auth,adm,(req,res)=>{const t={...req.body,id:Date.now()};DB.teams.push(t);res.json(t);});
app.put('/api/teams/:id',auth,adm,(req,res)=>{const i=DB.teams.findIndex(t=>t.id===parseInt(req.params.id));if(i<0)return res.status(404).json({error:'Not found'});DB.teams[i]={...req.body,id:parseInt(req.params.id)};res.json(DB.teams[i]);});
app.delete('/api/teams/:id',auth,adm,(req,res)=>{DB.teams=DB.teams.filter(t=>t.id!==parseInt(req.params.id));res.json({ok:true});});

// Participants
app.get('/api/participants',auth,(req,res)=>res.json(DB.participants));
app.post('/api/participants',auth,adm,(req,res)=>{DB.participants.push(req.body);res.json(req.body);});
app.post('/api/participants/bulk',auth,adm,(req,res)=>{const{rows}=req.body;let added=0;rows.forEach(r=>{if(r.co&&r.name&&r.pos){DB.participants.push(r);added++;}});res.json({added});});

// Setups
app.get('/api/setups',auth,(req,res)=>res.json(DB.setups));
app.put('/api/setups',auth,adm,(req,res)=>{DB.setups=req.body;res.json({ok:true});});

// Credentials
app.get('/api/credentials',auth,adm,(req,res)=>res.json(DB.credentials));
app.post('/api/credentials',auth,adm,(req,res)=>{if(DB.credentials.find(c=>c.u===req.body.u))return res.status(400).json({error:'Username exists'});const c={...req.body,id:uuidv4()};DB.credentials.push(c);res.json(c);});
app.put('/api/credentials/:id',auth,adm,(req,res)=>{const i=DB.credentials.findIndex(c=>c.id===req.params.id);if(i<0)return res.status(404).json({error:'Not found'});DB.credentials[i]={...DB.credentials[i],...req.body,id:req.params.id};res.json(DB.credentials[i]);});
app.delete('/api/credentials/:id',auth,adm,(req,res)=>{const c=DB.credentials.find(x=>x.id===req.params.id);if(c?.role==='admin')return res.status(403).json({error:'Cannot delete admin'});DB.credentials=DB.credentials.filter(x=>x.id!==req.params.id);res.json({ok:true});});

// Submissions
app.get('/api/submissions',auth,(req,res)=>{const s=req.user.role==='admin'?DB.submissions:DB.submissions.filter(s=>s.by===req.user.id);res.json(s);});
app.post('/api/submissions',auth,(req,res)=>{if(req.user.role==='viewer')return res.status(403).json({error:'Viewers cannot submit'});const sub={...req.body,id:uuidv4(),by:req.user.id,status:'pending',date:new Date().toLocaleString('en-IN')};DB.submissions.push(sub);const co=DB.companies.find(c=>c.name===sub.co||(sub.co&&c.name.split(' ')[0]===sub.co.split(' ')[0]));if(co&&sub.tId in co.acts)co.acts[sub.tId]=(co.acts[sub.tId]||0)+1;DB.news.unshift({t:`${sub.co} logs ${sub.type} — ${sub.pts>=0?'+':''}${sub.pts} pts`,up:sub.pts>=0});if(DB.news.length>20)DB.news=DB.news.slice(0,20);res.json(sub);});
app.put('/api/submissions/:id/approve',auth,adm,(req,res)=>{const s=DB.submissions.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Not found'});s.status='approved';const co=DB.companies.find(c=>c.name===s.co||(s.co&&c.name.split(' ')[0]===s.co.split(' ')[0]));if(co){co.val=Math.max(300,co.val+Math.round(s.pts*0.5));co.chg=parseFloat((s.pts>=0?1:-1)*(Math.random()*3+1).toFixed(1));co.h.push(co.val);if(co.h.length>11)co.h.shift();}res.json(s);});
app.put('/api/submissions/:id/reject',auth,adm,(req,res)=>{const s=DB.submissions.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Not found'});s.status='rejected';res.json(s);});

// Week multipliers
app.get('/api/weekmult',auth,(req,res)=>res.json(DB.weekMultipliers));
app.put('/api/weekmult',auth,adm,(req,res)=>{DB.weekMultipliers=req.body;res.json({ok:true});});

// Current week
app.get('/api/week',auth,(req,res)=>res.json({week:DB.currentWeek}));
app.put('/api/week',auth,adm,(req,res)=>{DB.currentWeek=req.body.week;res.json({ok:true});});

module.exports = app;
