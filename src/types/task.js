export const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];

export const STATUS_CONFIG = {
  'To Do': {
    label: 'To Do',
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    accentBar: '#64748B'
  },
  'In Progress': {
    label: 'In Progress',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    accentBar: '#0284C7'
  },
  'In Review': {
    label: 'In Review',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.25)',
    accentBar: '#8B5CF6'
  },
  'Done': {
    label: 'Done',
    color: '#34D399',
    bgColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
    accentBar: '#10B981'
  }
};

export const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];

export const PRIORITY_CONFIG = {
  'Urgent': {
    label: 'Urgent',
    rank: 4,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    icon: 'AlertTriangle'
  },
  'High': {
    label: 'High',
    rank: 3,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.14)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    icon: 'ArrowUp'
  },
  'Medium': {
    label: 'Medium',
    rank: 2,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.14)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    icon: 'Minus'
  },
  'Low': {
    label: 'Low',
    rank: 1,
    color: '#94A3B8',
    bgColor: 'rgba(100, 116, 139, 0.14)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    icon: 'ArrowDown'
  }
};

export const EFFORTS = ['Small', 'Medium', 'Large'];

export const EFFORT_CONFIG = {
  'Small': {
    label: 'Small',
    code: 'S',
    points: 1,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Quick task (1-3 hrs)'
  },
  'Medium': {
    label: 'Medium',
    code: 'M',
    points: 3,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'Standard task (1-2 days)'
  },
  'Large': {
    label: 'Large',
    code: 'L',
    points: 5,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    description: 'Major initiative (3-5+ days)'
  }
};

// Date utilities
export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'Done') return false;
  const today = getTodayString();
  return task.dueDate < today;
}

export function isDueToday(task) {
  if (!task.dueDate || task.status === 'Done') return false;
  const today = getTodayString();
  return task.dueDate === today;
}

export function isDueSoon(task) {
  if (!task.dueDate || task.status === 'Done') return false;
  const tomorrow = getDateOffset(1);
  return task.dueDate === tomorrow;
}

export function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'No due date';
  
  const today = getTodayString();
  const yesterday = getDateOffset(-1);
  const tomorrow = getDateOffset(1);

  if (dateStr === today) return 'Due Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return dateStr;
}
