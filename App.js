import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';

const API = 'http://localhost:8000';

// ============================================
// FULL TRANSLATIONS — NO MIXING
// ============================================
const T = {
  en: {
    // Language Selection Screen
    welcomeTitle    : "Mini Sandbox AI",
    welcomeSubtitle : "Chennai Ward Climate Risk Prediction System",
    welcomeDesc     : "An AI-powered tool for ward councillors to predict and simulate climate risks",
    chooseLang      : "Please choose your language",
    englishBtn      : "English",
    tamilBtn        : "தமிழ்",

    // Header
    appTitle        : "Mini Sandbox AI",
    appSubtitle     : "Chennai Ward Climate Risk Dashboard",
    changeLang      : "Change Language",

    // Tabs
    tabSearch       : "Ward Search",
    tabOverview     : "City Overview",
    tabIntervention : "Interventions",

    // Search
    searchTitle     : "Search Ward",
    searchLabel     : "Enter Ward Number",
    searchPlaceholder: "Example: 66",
    searchBtn       : "Search",
    searching       : "Searching...",
    searchHint      : "Enter a ward number between 1 and 155 to see climate risk predictions",

    // Ward Info
    wardLabel       : "Ward Number",
    zoneLabel       : "Zone",
    riskProfile     : "Risk Profile",

    // Risk Cards
    floodRisk       : "Flood Risk",
    waterScarcity   : "Water Scarcity",
    vulnerability   : "Vulnerability",
    sustainability  : "Sustainability",
    confidence      : "Confidence",

    // Risk Levels
    high            : "High",
    medium          : "Medium",
    low             : "Low",

    // Risk Descriptions
    highFlood       : "This ward has high flood risk. Immediate drainage improvements needed.",
    medFlood        : "This ward has moderate flood risk. Monitor during monsoon season.",
    lowFlood        : "This ward has low flood risk. Maintain current drainage systems.",
    highWater       : "This ward faces severe water scarcity. Water supply infrastructure needed.",
    medWater        : "This ward has moderate water scarcity. Monitor groundwater levels.",
    lowWater        : "This ward has adequate water supply. Continue current management.",
    highVuln        : "This ward is highly vulnerable. Priority intervention required.",
    medVuln         : "This ward has moderate vulnerability. Plan protective measures.",
    lowVuln         : "This ward has low vulnerability. Maintain current services.",
    highSust        : "This ward is highly sustainable. Good environmental practices.",
    medSust         : "This ward has moderate sustainability. Improvements possible.",
    lowSust         : "This ward has low sustainability. Environmental action needed.",

    // Intervention
    interventionTitle : "Simulate Interventions",
    interventionDesc  : "Use the sliders below to simulate the impact of different interventions",
    addDrainage     : "Add Drainage Lines",
    plantTrees      : "Plant Trees",
    addHospitals    : "Add Hospitals",
    simulate        : "Run Simulation",
    simulating      : "Simulating...",
    beforeSim       : "Before Intervention",
    afterSim        : "After Intervention",
    improved        : "Improved!",
    noChange        : "No Change",
    selectWardFirst : "Please search for a ward first to simulate interventions",

    // Overview
    overviewTitle   : "Chennai City Risk Overview",
    overviewDesc    : "Risk distribution across all 155 Chennai wards",
    totalWards      : "Total Wards",
    highRisk        : "High Risk",
    medRisk         : "Medium Risk",
    lowRisk         : "Low Risk",
    riskDistribution: "Risk Distribution Chart",
    allWardsTable   : "All Wards Risk Table",
    loading         : "Loading data...",

    // Table Headers
    thWard          : "Ward",
    thZone          : "Zone",
    thFlood         : "Flood Risk",
    thWater         : "Water Scarcity",
    thVuln          : "Vulnerability",
    thSust          : "Sustainability",

    // Download
    downloadReport  : "Download Report",
    reportTitle     : "MINI SANDBOX AI — CLIMATE RISK REPORT",

    // Errors
    wardNotFound    : "Ward not found. Please enter a number between 1 and 155.",
    networkError    : "Cannot connect to server. Please ensure the API is running.",
  },

  ta: {
    // Language Selection Screen
    welcomeTitle    : "மினி சாண்ட்பாக்ஸ் AI",
    welcomeSubtitle : "சென்னை வார்டு காலநிலை அபாய கணிப்பு அமைப்பு",
    welcomeDesc     : "வார்டு கவுன்சிலர்களுக்கான AI சக்திவாய்ந்த காலநிலை அபாய கணிப்பு கருவி",
    chooseLang      : "உங்கள் மொழியை தேர்ந்தெடுக்கவும்",
    englishBtn      : "English",
    tamilBtn        : "தமிழ்",

    // Header
    appTitle        : "மினி சாண்ட்பாக்ஸ் AI",
    appSubtitle     : "சென்னை வார்டு காலநிலை அபாய டாஷ்போர்டு",
    changeLang      : "மொழி மாற்று",

    // Tabs
    tabSearch       : "வார்டு தேடல்",
    tabOverview     : "நகர கண்ணோட்டம்",
    tabIntervention : "தலையீடுகள்",

    // Search
    searchTitle     : "வார்டு தேடல்",
    searchLabel     : "வார்டு எண்ணை உள்ளிடுக",
    searchPlaceholder: "எடுத்துக்காட்டு: 66",
    searchBtn       : "தேடு",
    searching       : "தேடுகிறது...",
    searchHint      : "காலநிலை அபாய கணிப்புகளை காண 1 முதல் 155 வரை வார்டு எண்ணை உள்ளிடுக",

    // Ward Info
    wardLabel       : "வார்டு எண்",
    zoneLabel       : "மண்டலம்",
    riskProfile     : "அபாய சுயவிவரம்",

    // Risk Cards
    floodRisk       : "வெள்ள அபாயம்",
    waterScarcity   : "நீர் பற்றாக்குறை",
    vulnerability   : "பாதிப்பு நிலை",
    sustainability  : "நிலைத்தன்மை",
    confidence      : "நம்பகத்தன்மை",

    // Risk Levels
    high            : "அதிகம்",
    medium          : "மிதமான",
    low             : "குறைவு",

    // Risk Descriptions
    highFlood       : "இந்த வார்டுக்கு வெள்ள அபாயம் அதிகமாக உள்ளது. உடனடியாக வடிகால் மேம்பாடு தேவை.",
    medFlood        : "இந்த வார்டுக்கு மிதமான வெள்ள அபாயம் உள்ளது. பருவமழை காலத்தில் கண்காணிக்கவும்.",
    lowFlood        : "இந்த வார்டுக்கு வெள்ள அபாயம் குறைவாக உள்ளது. தற்போதைய வடிகால் அமைப்பை பராமரிக்கவும்.",
    highWater       : "இந்த வார்டில் கடுமையான நீர் பற்றாக்குறை உள்ளது. நீர் வழங்கல் உள்கட்டமைப்பு தேவை.",
    medWater        : "இந்த வார்டில் மிதமான நீர் பற்றாக்குறை உள்ளது. நிலத்தடி நீர் மட்டத்தை கண்காணிக்கவும்.",
    lowWater        : "இந்த வார்டில் போதுமான நீர் வழங்கல் உள்ளது. தற்போதைய மேலாண்மையை தொடரவும்.",
    highVuln        : "இந்த வார்டு மிகவும் பாதிப்படையக்கூடியது. முன்னுரிமை தலையீடு தேவை.",
    medVuln         : "இந்த வார்டு மிதமான பாதிப்பு நிலையில் உள்ளது. பாதுகாப்பு நடவடிக்கைகளை திட்டமிடவும்.",
    lowVuln         : "இந்த வார்டு குறைந்த பாதிப்பு நிலையில் உள்ளது. தற்போதைய சேவைகளை பராமரிக்கவும்.",
    highSust        : "இந்த வார்டு மிகவும் நிலையானது. சிறந்த சுற்றுச்சூழல் நடைமுறைகள் உள்ளன.",
    medSust         : "இந்த வார்டு மிதமான நிலைத்தன்மை கொண்டுள்ளது. மேம்பாடுகள் சாத்தியம்.",
    lowSust         : "இந்த வார்டு குறைந்த நிலைத்தன்மை கொண்டுள்ளது. சுற்றுச்சூழல் நடவடிக்கை தேவை.",

    // Intervention
    interventionTitle : "தலையீடுகளை உருவகப்படுத்துக",
    interventionDesc  : "வெவ்வேறு தலையீடுகளின் தாக்கத்தை உருவகப்படுத்த கீழேயுள்ள சறுக்குப்பட்டிகளை பயன்படுத்தவும்",
    addDrainage     : "வடிகால் கோடுகளை சேர்க்கவும்",
    plantTrees      : "மரங்கள் நடவும்",
    addHospitals    : "மருத்துவமனைகளை சேர்க்கவும்",
    simulate        : "உருவகப்படுத்தலை இயக்கவும்",
    simulating      : "உருவகப்படுத்துகிறது...",
    beforeSim       : "தலையீட்டிற்கு முன்பு",
    afterSim        : "தலையீட்டிற்கு பின்பு",
    improved        : "மேம்பட்டது!",
    noChange        : "மாற்றமில்லை",
    selectWardFirst : "தலையீடுகளை உருவகப்படுத்த முதலில் ஒரு வார்டை தேடவும்",

    // Overview
    overviewTitle   : "சென்னை நகர அபாய கண்ணோட்டம்",
    overviewDesc    : "அனைத்து 155 சென்னை வார்டுகளிலும் அபாய விநியோகம்",
    totalWards      : "மொத்த வார்டுகள்",
    highRisk        : "அதிக அபாயம்",
    medRisk         : "மிதமான அபாயம்",
    lowRisk         : "குறைந்த அபாயம்",
    riskDistribution: "அபாய விநியோக வரைபடம்",
    allWardsTable   : "அனைத்து வார்டுகள் அபாய அட்டவணை",
    loading         : "தரவு ஏற்றுகிறது...",

    // Table Headers
    thWard          : "வார்டு",
    thZone          : "மண்டலம்",
    thFlood         : "வெள்ள அபாயம்",
    thWater         : "நீர் பற்றாக்குறை",
    thVuln          : "பாதிப்பு",
    thSust          : "நிலைத்தன்மை",

    // Download
    downloadReport  : "அறிக்கை பதிவிறக்கம்",
    reportTitle     : "மினி சாண்ட்பாக்ஸ் AI — காலநிலை அபாய அறிக்கை",

    // Errors
    wardNotFound    : "வார்டு கிடைக்கவில்லை. 1 முதல் 155 வரை எண்ணை உள்ளிடவும்.",
    networkError    : "சேவையகத்துடன் இணைக்க முடியவில்லை. API இயங்குகிறதா என சரிபார்க்கவும்.",
  }
};

// ============================================
// HELPERS
// ============================================
function riskColor(level, lang) {
  const high = lang === 'ta' ? 'அதிகம்' : 'High';
  const med  = lang === 'ta' ? 'மிதமான' : 'Medium';
  if (level === high || level === 'High') return '#C0392B';
  if (level === med  || level === 'Medium') return '#E67E22';
  return '#27AE60';
}
function riskBg(level, lang) {
  const high = lang === 'ta' ? 'அதிகம்' : 'High';
  const med  = lang === 'ta' ? 'மிதமான' : 'Medium';
  if (level === high || level === 'High') return '#FADBD8';
  if (level === med  || level === 'Medium') return '#FDEBD0';
  return '#D5F5E3';
}
function translateLevel(level, t) {
  if (level === 'High')   return t.high;
  if (level === 'Medium') return t.medium;
  if (level === 'Low')    return t.low;
  return level;
}
function getRiskDesc(type, level, t) {
  const map = {
    flood_risk:     { High: t.highFlood,  Medium: t.medFlood,  Low: t.lowFlood  },
    water_scarcity: { High: t.highWater,  Medium: t.medWater,  Low: t.lowWater  },
    vulnerability:  { High: t.highVuln,   Medium: t.medVuln,   Low: t.lowVuln   },
    sustainability: { High: t.highSust,   Medium: t.medSust,   Low: t.lowSust   },
  };
  return map[type]?.[level] || '';
}

// ============================================
// LANGUAGE SELECTION SCREEN
// ============================================
function LanguageScreen({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0D1B2A, #1B4F72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '60px 80px', textAlign: 'center', maxWidth: '600px', width: '90%'
      }}>
        {/* Globe Icon */}
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🌏</div>

        {/* Title */}
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
          Mini Sandbox AI
        </div>
        <div style={{ fontSize: '16px', color: '#AED6F1', marginBottom: '8px' }}>
          Chennai Ward Climate Risk Prediction System
        </div>
        <div style={{ fontSize: '14px', color: '#7FB3D3', marginBottom: '8px' }}>
          —
        </div>
        <div style={{ fontSize: '18px', color: '#AED6F1', marginBottom: '8px' }}>
          சென்னை வார்டு காலநிலை அபாய கணிப்பு அமைப்பு
        </div>

        <div style={{
          width: '60px', height: '2px', background: 'linear-gradient(90deg, #3498DB, #1ABC9C)',
          margin: '32px auto', borderRadius: '2px'
        }} />

        {/* Choose Language */}
        <div style={{ fontSize: '16px', color: '#D6EAF8', marginBottom: '8px' }}>
          Please choose your language
        </div>
        <div style={{ fontSize: '16px', color: '#D6EAF8', marginBottom: '40px' }}>
          உங்கள் மொழியை தேர்ந்தெடுக்கவும்
        </div>

        {/* Language Buttons */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <button
            onClick={() => onSelect('en')}
            style={{
              background: 'linear-gradient(135deg, #2980B9, #1565C0)',
              color: 'white', border: 'none', borderRadius: '16px',
              padding: '20px 48px', fontSize: '20px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 8px 24px rgba(41,128,185,0.4)',
              minWidth: '180px'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => onSelect('ta')}
            style={{
              background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
              color: 'white', border: 'none', borderRadius: '16px',
              padding: '20px 48px', fontSize: '20px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 8px 24px rgba(231,76,60,0.4)',
              minWidth: '180px'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            🇮🇳 தமிழ்
          </button>
        </div>

        <div style={{ marginTop: '40px', fontSize: '12px', color: '#7FB3D3' }}>
          Powered by AI • 155 Chennai Wards • 4 Climate Risk Models
        </div>
      </div>
    </div>
  );
}

// ============================================
// RISK CARD COMPONENT
// ============================================
function RiskCard({ type, level, probability, t, lang }) {
  const labels = { flood_risk: t.floodRisk, water_scarcity: t.waterScarcity,
                   vulnerability: t.vulnerability, sustainability: t.sustainability };
  const icons  = { flood_risk: '🌊', water_scarcity: '💧', vulnerability: '🏚️', sustainability: '🌿' };
  const tlevel = translateLevel(level, t);
  const color  = riskColor(level, lang);
  const bg     = riskBg(level, lang);
  const desc   = getRiskDesc(type, level, t);

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      border: `2px solid ${color}`, flex: 1, minWidth: '220px',
      boxShadow: `0 4px 16px ${bg}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
          {icons[type]} {labels[type]}
        </div>
        <div style={{
          background: bg, color: color, padding: '4px 12px',
          borderRadius: '20px', fontSize: '13px', fontWeight: '700'
        }}>
          {tlevel}
        </div>
      </div>

      {/* Big level display */}
      <div style={{ fontSize: '40px', fontWeight: '800', color, marginBottom: '8px' }}>
        {tlevel}
      </div>

      {/* Description */}
      <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px', lineHeight: '1.5' }}>
        {desc}
      </div>

      {/* Probability bars */}
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
        {t.confidence}
      </div>
      {probability && Object.entries(probability).map(([k, v]) => (
        <div key={k} style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
            <span style={{ color: riskColor(k, lang) }}>{translateLevel(k, t)}</span>
            <span>{(v * 100).toFixed(0)}%</span>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
            <div style={{
              background: riskColor(k, lang), width: `${v * 100}%`,
              height: '6px', borderRadius: '4px', transition: 'width 0.5s'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [lang, setLang]           = useState(null);
  const [tab, setTab]             = useState('search');
  const [wardNum, setWardNum]     = useState('');
  const [wardData, setWardData]   = useState(null);
  const [allWards, setAllWards]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError]         = useState('');
  const [drainage, setDrainage]   = useState(0);
  const [trees, setTrees]         = useState(0);
  const [hospitals, setHospitals] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const t = lang ? T[lang] : T.en;

  // Load all wards
  useEffect(() => {
    if (!lang) return;
    setLoadingAll(true);
    axios.get(`${API}/predict/all`)
      .then(res => { setAllWards(res.data.wards); setLoadingAll(false); })
      .catch(() => setLoadingAll(false));
  }, [lang]);

  // Search ward
  const searchWard = async () => {
    if (!wardNum) return;
    setLoading(true); setError(''); setWardData(null); setSimResult(null);
    try {
      const res = await axios.post(`${API}/predict/ward`, { ward_number: parseInt(wardNum) });
      setWardData(res.data);
    } catch (err) {
      if (err.response?.status === 404) setError(t.wardNotFound);
      else setError(t.networkError);
    }
    setLoading(false);
  };

  // Simulate
  const simulate = async () => {
    if (!wardNum || !wardData) return;
    setSimLoading(true);
    try {
      const res = await axios.post(`${API}/predict/intervention`, {
        ward_number: parseInt(wardNum),
        add_drainage: drainage, plant_trees: trees, improve_hospital: hospitals
      });
      setSimResult(res.data);
    } catch { }
    setSimLoading(false);
  };

  // Download
  const download = () => {
    if (!wardData) return;
    const r = wardData.risks;
    const content = `
${t.reportTitle}
${'='.repeat(50)}
${t.wardLabel}  : ${wardData.ward}
${t.zoneLabel}  : ${wardData.zone}

${t.floodRisk}     : ${translateLevel(r.flood_risk.level, t)}
${t.waterScarcity} : ${translateLevel(r.water_scarcity.level, t)}
${t.vulnerability} : ${translateLevel(r.vulnerability.level, t)}
${t.sustainability}: ${translateLevel(r.sustainability.level, t)}

${simResult ? `
${t.beforeSim} → ${t.afterSim}
${t.floodRisk}     : ${translateLevel(simResult.before.flood_risk, t)} → ${translateLevel(simResult.after.flood_risk, t)}
${t.vulnerability} : ${translateLevel(simResult.before.vulnerability, t)} → ${translateLevel(simResult.after.vulnerability, t)}
${t.sustainability}: ${translateLevel(simResult.before.sustainability, t)} → ${translateLevel(simResult.after.sustainability, t)}
` : ''}
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ward_${wardData.ward}_report.txt`; a.click();
  };

  // Language selection screen
  if (!lang) return <LanguageScreen onSelect={setLang} />;

  // Radar chart data
  const radarData = wardData ? [
    { s: t.floodRisk,    v: wardData.risks.flood_risk.level === 'High' ? 100 : wardData.risks.flood_risk.level === 'Medium' ? 60 : 20 },
    { s: t.waterScarcity,v: wardData.risks.water_scarcity.level === 'High' ? 100 : wardData.risks.water_scarcity.level === 'Medium' ? 60 : 20 },
    { s: t.vulnerability,v: wardData.risks.vulnerability.level === 'High' ? 100 : wardData.risks.vulnerability.level === 'Medium' ? 60 : 20 },
    { s: t.sustainability,v: wardData.risks.sustainability.level === 'High' ? 20 : wardData.risks.sustainability.level === 'Medium' ? 60 : 100 },
  ] : [];

  // Chart data
  const chartData = ['High','Medium','Low'].map(lvl => ({
    name: translateLevel(lvl, t),
    [t.floodRisk]:    allWards.filter(w => w.flood_risk === lvl).length,
    [t.waterScarcity]:allWards.filter(w => w.water_scarcity === lvl).length,
    [t.vulnerability]:allWards.filter(w => w.vulnerability === lvl).length,
    [t.sustainability]:allWards.filter(w => w.sustainability === lvl).length,
  }));

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#F0F4F8' }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A, #1565C0)',
        color: 'white', padding: '0 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)', height: '70px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '28px' }}>🌏</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' }}>{t.appTitle}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{t.appSubtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {wardData && (
            <button onClick={download} style={{
              background: '#27AE60', color: 'white', border: 'none',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600'
            }}>
              ⬇ {t.downloadReport}
            </button>
          )}
          <button onClick={() => { setLang(null); setWardData(null); setSimResult(null); }}
            style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px',
              padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
            }}>
            🌐 {t.changeLang}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        background: 'white', display: 'flex', padding: '0 40px',
        borderBottom: '2px solid #E8ECF0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        {[
          { key: 'search',       label: t.tabSearch,       icon: '🔍' },
          { key: 'overview',     label: t.tabOverview,      icon: '📊' },
          { key: 'intervention', label: t.tabIntervention,  icon: '🔧' },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: 'none', border: 'none', padding: '18px 28px',
            cursor: 'pointer', fontSize: '15px', fontWeight: tab === key ? '700' : '400',
            color: tab === key ? '#1565C0' : '#666',
            borderBottom: tab === key ? '3px solid #1565C0' : '3px solid transparent',
            transition: 'all 0.2s'
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px' }}>

        {/* ==================== SEARCH TAB ==================== */}
        {tab === 'search' && (
          <div>
            {/* Search Box */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '28px 32px',
              marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1565C0', marginBottom: '20px' }}>
                🔍 {t.searchTitle}
              </div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                {t.searchHint}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#555',
                    fontWeight: '600', marginBottom: '8px' }}>
                    {t.searchLabel}
                  </label>
                  <input
                    type="number" min="1" max="155"
                    placeholder={t.searchPlaceholder}
                    value={wardNum}
                    onChange={e => setWardNum(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && searchWard()}
                    style={{
                      width: '100%', padding: '14px 18px', fontSize: '18px',
                      border: '2px solid #D5D8DC', borderRadius: '10px',
                      outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={searchWard} disabled={loading} style={{
                    background: loading ? '#AEB6BF' : 'linear-gradient(135deg, #1565C0, #0D47A1)',
                    color: 'white', border: 'none', borderRadius: '10px',
                    padding: '14px 32px', fontSize: '16px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(21,101,192,0.4)'
                  }}>
                    {loading ? t.searching : t.searchBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FADBD8', border: '1px solid #E74C3C', borderRadius: '10px',
                padding: '14px 20px', color: '#C0392B', marginBottom: '24px',
                fontSize: '15px', fontWeight: '600'
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Empty State */}
            {!wardData && !loading && !error && (
              <div style={{
                background: 'white', borderRadius: '16px', padding: '80px 40px',
                textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>🌏</div>
                <div style={{ fontSize: '20px', color: '#555', fontWeight: '600', marginBottom: '8px' }}>
                  {t.searchTitle}
                </div>
                <div style={{ fontSize: '14px', color: '#999' }}>{t.searchHint}</div>
              </div>
            )}

            {/* Ward Results */}
            {wardData && (
              <div>
                {/* Ward Info Bar */}
                <div style={{
                  background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                  borderRadius: '16px', padding: '20px 28px', marginBottom: '24px',
                  display: 'flex', gap: '40px', color: 'white'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                      {t.wardLabel}
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '800' }}>{wardData.ward}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '40px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                      {t.zoneLabel}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '700' }}>{wardData.zone}</div>
                  </div>
                </div>

                {/* Risk Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {Object.entries(wardData.risks).map(([type, data]) => (
                    <RiskCard key={type} type={type} level={data.level}
                      probability={data.probability} t={t} lang={lang} />
                  ))}
                </div>

                {/* Radar Chart */}
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '28px',
                  marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '20px' }}>
                    📡 {t.riskProfile} — {t.wardLabel} {wardData.ward}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E8ECF0" />
                      <PolarAngleAxis dataKey="s" tick={{ fontSize: 13, fontFamily: 'inherit' }} />
                      <Radar name={t.riskProfile} dataKey="v" stroke="#1565C0"
                        fill="#1565C0" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== OVERVIEW TAB ==================== */}
        {tab === 'overview' && (
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#1565C0', marginBottom: '8px' }}>
              📊 {t.overviewTitle}
            </div>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
              {t.overviewDesc}
            </div>

            {loadingAll ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888', fontSize: '18px' }}>
                ⏳ {t.loading}
              </div>
            ) : (
              <div>
                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '24px',
                    flex: 1, minWidth: '160px', textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderTop: '4px solid #1565C0' }}>
                    <div style={{ fontSize: '42px', fontWeight: '800', color: '#1565C0' }}>
                      {allWards.length}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>{t.totalWards}</div>
                  </div>
                  {[
                    { key: 'flood_risk', label: t.floodRisk, icon: '🌊' },
                    { key: 'water_scarcity', label: t.waterScarcity, icon: '💧' },
                    { key: 'vulnerability', label: t.vulnerability, icon: '🏚️' },
                    { key: 'sustainability', label: t.sustainability, icon: '🌿' },
                  ].map(({ key, label, icon }) => (
                    <div key={key} style={{ background: 'white', borderRadius: '16px', padding: '20px',
                      flex: 1, minWidth: '180px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#555', marginBottom: '16px' }}>
                        {icon} {label}
                      </div>
                      {['High','Medium','Low'].map(lvl => (
                        <div key={lvl} style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: riskColor(lvl, lang), fontWeight: '600', fontSize: '13px' }}>
                            {translateLevel(lvl, t)}
                          </span>
                          <span style={{
                            background: riskBg(lvl, lang), color: riskColor(lvl, lang),
                            padding: '2px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '700'
                          }}>
                            {allWards.filter(w => w[key] === lvl).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px',
                  marginBottom: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '20px' }}>
                    📈 {t.riskDistribution}
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                      <XAxis dataKey="name" tick={{ fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontFamily: 'inherit', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: '13px' }} />
                      <Bar dataKey={t.floodRisk}    fill="#2980B9" radius={[4,4,0,0]} />
                      <Bar dataKey={t.waterScarcity} fill="#E67E22" radius={[4,4,0,0]} />
                      <Bar dataKey={t.vulnerability} fill="#8E44AD" radius={[4,4,0,0]} />
                      <Bar dataKey={t.sustainability}fill="#27AE60" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Wards Table */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '20px' }}>
                    📋 {t.allWardsTable}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: 'white' }}>
                        {[t.thWard, t.thZone, t.thFlood, t.thWater, t.thVuln, t.thSust].map(h => (
                          <th key={h} style={{ padding: '14px 16px', textAlign: h === t.thWard || h === t.thZone ? 'left' : 'center',
                            fontWeight: '700', fontSize: '13px' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allWards.sort((a, b) => a.ward - b.ward).map((w, i) => (
                        <tr key={w.ward} style={{ background: i % 2 === 0 ? '#F8FAFC' : 'white',
                          transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#EBF5FB'}
                          onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? '#F8FAFC' : 'white'}>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1565C0' }}>
                            {w.ward}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#555', fontSize: '13px' }}>
                            {w.zone}
                          </td>
                          {['flood_risk','water_scarcity','vulnerability','sustainability'].map(key => (
                            <td key={key} style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{
                                background: riskBg(w[key], lang), color: riskColor(w[key], lang),
                                padding: '4px 14px', borderRadius: '20px',
                                fontSize: '12px', fontWeight: '700'
                              }}>
                                {translateLevel(w[key], t)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== INTERVENTION TAB ==================== */}
        {tab === 'intervention' && (
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#1565C0', marginBottom: '8px' }}>
              🔧 {t.interventionTitle}
            </div>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
              {t.interventionDesc}
            </div>

            {!wardData ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '80px 40px',
                textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
                <div style={{ fontSize: '16px', color: '#888' }}>{t.selectWardFirst}</div>
              </div>
            ) : (
              <div>
                {/* Current Ward */}
                <div style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                  borderRadius: '16px', padding: '20px 28px', marginBottom: '24px',
                  color: 'white', display: 'flex', gap: '32px' }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{t.wardLabel}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800' }}>{wardData.ward}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '32px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{t.zoneLabel}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{wardData.zone}</div>
                  </div>
                </div>

                {/* Sliders */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px',
                  marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  {[
                    { icon: '🚰', label: t.addDrainage,  val: drainage,  set: setDrainage  },
                    { icon: '🌳', label: t.plantTrees,   val: trees,     set: setTrees     },
                    { icon: '🏥', label: t.addHospitals, val: hospitals, set: setHospitals },
                  ].map(({ icon, label, val, set }) => (
                    <div key={label} style={{ marginBottom: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {icon} {label}
                        </label>
                        <span style={{
                          background: '#EBF5FB', color: '#1565C0',
                          padding: '4px 16px', borderRadius: '20px',
                          fontSize: '18px', fontWeight: '800'
                        }}>
                          {val}
                        </span>
                      </div>
                      <input type="range" min="0" max="10" value={val}
                        onChange={e => set(parseInt(e.target.value))}
                        style={{ width: '100%', height: '8px', cursor: 'pointer',
                          accentColor: '#1565C0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                        fontSize: '11px', color: '#AAB7B8', marginTop: '4px' }}>
                        <span>0</span><span>5</span><span>10</span>
                      </div>
                    </div>
                  ))}

                  <button onClick={simulate} disabled={simLoading} style={{
                    background: simLoading ? '#AEB6BF' : 'linear-gradient(135deg, #27AE60, #1E8449)',
                    color: 'white', border: 'none', borderRadius: '10px',
                    padding: '16px 40px', fontSize: '17px', fontWeight: '700',
                    cursor: simLoading ? 'not-allowed' : 'pointer', width: '100%',
                    boxShadow: '0 4px 12px rgba(39,174,96,0.4)'
                  }}>
                    ▶ {simLoading ? t.simulating : t.simulate}
                  </button>
                </div>

                {/* Simulation Result */}
                {simResult && (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '28px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {['flood_risk','vulnerability','sustainability'].map(key => {
                        const labels = { flood_risk: t.floodRisk, vulnerability: t.vulnerability,
                                         sustainability: t.sustainability };
                        const before = simResult.before[key];
                        const after  = simResult.after[key];
                        const changed = simResult.changed[key];
                        return (
                          <div key={key} style={{ flex: 1, minWidth: '200px',
                            background: changed ? '#D5F5E3' : '#F8FAFC',
                            border: `2px solid ${changed ? '#27AE60' : '#E8ECF0'}`,
                            borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '16px' }}>
                              {labels[key]}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center',
                              alignItems: 'center', gap: '12px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                                  {t.beforeSim}
                                </div>
                                <span style={{
                                  background: riskBg(before, lang), color: riskColor(before, lang),
                                  padding: '6px 14px', borderRadius: '20px',
                                  fontSize: '14px', fontWeight: '700'
                                }}>
                                  {translateLevel(before, t)}
                                </span>
                              </div>
                              <div style={{ fontSize: '20px', color: changed ? '#27AE60' : '#CCC' }}>
                                →
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                                  {t.afterSim}
                                </div>
                                <span style={{
                                  background: riskBg(after, lang), color: riskColor(after, lang),
                                  padding: '6px 14px', borderRadius: '20px',
                                  fontSize: '14px', fontWeight: '700'
                                }}>
                                  {translateLevel(after, t)}
                                </span>
                              </div>
                            </div>
                            {changed && (
                              <div style={{ marginTop: '12px', color: '#27AE60',
                                fontWeight: '700', fontSize: '13px' }}>
                                ✓ {t.improved}
                              </div>
                            )}
                            {!changed && (
                              <div style={{ marginTop: '12px', color: '#AAB7B8', fontSize: '12px' }}>
                                {t.noChange}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
