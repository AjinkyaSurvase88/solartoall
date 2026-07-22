"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sun, 
  Zap, 
  Battery, 
  Home as HomeIcon, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowUpRight, 
  Check, 
  Award, 
  Flame, 
  TrendingUp, 
  HelpCircle,
  Mail,
  CheckCircle2,
  AlertTriangle,
  User,
  ThumbsUp,
  LineChart,
  ArrowLeft,
  ArrowUp
} from 'lucide-react';
import styles from './page.module.css';
import SolarPredictor from '../components/SolarPredictor';
import BillScanner from '../components/BillScanner';
import ChatbotWidget from '../components/ChatbotWidget';

/* ─── FAQ Data (from solartoall.com) ─── */
const FAQS = [
  { q: "What size solar system do I need for my house?", a: "The right system size depends on your monthly electricity consumption. Divide your monthly kWh usage by your location's peak sun hours per day × 30 days. For most Indian homes using 300–500 kWh/month, a 3–5 kW system is ideal. We provide a free custom sizing report based on your actual bill and rooftop area." },
  { q: "How to choose the right solar energy system?", a: "We provide tailor-made solar design recommendations based on your specific energy consumption, budget, and location. The key factors are: system size (kW), panel efficiency, inverter type (string vs. hybrid), and whether you need battery backup. Our free report covers all of these for your home." },
  { q: "How long is the payback period for solar?", a: "For most residential solar installations in India, the payback period is 4–6 years with government subsidies. After that, you generate free electricity for 20+ more years. Commercial systems typically pay back in 3–4 years due to higher energy consumption and no VAT on commercial electricity." },
  { q: "Questions to ask solar installer before signing?", a: "Key questions include: Are you MNRE-empanelled? What brand of panels and inverters do you use? What is the workmanship warranty? Who handles net metering application? Do you provide performance monitoring? We connect you only with vetted, top-rated installers who meet these standards." },
  { q: "Most efficient solar panels for residential use?", a: "Our Solar Product Technology Finder provides you with a package of technologies that can meet your solar needs. Currently, monocrystalline PERC panels (like Waaree WS-440 at 22.1% efficiency) offer the best performance for residential rooftops. TOPCon and HJT panels offer even higher efficiency at a premium price." },
  { q: "Pros and cons of solar battery storage options?", a: "We provide a detailed breakdown: Lithium-ion batteries (like Luminous or Loom Solar) offer 4,000+ cycles, fast charging, and 10-year warranties but cost ₹60,000–2,00,000. Lead-acid batteries are cheaper but last only 3–5 years. If you have fewer than 2 hours of daily outages, a grid-tied system without batteries gives the best ROI." },
];

/* ─── Product Data ─── */
const PANELS = [
  { brand: "Waaree", model: "WS-440", efficiency: "22.1%", warranty: "25 yr", price: "₹26/W", best: true },
  { brand: "Tata Power", model: "TP-420", efficiency: "21.3%", warranty: "25 yr", price: "₹28/W", best: false },
  { brand: "Adani Solar", model: "AS-415", efficiency: "21.0%", warranty: "25 yr", price: "₹25/W", best: false },
  { brand: "Luminous", model: "LX-400", efficiency: "20.5%", warranty: "25 yr", price: "₹23/W", best: false },
];

const INVERTERS = [
  { brand: "Growatt", model: "SPH 5000", type: "Hybrid", efficiency: "97.6%", warranty: "5 yr", price: "₹55,000", best: true },
  { brand: "SolarEdge", model: "SE5K-RW0", type: "String", efficiency: "99.0%", warranty: "12 yr", price: "₹1,20,000", best: false },
  { brand: "Sungrow", model: "SH5.0RS", type: "Hybrid", efficiency: "98.4%", warranty: "5 yr", price: "₹65,000", best: false },
  { brand: "Havells", model: "SBI 3.3K", type: "String", efficiency: "97.0%", warranty: "2 yr", price: "₹32,000", best: false },
];

/* ─── Testimonials (from solartoall.com) ─── */
const TESTIMONIALS = [
  { name: "Customer 3", location: "USA", text: "The list of solar companies available in my area was very helpful. I was able to find a top-rated local installer quickly and got the best price for my solar system.", savings: "Highly Satisfied", rating: 5 },
  { name: "Customer 4", location: "India", text: "I am extremely happy with the solar design recommendation provided by Solar to All. The custom report showed me exactly what system size I needed and helped me save significantly.", savings: "Highly Recommended", rating: 5 },
  { name: "Rajesh Kumar", location: "Bengaluru, India", text: "Solar to All gave me an unbiased report that saved me ₹40,000 compared to what the installer initially quoted. Completely free and zero pressure!", savings: "₹3,200/month saved", rating: 5 },
];

/* ─── Accordion ─── */
function Accordion({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} className={`accordion-item ${open === i ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
            {faq.q}
            <span className="accordion-icon">+</span>
          </button>
          <div className="accordion-content"><p>{faq.a}</p></div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [activeTab, setActiveTab] = useState('predictor');
  const [navOpen, setNavOpen] = useState(false);
  const [ctaData, setCtaData] = useState({ name: '', email: '', phone: '', bill: '' });
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaSuccess, setCtaSuccess] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCtaSubmit = async (e) => {
    e.preventDefault();
    setCtaLoading(true);
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctaData, source: 'homepage_cta' })
      });
      setCtaSuccess(true);
    } catch { /* silent */ } finally {
      setCtaLoading(false);
    }
  };

  const closeMobileNav = () => setNavOpen(false);

  return (
    <>

      {/* ──────────────── NAVIGATION ──────────────── */}
      <nav className={styles.nav} style={{ position: 'relative' }}>
        <div className={`container ${styles.navInner}`}>
          {/* Logo */}
          <a href="#" className={styles.navLogo}>
            <Image 
              src="/logo.png" 
              alt="Solar to All Logo" 
              width={160} 
              height={50} 
              priority 
              className={styles.navLogoPhoto}
            />
          </a>

          {/* Desktop Nav */}
          <div className={styles.navLinks}>
            <a href="#cta" className={`${styles.navLink} ${styles.navLinkPrimary}`}>Free Solar Savings Check</a>
            <a href="#tools" className={styles.navLink}>Recommendation For You</a>
            <div className={styles.navDropdown}>
              <a href="#products" className={styles.navLink}>
                Solar Products <ChevronDown size={14} style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: 'middle' }} />
              </a>
              <div className={styles.navDropdownMenu}>
                <a href="#products" className={styles.navDropdownItem}>
                  <Sun size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Solar Panels
                </a>
                <a href="#products" className={styles.navDropdownItem}>
                  <Zap size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Solar Inverters
                </a>
                <a href="#products" className={styles.navDropdownItem}>
                  <Battery size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Battery Storage
                </a>
                <a href="#products" className={styles.navDropdownItem}>
                <HomeIcon size={14} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Complete Systems
                </a>
              </div>
            </div>
            <a href="#faq" className={styles.navLink}>Blog</a>
            <a href="#cta" className={styles.navLink}>Contact us</a>
          </div>

          {/* Right Side */}
          <div className={styles.navRight}>
            <a href="#cta" className={`btn btn-primary btn-sm ${styles.navCta}`}>Get Free Report</a>
          </div>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${navOpen ? styles.open : ''}`}
            onClick={() => setNavOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={navOpen}
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`${styles.mobileMenu} ${navOpen ? styles.open : ''}`}>
          <button className={styles.mobileBackBtn} onClick={closeMobileNav}>
            <ArrowLeft size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> Back to Page
          </button>
          <a href="#cta" className={styles.mobileNavLink} onClick={closeMobileNav}>Free Solar Savings Check</a>
          <a href="#tools" className={styles.mobileNavLink} onClick={closeMobileNav}>Recommendation For You</a>
          <a href="#products" className={styles.mobileNavLink} onClick={closeMobileNav}>Solar Products</a>
          <a href="#faq" className={styles.mobileNavLink} onClick={closeMobileNav}>Blog</a>
          <a href="#cta" className={styles.mobileNavLink} onClick={closeMobileNav}>Contact us</a>
          <a href="#" className={styles.mobileNavLink} onClick={closeMobileNav}>Privacy Policy</a>
          <a href="#" className={styles.mobileNavLink} onClick={closeMobileNav}>About Us</a>
          <a href="#cta" className="btn btn-primary" onClick={closeMobileNav} style={{ textAlign: 'center' }}>Get Free Report</a>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent} animate-fade-in-up`}>
          <div className={styles.heroWrapper}>
            <div className={styles.heroTextSide}>
              <div className={`section-label ${styles.heroLabel}`}>
                <ShieldCheck size={14} style={{ marginRight: '6px', color: 'var(--brand-saffron)' }} /> Solar Pre-Installation Services — Free Custom Report
              </div>
              <h1 className={styles.heroTitle}>
                Know Exactly How Much<br />
                <span className="text-gradient">You Can Save with Solar</span>
              </h1>
              <p className={styles.heroSubtitle}>
                “Know Exactly How Much You Can Save with Solar — Free Custom Report”. Get your tailor-made solar design recommendation, top product picks, and vetted local installer quotes — completely free in 24 hours.
              </p>
              <div className={styles.heroCtas}>
                <a href="#cta" className={`btn btn-primary ${styles.heroCtaBtn}`}>Check My Solar Savings</a>
                <a href="#tools" className={`btn btn-outline ${styles.heroCtaBtn}`}>Try Free AI Tools</a>
              </div>

              {/* Stats Row */}
              <div className={styles.statsGrid}>
                {[['1,200+', 'Homes Checked'], ['₹0', 'Cost to You'], ['24 hrs', 'Delivery'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
                  <div key={label} className={`stat-box ${styles.statCell}`}>
                    <div className="stat-number">{num}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────── SOLAR FOR EVERYONE ──────────────── */}
      <section className={styles.section} style={{ borderTop: 'var(--border-subtle)' }}>
        <div className="container">
          <div className={styles.solarForEveryoneGrid}>
            {/* Left — text content */}
            <div className={styles.solarForEveryoneText}>
              <div className="section-label">
                <Sun size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Who We Are
              </div>
              <h2>Solar For Everyone</h2>
              <p style={{ marginBottom: '24px', lineHeight: 1.8 }}>
                Solar to All provides cutting-edge solar pre-installation solar services for homeowners, businesses, and industry professionals.
                We offer extensive services such as solar design recommendation, solar product technology finder and solar installer company finder.
              </p>
              <a href="#cta" className="btn btn-primary">Get Started</a>

              {/* Testimonial card */}
              <div className={styles.miniTestimonial}>
                <div className={styles.miniTestimonialQuote}>“”</div>
                <p className={styles.miniTestimonialText}>Highly recommended. The service made my solar decision effortless and I saved more than expected.</p>
                <div className={styles.miniTestimonialAuthor}>— Satisfied Customer</div>
              </div>
            </div>

            {/* Right — Main high-impression image */}
            <div className={styles.solarForEveryoneImages}>
              <div className={styles.sfeMainImg}>
                <Image
                  src="/images/family-solar.jpg"
                  alt="Happy family watching certified professionals install solar panels on rooftop"
                  width={560}
                  height={420}
                  priority
                  className={styles.sfeMainPhoto}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── WHY SOLAR PRE-INSTALLATION SERVICE ──────────────── */}
      <section className={styles.sectionDark}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <HomeIcon size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Our Services
            </div>
            <h2>Why take our Solar pre-installation service?</h2>
            <p className={styles.sectionSubtitle}>
              We at Solar to All differ from the best solar companies because we focus on a customer-centric approach, guidance and support for customers. We will recommend the best solar design and product for you. We will then connect you with the best solar installer near your area.
            </p>
          </div>

          <div className={styles.whyGrid}>
            {/* Left — Photo */}
            <div className={styles.whyImageCol}>
              <Image
                src="/images/solar-design1.jpg"
                alt="Solar panels installed on a rooftop by a certified installer"
                width={560}
                height={440}
                className={styles.whyImagePhoto}
              />
            </div>

            {/* Right — 3 service feature blocks */}
            <div className={styles.whyFeaturesCol}>
              {[
                {
                  icon: <LineChart size={24} style={{ color: 'var(--brand-saffron)' }} />,
                  title: 'Solar Design Recommendation',
                  desc: 'We provide tailor-made solar design recommendations based on customer specific energy consumption, budget and location.'
                },
                {
                  icon: <Zap size={24} style={{ color: 'var(--brand-saffron)' }} />,
                  title: 'Solar Product Technology Finder',
                  desc: 'Our Solar Product Technology Finder provides you with a package of technologies that can meet your solar needs for providing better system efficiency and low payback period.'
                },
                {
                  icon: <Award size={24} style={{ color: 'var(--brand-saffron)' }} />,
                  title: 'Solar Installation Company Finder',
                  desc: 'We connect you to the best solar installer company near your location to install your solar system. Only top rated companies that provide you the best sales and after-sales installation services are recommended.'
                },
              ].map(f => (
                <div key={f.title} className={styles.whyFeatureItem}>
                  <div className={styles.whyFeatureIcon}>{f.icon}</div>
                  <div>
                    <h4 className={styles.whyFeatureTitle}>{f.title}</h4>
                    <p className={styles.whyFeatureDesc}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section className={styles.section} style={{ borderTop: 'var(--border-subtle)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <TrendingUp size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Process
            </div>
            <h2>How Solar to All Works</h2>
            <p className={styles.sectionSubtitle}>Three simple steps from your current bill to a fully designed, installer-matched solar system.</p>
          </div>
          <div className={styles.howGrid}>
            {[
              { num: '1', icon: <FileText size={32} style={{ color: 'var(--brand-saffron)' }} />, title: 'Share Your Details', desc: 'Enter your address and upload your electricity bill. Our AI extracts your usage data instantly and securely.' },
              { num: '2', icon: <Sparkles size={32} style={{ color: 'var(--brand-saffron)' }} />, title: 'AI Analyses Your Roof', desc: 'We pull NREL satellite weather data for your location and calculate the exact energy your roof can generate.' },
              { num: '3', icon: <Award size={32} style={{ color: 'var(--brand-saffron)' }} />, title: 'Get Your Free Report', desc: 'Within 24 hours, receive a personalised report with system sizing, product picks, and vetted installer quotes.' },
            ].map(step => (
              <div key={step.num} className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
                <div className="step-number" style={{ margin: '0 auto 20px' }}>{step.num}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── AI TOOLS ──────────────── */}
      <section id="tools" className={styles.sectionDark}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <Sparkles size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> AI Suite
            </div>
            <h2>Free AI Tools — No Sign Up Required</h2>
            <p className={styles.sectionSubtitle}>Powered by government satellite data and browser-local OCR. Your data never leaves your device.</p>
          </div>

          <div className={styles.toolsTabsWrap}>
            <div className="tabs-list">
              <button className={`tab-btn ${activeTab === 'predictor' ? 'active' : ''}`} onClick={() => setActiveTab('predictor')}>Solar Predictor</button>
              <button className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>Bill Scanner</button>
            </div>
          </div>

          <div className={`card ${styles.toolCard}`} style={{ padding: '32px' }}>
            {activeTab === 'predictor' ? <SolarPredictor /> : <BillScanner />}
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Solar Predictor uses NREL PVWatts API & OpenStreetMap. Bill Scanner runs Tesseract OCR locally in your browser.
          </p>
        </div>
      </section>

      {/* ──────────────── SOLAR DESIGN GALLERY ──────────────── */}
      <section className={styles.section} id="designs" style={{ borderBottom: 'var(--border-subtle)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <HomeIcon size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Solar Design Studio
            </div>
            <h2>See Your Property's Solar Design — Before You Commit</h2>
            <p className={styles.sectionSubtitle}>
              Every project starts with a precision SketchUp floor plan, 3D model, and panel layout — so you know exactly what you're getting before installation begins.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className={styles.designBullets}>
            {[
              { icon: <LineChart size={18} style={{ color: 'var(--brand-saffron)', verticalAlign: 'middle' }} />, text: 'Tired of Sales Pitches? Get Unbiased Solar Design Here.' },
              { icon: <Zap size={18} style={{ color: 'var(--brand-saffron)', verticalAlign: 'middle' }} />, text: 'Find the Best Solar Panels & Inverters in Minutes.' },
              { icon: <TrendingUp size={18} style={{ color: 'var(--brand-saffron)', verticalAlign: 'middle' }} />, text: 'Maximize Your ROI: Get a Pro Efficiency Report Today.' },
              { icon: <ShieldCheck size={18} style={{ color: 'var(--brand-saffron)', verticalAlign: 'middle' }} />, text: 'Vetted & Top-Rated: Find a Local Installer You Can Trust.' },
              { icon: <Award size={18} style={{ color: 'var(--brand-saffron)', verticalAlign: 'middle' }} />, text: 'Get Your Custom Solar Savings Report — Free Design Estimate.' },
            ].map((b) => (
              <div key={b.text} className={styles.designBulletItem}>
                <span className={styles.designBulletIcon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className={styles.designGallery}>
            <div className={styles.designGalleryMain}>
              <Image
                src="/images/solar-design-new5.jpg"
                alt="Solar Design — Top View with Panel Layout and System Details"
                width={700}
                height={500}
                className={styles.designImg}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className={styles.designImgOverlay}>
                <span className="badge badge-emerald">TOTAL MODULES: 4 · 540W · 2.16 kW System</span>
              </div>
            </div>
            <div className={styles.designGalleryGrid}>
              {[
                { src: '/images/solar-design-new1.jpg', alt: 'Floor Plan — Top View with Measurements', label: 'Top View Floor Plan' },
                { src: '/images/solar-design-new2.jpg', alt: '3D Isometric Design View', label: '3D Isometric Model' },
                { src: '/images/solar-design-new3.jpg', alt: 'Solar Panel Installation View', label: 'Panel Installation View' },
                { src: '/images/solar-design-new4.jpg', alt: '3D Roof Design Angled View', label: '3D Roof Angle View' },
              ].map((img) => (
                <div key={img.src} className={styles.designThumb}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={340}
                    height={230}
                    className={styles.designImg}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className={styles.designThumbOverlay}>{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <a href="#cta" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>Get Free Design Estimate</a>
          </div>
        </div>
      </section>

      {/* ──────────────── PRODUCT COMPARISON ──────────────── */}
      <section id="products" className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <LineChart size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Products
            </div>
            <h2>Top Solar Products Compared</h2>
            <p className={styles.sectionSubtitle}>Unbiased comparison of the most popular panels and inverters in India. We earn nothing from these recommendations.</p>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} style={{ color: 'var(--brand-saffron)' }} /> Solar Panels
          </h3>
          <div className={styles.tableWrap}>
            <table className="comparison-table" style={{ minWidth: '520px' }}>
              <thead><tr><th>Brand</th><th>Model</th><th>Efficiency</th><th>Warranty</th><th>Approx Price</th></tr></thead>
              <tbody>
                {PANELS.map(p => (
                  <tr key={p.model}>
                    <td>
                      <strong>{p.brand}</strong>
                      {p.best && (
                        <span className="table-badge-best" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={10} /> Best Value
                        </span>
                      )}
                    </td>
                    <td>{p.model}</td>
                    <td><span className="text-gradient" style={{ fontWeight: 700 }}>{p.efficiency}</span></td>
                    <td>{p.warranty}</td>
                    <td>{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
            <Zap size={18} style={{ color: 'var(--brand-saffron)' }} /> Solar Inverters
          </h3>
          <div className={styles.tableWrap}>
            <table className="comparison-table" style={{ minWidth: '620px' }}>
              <thead><tr><th>Brand</th><th>Model</th><th>Type</th><th>Efficiency</th><th>Warranty</th><th>Price</th></tr></thead>
              <tbody>
                {INVERTERS.map(inv => (
                  <tr key={inv.model}>
                    <td>
                      <strong>{inv.brand}</strong>
                      {inv.best && (
                        <span className="table-badge-best" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={10} /> Best Value
                        </span>
                      )}
                    </td>
                    <td>{inv.model}</td>
                    <td><span className={`badge ${inv.type === 'Hybrid' ? 'badge-emerald' : 'badge-sky'}`}>{inv.type}</span></td>
                    <td><span className="text-gradient" style={{ fontWeight: 700 }}>{inv.efficiency}</span></td>
                    <td>{inv.warranty}</td>
                    <td>{inv.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ──────────────── VETTED INSTALLERS ──────────────── */}
      <section className={styles.installerSection}>
        <div className={styles.sectionOverlay} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.glassCard}>
            <div className="section-label">
              <Award size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Installation Quality
            </div>
            <h2>Certified Engineering & Hassle-Free Setup</h2>
            <p style={{ marginBottom: '20px' }}>
              We partner only with tier-1 local installers who use certified components and adhere to strict safety standards. Every project undergoes a complete independent engineering design review before a single bolt is tightened.
            </p>
            <ul>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> Certified structural engineers & installers
              </li>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> Comprehensive 5-year workmanship warranty
              </li>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> End-to-end net metering and subsidy processing
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ──────────────── WHY INDEPENDENT ──────────────── */}
      <section className={styles.sectionDark}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <ShieldCheck size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Our Promise
            </div>
            <h2>Truly Independent. Always Free.</h2>
            <p className={styles.sectionSubtitle}>Solar to All has no panels to sell, no installers to push, and no hidden fees. Ever.</p>
          </div>
          <div className={styles.featuresGrid}>
            {[
              { icon: <AlertTriangle size={24} style={{ color: 'var(--brand-saffron)' }} />, title: 'Zero Sales Pressure', desc: "We don't work for installers. We calculate the ideal system based purely on your home's actual needs and real weather data." },
              { icon: <ShieldCheck size={24} style={{ color: 'var(--brand-saffron)' }} />, title: 'Browser-Local AI', desc: "Your bills are scanned using Tesseract.js — a browser-local AI model. Your personal documents are never uploaded to our servers." },
              { icon: <Sparkles size={24} style={{ color: 'var(--brand-saffron)' }} />, title: 'Open Data Models', desc: "Our solar predictions use the US National Renewable Energy Laboratory (NREL) PVWatts API, trusted by researchers worldwide." },
              { icon: <Zap size={24} style={{ color: 'var(--brand-saffron)' }} />, title: '24-Hour Report Delivery', desc: "Submit your details and receive a custom solar design report with installer quotes within 24 hours via WhatsApp or email." },
              { icon: <User size={24} style={{ color: 'var(--brand-saffron)' }} />, title: 'Expert AI Advisor', desc: "Our AI chatbot is trained on solar engineering knowledge and can answer your questions anytime — day or night." },
              { icon: <LineChart size={24} style={{ color: 'var(--brand-saffron)' }} />, title: 'Product-Agnostic', desc: "We compare panels, inverters, and batteries from all major brands and recommend only what's right for your budget and location." },
            ].map(item => (
              <div key={item.title} className="card">
                <div className="icon-box" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249,115,22,0.08)', borderRadius: '50%', width: '48px', height: '48px' }}>
                  {item.icon}
                </div>
                <h4 style={{ marginBottom: '8px', marginTop: '12px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <ThumbsUp size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Happy Customers
            </div>
            <h2>Happy Customers</h2>
            <p className={styles.sectionSubtitle}>Read what our satisfied customers have to say about Solar To All.</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="stars" style={{ marginBottom: '14px', color: 'var(--brand-saffron)' }}>{'★'.repeat(t.rating)}</div>
                <p style={{ fontSize: '0.95rem', marginBottom: '20px', color: 'var(--text-primary)' }}>"{t.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.location}</div>
                  </div>
                  <div className="badge badge-emerald">{t.savings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── SOLAR SHOWCASE GALLERY ──────────────── */}
      <section className={styles.gallerySection}>
        <div className={styles.sectionOverlay} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.glassCard}>
            <div className="section-label">
              <Sun size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> Solar Gallery
            </div>
            <h2>Clean Energy in Action</h2>
            <p style={{ marginBottom: '20px' }}>
              See how residential and commercial properties across India are saving millions with optimized solar systems. By pulling satellite data and mapping exact shadow paths, we ensure every panel functions at peak efficiency.
            </p>
            <ul>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> Maximized solar output & seasonal sun tracking
              </li>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> Off-grid battery backups & smart hybrid storage
              </li>
              <li>
                <span style={{ color: 'var(--brand-emerald)', fontWeight: 'bold' }}>✓</span> Clean power generation helping save the planet
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ──────────────── FAQ ──────────────── */}
      <section id="faq" className={styles.sectionDark}>
        <div className="container-narrow">
          <div className={styles.sectionHeader}>
            <div className={`section-label ${styles.sectionLabel}`}>
              <HelpCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--brand-saffron)' }} /> FAQ
            </div>
            <h2>Frequently asked questions</h2>
          </div>
          <Accordion faqs={FAQS} />
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaOverlay} />
        <div className={`container-narrow ${styles.ctaContent}`} style={{ textAlign: 'center' }}>
          <div className={`section-label ${styles.sectionLabel}`}>
            <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle', color: '#fff' }} /> Get Started
          </div>
          <h2 style={{ marginBottom: '16px' }}>Get Your Free Solar Report Today</h2>
          <p style={{ marginBottom: '40px', fontSize: '1.05rem' }}>Fill in your details and receive a fully personalised solar design, savings projection, and top installer quotes — delivered within 24 hours.</p>

          {ctaSuccess ? (
            <div className="alert-success" style={{ maxWidth: '480px', margin: '0 auto', padding: '28px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <ThumbsUp size={42} style={{ color: 'var(--brand-saffron)' }} />
              </div>
              <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '8px' }}>Report Request Received!</strong>
              <p style={{ color: 'var(--brand-emerald-light)' }}>Your personalised solar report will arrive within 24 hours via WhatsApp or email.</p>
            </div>
          ) : (
            <form onSubmit={handleCtaSubmit} style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.ctaFormGrid}>
                <input type="text" className="input-field" placeholder="Full Name" value={ctaData.name} onChange={e => setCtaData({ ...ctaData, name: e.target.value })} required />
                <input type="tel" className="input-field" placeholder="WhatsApp Number" value={ctaData.phone} onChange={e => setCtaData({ ...ctaData, phone: e.target.value })} required />
              </div>
              <input type="email" className="input-field" placeholder="Email Address" value={ctaData.email} onChange={e => setCtaData({ ...ctaData, email: e.target.value })} required />
              <input type="text" className="input-field" placeholder="Monthly Electricity Bill (e.g., ₹3,500)" value={ctaData.bill} onChange={e => setCtaData({ ...ctaData, bill: e.target.value })} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }} disabled={ctaLoading}>
                {ctaLoading ? 'Submitting...' : 'Send My Free Report'}
              </button>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)' }}>By submitting, you agree to our privacy policy. We never spam or sell your data.</p>
            </form>
          )}
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer style={{ background: 'var(--bg-void)', borderTop: 'var(--border-subtle)', padding: '56px 0 32px' }}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Image src="/logo.png" alt="Solar to All" width={180} height={60} style={{ height: '42px', width: 'auto', display: 'block' }} />
              </div>
              <p style={{ fontSize: '0.875rem', maxWidth: '280px', lineHeight: 1.7 }}>India's independent solar advisory. We help homeowners and businesses go solar the right way — with data, not sales pressure.</p>
              <div className={styles.footerSocials}>
                <a href="https://www.linkedin.com/in/abhirkrishnan/" target="_blank" rel="noopener noreferrer" className="badge badge-sky" style={{ textDecoration: 'none' }}>LinkedIn</a>
              </div>
            </div>
            {[
              { title: 'Tools', links: [['Solar Predictor', '#tools'], ['Bill Scanner', '#tools'], ['AI Advisor', '#tools'], ['Free Report', '#cta']] },
              { title: 'Products', links: [['Solar Panels', '#products'], ['Inverters', '#products'], ['Compare All', '#products']] },
              { title: 'Company', links: [['About Us', '#'], ['FAQ', '#faq'], ['Contact', '#cta'], ['Privacy Policy', '#']] },
            ].map(col => (
              <div key={col.title}>
                <div className={styles.footerColTitle}>{col.title}</div>
                <div className={styles.footerLinks}>
                  {col.links.map(([label, href]) => (
                    <a key={label} href={href} className={styles.footerLink}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Solar to All. All rights reserved. Built with ❤️ in India.</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Powered by NREL PVWatts · OpenStreetMap · Tesseract.js</p>
          </div>
        </div>
      </footer>

      {/* Mobile Back To Top Floating Button */}
      {showScrollTop && (
        <button
          className={styles.mobileScrollTopBtn}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          <span>Top</span>
        </button>
      )}

      <ChatbotWidget />
    </>
  );
}

