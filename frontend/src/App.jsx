import React, { useState } from "react";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://fake-news-backend-2vkq.onrender.com.";

  // Submit text
  const handleTextSubmit = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setResponse(data);
      setError("");
    } catch (err) {
      setError("⚠️ Error connecting to backend.");
    }
  };

  // Submit PDF
  const handlePdfSubmit = async () => {
    const formData = new FormData();
    formData.append("file", pdfFile);
    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze_pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      setError("");
    } catch (err) {
      setError("⚠️ Error connecting to backend.");
    }
  };

  // Submit Image
  const handleImageSubmit = async () => {
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze_image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      setError("");
    } catch (err) {
      setError("⚠️ Error connecting to backend.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 AI Content Detector</h1>

      {/* Text Input */}
      <textarea
        style={styles.textarea}
        placeholder="Type or paste text to analyze..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button style={styles.button} onClick={handleTextSubmit}>
        Analyze Text
      </button>

      {/* PDF Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
        style={styles.input}
      />
      <button style={styles.button} onClick={handlePdfSubmit}>
        Analyze PDF
      </button>

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        style={styles.input}
      />
      <button style={styles.button} onClick={handleImageSubmit}>
        Analyze Image
      </button>

      {/* Response Area */}
      <div style={styles.responseBox}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0a0f1a",
    color: "#fff",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2rem",
    textAlign: "center",
    marginBottom: "20px",
    color: "#00d9ff",
  },
  textarea: {
    width: "100%",
    height: "100px",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #00d9ff",
    backgroundColor: "#1a2233",
    color: "#fff",
  },
  input: {
    margin: "10px 0",
    display: "block",
  },
  button: {
    padding: "10px 20px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#00d9ff",
    color: "#000",
    cursor: "pointer",
    fontWeight: "bold",
  },
  responseBox: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#111827",
    whiteSpace: "pre-wrap",
  },
};

export default App;
