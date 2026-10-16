import { getTodayString, getDateOffset } from '../types/task.js';

/**
 * Calculates next Jira ticket ID number based on current tasks
 */
export function getNextTicketNumber(tasks = []) {
  let maxNum = 112; // Start after default CD-112
  tasks.forEach(t => {
    if (t.id && t.id.startsWith('CD-')) {
      const num = parseInt(t.id.replace('CD-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return maxNum + 1;
}

/**
 * Heuristic Local NLP Extractor
 * Parses text even when user has not configured a Gemini API key.
 */
export function extractTasksLocally(text, existingTasks = []) {
  if (!text || !text.trim()) {
    return {
      assistantReply: 'Please provide some meeting notes, sentences, or action items to extract tasks from.',
      tasks: [],
      error: 'Empty input'
    };
  }

  let nextIdNum = getNextTicketNumber(existingTasks);
  const today = getTodayString();

  // Split into candidate items: lines, bullet points, or numbered lists
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let rawItems = [];

  // If text has list bullets or numbers, extract those lines
  const hasBulletsOrNumbers = lines.some(l => /^(\d+[\.\)]|[-*•]|\[ \]|TODO:)/i.test(l));

  if (hasBulletsOrNumbers) {
    let currentItem = '';
    lines.forEach(line => {
      if (/^(\d+[\.\)]|[-*•]|\[ \]|TODO:)/i.test(line)) {
        if (currentItem) rawItems.push(currentItem.trim());
        currentItem = line.replace(/^(\d+[\.\)]|[-*•]|\[ \]|TODO:)\s*/i, '');
      } else if (currentItem) {
        currentItem += ' ' + line;
      } else {
        // standalone header or context
        if (line.length > 15) rawItems.push(line);
      }
    });
    if (currentItem) rawItems.push(currentItem.trim());
  } else if (lines.length > 1) {
    // Treat non-empty lines as potential items if separated
    rawItems = lines.filter(l => l.length > 8);
  } else {
    // Single block of text: split by semicolons or sentences
    const sentences = text.split(/(?<=[.?!;])\s+(?=[A-Z0-9])/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 1) {
      rawItems = sentences;
    } else {
      rawItems = [text.trim()];
    }
  }

  // If nothing was parsed, fall back to whole text
  if (rawItems.length === 0) {
    rawItems = [text.trim()];
  }

  // Detect potential global requester from meeting header
  let globalRequester = 'Meeting Participant';
  const meetingHeaderMatch = text.match(/(?:meeting with|notes from|sync with|discussion with|1:1 with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*\([^)]+\))?)/i);
  if (meetingHeaderMatch && meetingHeaderMatch[1]) {
    globalRequester = meetingHeaderMatch[1].trim();
  }

  const extractedTasks = [];

  rawItems.forEach(itemText => {
    // Skip mere headers like "Meeting notes:" or "Action items:"
    if (/^(action items|meeting notes|agenda|attendees|retro notes|commitments):?$/i.test(itemText.trim())) {
      return;
    }

    const lower = itemText.toLowerCase();

    // 1. Detect Priority
    let priority = 'Medium';
    if (/\b(urgent|critical|p0|asap|emergency|blocker|blocking|immediately)\b/i.test(itemText)) {
      priority = 'Urgent';
    } else if (/\b(high|p1|important|crucial|top priority)\b/i.test(itemText)) {
      priority = 'High';
    } else if (/\b(low|p3|minor|trivial|nice to have|optional|backlog)\b/i.test(itemText)) {
      priority = 'Low';
    }

    // 2. Detect Effort
    let effort = 'Medium';
    if (/\b(small|quick|minor|tweak|typo|easy|1pt|s effort|simple fix)\b/i.test(itemText)) {
      effort = 'Small';
    } else if (/\b(large|epic|refactor|overhaul|migration|complex|architecture|re-architect|5pt|l effort|major)\b/i.test(itemText)) {
      effort = 'Large';
    }

    // 3. Detect Due Date
    let dueDate = getDateOffset(3); // default 3 days out
    if (/\b(today|tonight|end of day|eod)\b/i.test(itemText)) {
      dueDate = today;
    } else if (/\b(tomorrow)\b/i.test(itemText)) {
      dueDate = getDateOffset(1);
    } else if (/\b(yesterday)\b/i.test(itemText)) {
      dueDate = getDateOffset(-1);
    } else if (/in (\d+)\s+days?/i.test(itemText)) {
      const days = parseInt(itemText.match(/in (\d+)\s+days?/i)[1], 10);
      dueDate = getDateOffset(days);
    } else if (/\b(next week|in a week)\b/i.test(itemText)) {
      dueDate = getDateOffset(7);
    } else {
      // Check for day of week (e.g. before Friday, by Monday)
      const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const dayMatch = itemText.match(/\b(before|by|on|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (dayMatch && dayMatch[2]) {
        const targetDay = daysMap[dayMatch[2].toLowerCase()];
        const currentDay = new Date().getDay();
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7; // next week
        dueDate = getDateOffset(diff);
      }
    }

    // 4. Detect Requester
    let requester = globalRequester;
    const reqMatch = itemText.match(/(?:assigned to|requester:|requested by|from|by|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*\([^)]+\))?)/i);
    const speakerMatch = itemText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*\([^)]+\))?)\s*(?:wants|asked|requested|suggested|noticed|said|flagged):/i);
    
    if (speakerMatch && speakerMatch[1]) {
      requester = speakerMatch[1].trim();
    } else if (reqMatch && reqMatch[1]) {
      // verify not a day of week or generic word
      const candidate = reqMatch[1].trim();
      if (!/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|friday|urgent|high|low|medium|small|large)$/i.test(candidate)) {
        requester = candidate;
      }
    }

    // 5. Detect Status
    let status = 'To Do';
    if (/\b(done|completed|finished|resolved)\b/i.test(itemText)) {
      status = 'Done';
    } else if (/\b(in progress|wip|currently working|started)\b/i.test(itemText)) {
      status = 'In Progress';
    } else if (/\b(in review|under review|pr opened|testing)\b/i.test(itemText)) {
      status = 'In Review';
    }

    // 6. Detect Relevant Domain Tags
    const tags = [];
    const domainKeywords = [
      { key: 'Security', regex: /\b(security|audit|soc-2|kms|vulnerability|cve|cve-|encryption|auth0|saml|jwt)\b/i },
      { key: 'Backend', regex: /\b(backend|api|server|redis|database|postgres|sql|endpoint|webhook)\b/i },
      { key: 'Frontend', regex: /\b(frontend|ui|css|react|mobile|safari|button|modal|banner)\b/i },
      { key: 'Infra', regex: /\b(infra|devops|aws|kubernetes|k8s|terraform|docker|ci\/cd|pipeline)\b/i },
      { key: 'Performance', regex: /\b(performance|latency|p99|bundle|memory leak|cache|gc)\b/i },
      { key: 'Legal', regex: /\b(gdpr|legal|privacy|dpo|compliance|terms)\b/i },
      { key: 'Billing', regex: /\b(stripe|billing|invoice|payment|checkout)\b/i }
    ];

    domainKeywords.forEach(dk => {
      if (dk.regex.test(itemText)) {
        tags.push(dk.key);
      }
    });

    if (tags.length === 0) tags.push('Task');

    // 7. Clean Title & Description
    // Clean up title by removing leading conversational clutter
    let title = itemText
      .replace(/^(urgent|high|low|medium|p0|p1|p2|action item|task):?\s*/i, '')
      .replace(/^(meeting with|notes from)\s+[^:]+:\s*/i, '')
      .replace(/\s*,\s*(small|medium|large)\s*effort/i, '')
      .replace(/\s*,\s*(urgent|high|low|medium)\s*priority/i, '')
      .replace(/\s*by\s+(today|tomorrow|friday|monday|tuesday|wednesday|thursday)\b/i, '')
      .trim();

    // Capitalize first letter
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    // Truncate long titles to max 90 characters for card readability
    if (title.length > 95) {
      title = title.substring(0, 92) + '...';
    }

    let description = itemText.trim();
    if (description.length < 25) {
      description = `Action item extracted from meeting notes: ${itemText}. Follow up with ${requester} for acceptance criteria.`;
    }

    extractedTasks.push({
      id: `CD-${nextIdNum++}`,
      title: title || 'Follow up on discussion items',
      description,
      dueDate,
      requester,
      priority,
      effort,
      status,
      tags,
      createdAt: today
    });
  });

  const count = extractedTasks.length;
  const reply = count === 1
    ? `✨ Created **${extractedTasks[0].id}**: "${extractedTasks[0].title}" assigned to **${extractedTasks[0].requester}** with **${extractedTasks[0].priority}** priority.`
    : `✨ Extracted **${count} structured tasks** (${extractedTasks.map(t => t.id).join(', ')}) with assigned priorities, effort, and due dates. Board updated!`;

  return {
    assistantReply: reply,
    tasks: extractedTasks,
    isLocalFallback: true
  };
}

/**
 * Parses commitments using Google Gemini API, with automatic fallback
 */
export async function parseCommitmentsWithGemini({ text, apiKey, model = 'gemini-2.0-flash', existingTasks = [] }) {
  if (!text || !text.trim()) {
    return {
      assistantReply: 'Please provide notes or action items to extract.',
      tasks: [],
      error: 'Empty input'
    };
  }

  // If no API key is provided, use the built-in heuristic NLP extractor
  if (!apiKey || !apiKey.trim()) {
    return extractTasksLocally(text, existingTasks);
  }

  const nextIdNum = getNextTicketNumber(existingTasks);
  const today = getTodayString();
  const year = new Date().getFullYear();

  const systemPrompt = `You are CommitDesk's AI Ticket Extractor.
Extract structured Jira-style tasks from the user's input (meeting notes, sentences, or action items).
Current Reference Date: ${today} (Year ${year}).
Starting Task ID Number: CD-${nextIdNum} (increment by 1 for each task).

Return ONLY a valid JSON object matching this schema without markdown code block fences if possible:
{
  "assistantReply": "Concise 1-2 sentence assistant summary acknowledging what was extracted",
  "tasks": [
    {
      "id": "CD-${nextIdNum}",
      "title": "Concise, action-oriented Jira ticket title",
      "description": "Short description with context and scope",
      "dueDate": "YYYY-MM-DD", // calculate accurately based on 'today', 'tomorrow', day of week, or default to 3 days from ${today}
      "requester": "Full Name and Role if mentioned (e.g., 'Sarah Chen (VP Eng)'), otherwise 'Meeting Participant'",
      "priority": "Urgent" | "High" | "Medium" | "Low",
      "effort": "Small" | "Medium" | "Large",
      "status": "To Do" | "In Progress" | "In Review" | "Done", // default To Do
      "tags": ["Tag1", "Tag2"]
    }
  ]
}

Rules:
- NEVER return empty or placeholder values.
- If multiple action items are mentioned, extract all of them as separate tasks.
- Ensure priority is one of: Urgent, High, Medium, Low.
- Ensure effort is one of: Small, Medium, Large.
- Ensure status is one of: To Do, In Progress, In Review, Done.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Input to extract tasks from:\n"""${text}"""`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      let errorMsg = `Gemini API returned HTTP ${response.status}`;
      try {
        const parsedErr = JSON.parse(errBody);
        if (parsedErr.error && parsedErr.error.message) {
          errorMsg = parsedErr.error.message;
        }
      } catch (e) {
        // use raw body
      }
      console.warn('Gemini API call failed, falling back to local NLP parser:', errorMsg);
      const fallbackResult = extractTasksLocally(text, existingTasks);
      return {
        ...fallbackResult,
        warning: `Notice: Gemini API responded with error ("${errorMsg}"). Used built-in parser instead.`
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No content generated by Gemini');
    }

    // Sanitize response in case code fences are included
    let jsonStr = candidateText.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonStr);

    let assignedId = nextIdNum;
    const sanitizedTasks = (parsed.tasks || []).map(task => {
      return {
        id: task.id && task.id.startsWith('CD-') ? task.id : `CD-${assignedId++}`,
        title: task.title || 'Untitled Action Item',
        description: task.description || 'Action item extracted from meeting context.',
        dueDate: task.dueDate || getDateOffset(3),
        requester: task.requester || 'Meeting Participant',
        priority: ['Urgent', 'High', 'Medium', 'Low'].includes(task.priority) ? task.priority : 'Medium',
        effort: ['Small', 'Medium', 'Large'].includes(task.effort) ? task.effort : 'Medium',
        status: ['To Do', 'In Progress', 'In Review', 'Done'].includes(task.status) ? task.status : 'To Do',
        tags: Array.isArray(task.tags) && task.tags.length > 0 ? task.tags : ['Task'],
        createdAt: today
      };
    });

    return {
      assistantReply: parsed.assistantReply || `Extracted ${sanitizedTasks.length} task(s) via Gemini AI.`,
      tasks: sanitizedTasks,
      isLocalFallback: false,
      modelUsed: model
    };
  } catch (error) {
    console.warn('Gemini API exception, falling back to local NLP parser:', error);
    const fallbackResult = extractTasksLocally(text, existingTasks);
    return {
      ...fallbackResult,
      warning: `Notice: Gemini API request encountered an issue (${error.message}). Used built-in parser instead.`
    };
  }
}
