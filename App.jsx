// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import MessageBubble from "./components/MessageBubble";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);

  // listen to chats collection
  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return unsub;
  }, []);

 const sendMessage = async (text) => {
  const finalText = text ?? input;
  if (!finalText.trim()) return;

  // 1) store user message
  await addDoc(collection(db, "chats"), {
    text: finalText,
    from: "You",
    timestamp: serverTimestamp(),
  });

  if (text === undefined) setInput("");

  // 2) call AI backend
  try {
    const res = await fetch("http://localhost:5000/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: finalText }),
    });
    const data = await res.json();

    // 3) store AI reply
    await addDoc(collection(db, "chats"), {
      text: data.reply,
      from: "HereForYou AI",
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error(e);
  }
};


  const sendMood = async (moodLabel) => {
    await sendMessage(`I'm feeling ${moodLabel.toLowerCase()} today.`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #7F7FD5, #86A8E7, #91EAE4)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          height: 620,
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header with avatar + Safe Circle */}
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #eeeeee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Dynamic AI Avatar (UI only for now) */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, #ffffff, #7F7FD5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 700,
                border: "2px solid rgba(255,255,255,0.8)",
                cursor: "pointer",
              }}
              title="Dynamic AI avatar (adapts to your mood – coming soon)"
            >
              🙂
            </div>
            
            <div>
              <div style={{ fontWeight: 600 }}>HereForYou</div>
              <div style={{ fontSize: 12, color: "gray" }}>
                Your mental health companion
              </div>
              <div style={{ fontSize: 11, color: "#7F7FD5" }}>
                Dynamic AI avatar · learns your emotional pattern
              </div>
            </div>
          </div>

          {/* Safe Circle badge (UI only) */}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 11,
              background: "#f5f7ff",
              color: "#7F7FD5",
              border: "1px dashed #7F7FD5",
              cursor: "not-allowed",
            }}
            title="Safe Circle: trusted friends & mentors (next milestone)"
          >
            🛡️ Safe Circle
          </div>
        </div>

        {/* Mood quick actions + mini mood tracker */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #f0f0f0",
            fontSize: 13,
          }}
        >
          <div style={{ marginBottom: 6 }}>How are you feeling today?</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <button
              onClick={() => sendMood("Okay 😊")}
              style={quickMoodButtonStyle}
            >
              😊 Okay
            </button>
            <button
              onClick={() => sendMood("Low 😟")}
              style={quickMoodButtonStyle}
            >
              😟 Low
            </button>
            <button
              onClick={() => sendMood("Anxious 😰")}
              style={quickMoodButtonStyle}
            >
              😰 Anxious
            </button>
          </div>
          {/* Simple mood tracker strip (UI only) */}
          <div
            style={{
              fontSize: 11,
              color: "gray",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Today’s mood: tracked in your private timeline</span>
            <span style={{ color: "#7F7FD5" }}>Streak: 1 day</span>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "10px 12px",
            overflowY: "auto",
            background: "#f5f7fb",
          }}
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} from={m.from} text={m.text} />
          ))}
          {messages.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: "gray",
                textAlign: "center",
                marginTop: 40,
              }}
            >
              Share what’s on your mind. Your AI companion listens without
              judgement.
            </div>
          )}
        </div>

        {/* Crisis + Input */}
        <div
          style={{
            borderTop: "1px solid #eeeeee",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Emergency / crisis entry point */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
            }}
          >
            <button
              onClick={() => setShowCrisis(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#d32f2f",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Need help now?
            </button>
            <span style={{ color: "#d32f2f" }}>
              🚨 Emergency crisis support
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type how you feel..."
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid #cccccc",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage()}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                background: "#7F7FD5",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Crisis Modal */}
        {showCrisis && (
          <div
            onClick={() => setShowCrisis(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 320,
                background: "#ffffff",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                fontSize: 14,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#d32f2f",
                }}
              >
                You are not alone 💛
              </div>
              <p style={{ fontSize: 13, marginBottom: 8 }}>
                If you are in immediate danger, please contact local emergency
                services.
              </p>
              <ul style={{ paddingLeft: 18, fontSize: 13, marginBottom: 10 }}>
                <li>India helpline (KIRAN): 1800-599-0019</li>
                <li>Emergency: 112</li>
              </ul>
              <button
                onClick={() => setShowCrisis(false)}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "none",
                  background: "#7F7FD5",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const quickMoodButtonStyle = {
  flex: 1,
  padding: "6px 8px",
  borderRadius: 999,
  border: "none",
  fontSize: 12,
  cursor: "pointer",
  background: "#eef2ff",
};

export default App;
