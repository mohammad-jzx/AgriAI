import React, { useState } from 'react';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    const payload = { message: input };
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'bot', text: '⚠️ خطأ: ' + (data?.error || 'API') }]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: data.reply || '...' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: '⚠️ حدث خطأ في الاتصال.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%', background: '#0ea5e9', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 9999 }}
      >
        💬
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: 100, right: 24, width: 320, height: 460, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999 }}>
          <div style={{ background: '#0ea5e9', color: '#fff', padding: 10, textAlign: 'center', fontWeight: 'bold' }}>🤖 المساعد الذكي</div>

          <div style={{ flex: 1, padding: 10, overflowY: 'auto', background: '#fafafa', fontSize: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                <b>{m.role === 'user' ? '👤 أنت: ' : '🤖 البوت: '}</b>{m.text}
              </div>
            ))}
            {loading && <p>⏳ جاري التفكير...</p>}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', padding: 8, borderTop: '1px solid #eee' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك..."
              style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: '6px 8px' }}
            />
            <button type="submit" disabled={loading} style={{ marginLeft: 8, padding: '6px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              إرسال
            </button>
          </form>
        </div>
      )}
    </>
  );
}


