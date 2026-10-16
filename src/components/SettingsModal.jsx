import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Trash2, 
  Save, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-2.0-flash');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error' | null
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Validating API key with Google AI Studio...');

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with just the word "OK".' }] }]
        })
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful! Gemini API is active.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(errorData?.error?.message || `HTTP Error ${response.status}: Key rejected.`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Network error: ${err.message}`);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      apiKey: apiKey.trim(),
      model
    });
    onClose();
  };

  const handleClearKey = () => {
    setApiKey('');
    setTestStatus(null);
    setTestMessage('');
    onSaveSettings({
      ...settings,
      apiKey: '',
      model
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="settings-header-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">CommitDesk AI Settings</h3>
              <p className="modal-subtitle">Configure your Gemini API key for smart meeting extraction</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="modal-form">
          {/* Privacy Banner */}
          <div className="security-notice-box">
            <ShieldCheck size={18} className="shield-icon" />
            <div className="security-notice-content">
              <strong>100% Client-Side Privacy:</strong>
              <span>
                Your API key is never hardcoded, transmitted to an intermediary server, or stored in any cloud database. It lives exclusively in your browser's private <code>localStorage</code>.
              </span>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label" htmlFor="gemini-key">
                <Key size={13} />
                <span>Google Gemini API Key</span>
              </label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer" 
                className="helper-link"
              >
                <span>Get a free key from Google AI Studio</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="api-key-input-wrapper">
              <input 
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                className="input-text api-key-input"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus(null);
                }}
              />
              <button 
                type="button" 
                className="key-toggle-btn"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <span className="field-hint">
              Leave blank to use the intelligent built-in heuristic NLP parser.
            </span>
          </div>

          {/* Model Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="model-select">
              <Cpu size={13} />
              <span>Gemini Model</span>
            </label>
            <select 
              id="model-select"
              className="input-select"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setTestStatus(null);
              }}
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Fastest & Most Accurate)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex extraction)</option>
            </select>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`test-feedback-box ${testStatus}`}>
              {testStatus === 'testing' && <RefreshCw size={14} className="spin-icon" />}
              {testStatus === 'success' && <Check size={14} />}
              {testStatus === 'error' && <AlertCircle size={14} />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="settings-action-bar">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !apiKey.trim()}
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw size={13} className="spin-icon" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {apiKey && (
              <button 
                type="button" 
                className="btn btn-ghost btn-sm text-danger"
                onClick={handleClearKey}
                title="Remove API Key"
              >
                <Trash2 size={13} />
                <span>Clear Key</span>
              </button>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
