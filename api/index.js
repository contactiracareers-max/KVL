const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

if (!global._KVL_DB) {
  global._KVL_DB = {
    companies: [
      {id:1,name:'Atit Shah',ticker:'MAN',val:1850,chg:4.2,h:[1200,1280,1350,1420,1380,1490,1560,1620,1700,1780,1850],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:2,name:'Kushal Chokshi',ticker:'CIA',val:1640,chg:2.8,h:[1100,1150,1200,1180,1240,1300,1350,1420,1500,1580,1640],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:3,name:'Mayank Jain',ticker:'9D',val:1520,chg:1.5,h:[1000,1050,1100,1150,1200,1250,1300,1350,1400,1460,1520],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:4,name:'Romit Nanavati',ticker:'RN',val:1380,chg:-0.8,h:[1400,1380,1360,1390,1370,1350,1330,1360,1380,1390,1380],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:5,name:'Rushil Shah',ticker:'RR',val:1250,chg:-1.6,h:[1350,1320,1300,1280,1260,1240,1220,1230,1240,1250,1250],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:6,name:'Sagar Shah',ticker:'DJ',val:1180,chg:-2.4,h:[1300,1280,1260,1220,1200,1180,1160,1150,1170,1180,1180],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:7,name:'Sarthak Shah',ticker:'WH',val:980,chg:-5.2,h:[1100,1080,1050,1020,1000,980,950,960,970,975,980],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}},
      {id:8,name:'Vaibhav Shah',ticker:'FAC',val:850,chg:8.1,h:[600,650,680,700,720,750,780,800,820,840,850],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}}
    ],
    teams: [
      {id:1,name:'Atit Shah',color:'#FFD700',members:[{name:'Atit Shah',pos:['Chairman','CEO']},{name:'Virag Shah',pos:['Member']},{name:'Hetanshi Shah',pos:['Member']},{name:'Jenil Shah',pos:['Member']},{name:'Margik Doshi',pos:['Member']},{name:'Parth Shah',pos:['Member']},{name:'Yash Vora',pos:['Member']}]},
      {id:2,name:'Kushal Chokshi',color:'#00E5FF',members:[{name:'Kushal Chokshi',pos:['Chairman']},{name:'Gopi Shah',pos:['Member']},{name:'AR. Shruti Jain',pos:['Member']},{name:'Chirag Vagrecha',pos:['Member']},{name:'Dharmik Mehta',pos:['Member']},{name:'Preet Jain',pos:['Member']}]},
      {id:3,name:'Mayank Jain',color:'#7C3AED',members:[{name:'Mayank Jain',pos:['Chairman']},{name:'Jay Balu',pos:['Member']},{name:'Smit Shah',pos:['Member']},{name:'Fenil Shah',pos:['Member']},{name:'Nil Shah',pos:['Member']},{name:'Viral Shah',pos:['Member']}]},
      {id:4,name:'Romit Nanavati',color:'#F0134D',members:[{name:'Romit Nanavati',pos:['Chairman']},{name:'Mukesh Bafna',pos:['Member']},{name:'Saloni Jain',pos:['Member']},{name:'Tirth Shah',pos:['Member']},{name:'Kaival Dholakia',pos:['Member']},{name:'Vikas Mehta',pos:['Member']}]},
      {id:5,name:'Rushil Shah',color:'#FF6B35',members:[{name:'Rushil Shah',pos:['Chairman']},{name:'Linesh Babariya',pos:['CHRO & Vice Chairman']},{name:'Darshit Shah',pos:['CFO']},{name:'Akansha Talesra',pos:['CMO']},{name:'Shitul Doshi',pos:['CEO']},{name:'Vishal Sheth',pos:['CTO']}]},
      {id:6,name:'Sagar Shah',color:'#00BFA5',members:[{name:'Sagar Shah',pos:['Chairman']},{name:'Rahul Shah',pos:['Member']},{name:'Anjali Shah',pos:['Member']},{name:'Aakash Panchal',pos:['Member']},{name:'Mehul Shah',pos:['Member']},{name:'Kathan Doshi',pos:['Member']}]},
      {id:7,name:'Sarthak Shah',color:'#9C27B0',members:[{name:'Sarthak Shah',pos:['Chairman']},{name:'Avisha Shah',pos:['Member']},{name:'Khushbu Shah',pos:['Member']},{name:'Vatsal Mehta',pos:['Member']},{name:'JINEN UDANI',pos:['Member']},{name:'Kushal Bhansali',pos:['Member']},{name:'Nirdesh Shah',pos:['Member']}]},
      {id:8,name:'Vaibhav Shah',color:'#FF4081',members:[{name:'Vaibhav Shah',pos:['Chairman']},{name:'Jasmin Vakharia',pos:['CFO']},{name:'Dr Karishma Mehta',pos:['CMO']},{name:'Vatsal Shah',pos:['CEO']},{name:'Priyesh Shah',pos:['CTO & Vice Chairman']},{name:'Priyanka Shah',pos:['CHRO']}]}
    ],
    participants: [
      {co:'Atit Shah',name:'Atit Shah',pos:'Chairman'},{co:'Atit Shah',name:'Virag Shah',pos:''},{co:'Atit Shah',name:'Hetanshi Shah',pos:''},{co:'Atit Shah',name:'Jenil Shah',pos:''},{co:'Atit Shah',name:'Margik Doshi',pos:''},{co:'Atit Shah',name:'Parth Shah',pos:''},{co:'Atit Shah',name:'Yash Vora',pos:''},
      {co:'Kushal Chokshi',name:'Kushal Chokshi',pos:'Chairman'},{co:'Kushal Chokshi',name:'Gopi Shah',pos:''},{co:'Kushal Chokshi',name:'AR. Shruti Jain',pos:''},{co:'Kushal Chokshi',name:'Chirag Vagrecha',pos:''},{co:'Kushal Chokshi',name:'Dharmik Mehta',pos:''},{co:'Kushal Chokshi',name:'Preet Jain',pos:''},
      {co:'Mayank Jain',name:'Mayank Jain',pos:'Chairman'},{co:'Mayank Jain',name:'Jay Balu',pos:''},{co:'Mayank Jain',name:'Smit Shah',pos:''},{co:'Mayank Jain',name:'Fenil Shah',pos:''},{co:'Mayank Jain',name:'Nil Shah',pos:''},{co:'Mayank Jain',name:'Viral Shah',pos:''},
      {co:'Romit Nanavati',name:'Romit Nanavati',pos:'Chairman'},{co:'Romit Nanavati',name:'Mukesh Bafna',pos:''},{co:'Romit Nanavati',name:'Saloni Jain',pos:''},{co:'Romit Nanavati',name:'Tirth Shah',pos:''},{co:'Romit Nanavati',name:'Kaival Dholakia',pos:''},{co:'Romit Nanavati',name:'Vikas Mehta',pos:''},
      {co:'Rushil Shah',name:'Rushil Shah',pos:'Chairman'},{co:'Rushil Shah',name:'Linesh Babariya',pos:'CHRO & Vice Chairman'},{co:'Rushil Shah',name:'Darshit Shah',pos:'CFO'},{co:'Rushil Shah',name:'Akansha Talesra',pos:'CMO'},{co:'Rushil Shah',name:'Shitul Doshi',pos:'CEO'},{co:'Rushil Shah',name:'Vishal Sheth',pos:'CTO'},
      {co:'Sagar Shah',name:'Sagar Shah',pos:'Chairman'},{co:'Sagar Shah',name:'Rahul Shah',pos:''},{co:'Sagar Shah',name:'Anjali Shah',pos:''},{co:'Sagar Shah',name:'Aakash Panchal',pos:''},{co:'Sagar Shah',name:'Mehul Shah',pos:''},{co:'Sagar Shah',name:'Kathan Doshi',pos:''},
      {co:'Sarthak Shah',name:'Sarthak Shah',pos:'Chairman'},{co:'Sarthak Shah',name:'Avisha Shah',pos:''},{co:'Sarthak Shah',name:'Khushbu Shah',pos:''},{co:'Sarthak Shah',name:'Vatsal Mehta',pos:''},{co:'Sarthak Shah',name:'JINEN UDANI',pos:''},{co:'Sarthak Shah',name:'Kushal Bhansali',pos:''},{co:'Sarthak Shah',name:'Nirdesh Shah',pos:''},
      {co:'Vaibhav Shah',name:'Vaibhav Shah',pos:'Chairman'},{co:'Vaibhav Shah',name:'Jasmin Vakharia',pos:'CFO'},{co:'Vaibhav Shah',name:'Dr Karishma Mehta',pos:'CMO'},{co:'Vaibhav Shah',name:'Vatsal Shah',pos:'CEO'},{co:'Vaibhav Shah',name:'Priyesh Shah',pos:'CTO & Vice Chairman'},{co:'Vaibhav Shah',name:'Priyanka Shah',pos:'CHRO'}
    ],
    setups: [{id:1,wk:'W-01',acts:[{type:'P2P Meeting',pts:10,max:null},{type:'Referral',pts:20,max:null},{type:'Business Received',pts:0,max:null},{type:'Visitor Invited',pts:15,max:null},{type:'Board Meeting',pts:5,max:null},{type:'Joint Board Mtg',pts:8,max:null},{type:'Stakeholders Meet',pts:12,max:null}]}],
    weekMultipliers: [{wk:'W-01',bull:1.0,bear:1.0},{wk:'W-02',bull:1.2,bear:0.8},{wk:'W-03',bull:1.5,bear:0.7},{wk:'W-04',bull:2.0,bear:0.5}],
    news: [
      {t:'Atit Shah closes 5 P2P meetings - BULLISH surge expected!',up:true},
      {t:'Kushal Chokshi team 3 referrals - valuation up 2.8%',up:true},
      {t:'Sagar Shah low activity - BANKRUPTCY RISK flagged',up:false},
      {t:'KVL Season 01 Week 3: 128 activities recorded',up:true}
    ],
    currentWeek: 'W-01',
    credentials: [
      {u:'admin',p:'kvl@2025',role:'admin',name:'Admin',co:'KEBI'},
      {u:'viewer',p:'view123',role:'viewer',name:'Viewer',co:''},
      {u:'harshit.s',p:'harkebi@1',role:'admin',name:'Harshit Shah',co:'KEBI'},
      {u:'nikesh.s',p:'nikkebi@2',role:'admin',name:'Nikesh Shah',co:'KEBI'},
      {u:'rupesh.s',p:'rupkebi@3',role:'admin',name:'Rupesh Shah',co:'KEBI'},
      {u:'kaushal.s',p:'kaukebi@4',role:'admin',name:'Kaushal Shah',co:'KEBI'},
      {u:'pratik.p',p:'prakebi@5',role:'admin',name:'Pratik Shah',co:'KEBI'},
      {u:'virag.s',p:'manv001',role:'participant',name:'Virag Shah',co:'Atit Shah'},
      {u:'hetanshi.s',p:'manh002',role:'participant',name:'Hetanshi Shah',co:'Atit Shah'},
      {u:'jenil.s',p:'manj003',role:'participant',name:'Jenil Shah',co:'Atit Shah'},
      {u:'margik.d',p:'manm004',role:'participant',name:'Margik Doshi',co:'Atit Shah'},
      {u:'parth.s',p:'manp005',role:'participant',name:'Parth Shah',co:'Atit Shah'},
      {u:'yash.v',p:'many006',role:'participant',name:'Yash Vora',co:'Atit Shah'},
      {u:'atit.s',p:'mana007',role:'participant',name:'Atit Shah',co:'Atit Shah'},
      {u:'gopi.s',p:'ciag001',role:'participant',name:'Gopi Shah',co:'Kushal Chokshi'},
      {u:'shruti.j',p:'cias002',role:'participant',name:'AR. Shruti Jain',co:'Kushal Chokshi'},
      {u:'chirag.v',p:'ciac003',role:'participant',name:'Chirag Vagrecha',co:'Kushal Chokshi'},
      {u:'dharmik.m',p:'ciad004',role:'participant',name:'Dharmik Mehta',co:'Kushal Chokshi'},
      {u:'preet.j',p:'ciap005',role:'participant',name:'Preet Jain',co:'Kushal Chokshi'},
      {u:'kushal.c',p:'ciak006',role:'participant',name:'Kushal Chokshi',co:'Kushal Chokshi'},
      {u:'jay.b',p:'9dj001',role:'participant',name:'Jay Balu',co:'Mayank Jain'},
      {u:'smit.s',p:'9ds002',role:'participant',name:'Smit Shah',co:'Mayank Jain'},
      {u:'fenil.s',p:'9df003',role:'participant',name:'Fenil Shah',co:'Mayank Jain'},
      {u:'nil.s',p:'9dn004',role:'participant',name:'Nil Shah',co:'Mayank Jain'},
      {u:'viral.s',p:'9dv005',role:'participant',name:'Viral Shah',co:'Mayank Jain'},
      {u:'mayank.j',p:'9dm006',role:'participant',name:'Mayank Jain',co:'Mayank Jain'},
      {u:'mukesh.b',p:'rnm001',role:'participant',name:'Mukesh Bafna',co:'Romit Nanavati'},
      {u:'saloni.j',p:'rns002',role:'participant',name:'Saloni Jain',co:'Romit Nanavati'},
      {u:'tirth.s',p:'rnt003',role:'participant',name:'Tirth Shah',co:'Romit Nanavati'},
      {u:'kaival.d',p:'rnk004',role:'participant',name:'Kaival Dholakia',co:'Romit Nanavati'},
      {u:'vikas.m',p:'rnv005',role:'participant',name:'Vikas Mehta',co:'Romit Nanavati'},
      {u:'romit.n',p:'rnr006',role:'participant',name:'Romit Nanavati',co:'Romit Nanavati'},
      {u:'linesh.b',p:'rrl001',role:'participant',name:'Linesh Babariya',co:'Rushil Shah'},
      {u:'darshit.s',p:'rrd002',role:'participant',name:'Darshit Shah',co:'Rushil Shah'},
      {u:'akansha.t',p:'rra003',role:'participant',name:'Akansha Talesra',co:'Rushil Shah'},
      {u:'shitul.d',p:'rrs004',role:'participant',name:'Shitul Doshi',co:'Rushil Shah'},
      {u:'vishal.s',p:'rrv005',role:'participant',name:'Vishal Sheth',co:'Rushil Shah'},
      {u:'rushil.s',p:'rrr006',role:'participant',name:'Rushil Shah',co:'Rushil Shah'},
      {u:'rahul.s',p:'djs001',role:'participant',name:'Rahul Shah',co:'Sagar Shah'},
      {u:'anjali.s',p:'dja002',role:'participant',name:'Anjali Shah',co:'Sagar Shah'},
      {u:'aakash.p',p:'dja003',role:'participant',name:'Aakash Panchal',co:'Sagar Shah'},
      {u:'mehul.s',p:'djm004',role:'participant',name:'Mehul Shah',co:'Sagar Shah'},
      {u:'kathan.d',p:'djk005',role:'participant',name:'Kathan Doshi',co:'Sagar Shah'},
      {u:'sagar.s',p:'djs006',role:'participant',name:'Sagar Shah',co:'Sagar Shah'},
      {u:'avisha.s',p:'wha001',role:'participant',name:'Avisha Shah',co:'Sarthak Shah'},
      {u:'khushbu.s',p:'whk002',role:'participant',name:'Khushbu Shah',co:'Sarthak Shah'},
      {u:'vatsal.m',p:'whv003',role:'participant',name:'Vatsal Mehta',co:'Sarthak Shah'},
      {u:'jinen.u',p:'whj004',role:'participant',name:'JINEN UDANI',co:'Sarthak Shah'},
      {u:'kushal.b',p:'whk005',role:'participant',name:'Kushal Bhansali',co:'Sarthak Shah'},
      {u:'nirdesh.s',p:'whn006',role:'participant',name:'Nirdesh Shah',co:'Sarthak Shah'},
      {u:'sarthak.s',p:'whs007',role:'participant',name:'Sarthak Shah',co:'Sarthak Shah'},
      {u:'jasmin.v',p:'facj001',role:'participant',name:'Jasmin Vakharia',co:'Vaibhav Shah'},
      {u:'karishma.m',p:'facm002',role:'participant',name:'Dr Karishma Mehta',co:'Vaibhav Shah'},
      {u:'vatsal.s',p:'facv003',role:'participant',name:'Vatsal Shah',co:'Vaibhav Shah'},
      {u:'priyesh.s',p:'facp004',role:'participant',name:'Priyesh Shah',co:'Vaibhav Shah'},
      {u:'priyanka.s',p:'facp005',role:'participant',name:'Priyanka Shah',co:'Vaibhav Shah'},
      {u:'vaibhav.s',p:'facv006',role:'participant',name:'Vaibhav Shah',co:'Vaibhav Shah'}
    ],
    submissions: [],
    scoreOverrides: {},
    proofImages: []
  };
}
const DB = global._KVL_DB;

function auth(req,res,next){const t=req.headers['x-kvl-token'];if(!t)return res.status(401).json({error:'No token'});const u=DB.credentials.find(c=>c.u===t);if(!u)return res.status(401).json({error:'Invalid token'});req.user=u;next();}
function adm(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});next();}

app.get('/api/health',(req,res)=>res.json({status:'ok',ts:new Date().toISOString()}));

// Login
app.post('/api/login',(req,res)=>{const{u,p}=req.body;const user=DB.credentials.find(c=>c.u===u&&c.p===p);if(!user)return res.status(401).json({error:'Invalid credentials'});res.json({token:u,role:user.role,name:user.name,co:user.co});});

// Sync all data
app.post('/api/sync',auth,adm,(req,res)=>{const{companies,teams,participants,credentials,setups,weekMultipliers,currentWeek,scoreOverrides}=req.body;if(companies)DB.companies=companies;if(teams)DB.teams=teams;if(participants)DB.participants=participants;if(credentials)DB.credentials=credentials;if(setups)DB.setups=setups;if(weekMultipliers)DB.weekMultipliers=weekMultipliers;if(currentWeek)DB.currentWeek=currentWeek;if(scoreOverrides)DB.scoreOverrides=scoreOverrides;res.json({ok:true});});

// Full data
app.get('/api/data',auth,(req,res)=>res.json({companies:DB.companies,teams:DB.teams,participants:DB.participants,setups:DB.setups,weekMultipliers:DB.weekMultipliers,currentWeek:DB.currentWeek,news:DB.news,scoreOverrides:DB.scoreOverrides||{}}));

// Companies
app.get('/api/companies',auth,(req,res)=>res.json(DB.companies));
app.post('/api/companies',auth,adm,(req,res)=>{const co={...req.body,id:Date.now(),h:[1000],acts:{p2p:0,referral:0,business:0,visitor:0,board:0,jboard:0,stake:0}};DB.companies.push(co);res.json(co);});
app.put('/api/companies/:id',auth,adm,(req,res)=>{const i=DB.companies.findIndex(c=>c.id===parseInt(req.params.id));if(i<0)return res.status(404).json({error:'Not found'});DB.companies[i]={...DB.companies[i],...req.body};res.json(DB.companies[i]);});
app.delete('/api/companies/:id',auth,adm,(req,res)=>{DB.companies=DB.companies.filter(c=>c.id!==parseInt(req.params.id));res.json({ok:true});});

// Teams
app.get('/api/teams',auth,(req,res)=>res.json(DB.teams));
app.post('/api/teams',auth,adm,(req,res)=>{const t={...req.body,id:Date.now()};DB.teams.push(t);res.json(t);});
app.put('/api/teams/:id',auth,adm,(req,res)=>{const i=DB.teams.findIndex(t=>t.id===parseInt(req.params.id));if(i<0)return res.status(404).json({error:'Not found'});DB.teams[i]={...DB.teams[i],...req.body};res.json(DB.teams[i]);});
app.delete('/api/teams/:id',auth,adm,(req,res)=>{DB.teams=DB.teams.filter(t=>t.id!==parseInt(req.params.id));res.json({ok:true});});

// Participants
app.get('/api/participants',auth,(req,res)=>res.json(DB.participants));
app.post('/api/participants',auth,adm,(req,res)=>{DB.participants.push(req.body);res.json({ok:true});});
app.put('/api/participants/:idx',auth,adm,(req,res)=>{const i=parseInt(req.params.idx);if(i<0||i>=DB.participants.length)return res.status(404).json({error:'Not found'});DB.participants[i]={...DB.participants[i],...req.body};res.json(DB.participants[i]);});
app.delete('/api/participants/:idx',auth,adm,(req,res)=>{DB.participants.splice(parseInt(req.params.idx),1);res.json({ok:true});});

// Credentials
app.get('/api/credentials',auth,adm,(req,res)=>res.json(DB.credentials));
app.post('/api/credentials',auth,adm,(req,res)=>{if(DB.credentials.find(c=>c.u===req.body.u))return res.status(400).json({error:'Username exists'});DB.credentials.push(req.body);res.json({ok:true});});
app.put('/api/credentials/:id',auth,adm,(req,res)=>{const i=DB.credentials.findIndex(c=>c.u===req.params.id);if(i<0)return res.status(404).json({error:'Not found'});DB.credentials[i]={...DB.credentials[i],...req.body};res.json(DB.credentials[i]);});
app.delete('/api/credentials/:id',auth,adm,(req,res)=>{const c=DB.credentials.find(x=>x.u===req.params.id);if(c?.role==='admin'&&DB.credentials.filter(x=>x.role==='admin').length<=1)return res.status(400).json({error:'Cannot delete last admin'});DB.credentials=DB.credentials.filter(x=>x.u!==req.params.id);res.json({ok:true});});

// Submissions
app.get('/api/submissions',auth,(req,res)=>{const s=req.user.role==='admin'?DB.submissions:DB.submissions.filter(s=>s.by===req.user.u);res.json(s);});
app.post('/api/submissions',auth,(req,res)=>{if(req.user.role==='viewer')return res.status(403).json({error:'Viewers cannot submit'});const sub={...req.body,id:uuidv4(),by:req.user.u,name:req.user.name,co:req.user.co,ts:new Date().toISOString(),status:'pending'};DB.submissions.push(sub);res.json(sub);});
app.put('/api/submissions/:id/approve',auth,adm,(req,res)=>{const s=DB.submissions.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Not found'});s.status='approved';const co=DB.companies.find(c=>c.name===s.co);if(co&&co.acts){co.acts[s.actKey]=(co.acts[s.actKey]||0)+1;}res.json({ok:true});});
app.put('/api/submissions/:id/reject',auth,adm,(req,res)=>{const s=DB.submissions.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Not found'});s.status='rejected';res.json({ok:true});});

// Score overrides (manual admin adjustment)
app.get('/api/scores',auth,(req,res)=>res.json(DB.scoreOverrides||{}));
app.put('/api/scores/:co',auth,adm,(req,res)=>{if(!DB.scoreOverrides)DB.scoreOverrides={};DB.scoreOverrides[req.params.co]={...( DB.scoreOverrides[req.params.co]||{}), ...req.body};res.json({ok:true});});
app.delete('/api/scores/:co',auth,adm,(req,res)=>{if(DB.scoreOverrides)delete DB.scoreOverrides[req.params.co];res.json({ok:true});});

// Proof Images
app.get('/api/images',auth,(req,res)=>{const imgs=req.user.role==='admin'?DB.proofImages:DB.proofImages.filter(i=>i.by===req.user.u);res.json(imgs);});
app.post('/api/images',auth,(req,res)=>{if(req.user.role==='viewer')return res.status(403).json({error:'Not allowed'});const img={id:uuidv4(),by:req.user.u,name:req.user.name,co:req.user.co,ts:new Date().toISOString(),...req.body};DB.proofImages.push(img);res.json(img);});
app.delete('/api/images/:id',auth,adm,(req,res)=>{DB.proofImages=DB.proofImages.filter(i=>i.id!==req.params.id);res.json({ok:true});});

// Setups
app.get('/api/setups',auth,(req,res)=>res.json(DB.setups));
app.put('/api/setups',auth,adm,(req,res)=>{DB.setups=req.body;res.json({ok:true});});

// Week multipliers
app.get('/api/weekmult',auth,(req,res)=>res.json(DB.weekMultipliers));
app.put('/api/weekmult',auth,adm,(req,res)=>{DB.weekMultipliers=req.body;res.json({ok:true});});

// Current week
app.get('/api/week',auth,(req,res)=>res.json({week:DB.currentWeek}));
app.put('/api/week',auth,adm,(req,res)=>{DB.currentWeek=req.body.week;res.json({ok:true});});

// News
app.get('/api/news',auth,(req,res)=>res.json(DB.news));
app.put('/api/news',auth,adm,(req,res)=>{DB.news=req.body;res.json({ok:true});});

module.exports = app;
