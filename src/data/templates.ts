export interface TemplateAction {
  name: string;
  estimated_minutes?: number;
  priority?: number;
}

export interface TemplateHabit {
  name: string;
  icon: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  custom_days?: number[];
}

export interface TemplateGoal {
  name: string;
  description: string;
  goal_type: 'outcome' | 'process' | 'milestone';
  pillar_name: string;
  actions: TemplateAction[];
  habits: TemplateHabit[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  pillar_name: string;
  icon: string;
  category: 'health' | 'career' | 'knowledge' | 'relationships' | 'finance' | 'creative';
  goals: TemplateGoal[];
}

export const TEMPLATES: Template[] = [
  // ─── HEALTH ───
  {
    id: 'run-5k',
    name: 'Couch to 5K',
    description: 'Go from zero to running a 5K in 8 weeks with structured training.',
    pillar_name: 'Health',
    icon: '🏃',
    category: 'health',
    goals: [
      {
        name: 'Run a 5K',
        description: 'Complete a 5K run within 8 weeks',
        goal_type: 'milestone',
        pillar_name: 'Health',
        actions: [
          { name: 'Buy running shoes', estimated_minutes: 60, priority: 3 },
          { name: 'Plan a running route', estimated_minutes: 15 },
          { name: 'Sign up for a local 5K', estimated_minutes: 10 },
          { name: 'Do a test 1K run', estimated_minutes: 20, priority: 2 },
        ],
        habits: [
          { name: 'Run training session', icon: '🏃', frequency: 'custom', custom_days: [1, 3, 5] },
          { name: 'Dynamic stretching', icon: '🧘', frequency: 'custom', custom_days: [1, 3, 5] },
        ],
      },
    ],
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Build a consistent morning routine that energizes your day.',
    pillar_name: 'Health',
    icon: '🌅',
    category: 'health',
    goals: [
      {
        name: 'Build a morning routine',
        description: 'Establish a consistent morning routine within 30 days',
        goal_type: 'process',
        pillar_name: 'Health',
        actions: [
          { name: 'Set consistent wake-up alarm', estimated_minutes: 5 },
          { name: 'Prepare morning supplies the night before', estimated_minutes: 10 },
        ],
        habits: [
          { name: 'Wake up at target time', icon: '⏰', frequency: 'daily' },
          { name: 'Drink water upon waking', icon: '💧', frequency: 'daily' },
          { name: 'Morning exercise (15 min)', icon: '💪', frequency: 'weekdays' },
          { name: 'Healthy breakfast', icon: '🥣', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'meditation-practice',
    name: 'Meditation Practice',
    description: 'Start and sustain a meditation habit from 5 to 20 minutes daily.',
    pillar_name: 'Health',
    icon: '🧘',
    category: 'health',
    goals: [
      {
        name: 'Establish daily meditation',
        description: 'Build a consistent meditation practice over 60 days',
        goal_type: 'process',
        pillar_name: 'Health',
        actions: [
          { name: 'Choose a meditation app or method', estimated_minutes: 20 },
          { name: 'Set up a quiet meditation space', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Meditate (start with 5 min)', icon: '🧘', frequency: 'daily' },
          { name: 'Evening gratitude reflection', icon: '🙏', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'weight-training',
    name: 'Strength Training',
    description: 'Start a structured weight training program 3-4 days per week.',
    pillar_name: 'Health',
    icon: '🏋️',
    category: 'health',
    goals: [
      {
        name: 'Build consistent strength training',
        description: 'Follow a structured program for 12 weeks',
        goal_type: 'process',
        pillar_name: 'Health',
        actions: [
          { name: 'Get gym membership or home equipment', estimated_minutes: 30, priority: 3 },
          { name: 'Choose a beginner program (StrongLifts, PPL, etc.)', estimated_minutes: 30 },
          { name: 'Learn proper form for compound lifts', estimated_minutes: 60 },
        ],
        habits: [
          { name: 'Strength training session', icon: '🏋️', frequency: 'custom', custom_days: [1, 3, 5] },
          { name: 'Track workout in log', icon: '📋', frequency: 'custom', custom_days: [1, 3, 5] },
          { name: 'High-protein meal', icon: '🥩', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'better-sleep',
    name: 'Better Sleep',
    description: 'Optimize your sleep hygiene for deeper, more restful sleep.',
    pillar_name: 'Health',
    icon: '😴',
    category: 'health',
    goals: [
      {
        name: 'Improve sleep quality',
        description: 'Implement sleep hygiene practices for 30 days',
        goal_type: 'process',
        pillar_name: 'Health',
        actions: [
          { name: 'Buy blackout curtains or sleep mask', estimated_minutes: 20 },
          { name: 'Set up phone night mode schedule', estimated_minutes: 5 },
        ],
        habits: [
          { name: 'Screen-free 1 hour before bed', icon: '📵', frequency: 'daily' },
          { name: 'In bed by target time', icon: '🛏️', frequency: 'daily' },
          { name: 'No caffeine after 2pm', icon: '☕', frequency: 'daily' },
        ],
      },
    ],
  },

  // ─── CAREER ───
  {
    id: 'job-search',
    name: 'Job Search',
    description: 'Structured approach to landing your next role in 90 days.',
    pillar_name: 'Career',
    icon: '💼',
    category: 'career',
    goals: [
      {
        name: 'Land a new job',
        description: 'Systematically search and apply for jobs over 90 days',
        goal_type: 'outcome',
        pillar_name: 'Career',
        actions: [
          { name: 'Update resume', estimated_minutes: 120, priority: 3 },
          { name: 'Update LinkedIn profile', estimated_minutes: 60, priority: 3 },
          { name: 'Prepare elevator pitch', estimated_minutes: 30 },
          { name: 'Research target companies', estimated_minutes: 60, priority: 2 },
          { name: 'Practice common interview questions', estimated_minutes: 45 },
        ],
        habits: [
          { name: 'Apply to 2 jobs', icon: '📝', frequency: 'weekdays' },
          { name: 'Network outreach (1 person)', icon: '🤝', frequency: 'weekdays' },
        ],
      },
    ],
  },
  {
    id: 'side-project',
    name: 'Launch a Side Project',
    description: 'Ship a side project from idea to launch in 12 weeks.',
    pillar_name: 'Career',
    icon: '🚀',
    category: 'career',
    goals: [
      {
        name: 'Launch side project',
        description: 'Build and ship an MVP in 12 weeks',
        goal_type: 'milestone',
        pillar_name: 'Career',
        actions: [
          { name: 'Define the problem and target audience', estimated_minutes: 60, priority: 3 },
          { name: 'Sketch wireframes', estimated_minutes: 90 },
          { name: 'Set up project repository', estimated_minutes: 30 },
          { name: 'Build landing page', estimated_minutes: 120 },
          { name: 'Plan launch strategy', estimated_minutes: 60 },
        ],
        habits: [
          { name: 'Code on side project (1 hour)', icon: '💻', frequency: 'weekdays' },
          { name: 'Write project update log', icon: '📝', frequency: 'custom', custom_days: [5] },
        ],
      },
    ],
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking',
    description: 'Improve your public speaking skills with structured practice.',
    pillar_name: 'Career',
    icon: '🎤',
    category: 'career',
    goals: [
      {
        name: 'Become a confident public speaker',
        description: 'Practice and deliver 10 presentations in 6 months',
        goal_type: 'outcome',
        pillar_name: 'Career',
        actions: [
          { name: 'Join Toastmasters or speaking group', estimated_minutes: 30 },
          { name: 'Watch 5 great TED talks for technique', estimated_minutes: 75 },
          { name: 'Prepare first practice speech', estimated_minutes: 60, priority: 2 },
        ],
        habits: [
          { name: 'Practice speaking (10 min)', icon: '🎤', frequency: 'weekdays' },
          { name: 'Record and review yourself', icon: '📹', frequency: 'custom', custom_days: [3] },
        ],
      },
    ],
  },
  {
    id: 'leadership-skills',
    name: 'Leadership Development',
    description: 'Build essential leadership skills for career advancement.',
    pillar_name: 'Career',
    icon: '👔',
    category: 'career',
    goals: [
      {
        name: 'Develop leadership skills',
        description: 'Systematically improve leadership capabilities',
        goal_type: 'process',
        pillar_name: 'Career',
        actions: [
          { name: 'Read "The Manager\'s Path" or similar book', estimated_minutes: 600 },
          { name: 'Set up 1-on-1 schedule with reports', estimated_minutes: 30, priority: 3 },
          { name: 'Write your leadership principles', estimated_minutes: 45 },
        ],
        habits: [
          { name: 'Give one piece of feedback', icon: '💬', frequency: 'weekdays' },
          { name: 'Read leadership article', icon: '📖', frequency: 'weekdays' },
        ],
      },
    ],
  },

  // ─── KNOWLEDGE ───
  {
    id: 'learn-language',
    name: 'Learn a Language',
    description: 'Reach conversational fluency in a new language.',
    pillar_name: 'Knowledge',
    icon: '🌍',
    category: 'knowledge',
    goals: [
      {
        name: 'Reach conversational fluency',
        description: 'Study consistently for 6 months to hold basic conversations',
        goal_type: 'outcome',
        pillar_name: 'Knowledge',
        actions: [
          { name: 'Choose language learning app (Duolingo, Pimsleur, etc.)', estimated_minutes: 20 },
          { name: 'Find a language exchange partner', estimated_minutes: 30 },
          { name: 'Buy a beginner textbook', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Language lesson (15-30 min)', icon: '🌍', frequency: 'daily' },
          { name: 'Listen to target language podcast', icon: '🎧', frequency: 'weekdays' },
          { name: 'Practice conversation', icon: '💬', frequency: 'custom', custom_days: [3, 6] },
        ],
      },
    ],
  },
  {
    id: 'reading-habit',
    name: 'Reading Habit',
    description: 'Read 24 books in a year with a consistent daily reading habit.',
    pillar_name: 'Knowledge',
    icon: '📚',
    category: 'knowledge',
    goals: [
      {
        name: 'Read 24 books this year',
        description: 'Read 2 books per month for a year',
        goal_type: 'outcome',
        pillar_name: 'Knowledge',
        actions: [
          { name: 'Create reading list of 30 books', estimated_minutes: 30, priority: 2 },
          { name: 'Set up a reading nook', estimated_minutes: 15 },
          { name: 'Join a book club', estimated_minutes: 20 },
        ],
        habits: [
          { name: 'Read for 30 minutes', icon: '📖', frequency: 'daily' },
          { name: 'Write book notes / highlights', icon: '📝', frequency: 'custom', custom_days: [7] },
        ],
      },
    ],
  },
  {
    id: 'online-course',
    name: 'Complete an Online Course',
    description: 'Finish an online course with structured study sessions.',
    pillar_name: 'Knowledge',
    icon: '🎓',
    category: 'knowledge',
    goals: [
      {
        name: 'Complete online course',
        description: 'Finish the course with all assignments in 8 weeks',
        goal_type: 'milestone',
        pillar_name: 'Knowledge',
        actions: [
          { name: 'Enroll in the course', estimated_minutes: 15, priority: 3 },
          { name: 'Create study schedule', estimated_minutes: 20 },
          { name: 'Set up note-taking system', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Study session (45 min)', icon: '🎓', frequency: 'weekdays' },
          { name: 'Review notes from previous session', icon: '📋', frequency: 'weekdays' },
        ],
      },
    ],
  },
  {
    id: 'learn-coding',
    name: 'Learn to Code',
    description: 'Go from beginner to building your first web application.',
    pillar_name: 'Knowledge',
    icon: '💻',
    category: 'knowledge',
    goals: [
      {
        name: 'Build first web application',
        description: 'Learn fundamentals and build a working project in 12 weeks',
        goal_type: 'milestone',
        pillar_name: 'Knowledge',
        actions: [
          { name: 'Choose a learning path (freeCodeCamp, Odin Project, etc.)', estimated_minutes: 30 },
          { name: 'Set up development environment', estimated_minutes: 60, priority: 3 },
          { name: 'Plan your first project idea', estimated_minutes: 30 },
        ],
        habits: [
          { name: 'Code practice (1 hour)', icon: '💻', frequency: 'daily' },
          { name: 'Read programming article', icon: '📰', frequency: 'weekdays' },
        ],
      },
    ],
  },

  // ─── RELATIONSHIPS ───
  {
    id: 'deeper-friendships',
    name: 'Deeper Friendships',
    description: 'Strengthen existing friendships with intentional connection.',
    pillar_name: 'Relationships',
    icon: '👥',
    category: 'relationships',
    goals: [
      {
        name: 'Deepen key friendships',
        description: 'Invest in 5 important friendships over 3 months',
        goal_type: 'process',
        pillar_name: 'Relationships',
        actions: [
          { name: 'List your 5 most important friendships', estimated_minutes: 15, priority: 2 },
          { name: 'Schedule a catch-up with each person', estimated_minutes: 30 },
          { name: 'Plan a group activity', estimated_minutes: 20 },
        ],
        habits: [
          { name: 'Reach out to a friend', icon: '💬', frequency: 'custom', custom_days: [1, 4] },
          { name: 'Express gratitude to someone', icon: '🙏', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'relationship-quality',
    name: 'Relationship Quality Time',
    description: 'Improve your romantic relationship with consistent quality time.',
    pillar_name: 'Relationships',
    icon: '❤️',
    category: 'relationships',
    goals: [
      {
        name: 'Strengthen romantic relationship',
        description: 'Invest in quality time and communication',
        goal_type: 'process',
        pillar_name: 'Relationships',
        actions: [
          { name: 'Plan next date night', estimated_minutes: 20, priority: 2 },
          { name: 'Discuss relationship goals together', estimated_minutes: 45 },
          { name: 'Create shared bucket list', estimated_minutes: 30 },
        ],
        habits: [
          { name: 'Quality conversation (no phones)', icon: '💑', frequency: 'daily' },
          { name: 'Weekly date night', icon: '❤️', frequency: 'custom', custom_days: [6] },
          { name: 'Express appreciation', icon: '💝', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'family-connection',
    name: 'Family Connection',
    description: 'Stay connected with family through regular touchpoints.',
    pillar_name: 'Relationships',
    icon: '👨‍👩‍👧‍👦',
    category: 'relationships',
    goals: [
      {
        name: 'Stay connected with family',
        description: 'Regular family connection and quality time',
        goal_type: 'process',
        pillar_name: 'Relationships',
        actions: [
          { name: 'Schedule monthly family dinner/call', estimated_minutes: 10 },
          { name: 'Plan a family outing or trip', estimated_minutes: 30 },
        ],
        habits: [
          { name: 'Call a family member', icon: '📱', frequency: 'custom', custom_days: [3, 7] },
          { name: 'Family dinner (screen-free)', icon: '🍽️', frequency: 'custom', custom_days: [7] },
        ],
      },
    ],
  },
  {
    id: 'networking',
    name: 'Professional Networking',
    description: 'Build a strong professional network through consistent outreach.',
    pillar_name: 'Relationships',
    icon: '🤝',
    category: 'relationships',
    goals: [
      {
        name: 'Expand professional network',
        description: 'Make 50 meaningful connections in 6 months',
        goal_type: 'outcome',
        pillar_name: 'Relationships',
        actions: [
          { name: 'Optimize LinkedIn profile', estimated_minutes: 60, priority: 3 },
          { name: 'Identify 10 industry events to attend', estimated_minutes: 30 },
          { name: 'Prepare networking introduction', estimated_minutes: 20 },
        ],
        habits: [
          { name: 'Send a connection message', icon: '🤝', frequency: 'weekdays' },
          { name: 'Engage with industry content', icon: '📱', frequency: 'weekdays' },
        ],
      },
    ],
  },

  // ─── FINANCE ───
  {
    id: 'emergency-fund',
    name: 'Build Emergency Fund',
    description: 'Save 3-6 months of expenses in an emergency fund.',
    pillar_name: 'Finance',
    icon: '🏦',
    category: 'finance',
    goals: [
      {
        name: 'Build 3-month emergency fund',
        description: 'Systematically save to build financial security',
        goal_type: 'outcome',
        pillar_name: 'Finance',
        actions: [
          { name: 'Calculate monthly expenses', estimated_minutes: 30, priority: 3 },
          { name: 'Open high-yield savings account', estimated_minutes: 20 },
          { name: 'Set up automatic transfer', estimated_minutes: 10, priority: 3 },
          { name: 'Review and cut unnecessary subscriptions', estimated_minutes: 30 },
        ],
        habits: [
          { name: 'Track spending', icon: '📊', frequency: 'daily' },
          { name: 'No-spend check-in', icon: '💰', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'budgeting',
    name: 'Budgeting System',
    description: 'Set up and maintain a personal budgeting system.',
    pillar_name: 'Finance',
    icon: '📊',
    category: 'finance',
    goals: [
      {
        name: 'Master personal budgeting',
        description: 'Create and maintain a budgeting system for 3 months',
        goal_type: 'process',
        pillar_name: 'Finance',
        actions: [
          { name: 'Choose budgeting method (50/30/20, envelope, YNAB)', estimated_minutes: 30 },
          { name: 'Set up budgeting tool or spreadsheet', estimated_minutes: 45 },
          { name: 'Categorize all recurring expenses', estimated_minutes: 30 },
        ],
        habits: [
          { name: 'Log expenses', icon: '📝', frequency: 'daily' },
          { name: 'Weekly budget review', icon: '📊', frequency: 'custom', custom_days: [7] },
        ],
      },
    ],
  },
  {
    id: 'investing-basics',
    name: 'Start Investing',
    description: 'Learn the basics and start investing regularly.',
    pillar_name: 'Finance',
    icon: '📈',
    category: 'finance',
    goals: [
      {
        name: 'Start investment portfolio',
        description: 'Learn basics and begin investing within 30 days',
        goal_type: 'milestone',
        pillar_name: 'Finance',
        actions: [
          { name: 'Read investment basics (Bogleheads, etc.)', estimated_minutes: 120 },
          { name: 'Open brokerage account', estimated_minutes: 20, priority: 3 },
          { name: 'Research index funds', estimated_minutes: 60 },
          { name: 'Set up automatic investment', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Read financial news (10 min)', icon: '📰', frequency: 'weekdays' },
          { name: 'Review portfolio', icon: '📈', frequency: 'custom', custom_days: [1] },
        ],
      },
    ],
  },

  // ─── CREATIVE ───
  {
    id: 'writing-practice',
    name: 'Daily Writing Practice',
    description: 'Build a daily writing habit for blog, fiction, or journaling.',
    pillar_name: 'Creative',
    icon: '✍️',
    category: 'creative',
    goals: [
      {
        name: 'Establish daily writing practice',
        description: 'Write consistently for 90 days',
        goal_type: 'process',
        pillar_name: 'Creative',
        actions: [
          { name: 'Choose writing platform or tool', estimated_minutes: 15 },
          { name: 'Create list of 30 writing prompts', estimated_minutes: 20 },
          { name: 'Set up dedicated writing space', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Write for 30 minutes', icon: '✍️', frequency: 'daily' },
          { name: 'Read for writing inspiration', icon: '📖', frequency: 'daily' },
        ],
      },
    ],
  },
  {
    id: 'learn-music',
    name: 'Learn an Instrument',
    description: 'Pick up a new instrument and play your first song.',
    pillar_name: 'Creative',
    icon: '🎵',
    category: 'creative',
    goals: [
      {
        name: 'Learn to play first song',
        description: 'Practice consistently to play a full song in 3 months',
        goal_type: 'milestone',
        pillar_name: 'Creative',
        actions: [
          { name: 'Buy or borrow instrument', estimated_minutes: 30, priority: 3 },
          { name: 'Find a teacher or online course', estimated_minutes: 30 },
          { name: 'Choose your first song to learn', estimated_minutes: 15 },
        ],
        habits: [
          { name: 'Practice instrument (20 min)', icon: '🎵', frequency: 'daily' },
          { name: 'Music theory study (10 min)', icon: '🎼', frequency: 'custom', custom_days: [1, 3, 5] },
        ],
      },
    ],
  },
  {
    id: 'photography',
    name: 'Photography Skills',
    description: 'Improve your photography with structured practice and projects.',
    pillar_name: 'Creative',
    icon: '📸',
    category: 'creative',
    goals: [
      {
        name: 'Develop photography skills',
        description: 'Complete a 30-day photography challenge',
        goal_type: 'outcome',
        pillar_name: 'Creative',
        actions: [
          { name: 'Learn manual camera settings', estimated_minutes: 45 },
          { name: 'Study composition rules', estimated_minutes: 30 },
          { name: 'Create a portfolio (online gallery)', estimated_minutes: 60 },
        ],
        habits: [
          { name: 'Take 5 intentional photos', icon: '📸', frequency: 'daily' },
          { name: 'Edit and review photos', icon: '🖼️', frequency: 'custom', custom_days: [6, 7] },
        ],
      },
    ],
  },
  {
    id: 'drawing',
    name: 'Learn to Draw',
    description: 'Build drawing skills from fundamentals with daily sketching.',
    pillar_name: 'Creative',
    icon: '🎨',
    category: 'creative',
    goals: [
      {
        name: 'Build drawing fundamentals',
        description: 'Practice daily sketching for 60 days',
        goal_type: 'process',
        pillar_name: 'Creative',
        actions: [
          { name: 'Get sketchbook and pencils', estimated_minutes: 20 },
          { name: 'Find a drawing tutorial series', estimated_minutes: 20 },
          { name: 'Study basic shapes and proportions', estimated_minutes: 45 },
        ],
        habits: [
          { name: 'Daily sketch (15 min)', icon: '✏️', frequency: 'daily' },
          { name: 'Study art reference', icon: '🎨', frequency: 'custom', custom_days: [2, 4, 6] },
        ],
      },
    ],
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Start creating and publishing content consistently.',
    pillar_name: 'Creative',
    icon: '📱',
    category: 'creative',
    goals: [
      {
        name: 'Build content creation habit',
        description: 'Publish content consistently for 90 days',
        goal_type: 'process',
        pillar_name: 'Creative',
        actions: [
          { name: 'Choose your platform and niche', estimated_minutes: 30, priority: 3 },
          { name: 'Create content calendar for first month', estimated_minutes: 45 },
          { name: 'Set up posting tools and templates', estimated_minutes: 30 },
          { name: 'Batch create first week of content', estimated_minutes: 120 },
        ],
        habits: [
          { name: 'Create content (30 min)', icon: '🎬', frequency: 'weekdays' },
          { name: 'Engage with community', icon: '💬', frequency: 'weekdays' },
          { name: 'Publish content', icon: '📤', frequency: 'custom', custom_days: [1, 3, 5] },
        ],
      },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'health', label: 'Health', icon: '💪' },
  { id: 'career', label: 'Career', icon: '💼' },
  { id: 'knowledge', label: 'Knowledge', icon: '📚' },
  { id: 'relationships', label: 'Relationships', icon: '👥' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
] as const;
