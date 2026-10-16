import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowUp, 
  Minus, 
  ArrowDown, 
  Calendar, 
  Clock, 
  User, 
  MoreHorizontal, 
  Check, 
  Copy, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  PRIORITY_CONFIG, 
  STATUSES, 
  STATUS_CONFIG, 
  EFFORT_CONFIG, 
  isOverdue, 
  isDueToday, 
  formatFriendlyDate 
} from '../types/task.js';

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onSelect,
  isHighlighted = false 
}) {
  const [copied, setCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
  const effortConf = EFFORT_CONFIG[task.effort] || EFFORT_CONFIG.Medium;
  const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG['To Do'];

  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);

  const copyTicketId = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'Urgent':
        return <AlertTriangle size={12} className="priority-icon urgent" />;
      case 'High':
        return <ArrowUp size={12} className="priority-icon high" />;
      case 'Medium':
        return <Minus size={12} className="priority-icon medium" />;
      case 'Low':
        return <ArrowDown size={12} className="priority-icon low" />;
      default:
        return <Minus size={12} />;
    }
  };

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const nextStatusIndex = (STATUSES.indexOf(task.status) + 1) % STATUSES.length;
  const nextStatus = STATUSES[nextStatusIndex];

  return (
    <div 
      className={`task-card ${isHighlighted ? 'highlighted-task' : ''} ${overdue ? 'card-overdue' : ''} ${dueToday ? 'card-due-today' : ''}`}
      onClick={() => onEdit(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
      }}
    >
      {/* Top Bar: Key & Priority */}
      <div className="card-top-bar">
        <div className="card-key-group">
          <button 
            className="card-key-btn" 
            onClick={copyTicketId} 
            title="Click to copy ticket ID"
          >
            <span className="card-id-text">{task.id}</span>
            {copied ? <Check size={11} className="copied-icon" /> : <Copy size={11} className="copy-icon" />}
          </button>
          
          {task.tags && task.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="tag-pill">{tag}</span>
          ))}
        </div>

        <div className="card-priority-badge" style={{ backgroundColor: priorityConf.bgColor, borderColor: priorityConf.borderColor, color: priorityConf.color }}>
          {getPriorityIcon()}
          <span>{task.priority}</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="card-title">{task.title}</h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="card-description">
          {task.description.length > 105 ? task.description.slice(0, 102) + '...' : task.description}
        </p>
      )}

      {/* Footer Info: Requester, Effort, Due Date */}
      <div className="card-footer">
        <div className="card-requester-info" title={`Requester: ${task.requester}`}>
          <div className="requester-avatar">
            {getInitials(task.requester)}
          </div>
          <span className="requester-name">
            {task.requester.split('(')[0].trim()}
          </span>
        </div>

        <div className="card-meta-right">
          {/* Effort Badge */}
          <span 
            className="effort-badge" 
            style={{ color: effortConf.color, backgroundColor: effortConf.bgColor }}
            title={effortConf.description}
          >
            <span className="effort-code">{effortConf.code}</span>
            <span className="effort-pts">{effortConf.points}pt</span>
          </span>

          {/* Due Date Indicator */}
          <div className={`due-date-badge ${overdue ? 'overdue' : ''} ${dueToday ? 'due-today' : ''}`} title={`Due: ${task.dueDate}`}>
            {overdue ? (
              <>
                <AlertTriangle size={12} className="due-icon alert" />
                <span>{formatFriendlyDate(task.dueDate)}</span>
              </>
            ) : dueToday ? (
              <>
                <Clock size={12} className="due-icon today animate-pulse-dot" />
                <span>Today</span>
              </>
            ) : (
              <>
                <Calendar size={12} className="due-icon calendar" />
                <span>{formatFriendlyDate(task.dueDate)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Quick Actions on Hover */}
      <div className="card-hover-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          className="quick-action-btn move" 
          onClick={() => onStatusChange(task.id, nextStatus)}
          title={`Advance to ${nextStatus}`}
        >
          <span>{nextStatus}</span>
          <ArrowRight size={12} />
        </button>

        <button 
          className="quick-action-btn icon" 
          onClick={() => onEdit(task)}
          title="Edit details"
        >
          <Edit3 size={13} />
        </button>

        <button 
          className="quick-action-btn icon danger" 
          onClick={() => {
            if (window.confirm(`Delete ${task.id}?`)) {
              onDelete(task.id);
            }
          }}
          title="Delete ticket"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
