// Helper to generate dynamic demo transactions relative to today's date
export const getDemoTransactions = () => {
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const createEntry = (daysAgo, id, name, category, amount, status = 'Completed') => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return {
      id,
      name,
      category,
      amount,
      status,
      date: formatDate(d),
      rawDate: d.toISOString().split('T')[0]
    };
  };

  return [
    createEntry(1, 'demo-1', 'Supermarket & Groceries', 'Groceries', -12450),
    createEntry(3, 'demo-2', 'Dining Out with Friends', 'Entertainment', -5800),
    createEntry(5, 'demo-3', 'Software Developer Monthly Salary', 'Salary', 185000),
    createEntry(8, 'demo-4', 'Electricity & Water Utility Bills', 'Rent & Utilities', -9200),
    createEntry(11, 'demo-5', 'Freelance Web Design Project', 'Freelance', 55000),
    createEntry(14, 'demo-6', 'Cloud Hosting & Software Tools', 'Software', -4500),
    createEntry(18, 'demo-7', 'Pharmacy & Health Wellness', 'Health', -3600),
    createEntry(22, 'demo-8', 'Fuel & Transport Costs', 'Transport', -7500),
    createEntry(35, 'demo-9', 'Previous Month Salary', 'Salary', 185000),
    createEntry(40, 'demo-10', 'Apartment Rent Payment', 'Rent & Utilities', -45000),
    createEntry(45, 'demo-11', 'Stock Dividend Payout', 'Investment', 14000),
    createEntry(50, 'demo-12', 'Electronics & Accessories', 'Shopping', -22000),
    createEntry(65, 'demo-13', 'Bonus Salary Credit', 'Salary', 185000),
    createEntry(70, 'demo-14', 'Apartment Rent Payment', 'Rent & Utilities', -45000),
    createEntry(75, 'demo-15', 'Freelance Mobile App Design', 'Freelance', 48000),
  ];
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-welcome',
    type: 'success',
    title: 'Welcome to FinTrack!',
    message: 'You are currently viewing FinTrack in Guest Preview mode. Explore the dashboard, charts, and analytics freely.',
    time: 'Just now'
  },
  {
    id: 'demo-action-hint',
    type: 'alert',
    title: 'Ready to Track Your Money?',
    message: 'Click "+ Add Transaction" or "Sign In" anytime to start logging your real transactions.',
    time: '10m ago'
  },
  {
    id: 'demo-analytics-info',
    type: 'warning',
    title: 'Interactive Analytics Active',
    message: 'Check out the Analytics tab to view categorical breakdown and monthly savings performance.',
    time: 'Today'
  }
];
