export default function HomePage() {
  return (
    <>
      <style>{`
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

        .pd-nav {
          position: sticky; top: 0; z-index: 100;
          background: var(--paper);
          border-bottom: 1px solid var(--rule);
          padding: 0 5vw; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pd-nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
          color: var(--ink); text-decoration: none;
        }
        .pd-nav-logo svg { width: 20px; height: 20px; color: var(--blue); }
        .pd-nav-links { display: flex; align-items: center; gap: 24px; }
        .pd-nav-links a { font-size: 14px; color: var(--ink-muted); text-decoration: none; transition: color 0.15s; }
        .pd-nav-links a:hover { color: var(--ink); }
        .pd-nav-cta {
          background: var(--blue); color: #fff !important;
          padding: 8px 18px; border-radius: 8px;
          font-weight: 500; font-size: 14px !important;
          transition: background 0.15s !important;
        }
        .pd-nav-cta:hover { background: #1440b8 !important; }

        .pd-hero { padding: 80px 5vw 72px; max-width: 1100px; margin: 0 auto; }
        .pd-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--blue); margin-bottom: 24px;
        }
        .pd-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5.5vw, 68px); font-weight: 900;
          line-height: 1.08; letter-spacing: -0.02em;
          color: var(--ink); margin-bottom: 28px; max-width: 820px;
        }
        .pd-hero h1 em { font-style: italic; color: var(--blue); }
        .pd-hero-sub {
          font-size: 18px; color: var(--ink-muted); line-height: 1.65;
          max-width: 560px; margin-bottom: 40px; font-weight: 400;
        }
        .pd-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .pd-btn-primary {
          background: var(--blue); color: #fff;
          padding: 14px 28px; border-radius: 10px;
          font-weight: 600; font-size: 15px; text-decoration: none;
          transition: background 0.15s, transform 0.15s; display: inline-block;
        }
        .pd-btn-primary:hover { background: #1440b8; transform: translateY(-1px); }
        .pd-btn-secondary {
          color: var(--ink); padding: 14px 28px; border-radius: 10px;
          font-weight: 500; font-size: 15px; text-decoration: none;
          border: 1.5px solid var(--rule); transition: border-color 0.15s; display: inline-block;
        }
        .pd-btn-secondary:hover { border-color: var(--ink-muted); }
        .pd-hero-proof {
          margin-top: 48px; padding-top: 32px;
          border-top: 1px solid var(--rule);
          display: flex; gap: 40px; flex-wrap: wrap;
        }
        .pd-proof-item { display: flex; flex-direction: column; }
        .pd-proof-number {
          font-family: 'Playfair Display', serif;
          font-size: 32px; font-weight: 700; color: var(--ink); line-height: 1;
        }
        .pd-proof-label { font-size: 13px; color: var(--ink-muted); margin-top: 4px; }

        .pd-preview { background: #0f1e5c; padding: 80px 5vw; }
        .pd-preview-inner { max-width: 1100px; margin: 0 auto; }
        .pd-section-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--amber); margin-bottom: 16px;
        }
        .pd-preview h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 700;
          color: #fff; margin-bottom: 12px; line-height: 1.2;
        }
        .pd-preview .pd-section-sub { color: #93b4e8; font-size: 16px; margin-bottom: 48px; max-width: 560px; }
        .pd-issue-card { background: #162454; border-radius: 16px; overflow: hidden; border: 1px solid #1e3070; }
        .pd-issue-header { background: linear-gradient(135deg, var(--blue) 0%, #0d2d8a 100%); padding: 28px 32px; }
        .pd-issue-tag {
          display: inline-block; background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 20px; margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace;
        }
        .pd-issue-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.5vw, 26px); font-weight: 700;
          color: #fff; line-height: 1.25; margin-bottom: 10px;
        }
        .pd-issue-sub { color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5; }
        .pd-issue-sections {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0;
        }
        .pd-issue-section-item {
          padding: 22px 28px;
          border-right: 1px solid #1e3070; border-bottom: 1px solid #1e3070;
        }
        .pd-section-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px; font-size: 15px;
        }
        .pd-section-name { font-size: 13px; font-weight: 600; color: #e8eefb; margin-bottom: 4px; }
        .pd-section-desc { font-size: 12px; color: #93b4e8; line-height: 1.5; }

        .pd-features { padding: 96px 5vw; max-width: 1100px; margin: 0 auto; }
        .pd-features .pd-eyebrow { color: var(--blue); }
        .pd-features h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 700;
          color: var(--ink); margin-bottom: 12px; max-width: 620px; line-height: 1.2;
        }
        .pd-features .pd-section-sub { color: var(--ink-muted); font-size: 16px; margin-bottom: 56px; max-width: 500px; }
        .pd-feature-card {
          background: #fff; border: 1.5px solid var(--rule);
          border-radius: 16px; padding: 36px; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .pd-feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }
        .pd-feature-card.lens::before { background: linear-gradient(90deg, #7c3aed, #1a4fd6); }
        .pd-feature-card.synthesis::before { background: linear-gradient(90deg, #e67e22, #f59e0b); }
        .pd-feature-card.clippings::before { background: linear-gradient(90deg, #059669, #10b981); }
        .pd-feature-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 5px 12px;
          border-radius: 20px; margin-bottom: 20px;
        }
        .pd-feature-badge.lens { background: #f3f0ff; color: #7c3aed; }
        .pd-feature-badge.synthesis { background: var(--amber-light); color: var(--amber); }
        .pd-feature-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: var(--ink);
          margin-bottom: 12px; line-height: 1.25;
        }
        .pd-feature-card p { color: var(--ink-muted); font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
        .pd-feature-example {
          background: var(--paper-warm); border-radius: 10px;
          padding: 18px 20px; border-left: 3px solid;
        }
        .pd-feature-card.lens .pd-feature-example { border-color: #7c3aed; }
        .pd-feature-card.synthesis .pd-feature-example { border-color: var(--amber); }
        .pd-feature-card.clippings .pd-feature-example { border-color: #059669; }
        .pd-feature-badge.clippings { background: #ecfdf5; color: #059669; }
        .pd-example-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px;
        }
        .pd-example-text { font-size: 14px; color: var(--ink); line-height: 1.6; font-style: italic; }

        .pd-verticals {
          background: var(--paper-warm); padding: 80px 5vw;
          border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
        }
        .pd-verticals-inner { max-width: 1100px; margin: 0 auto; }
        .pd-verticals-inner h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 38px); font-weight: 700;
          color: var(--ink); margin-bottom: 8px;
        }
        .pd-verticals-inner .pd-section-sub { color: var(--ink-muted); font-size: 15px; margin-bottom: 36px; }
        .pd-verticals-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .pd-vertical-pill {
          background: #fff; border: 1.5px solid var(--rule);
          border-radius: 100px; padding: 8px 18px;
          font-size: 14px; font-weight: 500; color: var(--ink);
          display: flex; align-items: center; gap: 8px;
        }

        .pd-how { padding: 96px 5vw; max-width: 1100px; margin: 0 auto; }
        .pd-how h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 700;
          color: var(--ink); margin-bottom: 12px;
        }
        .pd-how .pd-section-sub { color: var(--ink-muted); font-size: 16px; margin-bottom: 56px; max-width: 480px; }
        .pd-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; }
        .pd-step-line { width: 40px; height: 2px; background: var(--blue); margin-bottom: 20px; }
        .pd-step h4 { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .pd-step p { font-size: 14px; color: var(--ink-muted); line-height: 1.65; }

        .pd-pricing { background: #0f1e5c; padding: 96px 5vw; }
        .pd-pricing-inner { max-width: 1100px; margin: 0 auto; }
        .pd-pricing-inner .pd-section-eyebrow { color: var(--amber); margin-bottom: 16px; }
        .pd-pricing-inner h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 700;
          color: #fff; margin-bottom: 12px;
        }
        .pd-pricing-inner .pd-section-sub { color: #93b4e8; font-size: 16px; margin-bottom: 56px; max-width: 480px; }
        .pd-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .pd-pricing-card {
          background: #162454; border: 1.5px solid #1e3070;
          border-radius: 16px; padding: 32px; position: relative; transition: border-color 0.2s;
        }
        .pd-pricing-card:hover { border-color: #4a4a4a; }
        .pd-pricing-card.featured { border-color: #60a5fa; background: #1a3a8f; }
        .pd-featured-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--blue); color: #fff;
          font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 4px 14px; border-radius: 20px;
          white-space: nowrap; font-family: 'JetBrains Mono', monospace;
        }
        .pd-plan-name {
          font-size: 13px; font-weight: 600; color: #93b4e8;
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 16px; font-family: 'JetBrains Mono', monospace;
        }
        .pd-plan-price {
          font-family: 'Playfair Display', serif;
          font-size: 44px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 4px;
        }
        .pd-plan-price sup {
          font-size: 22px; vertical-align: super;
          font-family: 'Inter', sans-serif; font-weight: 400;
        }
        .pd-plan-period { font-size: 13px; color: #93b4e8; margin-bottom: 24px; }
        .pd-plan-issues {
          font-size: 14px; color: #9a9a9a;
          margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #1e3070;
        }
        .pd-plan-issues strong { color: #fff; }
        .pd-plan-features { list-style: none; margin-bottom: 32px; }
        .pd-plan-features li {
          font-size: 14px; color: #93b4e8; padding: 6px 0;
          display: flex; gap: 10px; align-items: flex-start;
        }
        .pd-plan-features li::before {
          content: '✓'; color: var(--blue); font-weight: 700;
          flex-shrink: 0; margin-top: 1px;
        }
        .pd-plan-cta {
          display: block; text-align: center; padding: 13px;
          border-radius: 10px; font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.15s;
        }
        .pd-plan-cta.primary { background: var(--blue); color: #fff; }
        .pd-plan-cta.primary:hover { background: #1440b8; }
        .pd-plan-cta.secondary { background: transparent; color: #93b4e8; border: 1.5px solid #1e3070; }
        .pd-plan-cta.secondary:hover { border-color: #60a5fa; color: #fff; }

        .pd-faq { padding: 96px 5vw; max-width: 780px; margin: 0 auto; }
        .pd-faq h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 38px); font-weight: 700;
          color: var(--ink); margin-bottom: 48px;
        }
        .pd-faq-item { border-bottom: 1px solid var(--rule); padding: 24px 0; }
        .pd-faq-q { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
        .pd-faq-a { font-size: 15px; color: var(--ink-muted); line-height: 1.7; }

        .pd-final-cta {
          background: linear-gradient(135deg, #0f1e5c 0%, #1a4fd6 100%);
          padding: 96px 5vw; text-align: center;
        }
        .pd-final-cta h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 52px); font-weight: 900;
          color: #fff; margin-bottom: 16px; line-height: 1.1;
        }
        .pd-final-cta p {
          color: rgba(255,255,255,0.7); font-size: 17px; margin-bottom: 36px;
          max-width: 480px; margin-left: auto; margin-right: auto;
        }

        .pd-footer {
          background: #0f1e5c; padding: 40px 5vw;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .pd-footer-logo {
          font-family: 'Inter', sans-serif; font-weight: 600;
          font-size: 14px; color: #fff; display: flex; align-items: center; gap: 8px;
        }
        .pd-footer-copy { font-size: 13px; color: #93b4e8; }
        .pd-footer-links { display: flex; gap: 20px; }
        .pd-footer-links a { font-size: 13px; color: #93b4e8; text-decoration: none; transition: color 0.15s; }
        .pd-footer-links a:hover { color: #fff; }

        @media (max-width: 640px) {
          .pd-nav { padding: 0 20px; }
          .pd-hero { padding: 56px 20px; }
          .pd-hero-proof { gap: 24px; }
          .pd-preview { padding: 56px 20px; }
          .pd-features { padding: 64px 20px; }
          .pd-verticals { padding: 56px 20px; }
          .pd-how { padding: 64px 20px; }
          .pd-pricing { padding: 64px 20px; }
          .pd-faq { padding: 64px 20px; }
          .pd-final-cta { padding: 64px 20px; }
          .pd-footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
          .pd-issue-section-item { border-right: none; }
          .pd-hide-mobile { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="pd-nav">
        <a href="/" className="pd-nav-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          Pulse Department
        </a>
        <div className="pd-nav-links">
          <a href="#features" className="pd-hide-mobile">Features</a>
          <a href="#pricing" className="pd-hide-mobile">Pricing</a>
          <a href="/login">Sign in</a>
          <a href="/pricing" className="pd-nav-cta">Start free</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pd-hero">
        <p className="pd-eyebrow">Professional Intelligence Platform</p>
        <h1>Your industry.<br />Your country.<br /><em>Your intelligence.</em></h1>
        <p className="pd-hero-sub">
          Pulse Department generates a complete professional magazine issue for your specific field and location — built fresh from live global, regional, and local sources every time you need it.
        </p>
        <div className="pd-hero-actions">
          <a href="/pricing" className="pd-btn-primary">Get your first issue free</a>
          <a href="#features" className="pd-btn-secondary">See what&apos;s inside</a>
        </div>
        <div className="pd-hero-proof">
          <div className="pd-proof-item">
            <span className="pd-proof-number">12</span>
            <span className="pd-proof-label">Professional verticals</span>
          </div>
          <div className="pd-proof-item">
            <span className="pd-proof-number">10</span>
            <span className="pd-proof-label">Sections per issue</span>
          </div>
          <div className="pd-proof-item">
            <span className="pd-proof-number">100+</span>
            <span className="pd-proof-label">Countries supported</span>
          </div>
          <div className="pd-proof-item">
            <span className="pd-proof-number">AI</span>
            <span className="pd-proof-label">Powered by Claude</span>
          </div>
        </div>
      </section>

      {/* ISSUE PREVIEW */}
      <section className="pd-preview">
        <div className="pd-preview-inner">
          <p className="pd-section-eyebrow">What you get</p>
          <h2>Ten sections. One complete picture.</h2>
          <p className="pd-section-sub">Every issue combines real-time searched intelligence with deep professional knowledge — structured so you can go straight to what matters.</p>
          <div className="pd-issue-card">
            <div className="pd-issue-header">
              <div className="pd-issue-tag">Finance &amp; Investment · Singapore</div>
              <div className="pd-issue-headline">Singapore Tightens Digital Asset Rules as Regional Capital Flows Accelerate Into Southeast Asia</div>
              <div className="pd-issue-sub">MAS introduces mandatory reserve requirements for stablecoin issuers while cross-border investment volumes between Singapore, Indonesia, and Vietnam hit a five-year high — reshaping the region&apos;s financial architecture in real time.</div>
            </div>
            <div className="pd-issue-sections">
              {[
                { bg: '#1a3a6b', icon: '📰', name: 'Industry News', desc: '7 stories: global, continental & local — sourced live' },
                { bg: '#1a3a2a', icon: '📈', name: 'Market Data', desc: '5 real data points benchmarked to your context' },
                { bg: '#3a1a1a', icon: '⚖️', name: 'Regulatory Update', desc: 'Local, regional and global policy changes that affect you' },
                { bg: '#2a1a3a', icon: '🔍', name: 'Trends', desc: "Deep analysis of what's shifting in your profession" },
                { bg: '#1a2a3a', icon: '🏆', name: 'Case Study', desc: 'A real company solving a real problem in your sector' },
                { bg: '#3a2a1a', icon: '💡', name: 'Best Practices', desc: '5 actionable steps you can apply this week' },
              ].map((s) => (
                <div key={s.name} className="pd-issue-section-item">
                  <div className="pd-section-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="pd-section-name">{s.name}</div>
                  <div className="pd-section-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PULSE FEATURES */}
      <section className="pd-features" id="features">
        <p className="pd-eyebrow">Signature features</p>
        <h2>Three features you won&apos;t find anywhere else.</h2>
        <p className="pd-section-sub">Built into every subscription — not add-ons, not upgrades.</p>

        <div className="pd-feature-card lens">
          <div className="pd-feature-badge lens">✦ Pulse Lens</div>
          <h3>Your lead story, seen differently.</h3>
          <p>
            Every issue reframes the hero story through one of four analytical lenses — The Historian, The Outsider, The Constraint, The Apprentice — rotating automatically so you never see the same angle twice. It&apos;s the question your smartest colleague would ask that nobody else thought to raise.
          </p>
          <div className="pd-feature-example">
            <div className="pd-example-label">The Constraint Lens — Finance &amp; Investment · Brazil</div>
            <div className="pd-example-text">&ldquo;The assumption underlying Brazil&apos;s fintech boom is that regulatory modernisation is the binding constraint on financial inclusion. But what if the real bottleneck is trust, not access? Millions of Brazilians have smartphones, bank accounts, and now fintechs competing for them — yet informal cash transactions still dominate. The constraint lens asks: what does the financial system look like if we stop assuming that availability creates adoption?&rdquo;</div>
          </div>
        </div>

        <div className="pd-feature-card synthesis">
          <div className="pd-feature-badge synthesis">◈ Pulse Synthesis</div>
          <h3>Connections your industry isn&apos;t making yet.</h3>
          <p>
            Every issue, Pulse Synthesis selects two structurally distant stories from your issue&apos;s own content — things that appear unrelated — and builds a four-part concept note showing what they produce together. The Seed, The Proposal, Why Now, The Catch. It&apos;s the cross-disciplinary thinking that usually only happens in expensive strategy sessions.
          </p>
          <div className="pd-feature-example">
            <div className="pd-example-label">Pulse Synthesis — Marketing &amp; Growth · Indonesia</div>
            <div className="pd-example-text">&ldquo;Pairing: Indonesia&apos;s new data localisation rules requiring consumer data to be stored domestically + a global case study on how Duolingo rebuilt retention using push notification psychology. Proposal: Indonesian consumer brands have a narrow window to build first-party data infrastructure before compliance costs rise — and the retention mechanics that work in low-bandwidth, high-mobile environments are already proven. The brands that move now own the relationship; the ones that wait will pay to rent it.&rdquo;</div>
          </div>
        </div>

        <div className="pd-feature-card clippings">
          <div className="pd-feature-badge clippings">◉ Press Clippings Watchlist</div>
          <h3>Your people, companies, and topics. Tracked for you.</h3>
          <p>
            Add up to 10 people, companies, competitors, or topics to your personal watchlist. Every Monday morning, Pulse Department searches the web for the latest news on each one and delivers a curated digest straight to your inbox — so you never miss a development that matters to you, without having to search for it yourself.
          </p>
          <div className="pd-feature-example">
            <div className="pd-example-label">Sample watchlist digest — delivered Monday 7AM</div>
            <div className="pd-example-text">&ldquo;Watching: <strong>Safaricom M-Pesa expansion</strong> — 3 new developments this week, including a reported partnership with a major East African retail chain and a new merchant API launch. Also watching: <strong>AfCFTA implementation</strong> — two member states ratified new rules of origin protocols; dispute resolution timeline updated.&rdquo;</div>
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section className="pd-verticals">
        <div className="pd-verticals-inner">
          <p className="pd-eyebrow" style={{ color: 'var(--blue)' }}>Your profession</p>
          <h2>Built for professionals across every major sector.</h2>
          <p className="pd-section-sub">Select your vertical when you sign up. Switch anytime.</p>
          <div className="pd-verticals-grid">
            {[
              { icon: '🏥', name: 'Healthcare & Medicine' },
              { icon: '⚖️', name: 'Legal & Compliance' },
              { icon: '💰', name: 'Finance & Investment' },
              { icon: '📣', name: 'Marketing & Growth' },
              { icon: '🏗️', name: 'Manufacturing & Engineering' },
              { icon: '🌱', name: 'Agriculture & Food' },
              { icon: '💡', name: 'Energy & Utilities' },
              { icon: '🏠', name: 'Real Estate' },
              { icon: '👥', name: 'Human Resources' },
              { icon: '💼', name: 'Business Strategy' },
              { icon: '💻', name: 'Technology' },
              { icon: '🎓', name: 'Education' },
            ].map((v) => (
              <div key={v.name} className="pd-vertical-pill">
                <span>{v.icon}</span> {v.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="pd-how">
        <p className="pd-eyebrow" style={{ color: 'var(--blue)' }}>How it works</p>
        <h2>From nothing to a complete professional briefing in minutes.</h2>
        <p className="pd-section-sub">No setup, no configuration, no waiting for a weekly email.</p>
        <div className="pd-steps">
          {[
            { title: 'Choose your vertical and country', body: 'Pick your profession and where you\'re based. Pulse Department calibrates global, regional, and local coverage accordingly.' },
            { title: 'Generate your issue', body: 'Hit Generate. In a few minutes, a complete ten-section professional magazine issue is built from live sources and deep knowledge — specific to your field and location.' },
            { title: 'Read what matters, skip what doesn\'t', body: 'Navigate ten tabs. Each section is complete and standalone — dip in for the regulatory update, or read the full issue cover to cover.' },
            { title: 'Refresh whenever you need fresh intelligence', body: 'Generate a new issue whenever you want one. Each issue is built fresh — no repeated stories, no recycled headlines.' },
          ].map((s) => (
            <div key={s.title} className="pd-step">
              <div className="pd-step-line"></div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pd-pricing" id="pricing">
        <div className="pd-pricing-inner">
          <p className="pd-section-eyebrow">Pricing</p>
          <h2>Simple pricing. No surprises.</h2>
          <p className="pd-section-sub">Start with one free issue. No credit card required.</p>
          <div className="pd-pricing-grid">

            <div className="pd-pricing-card">
              <div className="pd-plan-name">Starter</div>
              <div className="pd-plan-price"><sup>$</sup>10</div>
              <div className="pd-plan-period">per month</div>
              <div className="pd-plan-issues"><strong>4 issues</strong> per month across your verticals</div>
              <ul className="pd-plan-features">
                <li>All 10 sections per issue</li>
                <li>Pulse Lens included</li>
                <li>Pulse Synthesis included</li>
                <li>Press Clippings Watchlist (10 terms)</li>
                <li>12 professional verticals</li>
                <li>100+ countries</li>
                <li>Content history</li>
              </ul>
              <a href="/pricing" className="pd-plan-cta secondary">Get started</a>
            </div>

            <div className="pd-pricing-card featured">
              <div className="pd-featured-badge">Most popular</div>
              <div className="pd-plan-name">Pro</div>
              <div className="pd-plan-price"><sup>$</sup>25</div>
              <div className="pd-plan-period">per month</div>
              <div className="pd-plan-issues"><strong>12 issues</strong> per month across your verticals</div>
              <ul className="pd-plan-features">
                <li>Everything in Starter</li>
                <li>3× the generation allowance</li>
                <li>Press Clippings Watchlist (10 terms)</li>
                <li>Priority generation</li>
                <li>Email delivery of issues</li>
                <li>Multiple verticals</li>
              </ul>
              <a href="/pricing" className="pd-plan-cta primary">Get started</a>
            </div>

            <div className="pd-pricing-card">
              <div className="pd-plan-name">Corporate</div>
              <div className="pd-plan-price"><sup>$</sup>75</div>
              <div className="pd-plan-period">per month</div>
              <div className="pd-plan-issues"><strong>40 issues</strong> per month across your verticals</div>
              <ul className="pd-plan-features">
                <li>Everything in Pro</li>
                <li>Press Clippings Watchlist (10 terms)</li>
                <li>Team sharing</li>
                <li>All verticals, unlimited switching</li>
                <li>Dedicated support</li>
                <li>Early access to new features</li>
              </ul>
              <a href="/pricing" className="pd-plan-cta secondary">Get started</a>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pd-faq">
        <h2>Common questions.</h2>
        {[
          {
            q: 'Is the content actually current, or is it from a database?',
            a: 'The news, market data, regulatory updates, and events sections are generated using live web search every time you generate an issue — not pulled from a content database. The analysis, trends, case studies, and best practices sections are built from deep professional knowledge rather than search, since those sections benefit from depth over recency.',
          },
          {
            q: 'What are Pulse Lens and Pulse Synthesis?',
            a: 'Pulse Lens reframes your issue\'s lead story through one of four analytical perspectives — The Historian, The Outsider, The Constraint, The Apprentice — rotating each issue so you always get a fresh angle. Pulse Synthesis finds two structurally unrelated stories in your issue and shows what a novel business or policy concept they produce together. Both are included in every plan at no extra cost.',
          },
          {
            q: 'What is the Press Clippings Watchlist?',
            a: 'Add up to 10 people, companies, competitors, or topics you want to track. Every Monday morning, Pulse Department searches the web for the latest news on each one and emails you a personalised digest — no setup, no alerts to configure, no searching required. It works across any topic in any country with web coverage.',
          },
          {
            q: 'Will I see the same content repeated across issues?',
            a: 'No. Pulse Department tracks your recent issue history for each vertical and actively avoids repeating the same stories, companies, data releases, or topics — even across multiple refreshes of the same vertical.',
          },
          {
            q: 'How is this different from a newsletter or news aggregator?',
            a: 'Newsletters give everyone the same content. News aggregators show you everything and filter nothing. Pulse Department generates a complete, structured professional briefing built specifically for your field and your country — with analysis, case studies, best practices, and original perspectives that no aggregator produces.',
          },
          {
            q: 'What payment methods do you accept?',
            a: 'We accept PayPal for all plans. Additional payment options are coming soon.',
          },
          {
            q: 'Can I try it before paying?',
            a: 'Yes. Every new account gets one free issue — no credit card required. Generate a full issue for your profession and your country, read all ten sections, and decide from there.',
          },
        ].map((item) => (
          <div key={item.q} className="pd-faq-item">
            <div className="pd-faq-q">{item.q}</div>
            <div className="pd-faq-a">{item.a}</div>
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section className="pd-final-cta">
        <h2>Your first issue is free.<br />No card required.</h2>
        <p>Pick your vertical, pick your country, and see what a professional intelligence platform built for your world actually looks like.</p>
        <a href="/pricing" className="pd-btn-primary" style={{ fontSize: '16px', padding: '16px 36px' }}>Generate your first issue</a>
      </section>

      {/* FOOTER */}
      <footer className="pd-footer">
        <div className="pd-footer-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a4fd6' }}>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          Pulse Department
        </div>
        <div className="pd-footer-links">
          <a href="/pricing">Pricing</a>
          <a href="/login">Sign in</a>
        </div>
        <div className="pd-footer-copy">© 2026 Pulse Department. All rights reserved.</div>
      </footer>
    </>
  );
}

