import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Clock, 
  Flame, 
  Copy,
  Check
} from 'lucide-react';
import { 
  STATUSES, 
  STATUS_CONFIG, 
  PRIORITIES, 
  PRIORITY_CONFIG, 
  EFFORTS, 
  EFFORT_CONFIG, 
  isOverdue, 
  isDueToday 
} from '../types/task.js';

export default function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status || 'To Do');
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [effort, setEffort] = useState(task.effort || 'Medium');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [requester, setRequester] = useState(task.requester || '');
  const [tags, setTags] = useState(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setStatus(task.status || 'To Do');
    setPriority(task.priority || 'Medium');
    setEffort(task.effort || 'Medium');
    setDueDate(task.dueDate || '');
    setRequester(task.requester || '');
    setTags(task.tags || []);
  }, [task]);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }

    onSave({
      ...task,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      effort,
      dueDate,
      requester: requester.trim() || 'Unassigned',
      tags
    });
    onClose();
  };

  const overdue = isOverdue({ ...task, dueDate, status });
  const dueToday = isDueToday({ ...task, dueDate, status });

  const isNew = Boolean(task.isNew);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container task-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <button className="modal-ticket-id" onClick={handleCopyId} title="Copy ID">
              <span>{isNew ? 'NEW TICKET' : task.id}</span>
              {!isNew && (copied ? <Check size={12} className="copied-icon" /> : <Copy size={12} />)}
            </button>
            <span className="modal-heading-sub">{isNew ? 'Create New Ticket' : 'Ticket Details'}</span>
          </div>

          <div className="modal-header-actions">
            {!isNew && (
              <button 
                className="btn btn-ghost btn-icon btn-sm text-danger" 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${task.id}?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                title="Delete ticket"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title</label>
            <input 
              id="task-title"
              type="text" 
              className="input-text title-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Migrate Auth0 to Okta SSO"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description & Context</label>
            <textarea 
              id="task-desc"
              className="input-textarea" 
              rows={4}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Detailed background, acceptance criteria, or meeting context..."
            />
          </div>

          <div className="form-grid-3">
            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="input-select" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="input-select" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Effort */}
            <div className="form-group">
              <label className="form-label">Effort Estimate</label>
              <select 
                className="input-select" 
                value={effort} 
                onChange={(e) => setEffort(e.target.value)}
              >
                {EFFORTS.map(eff => (
                  <option key={eff} value={eff}>{eff} ({EFFORT_CONFIG[eff].points} pts)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Requester */}
            <div className="form-group">
              <label className="form-label">
                <User size={13} />
                <span>Requester / Stakeholder</span>
              </label>
              <input 
                type="text" 
                className="input-text" 
                value={requester} 
                onChange={(e) => setRequester(e.target.value)}
                placeholder="e.g. Sarah Chen (VP Engineering)"
              />
            </div>

            {/* Due Date */}
            <div className="form-group">
              <div className="label-with-alert">
                <label className="form-label">
                  <Calendar size={13} />
                  <span>Due Date</span>
                </label>
                {overdue && <span className="pill-alert overdue">Overdue!</span>}
                {dueToday && <span className="pill-alert due-today">Due Today</span>}
              </div>
              <input 
                type="date" 
                className={`input-text ${overdue ? 'border-overdue' : ''}`} 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={13} />
              <span>Tags & Components</span>
            </label>
            <div className="tags-editor-wrap">
              <div className="tags-list">
                {tags.map((t, idx) => (
                  <span key={idx} className="tag-pill removable">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                className="tag-inline-input" 
                placeholder="Type tag and press Enter..." 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>{isNew ? 'Create Ticket' : 'Save Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
