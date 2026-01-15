'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = String(params?.conversationId ?? '');
  const validId = useMemo(() => isUuid(conversationId), [conversationId]);

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ===== PRS DASHBOARD COLORS =====
  const COLORS = {
    pageBg: '#0f2a3a',
    headerBg: '#14384f',
    headerBorder: '#27d3a2',
    cardBg: '#14384f',
    panelBg: '#0f3146',
    border: '#1e4b63',
    text: '#e5f3f7',
    muted: '#9fb9c8',
    accentTeal: '#27d3a2',
    accentGreen: '#22c55e',
    darkText: '#052e2b',
    danger: '#ff6b6b',
  };

  // Get signed-in user
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    }

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load messages
  async function fetchMessages() {
    if (!validId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus('');
    setMessages((data ?? []) as MessageRow[]);
  }

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, validId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!validId) {
      alert('Invalid conversation link. Please open a real UUID conversation id.');
      return;
    }

    const text = input.trim();
    if (!text) return;

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id ?? null;

    if (!uid) {
      alert('Please sign in first.');
      return;
    }

    setLoading(true);
    setInput('');

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: uid,
        content: text,
      },
    ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await fetchMessages();
    setLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!validId) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.pageBg, padding: 16, color: COLORS.text }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <h2 style={{ margin: 0, color: COLORS.text }}>Invalid conversation link</h2>
          <p style={{ marginTop: 8, color: COLORS.muted }}>
            This page needs a real UUID conversation id.
            <br />
            Example: <code>/chat/a3f2e9c4-91b6-4c7a-9e2f-9a9e3b2a6d11</code>
          </p>

          <button
            onClick={() => router.push('/')}
            style={{
              background: COLORS.accentGreen,
              color: COLORS.darkText,
              border: 'none',
              padding: '10px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pageBg }}>
      {/* Header */}
      <div
        style={{
          background: COLORS.headerBg,
          color: COLORS.text,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `2px solid ${COLORS.headerBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: '#0b3d1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
            }}
            title="PRS Home Connect"
          >
            <Image src="/logo.png" alt="PRS Logo" width={28} height={28} />
          </div>

          <div>
            <div style={{ fontWeight: 900 }}>PRS Home Connect — Chat</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>
              Conversation: {conversationId}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!userId ? (
            <button
              onClick={() => router.push('/signin')}
              style={{
                background: COLORS.accentTeal,
                color: COLORS.darkText,
                border: 'none',
                padding: '10px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              Sign in
            </button>
          ) : (
            <div style={{ fontSize: 12, color: COLORS.muted }}>Signed in</div>
          )}

          <button
            onClick={() => router.push('/')}
            style={{
              background: COLORS.accentGreen,
              color: COLORS.darkText,
              border: 'none',
              padding: '10px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            Go Home
          </button>
        </div>
      </div>

      {/* Chat card */}
      <div style={{ maxWidth: 900, margin: '18px auto', padding: '0 14px' }}>
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 14,
            color: COLORS.text,
          }}
        >
          {/* Messages */}
          <div
            style={{
              minHeight: 380,
              maxHeight: 520,
              overflowY: 'auto',
              padding: 10,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.panelBg,
            }}
          >
            {status ? <p style={{ color: COLORS.danger, margin: 0 }}>{status}</p> : null}

            {messages.length === 0 ? (
              <p style={{ color: COLORS.muted, margin: 0 }}>No messages yet</p>
            ) : (
              messages.map((m) => {
                const mine = userId && m.sender_id === userId;
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        background: mine ? COLORS.accentTeal : COLORS.border,
                        color: mine ? COLORS.darkText : COLORS.text,
                        padding: '10px 12px',
                        borderRadius: 14,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: `1px solid ${mine ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{m.content}</div>
                      <div style={{ fontSize: 11, marginTop: 6, color: mine ? '#0b3d1f' : COLORS.muted }}>
                        {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={userId ? 'Type a message' : 'Sign in to send messages'}
              disabled={!userId || loading}
              style={{
                flex: 1,
                padding: '12px 12px',
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                outline: 'none',
                background: COLORS.panelBg,
                color: COLORS.text,
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!userId || loading || input.trim().length === 0}
              style={{
                background: COLORS.accentGreen,
                color: COLORS.darkText,
                border: 'none',
                padding: '12px 18px',
                borderRadius: 12,
                cursor: !userId || loading ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                opacity: !userId || loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: COLORS.muted }}>
            Tip: press Enter to send.
          </div>
        </div>
      </div>
    </div>
  );
}
	
