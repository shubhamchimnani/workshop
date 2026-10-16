import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  Flame, 
  Zap,
  FilterX
} from 'lucide-react';
import { isOverdue, isDueToday } from '../types/task.js';

export default function SummaryStrip({ tasks = [], activeFilter, setActiveFilter }) {
  const totalTasks = tasks.length;
  
  const openTasks = tasks.filter(t => t.status !== 'Done');
  const dueTodayTasks = tasks.filter(t => isDueToday(t));
  const overdueTasks = tasks.filter(t => isOverdue(t));
  const completedTasks = tasks.filter(t => t.status === 'Done');

  // Compute story points effort sum (Small=1, Medium=3, Large=5)
  const totalPoints = tasks.reduce((sum, t) => {
    if (t.effort === 'Small') return sum + 1;
    if (t.effort === 'Medium') return sum + 3;
    if (t.effort === 'Large') return sum + 5;
    return sum + 2;
  }, 0);

  const completedPoints = completedTasks.reduce((sum, t) => {
    if (t.effort === 'Small') return sum + 1;
    if (t.effort === 'Medium') return sum + 3;
    if (t.effort === 'Large') return sum + 5;
    return sum + 2;
  }, 0);

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="summary-strip">
      <div className="summary-strip-items">
        {/* Total Open */}
        <button 
          className={`summary-card ${activeFilter === 'open' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'open' ? 'all' : 'open')}
          title="Filter to all open tickets"
        >
          <div className="summary-icon-box info">
            <ListTodo size={17} />
          </div>
          <div className="summary-content">
            <span className="summary-count">{openTasks.length}</span>
            <span className="summary-label">Open Tasks</span>
          </div>
        </button>

        {/* Due Today */}
        <button 
          className={`summary-card ${activeFilter === 'due-today' ? 'active' : ''} ${dueTodayTasks.length > 0 ? 'highlight-warning' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'due-today' ? 'all' : 'due-today')}
          title="Filter to tasks due today"
        >
          <div className="summary-icon-box warning">
            <Clock size={17} />
            {dueTodayTasks.length > 0 && <span className="pulsing-badge-dot" />}
          </div>
          <div className="summary-content">
            <div className="summary-count-row">
              <span className="summary-count">{dueTodayTasks.length}</span>
              {dueTodayTasks.length > 0 && <span className="mini-tag warning">Today</span>}
            </div>
            <span className="summary-label">Due Today</span>
          </div>
        </button>

        {/* Overdue */}
        <button 
          className={`summary-card ${activeFilter === 'overdue' ? 'active' : ''} ${overdueTasks.length > 0 ? 'highlight-danger' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
          title="Filter to overdue tickets"
        >
          <div className="summary-icon-box danger">
            <AlertCircle size={17} />
          </div>
          <div className="summary-content">
            <div className="summary-count-row">
              <span className="summary-count">{overdueTasks.length}</span>
              {overdueTasks.length > 0 && <span className="mini-tag danger">Action Needed</span>}
            </div>
            <span className="summary-label">Overdue</span>
          </div>
        </button>

        {/* Completed */}
        <button 
          className={`summary-card ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
          title="Filter to completed tasks"
        >
          <div className="summary-icon-box success">
            <CheckCircle2 size={17} />
          </div>
          <div className="summary-content">
            <div className="summary-count-row">
              <span className="summary-count">{completedTasks.length}</span>
              <span className="summary-sublabel">{completionPercent}%</span>
            </div>
            <span className="summary-label">Completed</span>
          </div>
        </button>

        {/* Velocity / Story Points */}
        <div className="summary-card velocity-stat" title="Total estimated story points">
          <div className="summary-icon-box purple">
            <Zap size={17} />
          </div>
          <div className="summary-content">
            <div className="summary-count-row">
              <span className="summary-count">{completedPoints}<span className="pts-divider">/</span>{totalPoints}</span>
              <span className="mini-tag purple">pts</span>
            </div>
            <span className="summary-label">Sprint Points</span>
          </div>
        </div>
      </div>

      {activeFilter !== 'all' && (
        <div className="summary-filter-active-pill">
          <span>Filtering by: <strong>{activeFilter.replace('-', ' ')}</strong></span>
          <button 
            className="clear-filter-btn" 
            onClick={() => setActiveFilter('all')}
            title="Reset filter"
          >
            <FilterX size={13} />
            <span>Show All</span>
          </button>
        </div>
      )}
    </div>
  );
}
