export const initialUser = {
    id: 'user-123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatarUrl: 'https://picsum.photos/seed/user/40/40',
    planId: 'free',
    tokenBalance: 500,
};
export const PLAN_DETAILS = [
    {
        id: 'free',
        name: 'Free Trial',
        price: 0,
        pricePeriod: 'mo',
        tokens: 500,
        features: ['30-Day Free Trial', '500 Tokens included', 'Standard AI Model', 'Explore all features'],
    },
    {
        id: 'freelancer',
        name: 'Freelancer',
        price: 12,
        pricePeriod: 'mo',
        tokens: 1000,
        features: ['1,000 Tokens/Month', 'Full Workspace Access', 'Standard AI Model', 'Email & Community Support'],
    },
    {
        id: 'business',
        name: 'Business',
        price: 49,
        pricePeriod: 'mo',
        tokens: 5000,
        features: ['5,000 Tokens/Month', 'Advanced AI Model', 'Priority Support', 'Team Features (coming soon)'],
    }
];
export const TOKEN_PACKS = [
    { id: 1, name: 'Starter Pack', price: 5, tokens: 500 },
    { id: 2, name: 'Pro Pack', price: 15, tokens: 2000 },
];
export const initialChats = [
    {
        id: 'chat-1',
        title: 'Initial Welcome Chat',
        messages: [
            {
                id: 'init',
                text: "Hello! I'm Business Brain. I'm ready to help you manage your files, emails, and calendar. How can I assist you today?",
                sender: 'ai',
            },
        ]
    }
];
export const initialDirectory = {
    'root': {
        id: 'root',
        type: 'directory',
        name: 'Business Brain',
        parentId: 'root', // Root's parent is itself for path logic
        children: ['1', '2', '3', '4', '5'],
    },
    '1': {
        id: '1',
        parentId: 'root',
        name: 'Q4_Sales_Report.xlsx',
        type: 'spreadsheet',
        isVisible: true,
        content: [
            ['Month', 'Revenue', 'Profit', 'Growth %'],
            ['October', '150,000', '45,000', '5%'],
            ['November', '180,000', '55,000', '7%'],
            ['December', '220,000', '70,000', '10%'],
        ]
    },
    '2': {
        id: '2',
        parentId: 'root',
        name: 'Client Onboarding Manual.docx',
        type: 'document',
        isVisible: true,
        content: 'Welcome to our client onboarding process!\n\nStep 1: Initial kickoff meeting.\nStep 2: Grant access to project management tools.\nStep 3: Schedule weekly check-ins.'
    },
    '3': {
        id: '3',
        parentId: 'root',
        name: 'Project Phoenix Budget.xlsx',
        type: 'spreadsheet',
        isVisible: false,
        content: [
            ['Category', 'Allocated', 'Spent', 'Remaining'],
            ['Development', '50000', '35000', '15000'],
            ['Marketing', '20000', '22000', '-2000'],
        ]
    },
    '4': {
        id: '4',
        parentId: 'root',
        name: 'Marketing Campaign Brief.docx',
        type: 'document',
        isVisible: true,
        content: 'Campaign Name: Summer Sizzle\nObjective: Increase Q3 sales by 15%.\nTarget Audience: 18-35 year olds.'
    },
    '5': {
        id: '5',
        parentId: 'root',
        name: 'Employee Handbook_SECURE.docx',
        type: 'document',
        isVisible: false,
        content: 'Confidential: This document contains proprietary company information.'
    },
};
export const initialEmails = [
    { id: 'email-1', sender: 'news@figma.com', subject: 'What’s new in Figma: March 2025', snippet: 'A whole new way to build, right in the canvas. Plus, a new look for comments...', body: 'Figma is excited to announce new features that will change the way you design. Introducing dynamic layers, AI-powered component generation, and a complete overhaul of the developer handoff process. We believe these updates will significantly speed up your workflow.', timestamp: '2025-03-25T10:30:00Z', isRead: false },
    { id: 'email-2', sender: 'Jane Doe', subject: 'Re: Project Phoenix Kickoff', snippet: 'Sounds great! I\'ve attached the preliminary budget. Let me know your thoughts.', body: 'Hi Team,\n\nFollowing up on our kickoff call, please find the preliminary budget attached. Key highlights:\n- $50,000 allocated for development\n- $20,000 for marketing launch\n\nPlease review and provide feedback by EOD Friday.\n\nBest,\nJane', timestamp: '2025-03-24T15:00:00Z', isRead: true },
    { id: 'email-3', sender: 'notifications@github.com', subject: '[business-brain] 3 new issues were created', snippet: 'Issue #45: Bug in file download, Issue #46: UI glitch on dark mode...', body: '3 new issues were created in the business-brain repository:\n- #45: Bug in file download - CSV files are not formatted correctly.\n- #46: UI glitch on dark mode - Calendar text is unreadable.\n- #47: Feature Request - Add support for markdown in documents.', timestamp: '2025-03-24T11:20:00Z', isRead: true },
    { id: 'email-4', sender: 'John Appleseed', subject: 'Invoice #1043 due', snippet: 'Hi there, just a friendly reminder that invoice #1043 for $1,500 is due next week...', body: 'Hi Business Brain Team,\n\nThis is a friendly reminder that invoice #1043 for $1,500 is due on April 1, 2025. Please let us know if you have any questions.\n\nThanks,\nJohn Appleseed', timestamp: '2025-03-22T09:00:00Z', isRead: true },
];
export const initialMedia = [
    { id: 'media-1', name: 'logo_final_dark.png', type: 'image', url: 'https://picsum.photos/seed/logo1/800/600', size: '1.2MB', createdAt: '2025-03-15' },
    { id: 'media-2', name: 'ad_campaign_v2.mp4', type: 'video', url: 'https://picsum.photos/seed/vid1/800/600', size: '25.6MB', createdAt: '2025-03-20' },
    { id: 'media-3', name: 'website_hero.jpg', type: 'image', url: 'https://picsum.photos/seed/hero/800/600', size: '4.8MB', createdAt: '2025-02-10' },
    { id: 'media-4', name: 'team_photo.jpg', type: 'image', url: 'https://picsum.photos/seed/team/800/600', size: '6.1MB', createdAt: '2025-01-25' },
];
export const initialCalendarEvents = [
    { id: 'cal-1', title: 'Q2 Planning Session', startTime: '2025-03-28T10:00', endTime: '2025-03-28T12:00', description: 'Finalize Q2 roadmap and OKRs.', attendees: ['Jane Doe', 'John Smith'] },
    { id: 'cal-2', title: 'Design Sync', startTime: '2025-03-28T14:00', endTime: '2025-03-28T14:30', description: 'Review new component designs.', attendees: ['You', 'Design Team'] },
    { id: 'cal-3', title: 'Dentist Appointment', startTime: '2025-04-02T11:00', endTime: '2025-04-02T11:45', description: 'Annual check-up.', attendees: ['You'] },
    { id: 'cal-4', title: '1-on-1 with Manager', startTime: '2025-04-02T15:00', endTime: '2025-04-02T15:30', description: '', attendees: ['You', 'Your Manager'] },
];
