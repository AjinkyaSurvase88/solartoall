"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatbotWidget.module.css';

const QUICK_REPLIES = [
  "How much can I save?",
  "Best panels for India?",
  "What size system do I need?",
  "Government subsidies?",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Solar AI Advisor 🌞\n\nI can help you calculate savings, compare products, and find top installers near you. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: response.ok ? data.reply : "Sorry, I'm having trouble right now. Please try again!" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => setIsOpen(false)} aria-label="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>Back</span>
            </button>
            <div className={styles.agentInfo}>
              <div className={styles.avatar}>🤖</div>
              <div>
                <div className={styles.agentName}>Solar AI Advisor</div>
                <div className={styles.onlineStatus}><span className={styles.onlineDot} />Online now</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageRow} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
                {msg.role === 'assistant' && <div className={styles.msgAvatar}>☀️</div>}
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageRow} ${styles.assistant}`}>
                <div className={styles.msgAvatar}>☀️</div>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className={styles.quickReplies}>
              {QUICK_REPLIES.map(q => (
                <button key={q} className={styles.chip} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.inputArea}>
            <input
              className={`input-field ${styles.chatInput}`}
              placeholder="Ask about solar..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" className={`btn btn-primary ${styles.sendBtn}`} disabled={isLoading || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      )}

      <button
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        )}
        {!isOpen && <span className={styles.notifDot} />}
      </button>
    </div>
  );
}
