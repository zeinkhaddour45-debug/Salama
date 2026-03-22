/**
 * Salama AI Chat Widget
 * Expandable bottom-right chat that uses Claude API to guide users around the platform.
 *
 * To enable real AI responses:
 *   Replace ANTHROPIC_API_KEY below with your actual key from console.anthropic.com
 *   (or proxy the request through a small backend to keep the key server-side)
 */

const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

const SALAMA_SYSTEM_PROMPT = `You are Salama's friendly mental health support assistant, embedded in the Salama platform   a safe digital space for Lebanese students and the wider community to learn, share, and find support on their mental health journey.

Your role is to warmly guide users to the right part of the website and provide brief, supportive context. Keep responses short (2–4 sentences max). Be warm, calm, and empathetic.

Pages on the platform:
- Home (index.html): Landing page with mission, services overview, and community stories.
- Daily Check-In (checkin.html): Users pick an emotion, rate intensity (members), and get coping resources.
- Journaling (journaling.html): Private journal entries for members to reflect and track thoughts over time.
- Login / Sign Up (login.html): Create an account or sign in to unlock member features like intensity tracking and journal entries.

If someone asks about anxiety, stress, sadness, or any difficult emotion   acknowledge it with empathy first, then suggest the Daily Check-In as a first step.
If someone asks about journaling or writing   point them to the Journaling page.
If someone asks about signing up or membership   point them to the Login page.
If someone is not sure where to start   suggest the Daily Check-In.

Always end with a gentle invitation to explore. Never provide medical diagnoses or clinical advice. If someone is in crisis, encourage them to reach out to a trusted person or mental health professional.`;

(function () {
  // ── CSS ────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ─── Chat Widget ──────────────────────────────────── */
    #salama-chat-widget {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9000;
      font-family: 'Inter', sans-serif;
    }

    /* Toggle button */
    #salama-chat-toggle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4a6640, #374f31);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 24px rgba(74,102,64,0.42), 0 2px 8px rgba(0,0,0,0.18);
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
      position: relative;
      z-index: 2;
    }
    #salama-chat-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 10px 32px rgba(74,102,64,0.52), 0 4px 12px rgba(0,0,0,0.2);
    }
    #salama-chat-toggle svg {
      width: 26px;
      height: 26px;
      transition: opacity 0.2s, transform 0.2s;
    }
    #salama-chat-toggle .icon-chat { position: absolute; }
    #salama-chat-toggle .icon-close {
      position: absolute;
      opacity: 0;
      transform: rotate(-45deg);
    }
    #salama-chat-widget.open #salama-chat-toggle .icon-chat {
      opacity: 0;
      transform: rotate(45deg);
    }
    #salama-chat-widget.open #salama-chat-toggle .icon-close {
      opacity: 1;
      transform: rotate(0deg);
    }

    /* Unread dot */
    #salama-chat-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e05c5c;
      border: 2px solid #fff;
      display: none;
      animation: chat-dot-pulse 2s infinite;
    }
    @keyframes chat-dot-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }

    /* Chat panel */
    #salama-chat-panel {
      position: absolute;
      bottom: calc(100% + 14px);
      right: 0;
      width: 360px;
      max-height: 520px;
      background: #f8f5ef;
      border-radius: 24px;
      box-shadow:
        0 24px 64px rgba(0,0,0,0.14),
        0 4px 16px rgba(0,0,0,0.08),
        0 0 0 1px rgba(255,255,255,0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px) scale(0.96);
      transform-origin: bottom right;
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(.34,1.2,.64,1);
    }
    #salama-chat-widget.open #salama-chat-panel {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* Panel header */
    #salama-chat-header {
      background: linear-gradient(135deg, #4a6640, #374f31);
      padding: 18px 20px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .chat-header-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      border: 1.5px solid rgba(255,255,255,0.28);
    }
    .chat-header-info h3 {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 2px;
      letter-spacing: 0.2px;
    }
    .chat-header-info p {
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .chat-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #7ece76;
      display: inline-block;
    }

    /* Messages area */
    #salama-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    #salama-chat-messages::-webkit-scrollbar { width: 4px; }
    #salama-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #salama-chat-messages::-webkit-scrollbar-thumb { background: rgba(74,102,64,0.2); border-radius: 2px; }

    /* Bubbles */
    .chat-bubble {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.55;
      animation: bubble-in 0.22s ease;
    }
    @keyframes bubble-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .chat-bubble.ai {
      background: #fff;
      color: #2a2722;
      border-bottom-left-radius: 5px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .chat-bubble.user {
      background: linear-gradient(135deg, #4a6640, #374f31);
      color: #fff;
      border-bottom-right-radius: 5px;
      align-self: flex-end;
    }
    .chat-bubble a {
      color: #4a6640;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .chat-bubble.ai a { color: #4a6640; }
    .chat-bubble.user a { color: rgba(255,255,255,0.9); }

    /* Typing indicator */
    .chat-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #fff;
      border-radius: 18px;
      border-bottom-left-radius: 5px;
      align-self: flex-start;
      width: fit-content;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      animation: bubble-in 0.22s ease;
    }
    .chat-typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #7d9e75;
      animation: typing-bounce 1.2s infinite;
    }
    .chat-typing span:nth-child(2) { animation-delay: 0.15s; }
    .chat-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    /* Quick replies */
    #salama-chat-quick {
      padding: 0 16px 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chat-quick-btn {
      background: rgba(125,158,117,0.12);
      border: 1px solid rgba(74,102,64,0.22);
      color: #4a6640;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 100px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      font-family: 'Inter', sans-serif;
      white-space: nowrap;
    }
    .chat-quick-btn:hover {
      background: rgba(74,102,64,0.14);
      border-color: #4a6640;
    }

    /* Input area */
    #salama-chat-footer {
      padding: 12px 14px;
      border-top: 1px solid rgba(0,0,0,0.06);
      display: flex;
      gap: 8px;
      align-items: flex-end;
      background: #f8f5ef;
      flex-shrink: 0;
    }
    #salama-chat-input {
      flex: 1;
      border: 1.5px solid rgba(74,102,64,0.22);
      border-radius: 14px;
      padding: 9px 13px;
      font-size: 13.5px;
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #2a2722;
      resize: none;
      outline: none;
      line-height: 1.45;
      max-height: 90px;
      min-height: 38px;
      overflow-y: auto;
      transition: border-color 0.2s;
    }
    #salama-chat-input:focus {
      border-color: #4a6640;
    }
    #salama-chat-input::placeholder { color: #a8a4a0; }
    #salama-chat-send {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4a6640, #374f31);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.15s;
    }
    #salama-chat-send:hover { opacity: 0.9; transform: scale(1.05); }
    #salama-chat-send:active { transform: scale(0.95); }
    #salama-chat-send svg { width: 16px; height: 16px; }
    #salama-chat-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* Mobile full-screen */
    @media (max-width: 480px) {
      #salama-chat-panel {
        position: fixed;
        inset: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        max-height: 100%;
        border-radius: 0;
        transform-origin: bottom center;
      }
      #salama-chat-widget {
        bottom: 20px;
        right: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'salama-chat-widget';
  widget.innerHTML = `
    <div id="salama-chat-panel" role="dialog" aria-label="Salama AI assistant">
      <div id="salama-chat-header">
        <div class="chat-header-avatar">🌿</div>
        <div class="chat-header-info">
          <h3>Salama Assistant</h3>
          <p><span class="chat-status-dot"></span> Here to help you find your way</p>
        </div>
      </div>

      <div id="salama-chat-messages"></div>

      <div id="salama-chat-quick"></div>

      <div id="salama-chat-footer">
        <textarea
          id="salama-chat-input"
          placeholder="Ask me anything…"
          rows="1"
          aria-label="Type a message"
        ></textarea>
        <button id="salama-chat-send" aria-label="Send message" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>

    <button id="salama-chat-toggle" aria-label="Open Salama assistant">
      <div id="salama-chat-dot"></div>
      <!-- Chat icon -->
      <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <!-- Close icon -->
      <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── State ──────────────────────────────────────────────
  const messagesEl  = document.getElementById('salama-chat-messages');
  const inputEl     = document.getElementById('salama-chat-input');
  const sendBtn     = document.getElementById('salama-chat-send');
  const quickEl     = document.getElementById('salama-chat-quick');
  const toggleBtn   = document.getElementById('salama-chat-toggle');
  const dot         = document.getElementById('salama-chat-dot');

  let isOpen       = false;
  let isLoading    = false;
  let hasOpened    = false;
  const history    = []; // {role, content}

  const QUICK_REPLIES = [
    'Where do I start?',
    'I\'m feeling anxious',
    'How do I join?',
    'What is the daily check-in?',
  ];

  const RULE_BASED_RESPONSES = {
    // fallback when API key is not set
    patterns: [
      {
        match: /\b(start|begin|new here|first time|not sure)\b/i,
        reply: 'Welcome to Salama! 🌿 A great first step is the <a href="checkin.html">Daily Check-In</a>   it only takes a minute and helps you tune into how you\'re feeling right now.',
      },
      {
        match: /\b(anxi|stress|overwhelm|nervous|worry|worried)\b/i,
        reply: 'I hear you   that sounds really tough. A gentle first step is our <a href="checkin.html">Daily Check-In</a>, where you can name what you\'re feeling and find calming resources tailored to you. 💚',
      },
      {
        match: /\b(sad|depress|unhappy|down|hopeless|lonely|alone)\b/i,
        reply: 'You\'re not alone in feeling this way, and it takes courage to reach out. Try the <a href="checkin.html">Daily Check-In</a> to explore your emotions, or write your thoughts in the <a href="journaling.html">Journal</a>.',
      },
      {
        match: /\b(journal|write|diary|reflect|writing)\b/i,
        reply: 'Journaling is a beautiful practice. Head to the <a href="journaling.html">Journaling page</a> to write freely and track your thoughts over time   it\'s private and just for you.',
      },
      {
        match: /\b(sign up|join|register|member|account|create)\b/i,
        reply: 'Joining Salama is free and takes 30 seconds! 🌱 Head to <a href="login.html?tab=signup">Sign Up</a> to unlock member features like intensity tracking and your personal journal.',
      },
      {
        match: /\b(login|log in|sign in|password)\b/i,
        reply: 'You can sign in from the <a href="login.html">Login page</a>. Once signed in you\'ll have access to your journal and check-in history.',
      },
      {
        match: /\b(check.?in|check in|emotion|feeling|mood)\b/i,
        reply: 'The <a href="checkin.html">Daily Check-In</a> lets you pick an emotion, rate its intensity (for members), and discover grounding resources. It\'s a small act of self-care that adds up! ✨',
      },
      {
        match: /\b(resource|help|support|professional|crisis|therapist)\b/i,
        reply: 'If you\'re looking for professional support, the Daily Check-In ends with resources tailored to what you\'re feeling. For immediate help, please reach out to a trusted person or local mental health line.',
      },
      {
        match: /\b(what is|what's|about|salama|platform)\b/i,
        reply: 'Salama is a safe digital space for Lebanese students and the wider community to learn, share, and find support on their mental health journey   stigma-free. 🌿 Explore our <a href="index.html#services">services</a> to see everything we offer.',
      },
    ],
    default: 'I\'m here to help you find your way around Salama! You can start with the <a href="checkin.html">Daily Check-In</a>, explore <a href="journaling.html">Journaling</a>, or <a href="login.html?tab=signup">join the community</a>. What would you like to explore?',
  };

  // ── Helpers ────────────────────────────────────────────
  function addBubble(content, role) {
    const el = document.createElement('div');
    el.className = `chat-bubble ${role}`;
    el.innerHTML = content;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'chat-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function setQuickReplies(replies) {
    quickEl.innerHTML = '';
    replies.forEach(function (text) {
      const btn = document.createElement('button');
      btn.className = 'chat-quick-btn';
      btn.textContent = text;
      btn.onclick = function () {
        quickEl.innerHTML = '';
        sendMessage(text);
      };
      quickEl.appendChild(btn);
    });
  }

  function ruleBasedReply(text) {
    for (const item of RULE_BASED_RESPONSES.patterns) {
      if (item.match.test(text)) return item.reply;
    }
    return RULE_BASED_RESPONSES.default;
  }

  async function callClaude(userMessage) {
    history.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SALAMA_SYSTEM_PROMPT,
        messages: history,
      }),
    });

    if (!response.ok) throw new Error('API error ' + response.status);
    const data = await response.json();
    const reply = data.content[0].text;
    history.push({ role: 'assistant', content: reply });
    return reply;
  }

  async function sendMessage(text) {
    text = (text || inputEl.value).trim();
    if (!text || isLoading) return;

    inputEl.value = '';
    inputEl.style.height = '';
    sendBtn.disabled = true;
    isLoading = true;
    quickEl.innerHTML = '';

    addBubble(escapeHtml(text), 'user');

    showTyping();

    let reply;
    try {
      if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE') {
        reply = await callClaude(text);
      } else {
        // Simulate a short delay for the typing indicator
        await new Promise(function (r) { setTimeout(r, 700 + Math.random() * 400); });
        reply = ruleBasedReply(text);
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: reply });
      }
    } catch (err) {
      reply = 'Sorry, I\'m having trouble connecting right now. You can explore <a href="checkin.html">Check-In</a> or <a href="journaling.html">Journaling</a> directly. 🌿';
    }

    removeTyping();
    addBubble(reply, 'ai');
    isLoading = false;
    sendBtn.disabled = !inputEl.value.trim();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ── Events ─────────────────────────────────────────────
  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    widget.classList.toggle('open', isOpen);

    if (isOpen && !hasOpened) {
      hasOpened = true;
      dot.style.display = 'none';
      // Welcome message
      setTimeout(function () {
        addBubble('Hello! 🌿 I\'m here to help you find what you\'re looking for on Salama. Whether you want to check in with your emotions, write in your journal, or just explore   I\'ve got you.', 'ai');
        setTimeout(function () { setQuickReplies(QUICK_REPLIES); }, 200);
      }, 100);
    }

    if (isOpen) {
      setTimeout(function () { inputEl.focus(); }, 300);
    }
  });

  inputEl.addEventListener('input', function () {
    sendBtn.disabled = !this.value.trim() || isLoading;
    // Auto-resize
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 90) + 'px';
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', function () { sendMessage(); });

  // Show unread dot after 4s to draw attention
  setTimeout(function () {
    if (!isOpen) dot.style.display = 'block';
  }, 4000);
})();
