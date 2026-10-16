import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Plus, 
  Database, 
  RotateCcw, 
  Download, 
  Upload,
  CheckCircle2,
  AlertCircle,
  Columns3,
  MessageSquare
} from 'lucide-react';

export default function Header({
  apiKey,
  model,
  onOpenSettings,
  onNewTask,
  onResetTasks,
  onExportTasks,
  onImportTasks,
  mobileTab,
  setMobileTab,
  tasksCount
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            onImportTasks(imported);
          } else {
            alert('Invalid task backup file: Expected an array of tasks.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <header className="app-header">
      <div className="header-brand-container">
        <div className="brand-logo">
          <div className="logo-icon-wrap">
            <Sparkles size={18} className="logo-sparkle" />
          </div>
          <div className="brand-text">
            <span className="brand-name">CommitDesk</span>
            <span className="brand-tag">AI Task & Sprint Studio</span>
          </div>
        </div>

        <div className="header-status-pill" onClick={onOpenSettings} title="Click to configure Gemini API">
          <span className={`status-dot ${apiKey ? 'active' : 'fallback'}`}></span>
          <span className="status-label">
            {apiKey ? `Gemini (${model.replace('gemini-', '')})` : 'Built-in Engine'}
          </span>
          <span className="status-pill-badge">{apiKey ? 'API Active' : 'Offline Ready'}</span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="mobile-view-tabs">
        <button 
          className={`tab-btn ${mobileTab === 'chat' ? 'active' : ''}`}
          onClick={() => setMobileTab('chat')}
        >
          <MessageSquare size={15} />
          <span>AI Chat</span>
        </button>
        <button 
          className={`tab-btn ${mobileTab === 'board' ? 'active' : ''}`}
          onClick={() => setMobileTab('board')}
        >
          <Columns3 size={15} />
          <span>Board ({tasksCount})</span>
        </button>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onNewTask}
          title="Manually create a new task"
        >
          <Plus size={15} />
          <span className="btn-text">New Ticket</span>
        </button>

        <div className="header-dropdown-wrap">
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            title="Backup, export, or reset tasks"
            onClick={onExportTasks}
          >
            <Download size={16} />
          </button>
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            title="Import tasks JSON"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json" 
            onChange={handleFileChange} 
          />
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            title="Reset to 12 default tickets"
            onClick={onResetTasks}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <button 
          className={`btn ${apiKey ? 'btn-ghost' : 'btn-accent-glow'} btn-sm`}
          onClick={onOpenSettings}
          title="Configure Gemini API Key"
        >
          <Settings size={16} />
          <span className="btn-text">{apiKey ? 'Settings' : 'Set API Key'}</span>
        </button>
      </div>
    </header>
  );
}
