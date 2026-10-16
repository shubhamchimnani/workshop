import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Clipboard, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  Cpu, 
  ExternalLink,
  Flame,
  Zap,
  CornerDownLeft
} from 'lucide-react';
import { SAMPLE_PROMPTS } from '../services/mockData.js';
import { PRIORITY_CONFIG, EFFORT_CONFIG } from '../types/task.js';

export default function ChatPanel({
  messages = [],
  onSendMessage,
  onClearChat,
  isLoading,
  apiKey,
  model,
  onSelectTask,
  onOpenSettings
}) {
  const [inputText, setInputText] = useState('');
  const [copiedPromptIdx, setCopiedPromptIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUsePrompt = (promptText, idx) => {
    setInputText(promptText);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 1200);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setInputText(prev => prev ? `${prev}\n${clipText}` : clipText);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Adjust textarea height dynamically
  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="chat-panel">
      {/* Panel Top Header */}
      <div className="chat-panel-header">
        <div className="chat-header-identity">
          <div className="chat-assistant-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="chat-title">AI Meeting Extractor</h3>
            <span className="chat-subtitle">
              Paste meeting notes, bullet points, or sentences
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button 
            className="engine-badge-btn" 
            onClick={onOpenSettings}
            title={apiKey ? `Powered by Gemini API (${model})` : 'Click to configure Gemini API Key'}
          >
            <Cpu size={12} />
            <span>{apiKey ? model.replace('gemini-', '') : 'Local Engine'}</span>
          </button>
          
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            onClick={onClearChat}
            title="Clear chat history"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Suggested Starter Pills */}
      <div className="sample-prompts-bar">
        <span className="sample-label">Try sample:</span>
        <div className="sample-chips">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              className="sample-chip"
              onClick={() => handleUsePrompt(sample.text, idx)}
              title="Click to load into chat"
            >
              <Zap size={11} className="chip-icon" />
              <span>{sample.title}</span>
              {copiedPromptIdx === idx && <Check size={11} className="text-success" />}
            </button>
          ))}
        </div>
      </div>

      {/* Message Feed */}
      <div className="chat-messages-container">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id || index} className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
              <div className="message-avatar">
                {isUser ? <User size={15} /> : <Bot size={16} />}
              </div>

              <div className="message-bubble-wrap">
                <div className="message-header-meta">
                  <span className="message-sender-name">{isUser ? 'You' : 'CommitDesk Assistant'}</span>
                  <span className="message-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div className="message-content">
                  {/* Clean display of text */}
                  {msg.text.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx} className="message-paragraph">
                      {para.split('\n').map((line, lIdx) => (
                        <React.Fragment key={lIdx}>
                          {line}
                          {lIdx < para.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  ))}
                </div>

                {/* Warning / fallback notice if any */}
                {msg.warning && (
                  <div className="message-warning-box">
                    <AlertCircle size={13} />
                    <span>{msg.warning}</span>
                  </div>
                )}

                {/* If AI extracted tasks, display interactive ticket cards in chat */}
                {msg.createdTasks && msg.createdTasks.length > 0 && (
                  <div className="chat-extracted-tasks">
                    <div className="extracted-tasks-header">
                      <span>Synchronized to Board:</span>
                      <span className="task-count-pill">{msg.createdTasks.length} Tickets</span>
                    </div>

                    <div className="extracted-tasks-list">
                      {msg.createdTasks.map(task => {
                        const prioConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
                        const effConf = EFFORT_CONFIG[task.effort] || EFFORT_CONFIG.Medium;
                        return (
                          <div 
                            key={task.id} 
                            className="chat-task-chip"
                            onClick={() => onSelectTask(task)}
                            title="Click to view and edit in board"
                          >
                            <div className="task-chip-top">
                              <span className="task-chip-id">{task.id}</span>
                              <span 
                                className="task-chip-prio" 
                                style={{ color: prioConf.color, backgroundColor: prioConf.bgColor }}
                              >
                                {task.priority}
                              </span>
                              <span 
                                className="task-chip-effort" 
                                style={{ color: effConf.color }}
                              >
                                {effConf.code} ({effConf.points}pt)
                              </span>
                            </div>

                            <div className="task-chip-title">{task.title}</div>

                            <div className="task-chip-meta">
                              <span className="task-chip-requester">👤 {task.requester}</span>
                              <span className="task-chip-due">📅 {task.dueDate}</span>
                              <span className="view-board-hint">
                                View <ArrowRight size={11} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="chat-message-row assistant-row loading-row">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble-wrap">
              <div className="loading-card">
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="loading-text">
                  {apiKey ? `Extracting tickets with ${model}...` : 'Analyzing notes with Built-in Engine...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="chat-input-wrapper">
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="chat-textarea-container">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="e.g. 'Urgent: Sarah wants us to fix the webhook race condition before Friday, Medium effort. Derrick requested...'"
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={isLoading}
            />

            <div className="chat-input-toolbar">
              <button 
                type="button" 
                className="input-tool-btn" 
                onClick={handlePasteClipboard}
                title="Paste meeting notes from clipboard"
              >
                <Clipboard size={14} />
                <span>Paste Notes</span>
              </button>

              <div className="input-submit-group">
                <span className="shortcut-hint">Press ↵ Enter to extract</span>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-send" 
                  disabled={!inputText.trim() || isLoading}
                  title="Extract tasks"
                >
                  <Send size={15} />
                  <span>Extract</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
