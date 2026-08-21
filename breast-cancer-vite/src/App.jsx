  import { useState } from 'react';
  import { Upload, AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';

  function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        setResult(null);
        setError(null);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file');
      }
    };

    const handleUpload = async () => {
      if (!selectedFile) {
        setError('Please select an image first');
        return;
      }

      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);

      try {
        const response = await fetch('http://localhost:5001/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze image. Make sure Flask backend is running on port 5000.');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err.message || 'An error occurred during analysis');
      } finally {setLoading(false);
      }
    };

    const reset = () => {
      setSelectedFile(null);
      setPreview(null);
      setResult(null);
      setError(null);
    };

    return (
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <header className="bg-white shadow-sm border-b border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-pink-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Breast Cancer Detection</h1>
                <p className="text-sm text-gray-600 mt-1">AI-Powered Medical Image Analysis</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Important Medical Notice</p>
                <p>This tool is for research and educational purposes only. It should not replace professional medical diagnosis. Always consult with healthcare professionals for medical advice.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Medical Image</h2>
            
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-pink-300 rounded-xl cursor-pointer bg-pink-50 hover:bg-pink-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-pink-600 mb-4" />
                  <p className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Image'
                    )}
                  </button>
                  
                  <button
                    onClick={reset}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analysis Results</h2>
              
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border-2 ${
                  result.prediction === 'benign' 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center mb-3">
                    {result.prediction === 'benign' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                    )}
                    <h3 className="text-xl font-bold capitalize">
                      {result.prediction}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    The AI model has classified this image as <strong>{result.prediction}</strong> with {result.confidence}% confidence.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Confidence Scores</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">Benign</span>
                        <span className="text-gray-600">{result.probabilities?.benign || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities?.benign || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">Malignant</span>
                        <span className="text-gray-600">{result.probabilities?.malignant || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities?.malignant || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Medical Disclaimer:</strong> This result is generated by an AI model and should not be used as the sole basis for medical decisions. Please consult with qualified healthcare professionals for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About This Tool</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This system uses a deep learning model based on ResNet architecture, trained on medical imaging data to classify breast tissue images as benign or malignant.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload a medical image, and our AI model will process it through multiple layers of analysis to determine the likelihood of the tissue being benign or malignant.
              </p>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600">
              © 2024 Breast Cancer Detection System. For research and educational purposes only.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  export default App;