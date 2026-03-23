(function () {
  // ── Styles ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #salama-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #4a6640;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(74,102,64,0.38);
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
      font-family: 'Inter', sans-serif;
    }
    #salama-chat-toggle:hover {
      background: #374f31;
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(74,102,64,0.48);
    }
    #salama-chat-toggle svg { display: block; }

    #salama-chat-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      z-index: 10000;
      width: 370px;
      height: 560px;
      max-height: calc(100vh - 120px);
      background: rgba(245, 240, 232, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(200,217,194,0.55);
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(74,102,64,0.14);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      transform-origin: bottom right;
      transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
    }
    #salama-chat-window.sc-hidden {
      opacity: 0;
      transform: scale(0.93) translateY(10px);
      visibility: hidden;
      pointer-events: none;
    }

    @media (max-width: 480px) {
      #salama-chat-window {
        inset: 0;
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        bottom: 0;
        right: 0;
      }
    }

    #salama-chat-header {
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(200,217,194,0.5);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .sc-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #4a6640;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sc-header-text { flex: 1; }
    .sc-header-name {
      font-size: 15px;
      font-weight: 600;
      color: #2a2722;
      font-family: 'Playfair Display', serif;
    }
    .sc-header-status {
      font-size: 12px;
      color: #7d9e75;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .sc-status-dot {
      width: 7px;
      height: 7px;
      background: #7d9e75;
      border-radius: 50%;
    }
    #salama-chat-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #8a8680;
      padding: 4px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, background 0.2s;
    }
    #salama-chat-close:hover { color: #2a2722; background: rgba(0,0,0,0.05); }

    #salama-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #salama-chat-messages::-webkit-scrollbar { width: 4px; }
    #salama-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #salama-chat-messages::-webkit-scrollbar-thumb { background: rgba(125,158,117,0.3); border-radius: 4px; }

    .sc-bubble-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .sc-bubble-row.sc-user { flex-direction: row-reverse; }

    .sc-bubble-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #4a6640;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sc-bubble-avatar.sc-user-av { background: #c8d9c2; }

    .sc-bubble {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.6;
      color: #2a2722;
    }
    .sc-bubble.sc-bot {
      background: rgba(200,217,194,0.45);
      border-bottom-left-radius: 4px;
    }
    .sc-bubble.sc-user-msg {
      background: #4a6640;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .sc-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
    }
    .sc-typing span {
      width: 6px;
      height: 6px;
      background: #7d9e75;
      border-radius: 50%;
      animation: sc-bounce 1.2s infinite;
    }
    .sc-typing span:nth-child(2) { animation-delay: 0.15s; }
    .sc-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes sc-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }

    #salama-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      padding: 0 16px 10px;
      flex-shrink: 0;
    }
    .sc-quick-btn {
      background: none;
      border: 1.5px solid rgba(74,102,64,0.35);
      color: #4a6640;
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      padding: 6px 12px;
      border-radius: 100px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .sc-quick-btn:hover {
      background: rgba(74,102,64,0.08);
      border-color: #4a6640;
    }

    #salama-chat-footer {
      padding: 10px 14px 14px;
      border-top: 1px solid rgba(200,217,194,0.5);
      flex-shrink: 0;
    }
    #salama-chat-form {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: rgba(200,217,194,0.2);
      border: 1.5px solid rgba(200,217,194,0.6);
      border-radius: 16px;
      padding: 6px 6px 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #salama-chat-form:focus-within {
      border-color: #4a6640;
      box-shadow: 0 0 0 3px rgba(74,102,64,0.08);
    }
    #salama-chat-input {
      flex: 1;
      border: none;
      background: transparent;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #2a2722;
      resize: none;
      outline: none;
      max-height: 100px;
      line-height: 1.5;
      padding: 4px 0;
    }
    #salama-chat-input::placeholder { color: #8a8680; }
    #salama-chat-send {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #4a6640;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    #salama-chat-send:hover { background: #374f31; }
    #salama-chat-send:disabled { background: #c8d9c2; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ── Responses ────────────────────────────────────────────────────────────────
  const responses = [
    {
      match: ['hello', 'hi', 'hey', 'salam', 'marhaba'],
      reply: "Hello 🌿 I'm the Salama Assistant. I'm here to help you find support, explore resources, or just have a gentle conversation. What's on your mind?"
    },
    {
      match: ['anxious', 'anxiety', 'worried', 'stress', 'stressed', 'overwhelmed', 'panic'],
      reply: "Anxiety can feel really overwhelming. Salama has breathing exercises and grounding techniques that can help you right now. Would you like to try one?",
      quick: ['Try breathing', 'Try grounding', 'Find support']
    },
    {
      match: ['sad', 'depressed', 'depression', 'empty', 'hopeless', 'crying', 'lonely', 'down'],
      reply: "I'm sorry you're feeling this way — you're not alone in this. Salama has a private journal space and a daily check-in to help you process your feelings. Would either of those help right now?",
      quick: ['Open journal', 'Do a check-in', 'Find support']
    },
    {
      match: ['breathe', 'breathing', 'breath', 'calm', 'relax', 'try breathing'],
      reply: "Salama has several breathing exercises — 4-6 for calm, 4-7-8 for sleep, and 5-5 box breathing for focus. Head to the breathing hub to try one.",
      quick: ['Go to breathing hub', 'Try 4-6 breathing', 'Try 4-7-8 breathing']
    },
    {
      match: ['grounding', 'try grounding', 'ground'],
      reply: "Grounding exercises help you reconnect with the present moment when anxiety feels overwhelming. Salama has a guided grounding exercise waiting for you.",
      quick: ['Try grounding now']
    },
    {
      match: ['journal', 'journaling', 'write', 'diary', 'open journal'],
      reply: "Your Salama journal is completely private — only you can see it. It's a safe space to process your thoughts freely. You'll need to sign in to access it.",
      quick: ['Sign in to journal']
    },
    {
      match: ['check-in', 'checkin', 'check in', 'mood', 'do a check-in'],
      reply: "A daily check-in helps you tune into how you're feeling and build emotional awareness over time. It only takes a minute.",
      quick: ['Do a check-in now']
    },
    {
      match: ['help', 'support', 'crisis', 'emergency', 'suicide', 'harm', 'hurt myself', 'find support'],
      reply: "If you're in crisis or need immediate support, please reach out to a professional right away.\n\n📞 Embrace Lebanon: 1564 (free, 24/7)\n\nSalama also has a full directory of mental health resources in Lebanon.",
      quick: ['Find all resources']
    },
    {
      match: ['therapist', 'psychiatrist', 'counselor', 'doctor', 'professional', 'therapy', 'find professionals'],
      reply: "Salama has a directory of mental health professionals and clinics in Lebanon — including MIND, Restart, IDRAAC, and university counseling centers.",
      quick: ['Explore resources']
    },
    {
      match: ['aub', 'aub resources'],
      reply: "AUB has student counseling services and accessible mental health support. Salama has a dedicated page with everything you need.",
      quick: ['Go to AUB page']
    },
    {
      match: ['lau', 'lau resources'],
      reply: "LAU offers counseling and mental health support for its students. Check Salama's LAU resources page for details.",
      quick: ['Go to LAU page']
    },
    {
      match: ['usj', 'usj resources'],
      reply: "USJ has psychiatric and counseling services for students. Find the details on Salama.",
      quick: ['Go to USJ page']
    },
    {
      match: ['ndu', 'ndu resources'],
      reply: "NDU offers student mental health support. Find details on Salama's NDU page.",
      quick: ['Go to NDU page']
    },
    {
      match: ['university', 'student', 'campus', 'uni'],
      reply: "Salama has dedicated pages for AUB, LAU, USJ, and NDU counseling services. Which university are you at?",
      quick: ['AUB', 'LAU', 'USJ', 'NDU']
    },
    {
      match: ['story', 'stories', 'community', 'experience', 'share', 'read stories'],
      reply: "Salama has a community space where people share their experiences with mental health and with Salama. You can read others' stories or share your own anonymously.",
      quick: ['Read community stories', 'Share my story']
    },
    {
      match: ['what is salama', 'about salama', 'about', 'what is this'],
      reply: "Salama سلامة is a mental wellness platform for Lebanon. It offers journaling, mood check-ins, breathing exercises, storytelling, and a directory of local mental health resources — all in a calm, private space."
    },
    // ── Study: specific sub-topics first, catch-all last ──────────────────────
    {
      match: ["i can't focus", "cant focus", "can't concentrate", 'no focus', 'distracted', 'cant concentrate'],
      reply: "When focus feels impossible, starting small helps. Try the Pomodoro method — 25 minutes of work, then a short break. Salama walks you through it.",
      quick: ['Try Pomodoro', 'Try 5-min rule', 'Go to Study Hub']
    },
    {
      match: ["i keep procrastinating", 'procrastinat', 'putting it off', 'keep delaying', 'cant start', "can't start"],
      reply: "The hardest part is starting. The 5-Minute Rule can help — just commit to 5 minutes, and momentum usually takes over.",
      quick: ['Try 5-min rule', 'Try one-task method', 'Go to Study Hub']
    },
    {
      match: ['too much to cover', 'too much material', 'overwhelmed by studying', 'a lot to study', 'dont know where to start', "don't know where to start", 'i have too much'],
      reply: "When everything feels urgent, breaking it down helps. Salama's Task Breakdown technique turns a huge workload into manageable steps.",
      quick: ['Try task breakdown', 'Try spaced repetition', 'Go to Study Hub']
    },
    {
      match: ['pomodoro', 'try pomodoro', 'start pomodoro'],
      reply: "The Pomodoro method uses focused 25-minute work sessions followed by short breaks. It's one of the most effective tools for concentration.",
      quick: ['Start Pomodoro now']
    },
    {
      match: ['5-min rule', '5 min rule', 'five minute', 'try 5-min'],
      reply: "The 5-Minute Rule: just commit to working for 5 minutes. More often than not, you'll keep going once you've started.",
      quick: ['Try it now']
    },
    {
      match: ['blurting', 'active recall', 'memoriz', 'try blurting', 'try active recall'],
      reply: "Active recall is one of the best ways to study. Salama has a Blurting technique — write down everything you remember, then check what you missed.",
      quick: ['Try blurting', 'Try active recall']
    },
    {
      match: ['spaced repetition', 'long term memory', 'retain', 'try spaced'],
      reply: "Spaced repetition spreads out your review sessions over time, making information stick much longer. Great for exam prep.",
      quick: ['Try spaced repetition', 'Go to Study Hub']
    },
    {
      match: ['brain reset', 'mental reset', 'burned out', 'burnout', 'need a break from studying'],
      reply: "Burnout is real — pushing through without breaks makes things worse. Salama has a Brain Reset technique to help you recharge properly.",
      quick: ['Try Brain Reset', 'Go to Study Hub']
    },
    {
      match: ['show me all techniques', 'study hub', 'go to study hub', 'all study', 'study tools', 'all techniques'],
      reply: "Salama's Study Hub has Pomodoro, 5-Minute Rule, Task Breakdown, One Task Focus, Blurting, Active Recall, Spaced Repetition, and a Brain Reset. Head there to explore.",
      quick: ['Go to Study Hub']
    },
    {
      match: ['study', 'studying', 'exam', 'exams', 'homework', 'assignment', 'revision', 'revise', 'academic', 'notes', 'concentrate', 'focus', 'recall', 'learn', 'lecture', 'test', 'quiz', 'finals', 'midterm', 'i need to study'],
      reply: "Salama has a dedicated Study Hub with techniques to help you study smarter and manage academic stress 📚 What's getting in your way right now?",
      quick: ["I can't focus", 'I keep procrastinating', 'I have too much to cover', 'Show me all techniques']
    },
    {
      match: ['thank', 'thanks', 'shukran', 'merci'],
      reply: "You're welcome 🌿 Take care of yourself. I'm always here if you need anything."
    },
    {
      match: ['bye', 'goodbye', 'see you', 'later'],
      reply: "Take care of yourself 🌿 Salama is always here whenever you need it."
    }
  ];

  const initialQuickReplies = [
    { label: "I'm feeling anxious", msg: "I'm feeling anxious" },
    { label: "I need to study", msg: "I need to study" },
    { label: "Try a breathing exercise", msg: "breathing exercise" },
    { label: "I need support", msg: "I need support" },
  ];

  const linkMap = {
    'Go to breathing hub': 'breathing-hub.html',
    'Try 4-6 breathing': 'breathing-46.html',
    'Try 4-7-8 breathing': 'breathing-478.html',
    'Try grounding now': 'grounding.html',
    'Try grounding': 'grounding.html',
    'Do a check-in now': 'checkin.html',
    'Do a check-in': 'checkin.html',
    'Sign in to journal': 'login.html',
    'Open journal': 'login.html',
    'Find all resources': 'support.html',
    'Explore resources': 'support.html',
    'Find support': 'support.html',
    'Go to AUB page': 'aub.html',
    'AUB': 'aub.html',
    'Go to LAU page': 'lau-counseling.html',
    'LAU': 'lau-counseling.html',
    'Go to USJ page': 'usj.html',
    'USJ': 'usj.html',
    'Go to NDU page': 'ndu.html',
    'NDU': 'ndu.html',
    'Read community stories': 'salama-stories.html',
    'Share my story': 'salama-stories-share.html',
    'Go to Study Hub': 'study.html',
    'Start Pomodoro now': 'study-pomodoro.html',
    'Try Pomodoro': 'study-pomodoro.html',
    'Try 5-min rule': 'study-5min.html',
    'Try it now': 'study-5min.html',
    'Try task breakdown': 'study-breakdown.html',
    'Try one-task method': 'study-onetask.html',
    'One Task Focus': 'study-onetask.html',
    'Try blurting': 'study-blurting.html',
    'Try active recall': 'study-recall.html',
    'Try spaced repetition': 'study-spaced.html',
    'Try Brain Reset': 'study-reset.html',
  };

  function getBotReply(text) {
    const lower = text.toLowerCase();
    for (const r of responses) {
      if (r.match.some(k => lower.includes(k))) return r;
    }
    return {
      reply: "I'm not sure I fully understood that, but I'm here to help. You can ask me about breathing exercises, journaling, check-ins, mental health resources in Lebanon, or anything else on your mind."
    };
  }

  // ── Build DOM ─────────────────────────────────────────────────────────────────
  const leafSVG = `<svg width="13" height="18" viewBox="0 0 16 22" fill="none">
    <path d="M8,21 L8,4" stroke="rgba(255,255,255,0.5)" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M8,15 C4.5,13 1.5,9.5 3.5,6.5 C5,4.5 8,8 8,15Z" fill="rgba(255,255,255,0.9)"/>
    <path d="M8,15 C11.5,13 14.5,9.5 12.5,6.5 C11,4.5 8,8 8,15Z" fill="rgba(255,255,255,0.9)"/>
    <path d="M8,8 C5.5,5.5 5.5,1.5 8,0.5 C10.5,1.5 10.5,5.5 8,8Z" fill="#fff"/>
  </svg>`;

  const userIconSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a6640" stroke-width="2" stroke-linecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>`;

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'salama-chat-toggle';
  toggleBtn.setAttribute('aria-label', 'Open Salama Assistant');
  toggleBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  const chatWindow = document.createElement('div');
  chatWindow.id = 'salama-chat-window';
  chatWindow.classList.add('sc-hidden');
  chatWindow.innerHTML = `
    <div id="salama-chat-header">
      <div class="sc-avatar">${leafSVG}</div>
      <div class="sc-header-text">
        <div class="sc-header-name">Salama Assistant</div>
        <div class="sc-header-status"><span class="sc-status-dot"></span> Here to help</div>
      </div>
      <button id="salama-chat-close" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div id="salama-chat-messages"></div>
    <div id="salama-quick-replies"></div>
    <div id="salama-chat-footer">
      <form id="salama-chat-form" autocomplete="off">
        <textarea id="salama-chat-input" placeholder="Type a message…" rows="1"></textarea>
        <button id="salama-chat-send" type="submit" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>`;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(chatWindow);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const messagesEl = document.getElementById('salama-chat-messages');
  const quickRepliesEl = document.getElementById('salama-quick-replies');
  const inputEl = document.getElementById('salama-chat-input');
  const sendBtn = document.getElementById('salama-chat-send');
  const form = document.getElementById('salama-chat-form');

  let isOpen = false;
  let botTyping = false;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function makeBotAvatar() {
    const el = document.createElement('div');
    el.className = 'sc-bubble-avatar';
    el.innerHTML = leafSVG;
    return el;
  }

  function makeUserAvatar() {
    const el = document.createElement('div');
    el.className = 'sc-bubble-avatar sc-user-av';
    el.innerHTML = userIconSVG;
    return el;
  }

  function addMessage(text, sender) {
    const row = document.createElement('div');
    row.className = 'sc-bubble-row' + (sender === 'user' ? ' sc-user' : '');
    const bubble = document.createElement('div');
    bubble.className = 'sc-bubble ' + (sender === 'user' ? 'sc-user-msg' : 'sc-bot');
    bubble.textContent = text;
    if (sender === 'user') {
      row.appendChild(bubble);
      row.appendChild(makeUserAvatar());
    } else {
      row.appendChild(makeBotAvatar());
      row.appendChild(bubble);
    }
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'sc-bubble-row';
    row.id = 'sc-typing-row';
    row.appendChild(makeBotAvatar());
    const bubble = document.createElement('div');
    bubble.className = 'sc-bubble sc-bot sc-typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function removeTyping() {
    const el = document.getElementById('sc-typing-row');
    if (el) el.remove();
  }

  function setQuickReplies(replies) {
    quickRepliesEl.innerHTML = '';
    if (!replies || !replies.length) return;
    replies.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'sc-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        if (linkMap[label]) {
          window.location.href = linkMap[label];
        } else {
          handleUserMessage(label);
        }
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleUserMessage(text) {
    if (!text.trim() || botTyping) return;
    setQuickReplies([]);
    addMessage(text, 'user');
    inputEl.value = '';
    inputEl.style.height = '';
    sendBtn.disabled = true;
    botTyping = true;
    addTyping();
    const result = getBotReply(text);
    const delay = 700 + Math.min(result.reply.length * 10, 1400);
    setTimeout(() => {
      removeTyping();
      addMessage(result.reply, 'bot');
      setQuickReplies(result.quick || []);
      botTyping = false;
      sendBtn.disabled = false;
    }, delay);
  }

  function toggle() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('sc-hidden', !isOpen);
    toggleBtn.innerHTML = isOpen
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    if (isOpen) { setTimeout(() => inputEl.focus(), 250); scrollBottom(); }
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', toggle);
  document.getElementById('salama-chat-close').addEventListener('click', toggle);

  form.addEventListener('submit', e => {
    e.preventDefault();
    handleUserMessage(inputEl.value.trim());
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage(inputEl.value.trim());
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });

  // ── Welcome ───────────────────────────────────────────────────────────────────
  setTimeout(() => {
    addMessage("Hi 🌿 I'm the Salama Assistant. How are you feeling today?", 'bot');
    setQuickReplies(initialQuickReplies.map(q => q.label));
    // Wire initial quick replies to their messages
    const btns = quickRepliesEl.querySelectorAll('.sc-quick-btn');
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => handleUserMessage(initialQuickReplies[i].msg), { once: true });
    });
  }, 350);

})();
