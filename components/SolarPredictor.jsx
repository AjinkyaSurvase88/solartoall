"use client";

import React, { useState } from 'react';
import { Sun, Zap, MapPin, Mail, ThumbsUp, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './SolarPredictor.module.css';

export default function SolarPredictor() {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const resetPredictor = () => {
    setResult(null);
    setError(null);
    setShowLeadForm(false);
    setLeadSuccess(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeolocating(true);
    setGeoError(null);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'SolarToAll-App' } }
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setIsGeolocating(false);
        }
      },
      (err) => {
        setIsGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Please type your address manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError('Location unavailable. Please type your address manually.');
        } else {
          setGeoError('Could not get location. Please type your address manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/solar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not fetch solar data');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, address, source: 'solar_predictor' })
      });
      if (res.ok) setLeadSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Estimate monthly savings (rough calculation: avg India tariff ₹7/kWh)
  const monthlySavings = result
    ? Math.round((result.estimated_annual_kwh * 7) / 12)
    : null;
  const paybackYears = result ? Math.round(40000 / (monthlySavings * 12)) : null;

  return (
    <div className={styles.predictor}>
      <div className={styles.header}>
        <div className="icon-box" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sun size={24} style={{ color: 'var(--brand-saffron)' }} />
        </div>
        <div>
          <h3 className={styles.title}>Solar Potential Calculator</h3>
          <p className={styles.subtitle}>Enter your address to see your roof's solar output powered by NREL satellite data.</p>
        </div>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputRow}>
            <input
              type="text"
              className={`input-field ${styles.addressInput}`}
              placeholder="e.g., 123 MG Road, Bengaluru, Karnataka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading || isGeolocating}
            />
            <button
              type="submit"
              className={`btn btn-primary ${styles.calcBtn}`}
              disabled={isLoading || isGeolocating || !address.trim()}
            >
              {isLoading ? (
                <span className={styles.loader}>
                  <svg className={styles.spin} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Analyzing...
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} /> Calculate
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            className={styles.geoBtn}
            onClick={handleUseLocation}
            disabled={isGeolocating || isLoading}
          >
            {isGeolocating ? (
              <span className={styles.loader}>
                <svg className={styles.spin} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Detecting location...
              </span>
            ) : (
              <span className={styles.loader} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Use My Location
              </span>
            )}
          </button>

          {geoError && (
            <p className={styles.geoErrorText}>{geoError}</p>
          )}
        </form>
      )}

      {error && (
        <div className="alert-error animate-fade-in-up" style={{ marginTop: '16px' }}>
          <strong>Error:</strong> {error}
          <button className={styles.backBtn} onClick={resetPredictor} style={{ marginTop: '8px' }}>
            <ArrowLeft size={14} /> Try Again
          </button>
        </div>
      )}

      {result && (
        <div className={`${styles.results} animate-fade-in-up`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className={styles.backBtn} onClick={resetPredictor}>
              <ArrowLeft size={14} /> Back / Calculate Another
            </button>
            <span className="badge badge-emerald">✓ Analysis Complete</span>
          </div>

          <div className={styles.resultsHeader}>
            <p className={styles.location}>{result.location.split(',').slice(0, 3).join(',')}</p>
          </div>

          <div className={styles.metricsGrid}>
            <div className="result-metric">
              <span className="result-metric-label">Annual Output</span>
              <span className="result-metric-value">{result.estimated_annual_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="result-metric">
              <span className="result-metric-label">Estimated Monthly Savings</span>
              <span className="result-metric-value">₹{monthlySavings?.toLocaleString()}</span>
            </div>
            <div className="result-metric">
              <span className="result-metric-label">System Size Needed</span>
              <span className="result-metric-value">{result.estimated_system_size_kw} kW</span>
            </div>
            <div className="result-metric">
              <span className="result-metric-label">Est. Payback Period</span>
              <span className="result-metric-value">{paybackYears} Yrs</span>
            </div>
          </div>

          <div className={styles.savingsBar}>
            <div className={styles.savingsBarLabel}>
              <span>ROI Progress (10 year horizon)</span>
              <span className={styles.savingsPercent}>85%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '85%' }} />
            </div>
          </div>

          <div className={styles.ctaBox}>
            {!showLeadForm ? (
              <>
                <p>Get a <strong>personalised savings report</strong> with installer recommendations in your area.</p>
                <button className="btn btn-primary" onClick={() => setShowLeadForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Mail size={16} /> Send My Free Report
                </button>
              </>
            ) : leadSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ThumbsUp size={18} style={{ flexShrink: 0 }} />
                  <span><strong>Report Sent!</strong> Your personalised solar report has been requested and will arrive within 24 hours.</span>
                </div>
                <button className={styles.backBtn} onClick={resetPredictor}>
                  <ArrowLeft size={14} /> Calculate Another Location
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className={styles.leadForm}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>Where should we send your free solar report?</p>
                  <button type="button" className={styles.backBtn} onClick={() => setShowLeadForm(false)}>
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="Full Name" value={leadData.name} onChange={e => setLeadData({ ...leadData, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <input type="email" className="input-field" placeholder="Email Address" value={leadData.email} onChange={e => setLeadData({ ...leadData, email: e.target.value })} required />
                </div>
                <div className="input-group">
                  <input type="tel" className="input-field" placeholder="WhatsApp / Phone Number" value={leadData.phone} onChange={e => setLeadData({ ...leadData, phone: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} disabled={isSubmittingLead}>
                  {isSubmittingLead ? 'Sending My Free Report...' : <><Mail size={16} /> Send My Free Report</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

