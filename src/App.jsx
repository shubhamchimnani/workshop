import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import SummaryStrip from './components/SummaryStrip.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import TaskBoard from './components/TaskBoard.jsx';
import TaskDetailModal from './components/TaskDetailModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { 
  loadTasks, 
  saveTasks, 
  loadSettings, 
  saveSettings, 
  loadChatHistory, 
  saveChatHistory 
} from './services/storage.js';
import { getInitialTasks } from './services/mockData.js';
import { parseCommitmentsWithGemini, getNextTicketNumber } from './services/gemini.js';
import { getDateOffset, getTodayString } from './types/task.js';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [settings, setSettings] = useState(() => loadSettings());
  const [chatMessages, setChatMessages] = useState(() => loadChatHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [summaryFilter, setSummaryFilter] = useState('all');
  const [mobileTab, setMobileTab] = useState('board'); // 'chat' | 'board'

  // Persist tasks whenever changed
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist chat whenever changed
  useEffect(() => {
    saveChatHistory(chatMessages);
  }, [chatMessages]);

  // Persist settings whenever changed
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // AI Chat Extraction Handler
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await parseCommitmentsWithGemini({
        text: text.trim(),
        apiKey: settings.apiKey,
        model: settings.model,
        existingTasks: tasks
      });

      if (result.tasks && result.tasks.length > 0) {
        // Prepend new tasks to board immediately
        setTasks(prev => [...result.tasks, ...prev]);

        // Highlight the first created task
        setHighlightedTaskId(result.tasks[0].id);
        setTimeout(() => setHighlightedTaskId(null), 3500);
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: result.assistantReply,
        createdTasks: result.tasks || [],
        warning: result.warning,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to parse message:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an unexpected error processing your request. Please try again.',
        warning: err.message,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all chat messages?')) {
      const resetGreeting = [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: '👋 Chat cleared! Paste or type meeting notes to extract new structured Jira tickets.',
          timestamp: new Date().toISOString(),
          createdTasks: []
        }
      ];
      setChatMessages(resetGreeting);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleSaveTask = (taskData) => {
    if (taskData.isNew) {
      const { isNew, ...cleanTask } = taskData;
      setTasks(prev => [cleanTask, ...prev]);
      setHighlightedTaskId(cleanTask.id);
      setTimeout(() => setHighlightedTaskId(null), 3000);
    } else {
      setTasks(prev => prev.map(t => (t.id === taskData.id ? taskData : t)));
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (editingTask && editingTask.id === taskId) {
      setEditingTask(null);
    }
  };

  const handleOpenNewTask = (initialStatus = 'To Do') => {
    const nextNum = getNextTicketNumber(tasks);
    setEditingTask({
      isNew: true,
      id: `CD-${nextNum}`,
      title: '',
      description: '',
      status: typeof initialStatus === 'string' ? initialStatus : 'To Do',
      priority: 'Medium',
      effort: 'Medium',
      dueDate: getDateOffset(3),
      requester: 'Engineering Lead',
      tags: ['Engineering']
    });
  };

  const handleResetToDefaultTasks = () => {
    if (window.confirm('Reset task board to original 12 Jira tickets? This will overwrite existing custom tasks.')) {
      const initial = getInitialTasks();
      setTasks(initial);
      saveTasks(initial);
      setSummaryFilter('all');
    }
  };

  const handleExportTasks = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `commitdesk-tasks-${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportTasks = (importedTasks) => {
    if (Array.isArray(importedTasks) && importedTasks.length > 0) {
      setTasks(importedTasks);
      saveTasks(importedTasks);
      alert(`Successfully imported ${importedTasks.length} tasks!`);
    }
  };

  const handleSelectTaskFromChat = (task) => {
    setEditingTask(task);
    setHighlightedTaskId(task.id);
    setMobileTab('board');
  };

  return (
    <div className="commitdesk-app">
      {/* Top Header */}
      <Header
        apiKey={settings.apiKey}
        model={settings.model}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewTask={handleOpenNewTask}
        onResetTasks={handleResetToDefaultTasks}
        onExportTasks={handleExportTasks}
        onImportTasks={handleImportTasks}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        tasksCount={tasks.length}
      />

      {/* Main Split Screen Area */}
      <main className="main-split-container">
        {/* Left Panel: AI Chat */}
        <div className={`split-left-pane ${mobileTab === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            apiKey={settings.apiKey}
            model={settings.model}
            onSelectTask={handleSelectTaskFromChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Right Panel: Task Management Board */}
        <div className={`split-right-pane ${mobileTab === 'board' ? 'mobile-visible' : 'mobile-hidden'}`}>
          {/* Summary Strip (Open, Due Today, Overdue, Completed, Story Points) */}
          <SummaryStrip
            tasks={tasks}
            activeFilter={summaryFilter}
            setActiveFilter={setSummaryFilter}
          />

          {/* Live Task Board */}
          <TaskBoard
            tasks={tasks}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onNewTask={handleOpenNewTask}
            highlightedTaskId={highlightedTaskId}
            summaryFilter={summaryFilter}
            setSummaryFilter={setSummaryFilter}
          />
        </div>
      </main>

      {/* Modals */}
      <TaskDetailModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
