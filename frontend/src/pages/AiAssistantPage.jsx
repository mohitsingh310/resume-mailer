import React, { useCallback, useState } from 'react';
import { aiApi } from '../api';
import { Bot, Sparkles, Copy, RefreshCw, Mail, FileText, HelpCircle, TrendingUp, Edit, Loader2 } from 'lucide-react';

const AI_TOOLS = [
  { key: 'cold-email', icon: Mail, label: 'Cold Email', color: 'text-blue-500', desc: 'Generate personalized cold emails to recruiters' },
  { key: 'cover-letter', icon: FileText, label: 'Cover Letter', color: 'text-purple-500', desc: 'Write compelling cover letters for any role' },
  { key: 'follow-up', icon: RefreshCw, label: 'Follow-Up Email', color: 'text-orange-500', desc: 'Craft polite follow-up emails' },
  { key: 'interview-questions', icon: HelpCircle, label: 'Interview Prep', color: 'text-yellow-500', desc: 'Generate likely interview questions for a role' },
  { key: 'salary-negotiation', icon: TrendingUp, label: 'Salary Negotiation', color: 'text-green-500', desc: 'Draft professional salary negotiation emails' },
  { key: 'rewrite-email', icon: Edit, label: 'Rewrite / Improve', color: 'text-pink-500', desc: 'Rewrite or improve any existing email' },
];

export default function AiAssistantPage() {
  const [activeTool, setActiveTool] = useState('cold-email');
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const setInput = useCallback((key, val) => {
    setInputs(p => ({ ...p, [key]: val }));
  }, []);

  const handleToolChange = useCallback((toolKey) => {
    setActiveTool(toolKey);
    setResult('');
    setInputs({});
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setResult('');
    try {
      let res;
      switch (activeTool) {
        case 'cold-email':
          res = await aiApi.generateColdEmail(inputs); break;
        case 'cover-letter':
          res = await aiApi.generateCoverLetter(inputs); break;
        case 'follow-up':
          res = await aiApi.generateFollowUp(inputs); break;
        case 'interview-questions':
          res = await aiApi.generateInterviewQuestions(inputs); break;
        case 'salary-negotiation':
          res = await aiApi.salaryNegotiation(inputs); break;
        case 'rewrite-email':
          res = await aiApi.rewriteEmail(inputs); break;
        default: return;
      }
      setResult(res.data.content);
    } catch (e) {
      setResult(`Error: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTool, inputs]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bot size={20} className="text-brand-500" />
          <h1 className="text-xl font-bold text-[var(--text)]">AI Assistant</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">Generate emails, cover letters, and interview prep with AI. Everything is editable before use.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tool Selector */}
        <div className="space-y-1">
          {AI_TOOLS.map(tool => {
            const Icon = tool.icon;
            const active = activeTool === tool.key;
            return (
              <button
                key={tool.key}
                onClick={() => handleToolChange(tool.key)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  active ? 'bg-brand-600 text-white' : 'hover:bg-[var(--hover)] text-[var(--text)]'
                }`}
              >
                <Icon size={16} className={`mt-0.5 flex-shrink-0 ${active ? 'text-white' : tool.color}`} />
                <div>
                  <p className={`text-sm font-medium ${active ? 'text-white' : ''}`}>{tool.label}</p>
                  <p className={`text-xs ${active ? 'text-blue-100' : 'text-[var(--muted)]'}`}>{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Input Form */}
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-brand-500" />
            {AI_TOOLS.find(t => t.key === activeTool)?.label}
          </h2>
          <ToolInput tool={activeTool} inputs={inputs} setInput={setInput} />
          <button onClick={generate} disabled={loading} className="btn-primary w-full justify-center mt-4">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate</>}
          </button>
        </div>

        {/* Result */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[var(--text)]">Generated Output</h3>
            {result && (
              <div className="flex gap-1">
                <button onClick={() => generate()} className="btn-ghost py-1 px-2 text-xs">
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button onClick={copy} className="btn-ghost py-1 px-2 text-xs">
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot size={28} className="text-brand-500 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-[var(--muted)]">AI is writing...</p>
              </div>
            </div>
          ) : result ? (
            <textarea
              className="flex-1 input-field resize-none text-sm leading-relaxed min-h-[300px]"
              value={result}
              onChange={e => setResult(e.target.value)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <Bot size={32} className="text-[var(--muted)] mx-auto mb-2 opacity-40" />
                <p className="text-sm text-[var(--muted)]">Fill in the form and click Generate</p>
                <p className="text-xs text-[var(--muted)] mt-1">Output will appear here — fully editable</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolInput({ tool, inputs, setInput }) {
  switch (tool) {
    case 'cold-email':
      return (
        <div className="space-y-3">
          <Field label="Recruiter Name" fieldKey="recruiterName" value={inputs.recruiterName} setInput={setInput} placeholder="Priya Sharma" />
          <Field label="Company Name" fieldKey="companyName" value={inputs.companyName} setInput={setInput} placeholder="Google India" />
          <Field label="Role Applying For" fieldKey="role" value={inputs.role} setInput={setInput} placeholder="Senior Software Engineer" />
          <Field label="Your Background / Resume Summary" fieldKey="resumeSummary" value={inputs.resumeSummary} setInput={setInput} placeholder="4.8 years Java/Node.js, CTI specialist at NovelVox..." rows={3} />
          <Field label="Custom Instructions (optional)" fieldKey="customInstructions" value={inputs.customInstructions} setInput={setInput} placeholder="Make it warm and technical" />
        </div>
      );
    case 'cover-letter':
      return (
        <div className="space-y-3">
          <Field label="Job Title" fieldKey="jobTitle" value={inputs.jobTitle} setInput={setInput} placeholder="Senior Java Developer" />
          <Field label="Company Name" fieldKey="companyName" value={inputs.companyName} setInput={setInput} placeholder="HCLTech" />
          <Field label="Job Description" fieldKey="jobDescription" value={inputs.jobDescription} setInput={setInput} placeholder="Paste job description..." rows={4} />
          <Field label="Your Background" fieldKey="resumeSummary" value={inputs.resumeSummary} setInput={setInput} placeholder="Your skills and experience..." rows={3} />
        </div>
      );
    case 'follow-up':
      return (
        <div className="space-y-3">
          <Field label="Recruiter Name" fieldKey="recruiterName" value={inputs.recruiterName} setInput={setInput} placeholder="Priya Sharma" />
          <Field label="Company Name" fieldKey="companyName" value={inputs.companyName} setInput={setInput} placeholder="Google India" />
          <Field label="Role" fieldKey="role" value={inputs.role} setInput={setInput} placeholder="Senior Software Engineer" />
          <Field label="Previous Email Date" fieldKey="previousEmailDate" value={inputs.previousEmailDate} setInput={setInput} placeholder="June 15, 2025" />
        </div>
      );
    case 'interview-questions':
      return (
        <div className="space-y-3">
          <Field label="Job Title" fieldKey="jobTitle" value={inputs.jobTitle} setInput={setInput} placeholder="ServiceNow Developer" />
          <Field label="Job Description" fieldKey="jobDescription" value={inputs.jobDescription} setInput={setInput} placeholder="Paste job description..." rows={4} />
          <SelectField
            label="Experience Level"
            fieldKey="level"
            value={inputs.level || 'Mid'}
            setInput={setInput}
            options={['Junior', 'Mid', 'Senior', 'Lead']}
          />
        </div>
      );
    case 'salary-negotiation':
      return (
        <div className="space-y-3">
          <Field label="Role" fieldKey="role" value={inputs.role} setInput={setInput} placeholder="Senior Specialist, E2 Band" />
          <Field label="Current Offer" fieldKey="currentOffer" value={inputs.currentOffer} setInput={setInput} placeholder="₹12 LPA" />
          <Field label="Target Salary" fieldKey="targetSalary" value={inputs.targetSalary} setInput={setInput} placeholder="₹15 LPA" />
          <Field label="Your Experience" fieldKey="experience" value={inputs.experience} setInput={setInput} placeholder="4.8 years in Java/CTI/ServiceNow..." rows={2} />
        </div>
      );
    case 'rewrite-email':
      return (
        <div className="space-y-3">
          <Field label="Original Email" fieldKey="emailContent" value={inputs.emailContent} setInput={setInput} placeholder="Paste your email here..." rows={5} />
          <SelectField
            label="Instruction"
            fieldKey="instruction"
            value={inputs.instruction || 'Make it more professional'}
            setInput={setInput}
            options={['Make it more professional', 'Make it shorter', 'Make it friendlier', 'Improve grammar', 'More confident tone', 'More concise']}
          />
        </div>
      );
    default:
      return null;
  }
}

function SelectField({ label, fieldKey, value, setInput, options }) {
  const handleChange = useCallback((e) => {
    setInput(fieldKey, e.target.value);
  }, [fieldKey, setInput]);

  return (
    <div>
      <label className="label">{label}</label>
      <select className="input-field" value={value} onChange={handleChange}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function Field({ label, fieldKey, value, setInput, placeholder, rows }) {
  const handleChange = useCallback((e) => {
    setInput(fieldKey, e.target.value);
  }, [fieldKey, setInput]);

  return (
    <div>
      <label className="label">{label}</label>
      {rows ? (
        <textarea
          className="input-field resize-none"
          style={{ height: `${rows * 40}px` }}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
        />
      ) : (
        <input
          className="input-field"
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
