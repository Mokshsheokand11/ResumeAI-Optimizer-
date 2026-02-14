
import React, { useState } from 'react';
import { analyzeResume } from './services/geminiService';
import { AnalysisResult, JobDetails } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';

const App: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: '',
    company: '',
    description: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("File size too large. Please upload a file smaller than 4MB.");
        return;
      }
      
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported file format. Please upload a PDF or an image (PNG, JPG, WEBP).");
        return;
      }

      setResumeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    if (!resumePreview || !jobDetails.title || !jobDetails.description) {
      setError("Please upload your resume and provide the job details.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract MIME type and raw Base64 data from the data URL
      const match = resumePreview.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Invalid file data format.");
      }
      
      const mimeType = match[1];
      const base64Data = match[2];
      
      const result = await analyzeResume(base64Data, mimeType, jobDetails);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze resume. Please try again with a clear document or image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setResumeFile(null);
    setResumePreview(null);
    setError(null);
  };

  const isPdf = resumeFile?.type === 'application/pdf';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">ResumeAI</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            AI-Powered Career Optimization
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {!analysisResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Upload & Job Details */}
            <div className="lg:col-span-3 space-y-8">
              <header className="space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                  Optimize your resume for your <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">dream job</span>
                </h2>
                <p className="text-lg text-slate-600">
                  Upload your resume (PDF or Image) and the job description. Our AI will give you an ATS score, find errors, and tell you exactly how to improve.
                </p>
              </header>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Step 1: Upload Resume (PDF or Image)</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center ${
                      resumeFile ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="application/pdf, image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {resumeFile ? (
                      <div className="flex items-center space-x-3 text-blue-600">
                        {isPdf ? (
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-5h2v5zm0-7h-2V7h2v2z"/>
                          </svg>
                        ) : (
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold truncate max-w-[200px]">{resumeFile.name}</span>
                          <span className="text-xs text-blue-400 uppercase font-bold">{isPdf ? 'PDF Document' : 'Image File'}</span>
                        </div>
                        <button onClick={(e) => { e.preventDefault(); setResumeFile(null); setResumePreview(null); }} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <p className="text-slate-600 font-medium">Click or drag to upload</p>
                        <p className="text-slate-400 text-xs">Supports PDF, PNG, JPG, WEBP (Limit 4MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Step 2: Job Details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        name="title"
                        placeholder="Job Title (e.g. Software Engineer)"
                        value={jobDetails.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                      <input 
                        type="text" 
                        name="company"
                        placeholder="Company Name (Optional)"
                        value={jobDetails.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <textarea 
                    name="description"
                    rows={6}
                    placeholder="Paste the full job description here..."
                    value={jobDetails.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start">
                    <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                    isAnalyzing 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-blue-200'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI Analyzing Application...
                    </div>
                  ) : (
                    "Scan & Analyze Application"
                  )}
                </button>
              </div>
            </div>

            {/* Right: Illustration or Guide */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden h-full">
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-bold">Comprehensive Career Audit</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">PDF Support</h4>
                        <p className="text-slate-400 text-sm">We now fully support professional PDF resumes. Simply upload your file and let Gemini work its magic.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">ATS Pattern Matching</h4>
                        <p className="text-slate-400 text-sm">Our AI simulates how modern hiring platforms read your documents, flagging missed keywords.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Contextual Suggestions</h4>
                        <p className="text-slate-400 text-sm">Beyond just grammar, we provide strategic advice to align your experience with the specific role.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-slate-800">
                    <p className="text-xs text-slate-500 italic">"I uploaded my PDF resume, fixed the keywords Gemini suggested, and got a response from a recruiter the next day." — Sarah K., Product Manager</p>
                  </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisDashboard result={analysisResult} onReset={resetAnalysis} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2024 ResumeAI Optimizer. Enhanced PDF Support. Built with Gemini 3 Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
