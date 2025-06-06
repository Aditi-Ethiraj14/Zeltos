import React, { useState, useEffect, useRef } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API on mount
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    } else {
      alert("Your browser does not support Speech Recognition");
    }
  }, []);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const askZeltos = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setReply(data.reply);
      speakText(data.reply);
    } catch (error) {
      setReply("Error contacting server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-black text-white p-6">
      <h1 className="text-5xl font-extrabold mb-8">Welcome to ZELTOS</h1>

      <div className="w-full max-w-xl">
        <textarea
          rows="3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your command or use voice input..."
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-lg"
        />

        <div className="flex space-x-4">
          <button
            onClick={startListening}
            disabled={listening}
            className={`px-6 py-3 rounded-lg font-semibold ${
              listening ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {listening ? "Listening..." : "🎤 Speak"}
          </button>

          <button
            onClick={askJarvis}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
          >
            Ask Zeltos
          </button>
        </div>

        {reply && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700 text-lg whitespace-pre-wrap">
            <strong>Zeltos:</strong> {reply}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
