import React, { useState, useEffect } from 'react';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ✅ Replace local backend with your Render backend
  const API_BASE = "https://fake-news-backend-2vkq.onrender.com";

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showCustomModal = (message) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/plain') {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
        setImageFile(null);
        setImagePreview('');
      };
      reader.readAsText(uploadedFile);
    } else {
      showCustomModal('Please upload a valid .txt file.');
      setFile(null);
      setInputText('');
    }
  };

  const handleImageUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      setImageFile(uploadedFile);
      setImagePreview(URL.createObjectURL(uploadedFile));
      setInputText('');
      setFile(null);
    } else {
      showCustomModal('Please upload a valid image file.');
      setImageFile(null);
      setImagePreview('');
    }
  };

  const analyzeContent = async () => {
    if (!inputText.trim() && !imageFile) {
      showCustomModal('Please enter some text, upload a text file, or upload an image to analyze.');
      return;
    }
    setLoading(true);
    setResults(null);
    setError('');

    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        response = await fetch(`${API_BASE}/api/analyze_image`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });
      }

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('An error occurred while connecting to the backend. Please ensure the backend is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (label) => {
    switch (label) {
      case 'Fake': return 'text-red-500';
      case 'Real':
      case 'Human-Written': return 'text-green-500';
      case 'Suspicious':
      case 'AI-Generated': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressBarColor = (score) => {
    if (score > 75) return 'bg-red-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      {/* 🌙 Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-12 mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-gray-800 dark:text-white">
          AI & Fake News Detector
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Paste text, upload a .txt file, or upload an image to check for fake news and AI-generated content.
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <div>
            <label className="text-lg font-semibold mb-2">Text Input</label>
            <textarea
              className="w-full h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Paste your news article, headline, or tweet here..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setImageFile(null);
                setImagePreview('');
              }}
              disabled={!!imageFile}
            ></textarea>
            <div className="flex justify-center mt-4">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl">
                Upload .txt File
                <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-lg font-semibold mb-2">Image Input</label>
            <div className="w-full h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-center">
                  Upload an image to check if it's AI-generated.
                </span>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl">
                Upload Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={analyzeContent}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
            disabled={loading || (!inputText.trim() && !imageFile)}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-12 mt-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Analysis Results</h2>
          {/* Fake News Result */}
          {results.fake_news && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Fake News Detection</h3>
              <p className={`text-4xl font-bold ${getResultColor(results.fake_news.label)}`}>
                {results.fake_news.label} ({results.fake_news.score}%)
              </p>
            </div>
          )}
          {/* AI Content Result */}
          {results.ai_content && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold">AI Content Detection</h3>
              <p className={`text-4xl font-bold ${getResultColor(results.ai_content.label)}`}>
                {results.ai_content.label} ({results.ai_content.score}%)
              </p>
            </div>
          )}
          {/* Image Result */}
          {results.image_result && (
            <div>
              <h3 className="text-xl font-semibold">Image Analysis</h3>
              <p className={`text-4xl font-bold ${getResultColor(results.image_result.label)}`}>
                {results.image_result.label} ({results.image_result.score}%)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h4 className="text-2xl font-bold mb-4">Attention</h4>
            <p className="mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
