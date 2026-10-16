import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import TaskCard from './TaskCard.jsx';
import { 
  STATUSES, 
  STATUS_CONFIG, 
  PRIORITIES, 
  PRIORITY_CONFIG, 
  EFFORTS, 
  EFFORT_CONFIG, 
  isOverdue, 
  isDueToday, 
  formatFriendlyDate 
} from '../types/task.js';
import confetti from 'canvas-confetti';

export default function TaskBoard({
  tasks = [],
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onNewTask,
  highlightedTaskId,
  summaryFilter,
  setSummaryFilter
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [effortFilter, setEffortFilter] = useState('all');
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Filter tasks based on search, column, priority, effort, and summaryFilter
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesKey = task.id?.toLowerCase().includes(query);
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesReq = task.requester?.toLowerCase().includes(query);
        const matchesTags = task.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesKey && !matchesTitle && !matchesDesc && !matchesReq && !matchesTags) {
          return false;
        }
      }

      // 2. Priority Filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // 3. Effort Filter
      if (effortFilter !== 'all' && task.effort !== effortFilter) {
        return false;
      }

      // 4. Summary Strip Filter
      if (summaryFilter === 'open' && task.status === 'Done') return false;
      if (summaryFilter === 'due-today' && !isDueToday(task)) return false;
      if (summaryFilter === 'overdue' && !isOverdue(task)) return false;
      if (summaryFilter === 'completed' && task.status !== 'Done') return false;

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, effortFilter, summaryFilter]);

  // Handle Drag & Drop to update task status
  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        onStatusChange(taskId, newStatus);
        if (newStatus === 'Done') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      }
    }
  };

  const handleDirectStatusChange = (taskId, newStatus) => {
    onStatusChange(taskId, newStatus);
    if (newStatus === 'Done') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const activeFiltersCount = (priorityFilter !== 'all' ? 1 : 0) + 
                             (effortFilter !== 'all' ? 1 : 0) + 
                             (summaryFilter !== 'all' ? 1 : 0) +
                             (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setEffortFilter('all');
    setSummaryFilter('all');
  };

  return (
    <div className="task-board-panel">
      {/* Board Controls Toolbar */}
      <div className="board-toolbar">
        {/* Left: Search Bar */}
        <div className="board-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="board-search-input"
            placeholder="Search tickets by ID, title, requester, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Middle: Filter Dropdowns */}
        <div className="board-filter-group">
          {/* Priority Filter */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Effort Filter */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={effortFilter}
              onChange={(e) => setEffortFilter(e.target.value)}
            >
              <option value="all">All Efforts</option>
              {EFFORTS.map(eff => (
                <option key={eff} value={eff}>{eff} ({EFFORT_CONFIG[eff].points}pt)</option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button className="clear-filters-chip" onClick={resetAllFilters} title="Reset all filters">
              <X size={12} />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle */}
        <div className="board-view-toggles">
          <div className="view-mode-pill">
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <LayoutGrid size={15} />
              <span className="view-btn-label">Board</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Jira Table / List View"
            >
              <List size={15} />
              <span className="view-btn-label">List</span>
            </button>
          </div>

          <button className="btn btn-primary btn-sm add-ticket-btn" onClick={onNewTask}>
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Board View: Kanban or List */}
      <div className="board-main-content">
        {viewMode === 'kanban' ? (
          <div className="kanban-columns-container">
            {STATUSES.map(status => {
              const columnTasks = filteredTasks.filter(t => t.status === status);
              const conf = STATUS_CONFIG[status];
              const isOver = dragOverColumn === status;

              return (
                <div
                  key={status}
                  className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="column-header">
                    <div className="column-title-wrap">
                      <span className="column-dot" style={{ backgroundColor: conf.color }} />
                      <h4 className="column-title">{status}</h4>
                      <span className="column-count-badge">{columnTasks.length}</span>
                    </div>

                    <button 
                      className="column-add-btn" 
                      onClick={() => onNewTask(status)}
                      title={`Add task to ${status}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Tasks Container */}
                  <div className="column-cards-list">
                    {columnTasks.length > 0 ? (
                      columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onStatusChange={handleDirectStatusChange}
                          isHighlighted={highlightedTaskId === task.id}
                        />
                      ))
                    ) : (
                      <div className="column-empty-state">
                        <span className="empty-text">No {status.toLowerCase()} tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Jira Table List View */
          <div className="board-table-container">
            <table className="jira-tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Key</th>
                  <th>Title & Tags</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '100px' }}>Priority</th>
                  <th style={{ width: '85px' }}>Effort</th>
                  <th style={{ width: '130px' }}>Due Date</th>
                  <th style={{ width: '170px' }}>Requester</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => {
                    const prioConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
                    const effConf = EFFORT_CONFIG[task.effort] || EFFORT_CONFIG.Medium;
                    const overdue = isOverdue(task);
                    const dueToday = isDueToday(task);

                    return (
                      <tr 
                        key={task.id} 
                        className={`table-task-row ${highlightedTaskId === task.id ? 'highlighted-row' : ''}`}
                        onClick={() => onEditTask(task)}
                      >
                        <td>
                          <span className="table-task-key">{task.id}</span>
                        </td>
                        <td>
                          <div className="table-title-cell">
                            <span className="table-task-title">{task.title}</span>
                            {task.tags && task.tags.length > 0 && (
                              <div className="table-tags-wrap">
                                {task.tags.map((t, idx) => (
                                  <span key={idx} className="tag-pill mini">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="table-status-select"
                            value={task.status}
                            onChange={(e) => handleDirectStatusChange(task.id, e.target.value)}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span 
                            className="table-badge priority"
                            style={{ color: prioConf.color, backgroundColor: prioConf.bgColor }}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="table-badge effort"
                            style={{ color: effConf.color, backgroundColor: effConf.bgColor }}
                          >
                            {effConf.code} ({effConf.points}pt)
                          </span>
                        </td>
                        <td>
                          <div className={`table-due-cell ${overdue ? 'overdue' : ''} ${dueToday ? 'due-today' : ''}`}>
                            {overdue && <AlertTriangle size={12} className="text-danger" />}
                            {dueToday && <Clock size={12} className="text-warning animate-pulse-dot" />}
                            <span>{formatFriendlyDate(task.dueDate)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-requester">{task.requester}</span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn btn-ghost btn-icon btn-sm text-danger"
                            onClick={() => {
                              if (window.confirm(`Delete ${task.id}?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            title="Delete ticket"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="table-empty-row">
                      <span>No matching tasks found for current search and filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
