import { getInitialTasks } from './mockData.js';

const TASKS_KEY = 'commitdesk_tasks_v1';
const SETTINGS_KEY = 'commitdesk_settings_v1';
const CHAT_KEY = 'commitdesk_chat_v1';

export function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialTasks();
    saveTasks(initial);
    return initial;
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
    return getInitialTasks();
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return {
    apiKey: '',
    model: 'gemini-2.0-flash',
    preferGemini: true
  };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load chat history:', err);
  }

  // Default welcome message
  return [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: '👋 Welcome to **CommitDesk**! I turn meeting notes, Slack messages, and action items into structured Jira-style tickets.\n\nType or paste any meeting summary or bullet points below, and I will extract the title, description, priority, effort, due date, and requester instantly.',
      timestamp: new Date().toISOString(),
      createdTasks: []
    }
  ];
}

export function saveChatHistory(history) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save chat history:', err);
  }
}
