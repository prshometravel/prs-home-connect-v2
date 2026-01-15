'use client';

import { useState } from 'react';

export default function ChatTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput('');
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>PRS Home Connect – Chat Test</h1>

      <div
        style={{
          border: '1px solid #ccc',
          height: 300,
          padding: 10,
          overflowY: 'auto',
          marginBottom: 10,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#777' }}>No messages yet</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            {msg}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        style={{ width: '80%', padding: 8 }}
      />

      <button
        onClick={sendMessage}
        style={{ padding: 8, marginLeft: 8 }}
      >
        Send
      </button>
    </main>
  );
}
	
