import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationsApi, aiApi } from '../api';
import { StatusBadge, PriorityBadge, Modal } from '../components/common';
import { ArrowLeft, Bot, ExternalLink, Edit, Calendar, MapPin, DollarSign, Star } from 'lucide-react';

const STATUSES = ['WISHLIST','APPLIED','HR_RESPONDED','INTERVIEW','ASSESSMENT','OFFER','REJECTED','JOINED'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiModal, setAiModal] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    applicationsApi.getById(id).then(r => { setApp(r.data); setLoading(false); });
  }, [id]);

  const updateStatus = useCallback(async (newStatus) => {
    const res = await applicationsApi.updateStatus(id, newStatus);
    setApp(res.data);
  }, [id]);

  const generateInterviewQuestions = useCallback(async () => {
    setAiModal(true);
    setAiLoading(true);
    try {
      const res = await aiApi.generateInterviewQuestions({
        jobTitle: app.jobTitle,
        jobDescription: app.jobDescription || '',
        level: 'Mid-Senior',
      });
      setAiResult(res.data.content);
    } finally {
      setAiLoading(false);
    }
  }, [app]);

  const handleCloseAiModal = useCallback(() => {
    setAiModal(false);
  }, []);

  if (loading) return <div className="p-8 text-center text-[var(--muted)]">Loading...</div>;
  if (!app) return <div className="p-8 text-center text-[var(--muted)]">Application not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="btn-ghost mb-3">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[var(--text)]">{app.jobTitle}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {app.companyName && <span className="text-[var(--muted)]">{app.companyName}</span>}
            {app.location && <span className="flex items-center gap-1 text-[var(--muted)] text-sm"><MapPin size={12} /> {app.location}</span>}
            <StatusBadge status={app.status} />
            <PriorityBadge priority={app.priority} />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {app.jobUrl && (
            <a href={app.jobUrl} target="_blank" rel="noreferrer" className="btn-ghost">
              <ExternalLink size={14} /> View Job
            </a>
          )}
          <button onClick={generateInterviewQuestions} className="btn-primary">
            <Bot size={14} /> Interview Prep
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Pipeline */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Status Pipeline</h3>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    app.status === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-hover text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Job Description */}
          {app.jobDescription && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Job Description</h3>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {app.jobDescription}
              </div>
            </div>
          )}

          {/* Skills */}
          {app.extractedSkills && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">AI-Extracted Skills</h3>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap">{app.extractedSkills}</div>
            </div>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Cover Letter</h3>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{app.coverLetter}</div>
            </div>
          )}

          {/* Notes */}
          {app.notes && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Notes</h3>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap">{app.notes}</div>
            </div>
          )}
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-4">
          {/* Key Details */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Details</h3>

            {(app.salaryMin || app.salaryMax) && (
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-green-500" />
                <span className="text-sm text-[var(--text)]">
                  {app.salaryMin ? `${(app.salaryMin/100000).toFixed(1)}L` : ''}
                  {app.salaryMin && app.salaryMax ? ' - ' : ''}
                  {app.salaryMax ? `${(app.salaryMax/100000).toFixed(1)}L` : ''} {app.salaryCurrency}
                </span>
              </div>
            )}

            {app.appliedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-brand-500" />
                <span className="text-sm text-[var(--text)]">Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
            )}

            {app.interviewAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-yellow-500" />
                <span className="text-sm text-[var(--text)]">Interview: {new Date(app.interviewAt).toLocaleString()}</span>
              </div>
            )}

            {app.followUpAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-orange-500" />
                <span className="text-sm text-[var(--text)]">Follow-up: {new Date(app.followUpAt).toLocaleDateString()}</span>
              </div>
            )}

            {app.recruiterName && (
              <div className="flex items-center gap-2">
                <Star size={14} className="text-purple-500" />
                <span className="text-sm text-[var(--text)]">Recruiter: {app.recruiterName}</span>
              </div>
            )}

            {app.resumeName && (
              <div>
                <span className="text-xs text-[var(--muted)]">Resume Used</span>
                <p className="text-sm text-[var(--text)] mt-0.5">{app.resumeName}</p>
              </div>
            )}

            {app.source && (
              <div>
                <span className="text-xs text-[var(--muted)]">Source</span>
                <p className="text-sm text-[var(--text)] mt-0.5">{app.source.replace('_', ' ')}</p>
              </div>
            )}
          </div>

          {/* Resume Match Score */}
          {app.resumeMatchScore && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Resume Match</h3>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${
                  app.resumeMatchScore >= 70 ? 'text-green-500' :
                  app.resumeMatchScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {app.resumeMatchScore}%
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        app.resumeMatchScore >= 70 ? 'bg-green-500' :
                        app.resumeMatchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${app.resumeMatchScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Interview Questions Modal */}
      <Modal isOpen={aiModal} onClose={handleCloseAiModal} title="AI Interview Preparation" size="xl">
        <div className="p-6">
          {aiLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bot size={32} className="text-brand-500 mx-auto mb-3 animate-pulse" />
                <p className="text-[var(--muted)]">Generating interview questions...</p>
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap text-[var(--text)]">
              {aiResult}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
