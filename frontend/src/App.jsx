import React, { useState } from "react";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle submit (connects to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText && !file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("inputText", inputText);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        "https://fake-news-backend-2vkq.onrender.com/api/process",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setResponse(data.result || "No response");
    } catch (error) {
      console.error(error);
      setResponse("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 AI Data Processor</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder="Type your input..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} style={styles.fileInput} />
        <button type="submit" style={styles.button}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
      {response && (
        <div style={styles.responseBox}>
          <h2 style={styles.responseTitle}>🔍 AI Response</h2>
          <p style={styles.responseText}>{response}</p>
        </div>
      )}
    </div>
  );
};

// Dark & Tech-Inspired Theme Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1c, #1a1a2e)",
    color: "#e0e0e0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    fontFamily: "'Roboto Mono', monospace",
  },
  title: {
    fontSize: "2.5rem",
    color: "#00f5ff",
    marginBottom: "30px",
    textShadow: "0px 0px 12px #00f5ff",
  },
  form: {
    background: "rgba(20, 20, 35, 0.9)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #00f5ff",
    boxShadow: "0px 0px 20px rgba(0, 245, 255, 0.4)",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "600px",
    gap: "15px",
  },
  textarea: {
    background: "#111122",
    color: "#e0e0e0",
    border: "1px solid #00f5ff",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "1rem",
    outline: "none",
    resize: "none",
    minHeight: "120px",
  },
  fileInput: {
    color: "#00f5ff",
  },
  button: {
    background: "linear-gradient(90deg, #00f5ff, #0088ff)",
    color: "#0f0f1c",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    boxShadow: "0px 0px 15px rgba(0, 245, 255, 0.6)",
    transition: "all 0.3s ease",
  },
  responseBox: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #8a2be2",
    background: "rgba(30, 20, 50, 0.9)",
    boxShadow: "0px 0px 15px rgba(138, 43, 226, 0.4)",
    width: "100%",
    maxWidth: "600px",
  },
  responseTitle: {
    fontSize: "1.5rem",
    marginBottom: "10px",
    color: "#8a2be2",
    textShadow: "0px 0px 10px #8a2be2",
  },
  responseText: {
    fontSize: "1rem",
    color: "#e0e0e0",
  },
};

export default App;
