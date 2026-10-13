import React, { useState } from 'react';
import {
  Plus,
  User,
  Building,
  MessageSquare,
  Send,
  X,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TrackedIssue, IssueStatus } from '../../types/issue';

export const IssueTrackerTab: React.FC = () => {
  const {
    trackedIssues,
    createTrackedIssue,
    updateTrackedIssueStatus,
    addIssueNote,
    showToast
  } = useApp();

  const [activeIssueForNotes, setActiveIssueForNotes] = useState<TrackedIssue | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Issue Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TrackedIssue['priority']>('High');
  const [newOwner, setNewOwner] = useState('Unassigned');
  const [newTeam, setNewTeam] = useState('Engineering');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTrackedIssue(newTitle.trim(), newDesc.trim(), newPriority, newOwner, newTeam, []);
    setNewTitle('');
    setNewDesc('');
    setIsCreateModalOpen(false);
    showToast('Tracked issue created successfully.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeIssueForNotes) return;

    addIssueNote(activeIssueForNotes.id, newNoteText.trim(), 'Current User');
    setNewNoteText('');
    // refresh active issue in state
    const updated = trackedIssues.find(i => i.id === activeIssueForNotes.id);
    if (updated) setActiveIssueForNotes(updated);
  };

  const columns: { id: IssueStatus; label: string; color: string }[] = [
    { id: 'Open', label: 'Open Triage', color: 'bg-amber-500' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'Resolved', label: 'Resolved', color: 'bg-emerald-500' },
    { id: 'Dismissed', label: 'Dismissed', color: 'bg-slate-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Issue Tracker & Remediation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track operational resolution lifecycle with persistent state and activity audit trail
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Tracked Issue</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colIssues = trackedIssues.filter(i => i.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/60 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {colIssues.length}
                </span>
              </div>

              {/* Card List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colIssues.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No issues in this column.
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            issue.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : issue.priority === 'High'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {issue.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {issue.id}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {issue.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {issue.owner}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                          <Building className="w-3 h-3" />
                          {issue.team}
                        </span>
                      </div>

                      {/* Status Selector & Notes Button */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <select
                          value={issue.status}
                          onChange={(e) => updateTrackedIssueStatus(issue.id, e.target.value as IssueStatus)}
                          className="text-[10px] font-semibold py-1 px-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Dismissed">Dismissed</option>
                        </select>

                        <button
                          onClick={() => setActiveIssueForNotes(issue)}
                          className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Notes ({issue.notes.length})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes / Activity Modal */}
      {activeIssueForNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setActiveIssueForNotes(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Issue Notes & Audit Log
                </h3>
                <p className="text-xs text-slate-500">{activeIssueForNotes.title}</p>
              </div>
              <button
                onClick={() => setActiveIssueForNotes(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes List */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 text-xs">
              {activeIssueForNotes.notes.length === 0 ? (
                <div className="py-4 text-center text-slate-400">No notes recorded yet.</div>
              ) : (
                activeIssueForNotes.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a remediation note or update..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Activity Log */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 flex items-center gap-1">
                <History className="w-3 h-3" /> Audit Log
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-slate-500">
                {activeIssueForNotes.activityLog.map((act) => (
                  <div key={act.id} className="flex items-center justify-between">
                    <span>{act.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Create New Tracked Issue
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Implement 3D Secure Verification"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Next Steps</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details on the root cause and planned resolution..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TrackedIssue['priority'])}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Team</label>
                  <select
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Fraud & Risk">Fraud & Risk</option>
                    <option value="Operations">Operations</option>
                    <option value="Support">Support</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
