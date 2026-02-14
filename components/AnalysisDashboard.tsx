
import React from 'react';
import { AnalysisResult } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onReset }) => {
  const COLORS = ['#3b82f6', '#e2e8f0'];
  const scoreData = [
    { name: 'Score', value: result.overallScore },
    { name: 'Remaining', value: 100 - result.overallScore },
  ];

  const matchData = [
    { name: 'Job Match', score: result.jobAlignment.matchPercentage },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resume Analysis</h2>
          <p className="text-slate-500">Comprehensive review of your application</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Analyze New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Overall Rating</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center -mb-8">
              <span className="text-4xl font-bold text-blue-600">{result.overallScore}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center">Base quality score</p>
        </div>

        {/* Match Percentage */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Job Match Alignment</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={matchData} margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-slate-600 text-sm mt-4 italic">"{result.jobAlignment.roleFitSummary}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Areas */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start text-slate-600 text-sm">
                  <span className="mr-2">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start text-slate-600 text-sm">
                  <span className="mr-2">•</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Spelling & Keywords */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Keywords Analysis
            </h3>
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Missing from Resume</p>
              <div className="flex flex-wrap gap-2">
                {result.jobAlignment.missingKeywords.map((k, i) => (
                  <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs border border-red-100">{k}</span>
                ))}
                {result.jobAlignment.missingKeywords.length === 0 && <span className="text-slate-400 text-xs">No key words missing!</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended Additions</p>
              <div className="flex flex-wrap gap-2">
                {result.jobAlignment.suggestedKeywords.map((k, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Errors & Corrections
            </h3>
            <div className="space-y-4">
              {result.spellingErrors.map((err, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="line-through text-red-500 font-medium text-sm">"{err.original}"</span>
                    <span className="text-green-600 font-bold text-sm">→ "{err.suggestion}"</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">...{err.context}...</p>
                </div>
              ))}
              {result.spellingErrors.length === 0 && (
                <p className="text-slate-500 text-sm">No spelling mistakes found! Great job.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Plan */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Detailed Improvement Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.improvements.map((imp, i) => (
            <div key={i} className="flex flex-col border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{imp.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  imp.impact === 'High' ? 'bg-green-100 text-green-700' :
                  imp.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {imp.impact} Impact
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{imp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
