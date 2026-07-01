import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api';
import { StatCard, SkeletonCard } from '../components/common';
import {
  Briefcase, Target, TrendingUp, XCircle, Clock, Users,
  Calendar, Bell, ChevronRight, Plus, Zap, Bot
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  APPLICATION_CREATED: '📝',
  STATUS_CHANGED: '🔄',
  EMAIL_SENT: '✉️',
  INTERVIEW_SCHEDULED: '📅',
  OFFER_RECEIVED: '🎉',
};

const STATUS_COLORS = {
  WISHLIST: '#64748b', APPLIED: '#3b82f6', HR_RESPONDED: '#a855f7',
  INTERVIEW: '#eab308', ASSESSMENT: '#f97316', OFFER: '#22c55e',
  REJECTED: '#ef4444', JOINED: '#10b981'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, actRes, intRes, fuRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getActivity(),
          dashboardApi.getUpcomingInterviews(),
          dashboardApi.getFollowUpsDue(),
        ]);
        setStats(statsRes.data);
        setActivity(actRes.data);
        setInterviews(intRes.data);
        setFollowUps(fuRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = stats ? [
    { name: 'Wishlist', value: stats.wishlistCount || 0 },
    { name: 'Applied', value: stats.appliedCount || 0 },
    { name: 'Interview', value: stats.interviewCount || 0 },
    { name: 'Offer', value: stats.offerCount || 0 },
    { name: 'Rejected', value: stats.rejectedCount || 0 },
  ].filter(d => d.value > 0) : [];

  const COLORS = ['#64748b', '#3b82f6', '#eab308', '#22c55e', '#ef4444'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {greeting}, {user?.firstName}! 👋
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {stats?.followUpsDue > 0
              ? `You have ${stats.followUpsDue} follow-up(s) due and ${stats.interviewsTomorrow} interview(s) tomorrow.`
              : 'Here\'s your job search overview for today.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/applications" className="btn-secondary">
            <Plus size={14} />
            New Application
          </Link>
          <Link to="/ai" className="btn-primary">
            <Bot size={14} />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Applications" value={stats?.totalApplications ?? 0} icon={Briefcase} color="brand" />
            <StatCard label="Interviews" value={stats?.interviewCount ?? 0} icon={Calendar} color="yellow" />
            <StatCard label="Offers" value={stats?.offerCount ?? 0} icon={TrendingUp} color="green" />
            <StatCard label="Response Rate" value={`${stats?.responseRate ?? 0}%`} icon={Target} color="purple" />
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard label="Applied (Last 30d)" value={stats?.appliedLast30Days ?? 0} icon={Zap} color="brand" />
            <StatCard label="Rejected" value={stats?.rejectedCount ?? 0} icon={XCircle} color="red" />
            <StatCard label="Follow-ups Due" value={stats?.followUpsDue ?? 0} icon={Clock} color="yellow" />
            <StatCard label="Recruiters" value={stats?.totalRecruiters ?? 0} icon={Users} color="purple" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Application Status Breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-[var(--text)] mb-4">Application Status</h3>
          {loading ? (
            <div className="h-40 bg-gray-100 dark:bg-dark-hover rounded animate-pulse" />
          ) : pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[var(--muted)] text-sm">No applications yet</div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text)]">Upcoming Interviews</h3>
            <Link to="/applications?status=INTERVIEW" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {loading ? <SkeletonCard /> : interviews.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)] text-sm">No upcoming interviews 🎉</div>
          ) : (
            <div className="space-y-2">
              {interviews.slice(0, 4).map(int => (
                <Link key={int.id} to={`/applications/${int.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--hover)] transition-all">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{int.jobTitle}</p>
                    <p className="text-xs text-[var(--muted)]">{int.companyName}</p>
                    <p className="text-xs text-brand-600 mt-0.5">
                      {int.interviewAt ? new Date(int.interviewAt).toLocaleString() : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups Due */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text)]">Follow-ups Due</h3>
            <span className="text-xs text-[var(--muted)]">{followUps.length} pending</span>
          </div>
          {loading ? <SkeletonCard /> : followUps.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)] text-sm">No follow-ups due 👍</div>
          ) : (
            <div className="space-y-2">
              {followUps.slice(0, 4).map(fu => (
                <Link key={fu.id} to={`/applications/${fu.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--hover)] transition-all">
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{fu.jobTitle}</p>
                    <p className="text-xs text-[var(--muted)]">{fu.companyName}</p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--muted)] flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text)]">Recent Activity</h3>
          <Link to="/applications" className="text-xs text-brand-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted)] text-sm">No activity yet. Start by adding an application!</div>
        ) : (
          <div className="space-y-1">
            {activity.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--hover)] transition-all">
                <span className="text-lg flex-shrink-0">{ACTIVITY_ICONS[a.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text)]">{a.description}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New Application', to: '/applications', icon: '📝', color: 'bg-brand-50 dark:bg-brand-950' },
          { label: 'Kanban View', to: '/applications/kanban', icon: '🗂️', color: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'Generate Email', to: '/ai', icon: '🤖', color: 'bg-green-50 dark:bg-green-950' },
          { label: 'Upload Resume', to: '/resumes', icon: '📄', color: 'bg-yellow-50 dark:bg-yellow-950' },
        ].map(({ label, to, icon, color }) => (
          <Link key={to} to={to}
            className={`card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-all cursor-pointer group`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-[var(--text)] group-hover:text-brand-600 transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
