import { useState, useEffect, useCallback } from 'react'

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080B0F; --bg2: #0D1117; --bg3: #161B22; --bg4: #1C2330;
    --border: #21262D; --border2: #30363D;
    --text: #E6EDF3; --text2: #8B949E; --text3: #484F58;
    --cyan: #39D0D8; --cyan-dim: #1A4D50;
    --green: #3FB950; --green-dim: #1A3A1E;
    --yellow: #D29922; --yellow-dim: #3A2A0A;
    --red: #F85149; --red-dim: #3A1018;
    --font-mono: 'IBM Plex Mono', monospace;
    --font-sans: 'Syne', sans-serif;
  }
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-mono); font-size: 13px; line-height: 1.6; overflow: hidden; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--bg2); } ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  .app { display: flex; flex-direction: column; height: 100vh; }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 52px; border-bottom: 1px solid var(--border); background: var(--bg2); flex-shrink: 0; }
  .header-logo { font-family: var(--font-sans); font-weight: 800; font-size: 16px; color: var(--cyan); letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  .header-logo span { color: var(--text2); font-weight: 400; font-size: 13px; font-family: var(--font-mono); }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .user-badge { display: flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 4px; background: var(--bg3); border: 1px solid var(--border); color: var(--text2); font-size: 12px; }
  .user-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
  .main { display: flex; flex: 1; overflow: hidden; }
  .sidebar { width: 340px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg2); overflow: hidden; }
  .sidebar-header { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .sidebar-title { font-family: var(--font-sans); font-weight: 700; font-size: 13px; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; }
  .badge { padding: 1px 7px; border-radius: 10px; font-size: 11px; background: var(--cyan-dim); color: var(--cyan); border: 1px solid var(--cyan-dim); }
  .email-list { overflow-y: auto; flex: 1; }
  .email-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.1s; position: relative; }
  .email-item:hover { background: var(--bg3); }
  .email-item.active { background: var(--bg3); border-left: 2px solid var(--cyan); }
  .email-item.selected { background: var(--bg4); }
  .email-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
  .email-sender { font-weight: 500; color: var(--text); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
  .email-date { color: var(--text3); font-size: 11px; flex-shrink: 0; }
  .email-subject { color: var(--text2); font-size: 12px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .email-snippet { color: var(--text3); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .email-status { position: absolute; top: 12px; right: 16px; font-size: 10px; padding: 1px 6px; border-radius: 3px; }
  .status-sent { background: var(--green-dim); color: var(--green); }
  .status-drafted { background: var(--yellow-dim); color: var(--yellow); }
  .email-checkbox { width: 14px; height: 14px; border-radius: 3px; border: 1px solid var(--border2); background: var(--bg3); cursor: pointer; flex-shrink: 0; margin-right: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .email-checkbox.checked { background: var(--cyan); border-color: var(--cyan); }
  .detail { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .detail-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text3); }
  .detail-empty-icon { font-size: 48px; opacity: 0.3; }
  .detail-empty-text { font-family: var(--font-sans); font-size: 16px; }
  .email-detail { flex: 1; overflow-y: auto; padding: 24px; }
  .email-detail-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
  .email-detail-subject { font-family: var(--font-sans); font-weight: 700; font-size: 18px; color: var(--text); margin-bottom: 12px; line-height: 1.3; }
  .email-meta { display: flex; flex-wrap: wrap; gap: 12px; }
  .meta-item { display: flex; gap: 6px; font-size: 12px; }
  .meta-label { color: var(--text3); } .meta-value { color: var(--text2); }
  .email-body-text { color: var(--text2); font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
  .draft-panel { border-top: 1px solid var(--border); background: var(--bg2); flex-shrink: 0; }
  .draft-panel-header { padding: 12px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .draft-panel-title { font-family: var(--font-sans); font-weight: 700; font-size: 13px; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; }
  .draft-body { padding: 16px 24px; max-height: 220px; overflow-y: auto; }
  .draft-textarea { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: 6px; color: var(--text); font-family: var(--font-mono); font-size: 13px; padding: 12px; resize: vertical; min-height: 100px; outline: none; line-height: 1.7; transition: border-color 0.15s; }
  .draft-textarea:focus { border-color: var(--cyan); }
  .draft-instructions { padding: 0 24px 12px; display: flex; gap: 8px; align-items: center; }
  .instructions-input { flex: 1; background: var(--bg3); border: 1px solid var(--border); border-radius: 4px; color: var(--text2); font-family: var(--font-mono); font-size: 12px; padding: 6px 10px; outline: none; }
  .instructions-input::placeholder { color: var(--text3); }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 5px; font-size: 12px; font-family: var(--font-mono); font-weight: 500; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: var(--cyan); color: var(--bg); border-color: var(--cyan); }
  .btn-primary:hover:not(:disabled) { background: #4EEAF2; }
  .btn-ghost { background: transparent; color: var(--text2); border-color: var(--border2); }
  .btn-ghost:hover:not(:disabled) { background: var(--bg3); color: var(--text); }
  .btn-green { background: var(--green-dim); color: var(--green); border-color: var(--green-dim); }
  .btn-green:hover:not(:disabled) { background: #234029; }
  .btn-yellow { background: var(--yellow-dim); color: var(--yellow); border-color: var(--yellow-dim); }
  .btn-sm { padding: 4px 10px; font-size: 11px; }
  .btn-lg { padding: 10px 20px; font-size: 13px; }
  .login-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
  .login-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 48px; max-width: 420px; width: 90%; text-align: center; }
  .login-icon { font-size: 48px; margin-bottom: 24px; }
  .login-title { font-family: var(--font-sans); font-weight: 800; font-size: 28px; color: var(--text); margin-bottom: 8px; }
  .login-title span { color: var(--cyan); }
  .login-sub { color: var(--text2); margin-bottom: 32px; font-size: 13px; line-height: 1.7; }
  .login-features { text-align: left; margin-bottom: 32px; display: flex; flex-direction: column; gap: 8px; }
  .login-feature { display: flex; align-items: center; gap: 10px; color: var(--text2); font-size: 12px; }
  .login-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); flex-shrink: 0; }
  .toolbar { padding: 10px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; background: var(--bg2); flex-shrink: 0; }
  .loading { display: flex; align-items: center; gap: 10px; color: var(--text3); padding: 40px; }
  .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border2); border-top-color: var(--cyan); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .toast-container { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 999; }
  .toast { padding: 10px 16px; border-radius: 6px; font-size: 12px; animation: slideIn 0.2s ease; display: flex; align-items: center; gap: 8px; max-width: 320px; }
  .toast-success { background: var(--green-dim); color: var(--green); border: 1px solid var(--green-dim); }
  .toast-error { background: var(--red-dim); color: var(--red); border: 1px solid var(--red-dim); }
  .toast-info { background: var(--cyan-dim); color: var(--cyan); border: 1px solid var(--cyan-dim); }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .name-input-row { padding: 8px 24px 0; display: flex; align-items: center; gap: 8px; }
  .name-label { color: var(--text3); font-size: 11px; white-space: nowrap; }
  .name-input { background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text2); font-family: var(--font-mono); font-size: 12px; padding: 2px 4px; outline: none; width: 160px; }
  .name-input::placeholder { color: var(--text3); }
  .refresh-btn { padding: 4px 10px; font-size: 11px; background: transparent; border: 1px solid var(--border); border-radius: 4px; color: var(--text3); cursor: pointer; font-family: var(--font-mono); transition: all 0.15s; }
  .refresh-btn:hover { border-color: var(--border2); color: var(--text2); }
  .empty-inbox { padding: 40px 20px; text-align: center; color: var(--text3); }
  .empty-inbox div:first-child { font-size: 28px; margin-bottom: 12px; }
  .bottom-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; border-top: 1px solid var(--border); background: var(--bg2); flex-shrink: 0; }
  .bottom-left { display: flex; align-items: center; gap: 12px; }
`

const api = {
  get: async (url) => {
    const r = await fetch(url, { credentials: 'include' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },
  post: async (url, body) => {
    const r = await fetch(url, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      throw new Error(err.detail || `HTTP ${r.status}`)
    }
    return r.json()
  }
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  return { toasts, success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }
}

function LoginScreen() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">⚡</div>
        <h1 className="login-title">AI Email <span>Replier</span></h1>
        <p className="login-sub">Connect your Gmail and let Llama 3 draft smart replies to your unread emails.</p>
        <div className="login-features">
          {['Fetch unread emails from Gmail','AI-drafted replies via Groq (Llama 3)','Review & edit before sending','Send with one click'].map(f => (
            <div key={f} className="login-feature"><div className="login-feature-dot" />{f}</div>
          ))}
        </div>
        <a href="/api/auth/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', justifyContent: 'center', width: '100%' }}>
          Connect Gmail Account →
        </a>
      </div>
    </div>
  )
}

export default function App() {
  const [authStatus, setAuthStatus] = useState(null)
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
  const toast = useToast()

  useEffect(() => {
    api.get('/api/auth/status')
      .then(data => setAuthStatus(data.authenticated ? data : false))
      .catch(() => setAuthStatus(false))
  }, [])

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/emails?max_results=20')
      setEmails(data.emails || [])
      toast.info(`Loaded ${data.count} unread emails`)
    } catch (e) {
      toast.error('Failed to fetch emails')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authStatus && authStatus.email) fetchEmails()
  }, [authStatus])

  const toggleCheck = (id, e) => {
    e.stopPropagation()
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDraft = async (email) => {
    setDraftingId(email.id)
    try {
      const data = await api.post('/api/draft', { ...email, instructions, user_name: userName })
      if (data && data.reply) {
        setDrafts(prev => ({ ...prev, [email.id]: data.reply }))
        toast.success('Reply drafted!')
      } else {
        toast.error('Empty reply received')
      }
    } catch (e) {
      toast.error('Failed to draft reply')
    } finally {
      setDraftingId(null)
    }
  }

  const handleDraftAll = async () => {
    const toProcess = emails.filter(e => checkedIds.has(e.id))
    if (!toProcess.length) { toast.info('Select emails first'); return }
    for (const em of toProcess) await handleDraft(em)
  }

  const handleSend = async (email) => {
    const reply = drafts[email.id]
    if (!reply) { toast.error('Draft a reply first'); return }
    setSendingId(email.id)
    try {
      const r = await fetch('/api/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_body: reply, original_email: email, dry_run: false })
      })
      if (r.ok) {
        setSentIds(prev => new Set([...prev, email.id]))
        toast.success('✓ Reply sent!')
      } else {
        toast.error('Failed to send reply')
      }
    } catch (e) {
      toast.error('Failed to send reply')
    } finally {
      setSendingId(null)
    }
  }

  const selectedEmail = emails.find(e => e.id === selectedId) || null

  if (authStatus === null) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading"><div className="spinner" /><span>Loading...</span></div>
    </div>
  )

  if (!authStatus) return <LoginScreen />

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-logo">⚡ AI Email Replier<span>/ inbox</span></div>
          <div className="header-right">
            <div className="user-badge"><div className="dot" />{authStatus.email}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => fetch('/api/auth/logout', { credentials: 'include' }).then(() => setAuthStatus(false))}>logout</button>
          </div>
        </header>

        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title">Unread</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {emails.length > 0 && <span className="badge">{emails.length}</span>}
                <button className="refresh-btn" onClick={fetchEmails} disabled={loading}>{loading ? '...' : '↻'}</button>
              </div>
            </div>

            {emails.length > 0 && (
              <div className="toolbar">
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const allIds = new Set(emails.map(e => e.id))
                  setCheckedIds(checkedIds.size === emails.length ? new Set() : allIds)
                }}>
                  {checkedIds.size === emails.length ? 'deselect all' : 'select all'}
                </button>
                {checkedIds.size > 0 && (
                  <button className="btn btn-yellow btn-sm" onClick={handleDraftAll} disabled={!!draftingId}>
                    {draftingId ? '...' : `draft ${checkedIds.size} selected`}
                  </button>
                )}
              </div>
            )}

            <div className="email-list">
              {loading && <div className="loading"><div className="spinner" /><span>fetching...</span></div>}
              {!loading && emails.length === 0 && <div className="empty-inbox"><div>📭</div><div>No unread emails</div></div>}
              {emails.map(em => (
                <div
                  key={em.id}
                  className={`email-item ${selectedId === em.id ? 'active' : ''} ${checkedIds.has(em.id) ? 'selected' : ''}`}
                  onClick={() => setSelectedId(em.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div className={`email-checkbox ${checkedIds.has(em.id) ? 'checked' : ''}`} onClick={(e) => toggleCheck(em.id, e)} style={{ marginTop: 2 }}>
                      {checkedIds.has(em.id) && <span style={{ color: '#080B0F', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="email-item-top">
                        <span className="email-sender">{em.sender_name || em.sender}</span>
                        <span className="email-date">{em.date ? em.date.split(' ').slice(0,3).join(' ') : ''}</span>
                      </div>
                      <div className="email-subject">{em.subject}</div>
                      <div className="email-snippet">{em.snippet}</div>
                    </div>
                  </div>
                  {sentIds.has(em.id) && <span className="email-status status-sent">sent</span>}
                  {!sentIds.has(em.id) && drafts[em.id] && <span className="email-status status-drafted">drafted</span>}
                </div>
              ))}
            </div>
          </aside>

          <div className="detail">
            {!selectedEmail ? (
              <div className="detail-empty">
                <div className="detail-empty-icon">✉️</div>
                <div className="detail-empty-text">Select an email</div>
                <div style={{ fontSize: 12 }}>Click any email to view and reply</div>
              </div>
            ) : (
              <>
                <div className="email-detail">
                  <div className="email-detail-header">
                    <div className="email-detail-subject">{selectedEmail.subject}</div>
                    <div className="email-meta">
                      <div className="meta-item"><span className="meta-label">from</span><span className="meta-value">{selectedEmail.sender_raw}</span></div>
                      <div className="meta-item"><span className="meta-label">to</span><span className="meta-value">{selectedEmail.to}</span></div>
                      {selectedEmail.date && <div className="meta-item"><span className="meta-label">date</span><span className="meta-value">{selectedEmail.date}</span></div>}
                    </div>
                  </div>
                  <div className="email-body-text">{selectedEmail.body}</div>
                </div>

                <div className="draft-panel">
                  <div className="draft-panel-header">
                    <span className="draft-panel-title">AI Reply</span>
                  </div>
                  <div className="name-input-row">
                    <span className="name-label">sign-off name:</span>
                    <input className="name-input" placeholder="Your Name" value={userName} onChange={e => setUserName(e.target.value)} />
                  </div>
                  <div className="draft-instructions">
                    <input
                      className="instructions-input"
                      placeholder="Optional instructions: e.g. 'decline politely' or 'keep it short'"
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleDraft(selectedEmail)} disabled={draftingId === selectedEmail.id}>
                      {draftingId === selectedEmail.id ? <><div className="spinner" style={{ width: 10, height: 10 }} /> drafting...</> : '⚡ draft reply'}
                    </button>
                  </div>
                  <div className="draft-body">
                    {drafts[selectedEmail.id] ? (
                      <textarea
                        className="draft-textarea"
                        value={drafts[selectedEmail.id]}
                        onChange={e => setDrafts(prev => ({ ...prev, [selectedEmail.id]: e.target.value }))}
                        rows={5}
                      />
                    ) : (
                      <div style={{ color: 'var(--text3)', padding: '12px 0', fontSize: 12 }}>
                        Click "⚡ draft reply" to generate an AI reply for this email.
                      </div>
                    )}
                  </div>
                  {drafts[selectedEmail.id] && (
                    <div className="bottom-bar">
                      <div className="bottom-left">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDraft(selectedEmail)} disabled={!!draftingId}>↻ regenerate</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDrafts(prev => { const n = { ...prev }; delete n[selectedEmail.id]; return n })}>✕ discard</button>
                      </div>
                      <button
                        className="btn btn-green"
                        onClick={() => handleSend(selectedEmail)}
                        disabled={sendingId === selectedEmail.id || sentIds.has(selectedEmail.id)}
                      >
                        {sentIds.has(selectedEmail.id) ? '✓ sent' : sendingId === selectedEmail.id ? 'sending...' : '→ send reply'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="toast-container">
        {toast.toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'} {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}