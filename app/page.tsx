<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pulse Department — Professional Intelligence, Built for Your World</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --ink: #0f0f0f;
    --ink-muted: #6b6b6b;
    --ink-faint: #c8c8c8;
    --paper: #f9f7f4;
    --paper-warm: #f2ede6;
    --blue: #1a4fd6;
    --blue-light: #e8eefb;
    --amber: #e67e22;
    --amber-light: #fef3e2;
    --rule: #e0dbd4;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── NAV ── */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--paper);
    border-bottom: 1px solid var(--rule);
    padding: 0 5vw;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--ink);
    text-decoration: none;
  }

  .nav-logo svg {
    width: 20px;
    height: 20px;
    color: var(--blue);
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .nav-links a {
    font-size: 14px;
    color: var(--ink-muted);
    text-decoration: none;
    transition: color 0.15s;
  }

  .nav-links a:hover { color: var(--ink); }

  .nav-cta {
    background: var(--blue);
    color: #fff !important;
    padding: 8px 18px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px !important;
    transition: background 0.15s !important;
  }

  .nav-cta:hover { background: #1440b8 !important; color: #fff !important; }

  /* ── HERO ── */
  .hero {
    padding: 80px 5vw 72px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .hero-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--blue);
    margin-bottom: 24px;
  }

  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5.5vw, 68px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 28px;
    max-width: 820px;
  }

  .hero h1 em {
    font-style: italic;
    color: var(--blue);
  }

  .hero-sub {
    font-size: 18px;
    color: var(--ink-muted);
    line-height: 1.65;
    max-width: 560px;
    margin-bottom: 40px;
    font-weight: 400;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    align-items: center;
  }

  .btn-primary {
    background: var(--blue);
    color: #fff;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    transition: background 0.15s, transform 0.15s;
    display: inline-block;
  }

  .btn-primary:hover { background: #1440b8; transform: translateY(-1px); }

  .btn-secondary {
    color: var(--ink);
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 500;
    font-size: 15px;
    text-decoration: none;
    border: 1.5px solid var(--rule);
    transition: border-color 0.15s;
    display: inline-block;
  }

  .btn-secondary:hover { border-color: var(--ink-muted); }

  .hero-proof {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--rule);
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }

  .proof-item {
    display: flex;
    flex-direction: column;
  }

  .proof-number {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1;
  }

  .proof-label {
    font-size: 13px;
    color: var(--ink-muted);
    margin-top: 4px;
  }

  /* ── ISSUE PREVIEW ── */
  .preview-section {
    background: var(--ink);
    padding: 80px 5vw;
  }

  .preview-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .section-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--amber);
    margin-bottom: 16px;
  }

  .preview-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .preview-section .section-sub {
    color: #9a9a9a;
    font-size: 16px;
    margin-bottom: 48px;
    max-width: 560px;
  }

  .issue-card {
    background: #1a1a1a;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #2a2a2a;
  }

  .issue-card-header {
    background: linear-gradient(135deg, var(--blue) 0%, #0d2d8a 100%);
    padding: 28px 32px;
  }

  .issue-tag {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace;
  }

  .issue-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 2.5vw, 26px);
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
    margin-bottom: 10px;
  }

  .issue-sub {
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    line-height: 1.5;
  }

  .issue-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0;
  }

  .issue-section-item {
    padding: 22px 28px;
    border-right: 1px solid #2a2a2a;
    border-bottom: 1px solid #2a2a2a;
  }

  .issue-section-item:last-child { border-right: none; }

  .section-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-size: 15px;
  }

  .section-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .section-desc {
    font-size: 12px;
    color: #6b6b6b;
    line-height: 1.5;
  }

  /* ── PULSE FEATURES ── */
  .features-section {
    padding: 96px 5vw;
    max-width: 1100px;
    margin: 0 auto;
  }

  .features-section > .section-eyebrow { color: var(--blue); }

  .features-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
    max-width: 620px;
    line-height: 1.2;
  }

  .features-section .section-sub {
    color: var(--ink-muted);
    font-size: 16px;
    margin-bottom: 56px;
    max-width: 500px;
  }

  .feature-card {
    background: #fff;
    border: 1.5px solid var(--rule);
    border-radius: 16px;
    padding: 36px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }

  .feature-card.lens::before { background: linear-gradient(90deg, #7c3aed, #1a4fd6); }
  .feature-card.synthesis::before { background: linear-gradient(90deg, #e67e22, #f59e0b); }

  .feature-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .feature-badge.lens {
    background: #f3f0ff;
    color: #7c3aed;
  }

  .feature-badge.synthesis {
    background: var(--amber-light);
    color: var(--amber);
  }

  .feature-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
    line-height: 1.25;
  }

  .feature-card p {
    color: var(--ink-muted);
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .feature-example {
    background: var(--paper-warm);
    border-radius: 10px;
    padding: 18px 20px;
    border-left: 3px solid;
  }

  .feature-card.lens .feature-example { border-color: #7c3aed; }
  .feature-card.synthesis .feature-example { border-color: var(--amber); }

  .example-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 8px;
  }

  .example-text {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.6;
    font-style: italic;
  }

  /* ── VERTICALS ── */
  .verticals-section {
    background: var(--paper-warm);
    padding: 80px 5vw;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .verticals-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .verticals-inner h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3vw, 38px);
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 8px;
  }

  .verticals-inner .section-sub {
    color: var(--ink-muted);
    font-size: 15px;
    margin-bottom: 36px;
  }

  .verticals-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .vertical-pill {
    background: #fff;
    border: 1.5px solid var(--rule);
    border-radius: 100px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .vertical-pill span { font-size: 16px; }

  /* ── HOW IT WORKS ── */
  .how-section {
    padding: 96px 5vw;
    max-width: 1100px;
    margin: 0 auto;
  }

  .how-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
  }

  .how-section .section-sub {
    color: var(--ink-muted);
    font-size: 16px;
    margin-bottom: 56px;
    max-width: 480px;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 32px;
  }

  .step {
    position: relative;
  }

  .step-line {
    width: 40px;
    height: 2px;
    background: var(--blue);
    margin-bottom: 20px;
  }

  .step h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
  }

  .step p {
    font-size: 14px;
    color: var(--ink-muted);
    line-height: 1.65;
  }

  /* ── PRICING ── */
  .pricing-section {
    background: var(--ink);
    padding: 96px 5vw;
  }

  .pricing-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .pricing-inner .section-eyebrow { color: var(--amber); margin-bottom: 16px; }

  .pricing-inner h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  .pricing-inner .section-sub {
    color: #9a9a9a;
    font-size: 16px;
    margin-bottom: 56px;
    max-width: 480px;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .pricing-card {
    background: #1a1a1a;
    border: 1.5px solid #2a2a2a;
    border-radius: 16px;
    padding: 32px;
    position: relative;
    transition: border-color 0.2s;
  }

  .pricing-card:hover { border-color: #4a4a4a; }

  .pricing-card.featured {
    border-color: var(--blue);
    background: #111d3a;
  }

  .featured-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--blue);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 20px;
    white-space: nowrap;
    font-family: 'JetBrains Mono', monospace;
  }

  .plan-name {
    font-size: 13px;
    font-weight: 600;
    color: #9a9a9a;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 16px;
    font-family: 'JetBrains Mono', monospace;
  }

  .plan-price {
    font-family: 'Playfair Display', serif;
    font-size: 44px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 4px;
  }

  .plan-price sup {
    font-size: 22px;
    vertical-align: super;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .plan-period {
    font-size: 13px;
    color: #6b6b6b;
    margin-bottom: 24px;
  }

  .plan-issues {
    font-size: 14px;
    color: #9a9a9a;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid #2a2a2a;
  }

  .plan-issues strong { color: #fff; }

  .plan-features {
    list-style: none;
    margin-bottom: 32px;
  }

  .plan-features li {
    font-size: 14px;
    color: #9a9a9a;
    padding: 6px 0;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .plan-features li::before {
    content: '✓';
    color: var(--blue);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .plan-cta {
    display: block;
    text-align: center;
    padding: 13px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.15s;
  }

  .plan-cta.primary {
    background: var(--blue);
    color: #fff;
  }

  .plan-cta.primary:hover { background: #1440b8; }

  .plan-cta.secondary {
    background: transparent;
    color: #9a9a9a;
    border: 1.5px solid #2a2a2a;
  }

  .plan-cta.secondary:hover { border-color: #4a4a4a; color: #fff; }

  /* ── FAQ ── */
  .faq-section {
    padding: 96px 5vw;
    max-width: 780px;
    margin: 0 auto;
  }

  .faq-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3vw, 38px);
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 48px;
  }

  .faq-item {
    border-bottom: 1px solid var(--rule);
    padding: 24px 0;
  }

  .faq-q {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 10px;
  }

  .faq-a {
    font-size: 15px;
    color: var(--ink-muted);
    line-height: 1.7;
  }

  /* ── FINAL CTA ── */
  .final-cta {
    background: linear-gradient(135deg, #0f1e5c 0%, #1a4fd6 100%);
    padding: 96px 5vw;
    text-align: center;
  }

  .final-cta h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 52px);
    font-weight: 900;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.1;
  }

  .final-cta p {
    color: rgba(255,255,255,0.7);
    font-size: 17px;
    margin-bottom: 36px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ── FOOTER ── */
  footer {
    background: var(--ink);
    padding: 40px 5vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-logo {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-copy {
    font-size: 13px;
    color: #6b6b6b;
  }

  .footer-links {
    display: flex;
    gap: 20px;
  }

  .footer-links a {
    font-size: 13px;
    color: #6b6b6b;
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer-links a:hover { color: #fff; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    nav { padding: 0 20px; }
    .hero { padding: 56px 20px 56px; }
    .hero-proof { gap: 24px; }
    .preview-section { padding: 56px 20px; }
    .features-section { padding: 64px 20px; }
    .verticals-section { padding: 56px 20px; }
    .how-section { padding: 64px 20px; }
    .pricing-section { padding: 64px 20px; }
    .faq-section { padding: 64px 20px; }
    .final-cta { padding: 64px 20px; }
    footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
    .issue-section-item { border-right: none; }
    .nav-links .hide-mobile { display: none; }
  }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
    Pulse Department
  </a>
  <div class="nav-links">
    <a href="#features" class="hide-mobile">Features</a>
    <a href="#pricing" class="hide-mobile">Pricing</a>
    <a href="/login">Sign in</a>
    <a href="/pricing" class="nav-cta">Start free</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <p class="hero-eyebrow">Professional Intelligence Platform</p>
  <h1>Your industry.<br/>Your country.<br/><em>Your intelligence.</em></h1>
  <p class="hero-sub">
    Pulse Department generates a complete professional magazine issue for your specific field and location — built fresh from live global, regional, and local sources every time you need it.
  </p>
  <div class="hero-actions">
    <a href="/pricing" class="btn-primary">Get your first issue free</a>
    <a href="#features" class="btn-secondary">See what's inside</a>
  </div>
  <div class="hero-proof">
    <div class="proof-item">
      <span class="proof-number">12</span>
      <span class="proof-label">Professional verticals</span>
    </div>
    <div class="proof-item">
      <span class="proof-number">10</span>
      <span class="proof-label">Sections per issue</span>
    </div>
    <div class="proof-item">
      <span class="proof-number">100+</span>
      <span class="proof-label">Countries supported</span>
    </div>
    <div class="proof-item">
      <span class="proof-number">AI</span>
      <span class="proof-label">Powered by Claude</span>
    </div>
  </div>
</section>

<!-- ISSUE PREVIEW -->
<section class="preview-section">
  <div class="preview-inner">
    <p class="section-eyebrow">What you get</p>
    <h2>Ten sections. One complete picture.</h2>
    <p class="section-sub">Every issue combines real-time searched intelligence with deep professional knowledge — structured so you can go straight to what matters.</p>
    <div class="issue-card">
      <div class="issue-card-header">
        <div class="issue-tag">Finance & Investment · Singapore</div>
        <div class="issue-headline">Singapore Tightens Digital Asset Rules as Regional Capital Flows Accelerate Into Southeast Asia</div>
        <div class="issue-sub">MAS introduces mandatory reserve requirements for stablecoin issuers while cross-border investment volumes between Singapore, Indonesia, and Vietnam hit a five-year high — reshaping the region's financial architecture in real time.</div>
      </div>
      <div class="issue-sections">
        <div class="issue-section-item">
          <div class="section-icon" style="background:#1a3a6b;">📰</div>
          <div class="section-name">Industry News</div>
          <div class="section-desc">7 stories: global, continental & local — sourced live</div>
        </div>
        <div class="issue-section-item">
          <div class="section-icon" style="background:#1a3a2a;">📈</div>
          <div class="section-name">Market Data</div>
          <div class="section-desc">5 real data points benchmarked to your context</div>
        </div>
        <div class="issue-section-item">
          <div class="section-icon" style="background:#3a1a1a;">⚖️</div>
          <div class="section-name">Regulatory Update</div>
          <div class="section-desc">Local, regional and global policy changes that affect you</div>
        </div>
        <div class="issue-section-item">
          <div class="section-icon" style="background:#2a1a3a;">🔍</div>
          <div class="section-name">Trends</div>
          <div class="section-desc">Deep analysis of what's shifting in your profession</div>
        </div>
        <div class="issue-section-item">
          <div class="section-icon" style="background:#1a2a3a;">🏆</div>
          <div class="section-name">Case Study</div>
          <div class="section-desc">A real company solving a real problem in your sector</div>
        </div>
        <div class="issue-section-item">
          <div class="section-icon" style="background:#3a2a1a;">💡</div>
          <div class="section-name">Best Practices</div>
          <div class="section-desc">5 actionable steps you can apply this week</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PULSE FEATURES -->
<section class="features-section" id="features">
  <p class="section-eyebrow">Signature features</p>
  <h2>Two features you won't find anywhere else.</h2>
  <p class="section-sub">Built into every issue — not add-ons, not upgrades.</p>

  <div class="feature-card lens">
    <div class="feature-badge lens">✦ Pulse Lens</div>
    <h3>Your lead story, seen differently.</h3>
    <p>
      Every issue reframes the hero story through one of four analytical lenses — The Historian, The Outsider, The Constraint, The Apprentice — rotating automatically so you never see the same angle twice. It's the question your smartest colleague would ask that nobody else thought to raise.
    </p>
    <div class="feature-example">
      <div class="example-label">The Constraint Lens — Finance & Investment · Brazil</div>
      <div class="example-text">"The assumption underlying Brazil's fintech boom is that regulatory modernisation is the binding constraint on financial inclusion. But what if the real bottleneck is trust, not access? Millions of Brazilians have smartphones, bank accounts, and now fintechs competing for them — yet informal cash transactions still dominate. The constraint lens asks: what does the financial system look like if we stop assuming that availability creates adoption?"</div>
    </div>
  </div>

  <div class="feature-card synthesis">
    <div class="feature-badge synthesis">◈ Pulse Synthesis</div>
    <h3>Connections your industry isn't making yet.</h3>
    <p>
      Every issue, Pulse Synthesis selects two structurally distant stories from your issue's own content — things that appear unrelated — and builds a four-part concept note showing what they produce together. The Seed, The Proposal, Why Now, The Catch. It's the cross-disciplinary thinking that usually only happens in expensive strategy sessions.
    </p>
    <div class="feature-example">
      <div class="example-label">Pulse Synthesis — Marketing & Growth · Indonesia</div>
      <div class="example-text">"Pairing: Indonesia's new data localisation rules requiring consumer data to be stored domestically + a global case study on how Duolingo rebuilt retention using push notification psychology. Proposal: Indonesian consumer brands have a narrow window to build first-party data infrastructure before compliance costs rise — and the retention mechanics that work in low-bandwidth, high-mobile environments are already proven. The brands that move now own the relationship; the ones that wait will pay to rent it."</div>
    </div>
  </div>
</section>

<!-- VERTICALS -->
<section class="verticals-section">
  <div class="verticals-inner">
    <p class="section-eyebrow">Your profession</p>
    <h2>Built for professionals across every major sector.</h2>
    <p class="section-sub">Select your vertical when you sign up. Switch anytime.</p>
    <div class="verticals-grid">
      <div class="vertical-pill"><span>🏥</span> Healthcare & Medicine</div>
      <div class="vertical-pill"><span>⚖️</span> Legal & Compliance</div>
      <div class="vertical-pill"><span>💰</span> Finance & Investment</div>
      <div class="vertical-pill"><span>📣</span> Marketing & Growth</div>
      <div class="vertical-pill"><span>🏗️</span> Manufacturing & Engineering</div>
      <div class="vertical-pill"><span>🌱</span> Agriculture & Food</div>
      <div class="vertical-pill"><span>💡</span> Energy & Utilities</div>
      <div class="vertical-pill"><span>🏠</span> Real Estate</div>
      <div class="vertical-pill"><span>👥</span> Human Resources</div>
      <div class="vertical-pill"><span>💼</span> Business Strategy</div>
      <div class="vertical-pill"><span>💻</span> Technology</div>
      <div class="vertical-pill"><span>🎓</span> Education</div>
      <div class="vertical-pill"><span>🚚</span> Logistics & Supply Chain</div>
      <div class="vertical-pill"><span>🏛️</span> Public Sector & Policy</div>
      <div class="vertical-pill"><span>+ more</span></div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
  <p class="section-eyebrow" style="color:var(--blue);">How it works</p>
  <h2>From nothing to a complete professional briefing in minutes.</h2>
  <p class="section-sub">No setup, no configuration, no waiting for a weekly email.</p>
  <div class="steps">
    <div class="step">
      <div class="step-line"></div>
      <h4>Choose your vertical and country</h4>
      <p>Pick your profession and where you're based. Pulse Department calibrates global, regional, and local coverage accordingly.</p>
    </div>
    <div class="step">
      <div class="step-line"></div>
      <h4>Generate your issue</h4>
      <p>Hit Generate. In a few minutes, a complete ten-section professional magazine issue is built from live sources and deep knowledge — specific to your field and location.</p>
    </div>
    <div class="step">
      <div class="step-line"></div>
      <h4>Read what matters, skip what doesn't</h4>
      <p>Navigate ten tabs. Each section is complete and standalone — dip in for the regulatory update, or read the full issue cover to cover.</p>
    </div>
    <div class="step">
      <div class="step-line"></div>
      <h4>Refresh whenever you need fresh intelligence</h4>
      <p>Generate a new issue whenever you want one. Each issue is built fresh — no repeated stories, no recycled headlines.</p>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="pricing-section" id="pricing">
  <div class="pricing-inner">
    <p class="section-eyebrow">Pricing</p>
    <h2>Simple pricing. No surprises.</h2>
    <p class="section-sub">Start with one free issue. No credit card required.</p>
    <div class="pricing-grid">

      <div class="pricing-card">
        <div class="plan-name">Starter</div>
        <div class="plan-price"><sup>$</sup>10</div>
        <div class="plan-period">per month</div>
        <div class="plan-issues"><strong>4 issues</strong> per month across your verticals</div>
        <ul class="plan-features">
          <li>All 10 sections per issue</li>
          <li>Pulse Lens included</li>
          <li>Pulse Synthesis included</li>
          <li>15+ professional verticals</li>
          <li>100+ countries</li>
          <li>Content history</li>
        </ul>
        <a href="/pricing" class="plan-cta secondary">Get started</a>
      </div>

      <div class="pricing-card featured">
        <div class="featured-badge">Most popular</div>
        <div class="plan-name">Pro</div>
        <div class="plan-price"><sup>$</sup>25</div>
        <div class="plan-period">per month</div>
        <div class="plan-issues"><strong>12 issues</strong> per month across your verticals</div>
        <ul class="plan-features">
          <li>Everything in Starter</li>
          <li>3× the generation allowance</li>
          <li>Priority generation</li>
          <li>Email delivery of issues</li>
          <li>Multiple verticals</li>
        </ul>
        <a href="/pricing" class="plan-cta primary">Get started</a>
      </div>

      <div class="pricing-card">
        <div class="plan-name">Corporate</div>
        <div class="plan-price"><sup>$</sup>75</div>
        <div class="plan-period">per month</div>
        <div class="plan-issues"><strong>40 issues</strong> per month across your verticals</div>
        <ul class="plan-features">
          <li>Everything in Pro</li>
          <li>Team sharing</li>
          <li>All verticals, unlimited switching</li>
          <li>Dedicated support</li>
          <li>Early access to new features</li>
        </ul>
        <a href="/pricing" class="plan-cta secondary">Get started</a>
      </div>

    </div>
  </div>
</section>

<!-- FAQ -->
<section class="faq-section">
  <h2>Common questions.</h2>

  <div class="faq-item">
    <div class="faq-q">Is the content actually current, or is it from a database?</div>
    <div class="faq-a">The news, market data, regulatory updates, and events sections are generated using live web search every time you generate an issue — not pulled from a content database. The analysis, trends, case studies, and best practices sections are built from deep professional knowledge rather than search, since those sections benefit from depth over recency.</div>
  </div>

  <div class="faq-item">
    <div class="faq-q">What are Pulse Lens and Pulse Synthesis?</div>
    <div class="faq-a">Pulse Lens reframes your issue's lead story through one of four analytical perspectives — The Historian, The Outsider, The Constraint, The Apprentice — rotating each issue so you always get a fresh angle. Pulse Synthesis finds two structurally unrelated stories in your issue and shows what a novel business or policy concept they produce together. Both are included in every plan at no extra cost.</div>
  </div>

  <div class="faq-item">
    <div class="faq-q">Will I see the same content repeated across issues?</div>
    <div class="faq-a">No. Pulse Department tracks your recent issue history for each vertical and actively avoids repeating the same stories, companies, data releases, or topics — even across multiple refreshes of the same vertical.</div>
  </div>

  <div class="faq-item">
    <div class="faq-q">How is this different from a newsletter or news aggregator?</div>
    <div class="faq-a">Newsletters give everyone the same content. News aggregators show you everything and filter nothing. Pulse Department generates a complete, structured professional briefing built specifically for your field and your country — with analysis, case studies, best practices, and original perspectives that no aggregator produces.</div>
  </div>

  <div class="faq-item">
    <div class="faq-q">What payment methods do you accept?</div>
    <div class="faq-a">We accept PayPal for all plans. Additional payment options are coming soon.</div>
  </div>

  <div class="faq-item">
    <div class="faq-q">Can I try it before paying?</div>
    <div class="faq-a">Yes. Every new account gets one free issue — no credit card required. Generate a full issue for your profession and your country, read all ten sections, and decide from there.</div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta">
  <h2>Your first issue is free.<br/>No card required.</h2>
  <p>Pick your vertical, pick your country, and see what a professional intelligence platform built for your world actually looks like.</p>
  <a href="/pricing" class="btn-primary" style="font-size:16px; padding:16px 36px;">Generate your first issue</a>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#1a4fd6;">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
    Pulse Department
  </div>
  <div class="footer-links">
    <a href="/pricing">Pricing</a>
    <a href="/login">Sign in</a>
  </div>
  <div class="footer-copy">© 2026 Pulse Department. All rights reserved.</div>
</footer>

</body>
</html>

