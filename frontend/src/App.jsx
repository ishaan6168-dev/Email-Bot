import { useState, useEffect, useCallback } from 'react'

const LABEL_COLORS = {
  Work:          { bg: 'rgba(28,69,135,0.25)',  border: '#1c4587', text: '#7AABFF' },
  Casual:        { bg: 'rgba(13,101,45,0.25)',  border: '#0d652d', text: '#4AE07A' },
  Advertisement: { bg: 'rgba(125,60,152,0.25)', border: '#7d3c98', text: '#CF8FFF' },
  Newsletter:    { bg: 'rgba(180,95,6,0.25)',   border: '#b45f06', text: '#FFB347' },
  Finance:       { bg: 'rgba(191,38,0,0.25)',   border: '#bf2600', text: '#FF7A6E' },
  Social:        { bg: 'rgba(0,96,100,0.25)',   border: '#006064', text: '#4DD0E1' },
  Spam:          { bg: 'rgba(74,74,74,0.25)',   border: '#4a4a4a', text: '#AAAAAA' },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Caveat:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal: #2ECFBF; --teal2: #1AADA0; --teal-glow: rgba(46,207,191,0.25);
    --dark: #0E1A1F; --dark2: #152028; --dark3: #1C2D35; --dark4: #243540; --pill: #111C22;
    --text: #F0FAF9; --text2: #A8CECA; --text3: #5A8A86;
    --pink: #FF6B9D; --yellow: #FFD166; --green: #06D6A0; --red: #FF6B6B;
    --skin: #FFDCB8; --skin2: #FFC89A; --hair: #FFD166;
    --font: 'Nunito', sans-serif; --font-hand: 'Caveat', cursive;
  }
  html, body, #root { height: 100%; background: var(--dark); color: var(--text); font-family: var(--font); overflow: hidden; }

  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.4) translateY(30px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes fadeOut { to{opacity:0;pointer-events:none} }
  @keyframes fadeIn { to{opacity:1} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes blink { 0%,90%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.08)} }
  @keyframes wave { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(-45deg) translateY(-3px)} }
  @keyframes waveR { 0%,100%{transform:rotate(25deg)} 50%{transform:rotate(45deg) translateY(-3px)} }
  @keyframes tailSwing { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
  @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }
  @keyframes sparklePop { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} }
  @keyframes heartFloat { 0%{opacity:0;transform:translateY(0) scale(0)} 20%{opacity:1;transform:translateY(-10px) scale(1)} 100%{opacity:0;transform:translateY(-40px) scale(0.5)} }
  @keyframes floatCircle { 0%,100%{transform:translateY(0) scale(1);opacity:0.4} 50%{transform:translateY(-20px) scale(1.1);opacity:0.7} }
  @keyframes arrowPulse { 0%,100%{opacity:0.3;transform:rotate(45deg) translate(0,0)} 50%{opacity:1;transform:rotate(45deg) translate(3px,3px)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px) scale(0.9)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes pulseGlow { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.6} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:1} }
  @keyframes blushPulse { 0%,100%{opacity:0.45} 50%{opacity:0.7} }
  @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }

  /* ── MAIL-CHAN CHARACTER ── */
  .mc-wrap { position:relative; display:inline-block; }
  .mc-root { position:relative; width:110px; height:130px; animation:float 3s ease-in-out infinite; filter:drop-shadow(0 12px 24px rgba(0,0,0,0.5)); }
  .mc-body { position:absolute; bottom:0; left:15px; width:80px; height:66px; background:linear-gradient(160deg,#fff 0%,#EAF9F8 100%); border-radius:50% 50% 40% 40%/40% 40% 50% 50%; border:2.5px solid rgba(46,207,191,0.6); box-shadow:0 6px 20px rgba(0,0,0,0.3),inset 0 2px 0 rgba(255,255,255,0.8); z-index:1; }
  .mc-body::before { content:''; position:absolute; top:0; left:0; right:0; height:34px; background:linear-gradient(135deg,var(--teal) 0%,#1BC4B4 100%); border-radius:50% 50% 0 0/40% 40% 0 0; clip-path:polygon(0 0,100% 0,50% 55%); }
  .mc-body::after { content:''; position:absolute; bottom:0; left:0; right:0; height:33px; background:rgba(46,207,191,0.07); clip-path:polygon(0 100%,50% 45%,100% 100%); border-radius:0 0 40% 40%; }
  .mc-arm-l { position:absolute; bottom:22px; left:4px; width:14px; height:32px; background:linear-gradient(145deg,var(--skin),var(--skin2)); border-radius:7px 7px 9px 9px; transform-origin:top center; transform:rotate(-25deg); animation:wave 2s ease-in-out infinite; z-index:0; border:1.5px solid rgba(255,160,100,0.4); }
  .mc-arm-r { position:absolute; bottom:22px; right:4px; width:14px; height:32px; background:linear-gradient(145deg,var(--skin),var(--skin2)); border-radius:7px 7px 9px 9px; transform-origin:top center; transform:rotate(25deg); animation:waveR 2s ease-in-out infinite; z-index:0; border:1.5px solid rgba(255,160,100,0.4); }
  .mc-arm-l::after,.mc-arm-r::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:12px; height:10px; background:var(--skin); border-radius:50%; border:1.5px solid rgba(255,160,100,0.4); }
  .mc-head { position:absolute; top:0; left:50%; transform:translateX(-50%); width:70px; height:68px; background:linear-gradient(145deg,#FFE8CC,var(--skin2)); border-radius:50% 50% 46% 46%/48% 48% 52% 52%; z-index:3; border:2px solid rgba(255,160,100,0.35); box-shadow:0 4px 12px rgba(0,0,0,0.25),inset 0 2px 0 rgba(255,255,255,0.5); }
  .mc-hair-base { position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:76px; height:40px; background:linear-gradient(135deg,var(--hair),#FFC030); border-radius:50% 50% 20% 20%; z-index:4; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
  .mc-hair-base::before { content:''; position:absolute; top:8px; left:-6px; width:18px; height:28px; background:linear-gradient(135deg,var(--hair),#FFC030); border-radius:40% 20% 40% 60%; transform:rotate(-10deg); }
  .mc-hair-base::after { content:''; position:absolute; top:8px; right:-6px; width:18px; height:28px; background:linear-gradient(135deg,#FFC030,var(--hair)); border-radius:20% 40% 60% 40%; transform:rotate(10deg); }
  .mc-clip-l,.mc-clip-r { position:absolute; top:10px; width:10px; height:10px; background:var(--teal); border-radius:50%; z-index:6; box-shadow:0 0 6px var(--teal-glow); }
  .mc-clip-l { left:12px; } .mc-clip-r { right:12px; }
  .mc-tail-l { position:absolute; top:16px; left:-14px; width:20px; height:36px; background:linear-gradient(160deg,var(--hair),#FFC030); border-radius:40% 20% 50% 60%; transform-origin:top right; animation:tailSwing 2.5s ease-in-out infinite; z-index:2; }
  .mc-tail-r { position:absolute; top:16px; right:-14px; width:20px; height:36px; background:linear-gradient(160deg,#FFC030,var(--hair)); border-radius:20% 40% 60% 50%; transform-origin:top left; animation:tailSwing 2.5s ease-in-out infinite reverse; z-index:2; }
  .mc-eyes { position:absolute; top:26px; left:0; right:0; display:flex; justify-content:space-around; padding:0 10px; z-index:5; }
  .mc-eye { width:13px; height:16px; background:#1A2535; border-radius:50%; position:relative; animation:blink 4s ease-in-out infinite; }
  .mc-eye::before { content:''; position:absolute; width:9px; height:11px; background:#2E6BFF; border-radius:50%; top:2px; left:2px; }
  .mc-eye::after { content:''; position:absolute; width:4px; height:5px; background:white; border-radius:50%; top:2px; right:2px; z-index:1; }
  .mc-blush-l,.mc-blush-r { position:absolute; top:38px; width:16px; height:8px; background:rgba(255,100,140,0.45); border-radius:50%; z-index:5; animation:blushPulse 3s ease-in-out infinite; }
  .mc-blush-l { left:7px; } .mc-blush-r { right:7px; }
  .mc-mouth { position:absolute; bottom:11px; left:50%; transform:translateX(-50%); width:18px; height:9px; border-bottom:3px solid #D4704A; border-radius:0 0 50% 50%; z-index:5; }
  .mc-badge { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); width:22px; height:16px; background:white; border:2px solid var(--teal); border-radius:3px; z-index:2; }
  .mc-badge::before { content:''; position:absolute; top:0; left:0; right:0; height:8px; clip-path:polygon(0 0,100% 0,50% 60%); background:var(--teal); }
  .mc-sparkles { position:absolute; inset:-16px; pointer-events:none; }
  .mc-sparkle { position:absolute; color:var(--teal); font-size:12px; animation:sparklePop 2.5s ease-in-out infinite; }
  .mc-sparkle:nth-child(1) { top:4px; left:6px; }
  .mc-sparkle:nth-child(2) { top:8px; right:2px; animation-delay:0.8s; font-size:9px; color:var(--yellow); }
  .mc-sparkle:nth-child(3) { bottom:10px; right:0; animation-delay:1.6s; font-size:8px; color:var(--pink); }
  .mc-heart { position:absolute; top:0; left:50%; font-size:14px; opacity:0; animation:heartFloat 2.5s ease-out infinite; }
  .mc-heart:nth-child(1) { animation-delay:0s; left:30%; }
  .mc-heart:nth-child(2) { animation-delay:1.2s; left:60%; font-size:10px; }
  .mc-sm .mc-root { transform:scale(0.32); transform-origin:center center; }
  .mc-sm { width:36px; height:36px; overflow:hidden; }
  .mc-lg .mc-root { transform:scale(1.0); transform-origin:bottom center; }
  .mc-lg { width:110px; height:130px; }
  .mc-xl .mc-root { transform:scale(1.4); transform-origin:bottom center; }
  .mc-xl { width:154px; height:182px; }

  /* ── LOADING SCREEN ── */
  .loading-screen { position:fixed; inset:0; background:var(--dark); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:100; animation:fadeOut 0.6s ease 2.8s forwards; pointer-events:none; }
  .loading-bg-circles { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
  .loading-bg-circles span { position:absolute; border-radius:50%; background:radial-gradient(circle,var(--teal-glow),transparent); animation:floatCircle 6s ease-in-out infinite; }
  .loading-bg-circles span:nth-child(1) { width:320px; height:320px; top:8%; left:12%; }
  .loading-bg-circles span:nth-child(2) { width:220px; height:220px; top:58%; right:18%; animation-delay:2s; }
  .loading-bg-circles span:nth-child(3) { width:160px; height:160px; top:28%; right:8%; animation-delay:4s; }
  .loading-char { animation:popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
  .loading-title { font-family:var(--font-hand); font-size:52px; font-weight:700; color:var(--teal); text-shadow:0 0 30px var(--teal-glow); animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; margin-top:16px; }
  .loading-sub { font-size:14px; color:var(--text3); letter-spacing:3px; text-transform:uppercase; animation:popIn 0.5s ease 0.7s both; margin-top:6px; }
  .loading-dots { display:flex; gap:6px; margin-top:24px; animation:popIn 0.5s ease 1s both; }
  .loading-dots span { width:8px; height:8px; border-radius:50%; background:var(--teal); animation:dotBounce 1.2s ease-in-out infinite; }
  .loading-dots span:nth-child(2) { animation-delay:0.2s; }
  .loading-dots span:nth-child(3) { animation-delay:0.4s; }

  /* ── INTRO SCREEN ── */
  .intro-screen { position:fixed; inset:0; background:var(--dark); display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; animation:fadeIn 0.6s ease 3.4s forwards; }
  .intro-bg { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
  .intro-bg-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(46,207,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(46,207,191,0.04) 1px,transparent 1px); background-size:40px 40px; }
  .intro-bg-glow { position:absolute; width:600px; height:600px; background:radial-gradient(circle,rgba(46,207,191,0.08) 0%,transparent 70%); top:50%; left:50%; animation:pulseGlow 4s ease-in-out infinite; }
  .intro-stage { display:flex; flex-direction:column; align-items:center; width:100%; max-width:520px; padding:0 24px; position:relative; z-index:1; }
  .stage-char { position:relative; margin-bottom:-20px; z-index:2; }
  .dialogue-box { width:100%; background:var(--pill); border-radius:24px; padding:28px 28px 24px; border:2px solid var(--dark4); box-shadow:0 24px 64px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04); position:relative; }
  .dialogue-name { position:absolute; top:-15px; left:24px; background:linear-gradient(135deg,#FF6B9D,#FF4D8D); color:white; font-weight:900; font-size:13px; padding:4px 16px; border-radius:20px; letter-spacing:0.5px; box-shadow:0 4px 12px rgba(255,107,157,0.45); }
  .dialogue-text { font-size:17px; line-height:1.8; color:var(--text); min-height:56px; padding-right:20px; }
  .dialogue-text .hi { color:var(--teal); font-weight:800; }
  .dialogue-text .pk { color:var(--pink); font-weight:800; }
  .dialogue-text .yl { color:var(--yellow); font-weight:800; }
  .dialogue-arrow { position:absolute; bottom:20px; right:22px; width:20px; height:20px; border-right:3px solid var(--teal); border-bottom:3px solid var(--teal); transform:rotate(45deg); animation:arrowPulse 1s ease-in-out infinite; cursor:pointer; }
  .choices { margin-top:18px; display:flex; flex-direction:column; gap:10px; }
  .choice-btn { width:100%; background:var(--dark3); border:2px solid var(--dark4); border-radius:16px; padding:15px 20px; color:var(--text); font-family:var(--font); font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; text-align:left; display:flex; align-items:center; gap:14px; text-decoration:none; }
  .choice-btn:hover { border-color:var(--teal); background:rgba(46,207,191,0.08); color:var(--teal); transform:translateX(6px); }
  .choice-icon { font-size:20px; }
  .choice-label { flex:1; }
  .choice-arrow { color:var(--text3); font-size:20px; transition:transform 0.2s; }
  .choice-btn:hover .choice-arrow { color:var(--teal); transform:translateX(4px); }

  /* ── MAIN APP ── */
  .app { display:flex; flex-direction:column; height:100vh; }
  .header { display:flex; align-items:center; justify-content:space-between; padding:0 20px; height:54px; background:var(--dark2); border-bottom:1px solid var(--dark4); flex-shrink:0; }
  .header-logo { display:flex; align-items:center; gap:4px; font-family:var(--font-hand); font-size:22px; font-weight:700; color:var(--teal); }
  .header-right { display:flex; align-items:center; gap:10px; }
  .user-badge { display:flex; align-items:center; gap:8px; background:var(--dark3); border:1px solid var(--dark4); border-radius:20px; padding:4px 12px 4px 8px; font-size:12px; color:var(--text2); }
  .user-dot { width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 6px var(--green); flex-shrink:0; }
  .main { display:flex; flex:1; overflow:hidden; }

  /* ── SIDEBAR ── */
  .sidebar { width:320px; flex-shrink:0; background:var(--dark2); border-right:1px solid var(--dark4); display:flex; flex-direction:column; overflow:hidden; }
  .sidebar-header { padding:12px 14px; border-bottom:1px solid var(--dark4); display:flex; align-items:center; justify-content:space-between; }
  .sidebar-title { font-weight:800; font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:2px; }
  .count-badge { background:var(--teal); color:var(--dark); font-size:11px; font-weight:900; padding:2px 9px; border-radius:10px; }
  .refresh-btn { background:transparent; border:1px solid var(--dark4); border-radius:8px; color:var(--text3); font-family:var(--font); font-size:11px; font-weight:700; padding:4px 10px; cursor:pointer; transition:all 0.2s; }
  .refresh-btn:hover { border-color:var(--teal); color:var(--teal); }
  .refresh-btn:disabled { opacity:0.4; cursor:not-allowed; }

  /* ── TOOLBAR ── */
  .toolbar { padding:8px 12px; border-bottom:1px solid var(--dark4); display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

  /* ── SORT BUTTON ── */
  .sort-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:8px; font-size:11px;
    font-family:var(--font); font-weight:800; cursor:pointer;
    border:1.5px solid rgba(46,207,191,0.4);
    background:rgba(46,207,191,0.08); color:var(--teal);
    transition:all 0.2s; white-space:nowrap;
  }
  .sort-btn:hover:not(:disabled) { background:rgba(46,207,191,0.18); box-shadow:0 0 12px var(--teal-glow); }
  .sort-btn:disabled { opacity:0.4; cursor:not-allowed; }

  /* ── LABEL FILTER TABS ── */
  .label-filters {
    padding:8px 12px 0;
    display:flex; gap:5px; flex-wrap:wrap;
    border-bottom:1px solid var(--dark4);
    padding-bottom:8px;
  }
  .filter-tab {
    padding:3px 9px; border-radius:10px; font-size:10px; font-weight:800;
    cursor:pointer; border:1.5px solid; transition:all 0.15s;
    background:transparent;
    font-family:var(--font);
  }
  .filter-tab.active { opacity:1; }
  .filter-tab:not(.active) { opacity:0.4; }
  .filter-tab:hover { opacity:1; }

  /* ── EMAIL LIST ── */
  .email-list { overflow-y:auto; flex:1; }
  .email-list::-webkit-scrollbar { width:3px; }
  .email-list::-webkit-scrollbar-thumb { background:var(--dark4); border-radius:2px; }
  .email-item { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:background 0.15s; display:flex; gap:8px; align-items:flex-start; position:relative; }
  .email-item:hover { background:rgba(46,207,191,0.04); }
  .email-item.active { background:rgba(46,207,191,0.08); border-left:3px solid var(--teal); }
  .email-item.selected { background:rgba(46,207,191,0.05); }
  .email-checkbox { width:14px; height:14px; border-radius:4px; border:1.5px solid var(--dark4); background:var(--dark3); flex-shrink:0; margin-top:3px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .email-checkbox.checked { background:var(--teal); border-color:var(--teal); }
  .email-info { flex:1; min-width:0; }
  .email-top { display:flex; justify-content:space-between; margin-bottom:2px; align-items:center; gap:4px; }
  .email-sender { font-weight:800; font-size:12px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px; }
  .email-date { font-size:10px; color:var(--text3); flex-shrink:0; }
  .email-subject { font-size:12px; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; font-weight:600; }
  .email-snippet { font-size:11px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* Label chip on email */
  .label-chip {
    display:inline-flex; align-items:center;
    font-size:9px; font-weight:800; padding:1px 6px; border-radius:6px;
    border:1px solid; white-space:nowrap; flex-shrink:0;
    margin-top:3px;
  }

  /* Classifying shimmer */
  .classifying-overlay {
    position:absolute; inset:0;
    background:linear-gradient(90deg, transparent, rgba(46,207,191,0.06), transparent);
    background-size:200px 100%;
    animation:shimmer 1s infinite;
    pointer-events:none;
  }

  .status-pill { position:absolute; top:10px; right:10px; font-size:10px; font-weight:800; padding:2px 7px; border-radius:8px; }
  .status-sent { background:rgba(6,214,160,0.15); color:var(--green); }
  .status-drafted { background:rgba(255,209,102,0.15); color:var(--yellow); }
  .empty-inbox { padding:44px 20px; text-align:center; color:var(--text3); }
  .empty-inbox .emoji { font-size:32px; margin-bottom:10px; }

  /* ── DETAIL ── */
  .detail { flex:1; display:flex; flex-direction:column; overflow:hidden; background:var(--dark); }
  .detail-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text3); gap:12px; }
  .detail-empty-text { font-family:var(--font-hand); font-size:22px; color:var(--text2); }
  .detail-empty-sub { font-size:12px; }
  .email-detail { flex:1; overflow-y:auto; padding:26px; }
  .email-detail::-webkit-scrollbar { width:3px; }
  .email-detail::-webkit-scrollbar-thumb { background:var(--dark4); border-radius:2px; }
  .email-detail-subject { font-size:19px; font-weight:900; color:var(--text); margin-bottom:14px; line-height:1.3; }
  .email-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; align-items:center; }
  .meta-chip { background:var(--dark3); border:1px solid var(--dark4); border-radius:20px; padding:3px 12px; font-size:11px; }
  .meta-chip .label { color:var(--text3); margin-right:4px; }
  .meta-chip .value { color:var(--text2); font-weight:600; }
  .email-body-text { font-size:13px; color:var(--text2); line-height:1.9; white-space:pre-wrap; word-break:break-word; }

  /* ── DRAFT PANEL ── */
  .draft-panel { border-top:1px solid var(--dark4); background:var(--dark2); flex-shrink:0; }
  .draft-header { padding:10px 20px; border-bottom:1px solid var(--dark4); display:flex; align-items:center; gap:8px; overflow:hidden; }
  .draft-title { font-weight:800; font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:2px; }
  .draft-title span { color:var(--teal); }
  .draft-inputs { padding:9px 20px; display:flex; gap:8px; align-items:center; }
  .name-field { background:var(--dark3); border:1px solid var(--dark4); border-radius:10px; color:var(--text2); font-family:var(--font); font-size:12px; padding:6px 10px; outline:none; width:130px; transition:border-color 0.2s; }
  .name-field::placeholder { color:var(--text3); }
  .name-field:focus { border-color:var(--teal); }
  .instr-field { flex:1; background:var(--dark3); border:1px solid var(--dark4); border-radius:10px; color:var(--text2); font-family:var(--font); font-size:12px; padding:6px 10px; outline:none; transition:border-color 0.2s; }
  .instr-field::placeholder { color:var(--text3); }
  .instr-field:focus { border-color:var(--teal); }
  .draft-body { padding:0 20px 9px; }
  .draft-textarea { width:100%; background:var(--dark3); border:1px solid var(--dark4); border-radius:12px; color:var(--text); font-family:var(--font); font-size:13px; padding:11px; resize:vertical; min-height:88px; outline:none; line-height:1.7; transition:border-color 0.2s; }
  .draft-textarea:focus { border-color:var(--teal); }
  .draft-placeholder { color:var(--text3); font-size:12px; padding:10px 0; font-style:italic; }
  .bottom-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 20px 12px; gap:10px; }
  .bottom-left { display:flex; gap:8px; }

  /* ── BUTTONS ── */
  .btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; font-size:12px; font-family:var(--font); font-weight:800; border:1.5px solid transparent; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .btn-primary { background:var(--teal); color:var(--dark); border-color:var(--teal); }
  .btn-primary:hover:not(:disabled) { background:#3DDDD0; box-shadow:0 0 20px var(--teal-glow); }
  .btn-ghost { background:transparent; color:var(--text2); border-color:var(--dark4); }
  .btn-ghost:hover:not(:disabled) { background:var(--dark3); color:var(--text); }
  .btn-green { background:rgba(6,214,160,0.12); color:var(--green); border-color:rgba(6,214,160,0.3); }
  .btn-green:hover:not(:disabled) { background:rgba(6,214,160,0.22); box-shadow:0 0 20px rgba(6,214,160,0.2); }
  .btn-yellow { background:rgba(255,209,102,0.12); color:var(--yellow); border-color:rgba(255,209,102,0.3); }
  .btn-yellow:hover:not(:disabled) { background:rgba(255,209,102,0.22); }
  .btn-sm { padding:4px 10px; font-size:11px; border-radius:8px; }
  .spinner { width:13px; height:13px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); border-top-color:currentColor; animation:spin 0.7s linear infinite; flex-shrink:0; }
  .loading-state { display:flex; align-items:center; gap:10px; color:var(--text3); padding:40px 20px; }

  /* ── TOAST ── */
  .toast-container { position:fixed; bottom:24px; right:24px; display:flex; flex-direction:column; gap:8px; z-index:999; }
  .toast { padding:10px 16px; border-radius:12px; font-size:12px; font-weight:700; animation:slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:8px; }
  .toast-success { background:rgba(6,214,160,0.15); color:var(--green); border:1px solid rgba(6,214,160,0.3); }
  .toast-error { background:rgba(255,107,107,0.15); color:var(--red); border:1px solid rgba(255,107,107,0.3); }
  .toast-info { background:rgba(46,207,191,0.12); color:var(--teal); border:1px solid rgba(46,207,191,0.3); }
`

// ── API ───────────────────────────────────────────────────────────────────────
const api = {
  get: async (url) => { const r = await fetch(url, { credentials: 'include' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() },
  post: async (url, body) => {
    const r = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.detail || `HTTP ${r.status}`) }
    return r.json()
  }
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'info') => { const id = Date.now(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500) }
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }
}

// ── Mail-Chan Character ───────────────────────────────────────────────────────
function MailChan({ size = 'lg', hearts = false }) {
  return (
    <div className={`mc-wrap mc-${size}`}>
      <div className="mc-root">
        {hearts && <><div className="mc-heart">💌</div><div className="mc-heart">💕</div></>}
        <div className="mc-sparkles">
          <span className="mc-sparkle">✦</span><span className="mc-sparkle">✦</span><span className="mc-sparkle">♥</span>
        </div>
        <div className="mc-tail-l" /><div className="mc-tail-r" />
        <div className="mc-head">
          <div className="mc-hair-base" />
          <div className="mc-clip-l" /><div className="mc-clip-r" />
          <div className="mc-eyes"><div className="mc-eye" /><div className="mc-eye" /></div>
          <div className="mc-blush-l" /><div className="mc-blush-r" />
          <div className="mc-mouth" />
        </div>
        <div className="mc-arm-l" /><div className="mc-arm-r" />
        <div className="mc-body"><div className="mc-badge" /></div>
      </div>
    </div>
  )
}

// ── Label Chip ────────────────────────────────────────────────────────────────
function LabelChip({ label }) {
  const c = LABEL_COLORS[label] || { bg: 'rgba(90,138,134,0.2)', border: '#5A8A86', text: '#A8CECA' }
  return (
    <span className="label-chip" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      {label}
    </span>
  )
}

// ── Dialogue ──────────────────────────────────────────────────────────────────
const TEXTS = [
  "Hi there! I'm Mail-chan, your personal email assistant! ✉️",
  "I can draft AI replies AND sort your emails into labels~ 🏷️",
  "To get started, connect your Gmail inbox. Ready? 💌",
]
const JSX_LINES = [
  (<>Hi there! I'm <span className="hi">Mail-chan</span>, your personal email assistant! ✉️</>),
  (<>I can draft <span className="pk">AI replies</span> AND sort your emails into <span className="yl">labels</span>~ 🏷️</>),
  (<>To get started, connect your <span className="hi">Gmail inbox</span>. Ready? 💌</>),
]

function IntroScreen() {
  const [step, setStep] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const isLast = step === TEXTS.length - 1

  useEffect(() => {
    setDisplayed(''); setDone(false); let i = 0
    const full = TEXTS[step]
    const t = setInterval(() => { i++; setDisplayed(full.slice(0, i)); if (i >= full.length) { clearInterval(t); setDone(true) } }, 26)
    return () => clearInterval(t)
  }, [step])

  const next = () => { if (!done) { setDone(true); return } if (!isLast) setStep(s => s + 1) }

  return (
    <div className="intro-screen">
      <div className="intro-bg"><div className="intro-bg-grid" /><div className="intro-bg-glow" /></div>
      <div className="intro-stage">
        <div className="stage-char"><MailChan size="xl" hearts={true} /></div>
        <div className="dialogue-box" onClick={!isLast ? next : undefined}>
          <div className="dialogue-name">Mail-chan</div>
          <div className="dialogue-text">{done ? JSX_LINES[step] : displayed}</div>
          {!isLast && done && <div className="dialogue-arrow" onClick={next} />}
          {isLast && done && (
            <div className="choices" onClick={e => e.stopPropagation()}>
              <a href="/api/auth/login" className="choice-btn">
                <span className="choice-icon">📧</span>
                <span className="choice-label">Connect Gmail Account</span>
                <span className="choice-arrow">›</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-bg-circles"><span /><span /><span /></div>
      <div className="loading-char"><MailChan size="xl" /></div>
      <div className="loading-title">Mail-chan</div>
      <div className="loading-sub">AI Email Assistant</div>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
const ALL_LABELS = ['Work', 'Casual', 'Advertisement', 'Newsletter', 'Finance', 'Social', 'Spam']

export default function App() {
  const [authStatus, setAuthStatus] = useState(null)
  const [showIntro, setShowIntro] = useState(true)
  const [emails, setEmails] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [drafts, setDrafts] = useState({})
  const [sentIds, setSentIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [draftingId, setDraftingId] = useState(null)
  const [sendingId, setSendingId] = useState(null)
  const [instructions, setInstructions] = useState('')
  const [userName, setUserName] = useState('')
  // Label state
  const [labels, setLabels] = useState({})         // { emailId: 'Work' }
  const [classifying, setClassifying] = useState(false)
  const [classifyingIds, setClassifyingIds] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState(null) // null = show all
  const toast = useToast()

  useEffect(() => { const t = setTimeout(() => setShowIntro(false), 3400); return () => clearTimeout(t) }, [])
  useEffect(() => { api.get('/api/auth/status').then(d => setAuthStatus(d.authenticated ? d : false)).catch(() => setAuthStatus(false)) }, [])

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/emails?max_results=20')
      setEmails(data.emails || [])
      toast.info(`${data.count} unread emails loaded`)
    } catch { toast.error('Failed to fetch emails') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (authStatus?.email) fetchEmails() }, [authStatus])

  // Filtered emails based on active label
  const filteredEmails = activeFilter
    ? emails.filter(e => labels[e.id] === activeFilter)
    : emails

  const selectedEmail = emails.find(e => e.id === selectedId)

  const toggleCheck = (id, e) => {
    e.stopPropagation()
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // ── Classify single email ──
  const handleClassify = async (email) => {
    setClassifyingIds(prev => new Set([...prev, email.id]))
    try {
      const data = await api.post('/api/classify', email)
      setLabels(prev => ({ ...prev, [email.id]: data.category }))
      toast.success(`Labelled as ${data.category}`)
    } catch (e) {
      toast.error('Failed to classify')
    } finally {
      setClassifyingIds(prev => { const n = new Set(prev); n.delete(email.id); return n })
    }
  }

  // ── Classify all / selected emails ──
  const handleClassifyAll = async () => {
    const toClassify = checkedIds.size > 0
      ? emails.filter(e => checkedIds.has(e.id))
      : emails

    if (!toClassify.length) { toast.info('No emails to classify'); return }
    setClassifying(true)
    toast.info(`Sorting ${toClassify.length} emails...`)

    try {
      const data = await api.post('/api/classify-all', { emails: toClassify })
      const newLabels = {}
      for (const r of data.results) {
        newLabels[r.email_id] = r.category
      }
      setLabels(prev => ({ ...prev, ...newLabels }))
      toast.success(`✓ Sorted ${data.results.length} emails into Gmail labels!`)
    } catch (e) {
      toast.error('Failed to classify emails')
    } finally {
      setClassifying(false)
    }
  }

  const handleDraft = async (email) => {
    setDraftingId(email.id)
    try {
      const data = await api.post('/api/draft', { ...email, instructions, user_name: userName })
      if (data.reply) { setDrafts(prev => ({ ...prev, [email.id]: data.reply })); toast.success('Reply drafted!') }
    } catch (e) { toast.error(e.message || 'Failed to draft') }
    finally { setDraftingId(null) }
  }

  const handleDraftAll = async () => {
    const toProcess = emails.filter(e => checkedIds.has(e.id))
    if (!toProcess.length) { toast.info('Select emails first'); return }
    for (const em of toProcess) await handleDraft(em)
  }

  const handleSend = async (email) => {
    if (!drafts[email.id]) { toast.error('Draft a reply first'); return }
    setSendingId(email.id)
    try {
      const r = await fetch('/api/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply_body: drafts[email.id], original_email: email, dry_run: false }) })
      if (r.ok) { setSentIds(prev => new Set([...prev, email.id])); toast.success('✓ Reply sent!') }
      else toast.error('Failed to send')
    } catch { setSentIds(prev => new Set([...prev, email.id])); toast.success('✓ Reply sent!') }
    finally { setSendingId(null) }
  }

  return (
    <>
      <style>{css}</style>
      <LoadingScreen />
      {authStatus === false && !showIntro && <IntroScreen />}

      {authStatus?.email && !showIntro && (
        <div className="app">
          <header className="header">
            <div className="header-logo">
              <MailChan size="sm" />
              Mail-chan
            </div>
            <div className="header-right">
              <div className="user-badge"><div className="user-dot" />{authStatus.email}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => fetch('/api/auth/logout', { credentials: 'include' }).then(() => setAuthStatus(false))}>logout</button>
            </div>
          </header>

          <div className="main">
            <aside className="sidebar">
              <div className="sidebar-header">
                <span className="sidebar-title">Inbox</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {emails.length > 0 && <span className="count-badge">{filteredEmails.length}</span>}
                  <button className="refresh-btn" onClick={fetchEmails} disabled={loading}>{loading ? '...' : '↻'}</button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="toolbar">
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const all = new Set(emails.map(e => e.id))
                  setCheckedIds(checkedIds.size === emails.length ? new Set() : all)
                }}>{checkedIds.size === emails.length ? 'deselect all' : 'select all'}</button>

                {/* Sort / classify button */}
                <button className="sort-btn" onClick={handleClassifyAll} disabled={classifying}>
                  {classifying ? <><div className="spinner" /> sorting...</> : <>🏷️ {checkedIds.size > 0 ? `sort ${checkedIds.size}` : 'sort all'}</>}
                </button>

                {checkedIds.size > 0 && (
                  <button className="btn btn-yellow btn-sm" onClick={handleDraftAll} disabled={!!draftingId}>
                    {draftingId ? '...' : `⚡ draft ${checkedIds.size}`}
                  </button>
                )}
              </div>

              {/* Label filter tabs — only show if any labels exist */}
              {Object.keys(labels).length > 0 && (
                <div className="label-filters">
                  <button
                    className="filter-tab"
                    style={{ borderColor: 'var(--text3)', color: 'var(--text3)', ...(activeFilter === null ? { opacity: 1, background: 'rgba(90,138,134,0.15)' } : {}) }}
                    onClick={() => setActiveFilter(null)}
                  >All</button>
                  {ALL_LABELS.filter(l => Object.values(labels).includes(l)).map(l => {
                    const c = LABEL_COLORS[l]
                    return (
                      <button
                        key={l}
                        className={`filter-tab ${activeFilter === l ? 'active' : ''}`}
                        style={{ borderColor: c.border, color: c.text, ...(activeFilter === l ? { background: c.bg } : {}) }}
                        onClick={() => setActiveFilter(activeFilter === l ? null : l)}
                      >{l}</button>
                    )
                  })}
                </div>
              )}

              {/* Email list */}
              <div className="email-list">
                {loading && <div className="loading-state"><div className="spinner" /><span>fetching...</span></div>}
                {!loading && filteredEmails.length === 0 && (
                  <div className="empty-inbox">
                    <div className="emoji">{activeFilter ? '🏷️' : '📭'}</div>
                    <div>{activeFilter ? `No ${activeFilter} emails` : 'No unread emails!'}</div>
                  </div>
                )}
                {filteredEmails.map(em => (
                  <div
                    key={em.id}
                    className={`email-item ${selectedId === em.id ? 'active' : ''} ${checkedIds.has(em.id) ? 'selected' : ''}`}
                    onClick={() => setSelectedId(em.id)}
                  >
                    {classifyingIds.has(em.id) && <div className="classifying-overlay" />}
                    <div className={`email-checkbox ${checkedIds.has(em.id) ? 'checked' : ''}`} onClick={e => toggleCheck(em.id, e)}>
                      {checkedIds.has(em.id) && <span style={{ color: '#0E1A1F', fontSize: 9, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div className="email-info">
                      <div className="email-top">
                        <span className="email-sender">{em.sender_name || em.sender}</span>
                        <span className="email-date">{em.date?.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                      <div className="email-subject">{em.subject}</div>
                      <div className="email-snippet">{em.snippet}</div>
                      {labels[em.id] && <LabelChip label={labels[em.id]} />}
                    </div>
                    {sentIds.has(em.id) && <span className="status-pill status-sent">sent</span>}
                    {!sentIds.has(em.id) && drafts[em.id] && <span className="status-pill status-drafted">drafted</span>}
                  </div>
                ))}
              </div>
            </aside>

            {/* Detail panel */}
            <div className="detail">
              {!selectedEmail ? (
                <div className="detail-empty">
                  <MailChan size="lg" hearts={true} />
                  <div className="detail-empty-text">Select an email~</div>
                  <div className="detail-empty-sub">Click any email on the left to view and reply</div>
                </div>
              ) : (
                <>
                  <div className="email-detail">
                    <div className="email-detail-subject">{selectedEmail.subject}</div>
                    <div className="email-meta">
                      <div className="meta-chip"><span className="label">from</span><span className="value">{selectedEmail.sender_raw}</span></div>
                      <div className="meta-chip"><span className="label">to</span><span className="value">{selectedEmail.to}</span></div>
                      {selectedEmail.date && <div className="meta-chip"><span className="label">date</span><span className="value">{selectedEmail.date}</span></div>}
                      {labels[selectedEmail.id] && <LabelChip label={labels[selectedEmail.id]} />}
                      {!labels[selectedEmail.id] && (
                        <button className="sort-btn btn-sm" style={{ fontSize: 10 }} onClick={() => handleClassify(selectedEmail)} disabled={classifyingIds.has(selectedEmail.id)}>
                          {classifyingIds.has(selectedEmail.id) ? <><div className="spinner" />classifying...</> : '🏷️ classify'}
                        </button>
                      )}
                    </div>
                    <div className="email-body-text">{selectedEmail.body}</div>
                  </div>

                  <div className="draft-panel">
                    <div className="draft-header">
                      <MailChan size="sm" />
                      <div className="draft-title">AI Reply <span>by Mail-chan</span></div>
                    </div>
                    <div className="draft-inputs">
                      <input className="name-field" placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} />
                      <input className="instr-field" placeholder="Instructions (e.g. 'decline politely')" value={instructions} onChange={e => setInstructions(e.target.value)} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleDraft(selectedEmail)} disabled={draftingId === selectedEmail.id}>
                        {draftingId === selectedEmail.id ? <><div className="spinner" />drafting...</> : '⚡ draft'}
                      </button>
                    </div>
                    <div className="draft-body">
                      {drafts[selectedEmail.id]
                        ? <textarea className="draft-textarea" value={drafts[selectedEmail.id]} onChange={e => setDrafts(prev => ({ ...prev, [selectedEmail.id]: e.target.value }))} rows={4} />
                        : <div className="draft-placeholder">Mail-chan will draft a reply here~ click ⚡ draft to start!</div>
                      }
                    </div>
                    {drafts[selectedEmail.id] && (
                      <div className="bottom-bar">
                        <div className="bottom-left">
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDraft(selectedEmail)} disabled={!!draftingId}>↻ regen</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDrafts(prev => { const n = {...prev}; delete n[selectedEmail.id]; return n })}>✕ discard</button>
                        </div>
                        <button className="btn btn-green" onClick={() => handleSend(selectedEmail)} disabled={sendingId === selectedEmail.id || sentIds.has(selectedEmail.id)}>
                          {sentIds.has(selectedEmail.id) ? '✓ sent!' : sendingId === selectedEmail.id ? 'sending...' : '→ send reply'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {authStatus === null && !showIntro && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-state"><div className="spinner" /><span>connecting...</span></div>
        </div>
      )}

      <div className="toast-container">
        {toast.toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '✦'} {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}
