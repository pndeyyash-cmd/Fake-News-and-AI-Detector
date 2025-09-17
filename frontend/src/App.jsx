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

  useEffect(() => {
    // Set a class on the body to enable Tailwind's dark mode
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
        setImageFile(null); // Clear image when text file is uploaded
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
      setInputText(''); // Clear text when image is uploaded
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
        response = await fetch('http://127.0.0.1:5000/api/analyze_image', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('http://127.0.0.1:5000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: inputText }),
        });
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('An error occurred while connecting to the backend. Please ensure the Flask server is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (label) => {
    switch (label) {
      case 'Fake':
        return 'text-red-500';
      case 'Real':
      case 'Human-Written':
        return 'text-green-500';
      case 'Suspicious':
      case 'AI-Generated':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressBarColor = (score) => {
    if (score > 75) return 'bg-red-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-12 mb-8 transform transition-transform hover:scale-[1.01] duration-300">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 text-gray-800 dark:text-white">
          AI & Fake News Detector
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Paste text or upload a file to check for fake news and AI-generated content.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="text-input" className="text-lg font-semibold mb-2">Text Input</label>
              <textarea
                id="text-input"
                className="w-full h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-all duration-300 shadow-inner"
                placeholder="Paste your news article, headline, or tweet here..."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setImageFile(null); // Clear image when text is entered
                  setImagePreview('');
                }}
                disabled={!!imageFile}
              ></textarea>
              <div className="flex justify-center mt-4">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300">
                  Upload .txt File
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="image-input" className="text-lg font-semibold mb-2">Image Input</label>
              <div className="w-full h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-center">
                    Upload an image to check if it's AI-generated.
                  </span>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300">
                  Upload Image
                  <input
                    id="image-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6">
            <button
              onClick={analyzeContent}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 focus:outline-none focus:ring-4 focus:ring-green-500"
              disabled={loading || (!inputText.trim() && !imageFile)}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center text-xl text-blue-500 animate-pulse mt-8">
          Analyzing content...
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-2 border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative w-full max-w-5xl shadow-md mt-8 animate-fade-in">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-12 mt-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Analysis Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Fake News Result */}
            {results.fake_news && (
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fake News Detection</h3>
                <p className={`text-6xl font-extrabold text-center mb-4 ${getResultColor(results.fake_news.label)}`}>
                  {results.fake_news.label}
                </p>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-600">
                    <div style={{ width: `${results.fake_news.score}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-in-out rounded-full ${getProgressBarColor(results.fake_news.score)}`}></div>
                  </div>
                  <div className="text-right text-sm font-medium">
                    {results.fake_news.score}% Confidence
                  </div>
                </div>
              </div>
            )}
            
            {/* AI-Generated Content Result */}
            {results.ai_content && (
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">AI Content Detection</h3>
                <p className={`text-6xl font-extrabold text-center mb-4 ${getResultColor(results.ai_content.label)}`}>
                  {results.ai_content.label}
                </p>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-600">
                    <div style={{ width: `${results.ai_content.score}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-in-out rounded-full ${getProgressBarColor(results.ai_content.score)}`}></div>
                  </div>
                  <div className="text-right text-sm font-medium">
                    {results.ai_content.score}% Probability
                  </div>
                </div>
              </div>
            )}

            {/* AI-Generated Image Result */}
            {results.image_result && (
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300 col-span-1 md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Image Analysis</h3>
                <p className={`text-6xl font-extrabold text-center mb-4 ${getResultColor(results.image_result.label)}`}>
                  {results.image_result.label}
                </p>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-600">
                    <div style={{ width: `${results.image_result.score}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-in-out rounded-full ${getProgressBarColor(results.image_result.score)}`}></div>
                  </div>
                  <div className="text-right text-sm font-medium">
                    {results.image_result.score}% Probability
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Fact-Check Layer */}
          {results.fact_check && (
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Fact-Check Verification Layer</h3>
              <div className="space-y-4">
                {results.fact_check.map((fact, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-transform duration-200 hover:shadow-md">
                    <span className="text-3xl" role="img" aria-label="fact-check-icon">
                      {fact.verdict.includes('debunked') || fact.verdict.includes('Pants') || fact.verdict.includes('lacks') ? '🚨' : '✅'}
                    </span>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{fact.source}:</span> {fact.verdict}
                      </p>
                      <a href={fact.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm transition-colors duration-300">
                        Read more
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-transform scale-100 duration-300 ease-out">
            <h4 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Attention</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition-colors duration-300"
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

