// --- 1. FULL ACCOUNT STATE (Income - Expenses = Balance) ---
    let activeTab = 'home'; // 'home' | 'expenses' | 'categories'
    let activePeriod = 'current'; // 'current' | '3m' | '6m' | '1y'
    let logType = 'expense'; // 'expense' | 'income'
    let filterLedgerType = 'all'; // 'all' | 'income' | 'expense'
    let selectedCategory = 'All'; // 'All' or category.id
    let searchQuery = '';
    let sortBy = 'newest';
    let billingMode = 'amortized'; // 'amortized' | 'full'
    
    let doughnutChartInstance = null;
    let comparisonChartInstance = null;

    // Color palette for category recolouring
    const colorPalette = [
      '#4f46e5', // Indigo
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#ef4444', // Red
      '#14b8a6'  // Teal
    ];

    // Multi-Account State: Regular Expense vs Personal Account vs Both
    let activeAccount = 'regular'; // 'regular' | 'personal' | 'both'

    // Expense Categories partitioned by Account (Regular vs Personal)
    let categories = [
      // Regular Expense Account Categories (Total ₹25,000)
      { id: 'cat-home',  accountId: 'regular',  name: 'Home & Utilities', icon: '🏠', color: '#4f46e5', budget: 10000 },
      { id: 'cat-groc',  accountId: 'regular',  name: 'Groceries',        icon: '🛒', color: '#10b981', budget: 7000 },
      { id: 'cat-trans', accountId: 'regular',  name: 'Transport',        icon: '🚕', color: '#f59e0b', budget: 3500 },
      { id: 'cat-subs',  accountId: 'regular',  name: 'Subscriptions',    icon: '📱', color: '#8b5cf6', budget: 2500 },
      { id: 'cat-other', accountId: 'regular',  name: 'Other Regular',    icon: '✨', color: '#ec4899', budget: 2000 },

      // Personal Account Categories (Total ₹25,000)
      { id: 'cat-per-sip',  accountId: 'personal', name: 'Savings & SIP',            icon: '📈', color: '#0d9488', budget: 12000 },
      { id: 'cat-per-emg',  accountId: 'personal', name: 'Emergency Fund',          icon: '🛡️', color: '#0284c7', budget: 5000 },
      { id: 'cat-per-shop', accountId: 'personal', name: 'Personal Shopping & Tech', icon: '🛍️', color: '#d97706', budget: 4000 },
      { id: 'cat-per-self', accountId: 'personal', name: 'Self Care & Health',       icon: '🧘', color: '#7c3aed', budget: 2500 },
      { id: 'cat-per-oth',  accountId: 'personal', name: 'Other Personal',          icon: '✨', color: '#db2777', budget: 1500 }
    ];

    // Income Sources
    const incomeSources = [
      { id: 'inc-sal',  name: 'Primary Salary',   icon: '💼', color: '#10b981' },
      { id: 'inc-rent', name: 'Rental Property',  icon: '🏢', color: '#06b6d4' },
      { id: 'inc-free', name: 'Freelance & Extra',icon: '💻', color: '#8b5cf6' },
      { id: 'inc-inv',  name: 'Dividends & Yield',icon: '📈', color: '#f59e0b' },
      { id: 'inc-oth',  name: 'Other Inflow',     icon: '💰', color: '#64748b' }
    ];

    let editingCategoryId = null;
    let selectedEditColor = colorPalette[0];

    // Recurring Bills
    let recurringBills = [
      // Regular Expense Recurring Bills
      { id: 'bill-1', accountId: 'regular', title: 'Society Maintenance Fee', amount: 3500, cycleMonths: 1, categoryId: 'cat-home', dueDay: '5th', paid: true, linkedExpenseId: 1 },
      { id: 'bill-2', accountId: 'regular', title: 'Electricity & Water Bill', amount: 1850, cycleMonths: 1, categoryId: 'cat-home', dueDay: '12th', paid: true, linkedExpenseId: 2 },
      { id: 'bill-3', accountId: 'regular', title: 'Mobile Recharge (3-Month Pack)', amount: 900, cycleMonths: 3, categoryId: 'cat-subs', dueDay: '18th', paid: true, linkedExpenseId: 6 },
      { id: 'bill-4', accountId: 'regular', title: 'Water Purifier Filter AMC', amount: 1800, cycleMonths: 6, categoryId: 'cat-home', dueDay: '25th', paid: false, linkedExpenseId: null },
      { id: 'bill-5', accountId: 'regular', title: 'Cooking Gas / Cylinder Refill', amount: 950, cycleMonths: 1, categoryId: 'cat-home', dueDay: '28th', paid: false, linkedExpenseId: null },

      // Personal Account Recurring Commitments (SIP, Emergency, Annual Insurance)
      { id: 'bill-p1', accountId: 'personal', title: 'Index Mutual Fund SIP', amount: 10000, cycleMonths: 1, categoryId: 'cat-per-sip', dueDay: '5th', paid: true, linkedExpenseId: 203 },
      { id: 'bill-p2', accountId: 'personal', title: 'Emergency Fund Monthly Deposit', amount: 5000, cycleMonths: 1, categoryId: 'cat-per-emg', dueDay: '5th', paid: true, linkedExpenseId: 204 },
      { id: 'bill-p3', accountId: 'personal', title: 'Annual Health & Life Cover', amount: 18000, cycleMonths: 12, categoryId: 'cat-per-self', dueDay: '15th', paid: false, linkedExpenseId: null }
    ];

    // Month-by-Month Transactions:
    // November 2026 has active details; December 2026 starts clean & empty; October 2026 retains archived records!
    let transactions = [
      // --- NOVEMBER 2026 (CURRENT ACTIVE MONTH) ---
      // Regular Expense Account
      { id: 301, accountId: 'regular', type: 'income', title: 'Monthly Salary Credit', amount: 55000, categoryId: 'inc-sal', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 302, accountId: 'regular', type: 'income', title: 'Rental Property Return', amount: 10000, categoryId: 'inc-rent', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 303, accountId: 'regular', type: 'expense', title: 'Society Maintenance Fee', amount: 3500, categoryId: 'cat-home', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 304, accountId: 'regular', type: 'expense', title: 'Monthly Grocery Stock', amount: 4500, categoryId: 'cat-groc', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 305, accountId: 'regular', type: 'expense', title: 'Mobile Recharge (1/3 mo share)', amount: 300, categoryId: 'cat-subs', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 306, accountId: 'regular', type: 'expense', title: 'Metro Smart Card Recharge', amount: 1000, categoryId: 'cat-trans', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 307, accountId: 'regular', type: 'expense', title: 'Office Courier Expense', amount: 650, categoryId: 'cat-other', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026', isReimbursable: true, reimbursableSource: 'office', reimbursementStatus: 'pending' },

      // Personal Account
      { id: 401, accountId: 'personal', type: 'income', title: 'Monthly Personal Allocation (From Salary)', amount: 25000, categoryId: 'inc-sal', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 402, accountId: 'personal', type: 'income', title: 'Monthly Dividend Return', amount: 1800, categoryId: 'inc-inv', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 403, accountId: 'personal', type: 'expense', title: 'Index Mutual Fund SIP', amount: 10000, categoryId: 'cat-per-sip', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 404, accountId: 'personal', type: 'expense', title: 'Emergency Fund Safety Deposit', amount: 5000, categoryId: 'cat-per-emg', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },
      { id: 405, accountId: 'personal', type: 'expense', title: 'Fitness Gym & Wellness', amount: 1500, categoryId: 'cat-per-self', date: 'Nov 01', isoDate: '2026-11-01', monthYear: 'Nov 2026' },

      // --- OCTOBER 2026 (PAST MONTH ARCHIVE) ---
      { id: 101, accountId: 'regular', type: 'income', title: 'Monthly Salary Credit', amount: 55000, categoryId: 'inc-sal', date: 'Oct 01', isoDate: '2026-10-01', monthYear: 'Oct 2026' },
      { id: 102, accountId: 'regular', type: 'income', title: 'Rental Apartment Income', amount: 10000, categoryId: 'inc-rent', date: 'Oct 05', isoDate: '2026-10-05', monthYear: 'Oct 2026' },
      { id: 1,   accountId: 'regular', type: 'expense', title: 'Society Maintenance Fee', amount: 3500, categoryId: 'cat-home', date: 'Oct 05', isoDate: '2026-10-05', monthYear: 'Oct 2026' },
      { id: 7,   accountId: 'regular', type: 'expense', title: 'Office Stationery & Courier', amount: 1000, categoryId: 'cat-other', date: 'Oct 08', isoDate: '2026-10-08', monthYear: 'Oct 2026', isReimbursable: true, reimbursableSource: 'office', reimbursementStatus: 'settled' },
      { id: 2,   accountId: 'regular', type: 'expense', title: 'Electricity & Water Bill', amount: 1850, categoryId: 'cat-home', date: 'Oct 12', isoDate: '2026-10-12', monthYear: 'Oct 2026' },
      { id: 3,   accountId: 'regular', type: 'expense', title: 'Monthly Grocery Stock', amount: 4200, categoryId: 'cat-groc', date: 'Oct 18', isoDate: '2026-10-18', monthYear: 'Oct 2026' },
      { id: 6,   accountId: 'regular', type: 'expense', title: 'Mobile Recharge (3-Month Pack) (1/3 mo share)', amount: 300, categoryId: 'cat-subs', date: 'Oct 18', isoDate: '2026-10-18', monthYear: 'Oct 2026' },
      { id: 8,   accountId: 'regular', type: 'expense', title: 'Paid for Friend (Lunch & Movie Ticket)', amount: 850, categoryId: 'cat-other', date: 'Oct 20', isoDate: '2026-10-20', monthYear: 'Oct 2026', isReimbursable: true, reimbursableSource: 'friend', reimbursementStatus: 'settled' },
      { id: 5,   accountId: 'regular', type: 'expense', title: 'Metro Card & Auto Rides', amount: 1250, categoryId: 'cat-trans', date: 'Oct 25', isoDate: '2026-10-25', monthYear: 'Oct 2026' },
      { id: 201, accountId: 'personal', type: 'income', title: 'Monthly Personal Allocation (From Salary)', amount: 25000, categoryId: 'inc-sal', date: 'Oct 02', isoDate: '2026-10-02', monthYear: 'Oct 2026' },
      { id: 202, accountId: 'personal', type: 'income', title: 'Dividends & Yield Returns', amount: 2400, categoryId: 'inc-inv', date: 'Oct 10', isoDate: '2026-10-10', monthYear: 'Oct 2026' },
      { id: 203, accountId: 'personal', type: 'expense', title: 'Index Mutual Fund SIP', amount: 10000, categoryId: 'cat-per-sip', date: 'Oct 05', isoDate: '2026-10-05', monthYear: 'Oct 2026' },
      { id: 204, accountId: 'personal', type: 'expense', title: 'Emergency Fund Safety Deposit', amount: 5000, categoryId: 'cat-per-emg', date: 'Oct 05', isoDate: '2026-10-05', monthYear: 'Oct 2026' },
      { id: 205, accountId: 'personal', type: 'expense', title: 'Noise Cancelling Headphones', amount: 3200, categoryId: 'cat-per-shop', date: 'Oct 14', isoDate: '2026-10-14', monthYear: 'Oct 2026' },
      { id: 206, accountId: 'personal', type: 'expense', title: 'Health Supplements & Books', amount: 1100, categoryId: 'cat-per-self', date: 'Oct 22', isoDate: '2026-10-22', monthYear: 'Oct 2026' }
      // NOTE: December 2026 starts completely empty and clean, ready for new entries!
    ];

    // Dedicated Historical Months for Personal Account
    const personalHistoricalMonths = [
      { monthKey: 'Nov 2025', label: 'Nov 25', income: 25000, totalSpent: 19500, varianceNote: 'Good personal savings' },
      { monthKey: 'Dec 2025', label: 'Dec 25', income: 28000, totalSpent: 21800, varianceNote: 'Year-end bonus allocation' },
      { monthKey: 'Jan 2026', label: 'Jan 26', income: 25000, totalSpent: 19800, varianceNote: 'SIP & Emergency on track' },
      { monthKey: 'Feb 2026', label: 'Feb 26', income: 25000, totalSpent: 18200, varianceNote: 'High savings month' },
      { monthKey: 'Mar 2026', label: 'Mar 26', income: 27000, totalSpent: 20100, varianceNote: 'Surplus invested' },
      { monthKey: 'Apr 2026', label: 'Apr 26', income: 25000, totalSpent: 19600, varianceNote: 'Steady allocations' },
      { monthKey: 'May 2026', label: 'May 26', income: 25000, totalSpent: 19900, varianceNote: 'Consistent wealth fund' },
      { monthKey: 'Jun 2026', label: 'Jun 26', income: 26000, totalSpent: 19200, varianceNote: 'Quarterly yield received' },
      { monthKey: 'Jul 2026', label: 'Jul 26', income: 25000, totalSpent: 20400, varianceNote: 'Personal gadgets outlay' },
      { monthKey: 'Aug 2026', label: 'Aug 26', income: 25000, totalSpent: 19500, varianceNote: 'Steady monthly SIP' },
      { monthKey: 'Sep 2026', label: 'Sep 26', income: 25000, totalSpent: 19800, varianceNote: 'Surplus intact' },
      { monthKey: 'Oct 2026', label: 'Oct 26', income: 65000, totalSpent: 11100, varianceNote: 'Completed Month' },
      { monthKey: 'Nov 2026', label: 'Nov 26', income: null,  totalSpent: null,  varianceNote: 'Current Live Month' }
    ];

    // Historical Monthly Accounts Data for Regular Expense Account
    const historicalMonths = [
      { monthKey: 'Nov 2025', label: 'Nov 25', income: 65000, totalSpent: 21200, varianceNote: 'Good balance' },
      { monthKey: 'Dec 2025', label: 'Dec 25', income: 68000, totalSpent: 24800, varianceNote: 'Year-end bonus & upkeep' },
      { monthKey: 'Jan 2026', label: 'Jan 26', income: 65000, totalSpent: 22400, varianceNote: 'Steady balance' },
      { monthKey: 'Feb 2026', label: 'Feb 26', income: 65000, totalSpent: 19800, varianceNote: 'High savings month' },
      { monthKey: 'Mar 2026', label: 'Mar 26', income: 67000, totalSpent: 23100, varianceNote: 'Tax refund + consulting' },
      { monthKey: 'Apr 2026', label: 'Apr 26', income: 65000, totalSpent: 24200, varianceNote: 'Summer AC usage' },
      { monthKey: 'May 2026', label: 'May 26', income: 65000, totalSpent: 22600, varianceNote: 'Consistent surplus' },
      { monthKey: 'Jun 2026', label: 'Jun 26', income: 66000, totalSpent: 21900, varianceNote: 'Dividends received' },
      { monthKey: 'Jul 2026', label: 'Jul 26', income: 65000, totalSpent: 25800, varianceNote: 'Home repair outlay' },
      { monthKey: 'Aug 2026', label: 'Aug 26', income: 65000, totalSpent: 21500, varianceNote: 'Steady surplus' },
      { monthKey: 'Sep 2026', label: 'Sep 26', income: 65000, totalSpent: 23800, varianceNote: 'Festival savings' },
      { monthKey: 'Oct 2026', label: 'Oct 26', income: 65000, totalSpent: 11100, varianceNote: 'Completed Month' },
      { monthKey: 'Nov 2026', label: 'Nov 26', income: null,  totalSpent: null,  varianceNote: 'Current Live Month' }
    ];

    const cycleBadges = {
      1:  { label: 'Monthly',   short: '1M',  color: 'bg-slate-100 text-slate-600' },
      3:  { label: 'Every 3M',  short: '3M',  color: 'bg-violet-100 text-violet-700' },
      6:  { label: 'Every 6M',  short: '6M',  color: 'bg-sky-100 text-sky-700' },
      12: { label: 'Yearly',    short: '12M', color: 'bg-amber-100 text-amber-800' }
    };

    // --- 2. DOM ELEMENTS ---
    const headerTabSubtitle = document.getElementById('headerTabSubtitle');
    const netBalanceDisplay = document.getElementById('netBalanceDisplay');
    const savingsRateBadge = document.getElementById('savingsRateBadge');
    const totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
    const totalSpentDisplay = document.getElementById('totalSpentDisplay');
    const budgetLimitDisplay = document.getElementById('budgetLimitDisplay');
    const budgetProgressBar = document.getElementById('budgetProgressBar');
    const budgetPercentageText = document.getElementById('budgetPercentageText');
    const remainingBalanceText = document.getElementById('remainingBalanceText');
    const goToCategoriesFromHeaderBtn = document.getElementById('goToCategoriesFromHeaderBtn');

    // Equation breakdown elements
    const eqIncomeText = document.getElementById('eqIncomeText');
    const eqExpenseText = document.getElementById('eqExpenseText');
    const eqBalanceText = document.getElementById('eqBalanceText');

    // Views & Navigation
    const viewHome = document.getElementById('view-home');
    const viewExpenses = document.getElementById('view-expenses');
    const viewCategories = document.getElementById('view-categories');
    const navTabHome = document.getElementById('navTabHome');
    const navTabExpenses = document.getElementById('navTabExpenses');
    const navTabCategories = document.getElementById('navTabCategories');
    const jumpToCategoriesBtn = document.getElementById('jumpToCategoriesBtn');

    // Period Switcher Elements
    const periodCurrentBtn = document.getElementById('periodCurrentBtn');
    const period3MBtn = document.getElementById('period3MBtn');
    const period6MBtn = document.getElementById('period6MBtn');
    const period1YBtn = document.getElementById('period1YBtn');
    const currentMonthDashboardPanel = document.getElementById('currentMonthDashboardPanel');
    const comparisonReportPanel = document.getElementById('comparisonReportPanel');

    // Comparison Report Elements
    const comparisonReportHeading = document.getElementById('comparisonReportHeading');
    const comparisonReportSubheading = document.getElementById('comparisonReportSubheading');
    const exportReportCsvBtn = document.getElementById('exportReportCsvBtn');
    const kpiTotalIncome = document.getElementById('kpiTotalIncome');
    const kpiTotalSpent = document.getElementById('kpiTotalSpent');
    const kpiMonthlyAvg = document.getElementById('kpiMonthlyAvg');
    const kpiNetSavings = document.getElementById('kpiNetSavings');
    const reportTopCategoryBadge = document.getElementById('reportTopCategoryBadge');
    const reportCategoryBarsList = document.getElementById('reportCategoryBarsList');
    const reportMonthlyTable = document.getElementById('reportMonthlyTable');
    const comparisonChartCanvas = document.getElementById('comparisonChartCanvas');

    // Home & Doughnut Chart Elements
    const categoryLegendList = document.getElementById('categoryLegendList');
    const topCategoryBadge = document.getElementById('topCategoryBadge');
    const emptyChartMessage = document.getElementById('emptyChartMessage');
    const chartCanvas = document.getElementById('categoryChart');

    // Recurring Bills Elements
    const recurringBillsList = document.getElementById('recurringBillsList');
    const billsStatusBadge = document.getElementById('billsStatusBadge');
    const toggleAddBillFormBtn = document.getElementById('toggleAddBillFormBtn');
    const customBillForm = document.getElementById('customBillForm');
    const billTitleInput = document.getElementById('billTitleInput');
    const billAmountInput = document.getElementById('billAmountInput');
    const billCycleSelect = document.getElementById('billCycleSelect');
    const billCategorySelect = document.getElementById('billCategorySelect');
    const billDueInput = document.getElementById('billDueInput');
    const customBillPreviewText = document.getElementById('customBillPreviewText');
    const modeMonthlySetAsideBtn = document.getElementById('modeMonthlySetAsideBtn');
    const modeFullPaymentBtn = document.getElementById('modeFullPaymentBtn');
    const cycleModeHelperText = document.getElementById('cycleModeHelperText');

    // Ledger / Transactions Tab Elements
    const logTypeExpenseBtn = document.getElementById('logTypeExpenseBtn');
    const logTypeIncomeBtn = document.getElementById('logTypeIncomeBtn');
    const txTitleLabel = document.getElementById('txTitleLabel');
    const txCategoryLabel = document.getElementById('txCategoryLabel');
    const txSubmitBtn = document.getElementById('txSubmitBtn');
    const expenseForm = document.getElementById('expenseForm');
    const expenseTitle = document.getElementById('expenseTitle');
    const expenseAmount = document.getElementById('expenseAmount');
    const expenseCategory = document.getElementById('expenseCategory');
    const filterTypeAllBtn = document.getElementById('filterTypeAllBtn');
    const filterTypeIncomeBtn = document.getElementById('filterTypeIncomeBtn');
    const filterTypeExpenseBtn = document.getElementById('filterTypeExpenseBtn');
    const categoryFilterBar = document.getElementById('categoryFilterBar');
    const searchExpenseInput = document.getElementById('searchExpenseInput');
    const sortExpenseSelect = document.getElementById('sortExpenseSelect');
    const expenseList = document.getElementById('expenseList');
    const itemCountBadge = document.getElementById('itemCountBadge');

    // Categories Tab Elements
    const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');
    const categoryBudgetsTotalText = document.getElementById('categoryBudgetsTotalText');
    const categoryEditorCard = document.getElementById('categoryEditorCard');
    const categoryEditorHeading = document.getElementById('categoryEditorHeading');
    const cancelCategoryEditBtn = document.getElementById('cancelCategoryEditBtn');
    const categoryEditForm = document.getElementById('categoryEditForm');
    const catEditIconInput = document.getElementById('catEditIconInput');
    const catEditNameInput = document.getElementById('catEditNameInput');
    const catEditBudgetInput = document.getElementById('catEditBudgetInput');
    const colorSwatchPicker = document.getElementById('colorSwatchPicker');
    const categoriesManagerList = document.getElementById('categoriesManagerList');

    // --- 3. HELPER FUNCTIONS ---
    function formatCurrency(num) {
      return '₹' + Math.round(Number(num)).toLocaleString('en-IN');
    }

    // --- STRICT TWO-ACCOUNT & ACTIVE MONTH FILTERING HELPERS ---
    function getSelectedMonthName() {
      if (typeof currentMonthIndex === 'number' && availableMonths[currentMonthIndex]) {
        return availableMonths[currentMonthIndex];
      }
      return 'Nov 2026';
    }

    function getTxMonthYear(tx) {
      if (tx.monthYear) return tx.monthYear;
      if (tx.isoDate) {
        const parts = tx.isoDate.split('-');
        if (parts.length === 3) {
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) return `${monthNames[mIdx]} ${parts[0]}`;
        }
      }
      if (tx.date) {
        const prefix = tx.date.slice(0, 3);
        const valid = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        if (valid.includes(prefix)) {
          return `${prefix} 2026`;
        }
      }
      return 'Nov 2026';
    }

    function getActiveCategories() {
      return categories.filter((c) => c.accountId === activeAccount);
    }

    // Returns transactions belonging to the active account AND the currently selected month (Nov 2026, Dec 2026, etc.)
    function getActiveTransactions() {
      const activeMonth = getSelectedMonthName();
      return transactions.filter((t) => {
        const matchesAccount = t.accountId === activeAccount;
        const matchesMonth = getTxMonthYear(t) === activeMonth;
        return matchesAccount && matchesMonth;
      });
    }

    // Overall monthly expense budget strictly synced with the sum of category budgets for the active account
    function getOverallBudget() {
      return getActiveCategories().reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    }

    // Current Month Totals filtered by active account
    function getMonthIncome() {
      return getActiveTransactions()
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    }

    function getMonthExpenses() {
      return getActiveTransactions()
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => {
          if (t.isReimbursable && t.reimbursementStatus === 'settled') {
            return sum;
          }
          return sum + t.amount;
        }, 0);
    }

    function getAnyCategoryById(catId) {
      const expCat = categories.find((c) => c.id === catId);
      if (expCat) return expCat;
      const incCat = incomeSources.find((i) => i.id === catId);
      if (incCat) return incCat;
      return {
        id: 'cat-fallback',
        name: 'General',
        icon: '💵',
        color: '#64748b',
        budget: 0
      };
    }

    function getCategorySpentMap() {
      const totals = {};
      getActiveCategories().forEach((c) => { totals[c.id] = 0; });
      getActiveTransactions()
        .filter((t) => t.type === 'expense')
        .forEach((item) => {
          if (totals[item.categoryId] !== undefined) {
            if (!(item.isReimbursable && item.reimbursementStatus === 'settled')) {
              totals[item.categoryId] += item.amount;
            }
          }
        });
      return totals;
    }

    function getEffectiveBillAmount(bill) {
      if (billingMode === 'amortized' && bill.cycleMonths > 1) {
        return Math.round(bill.amount / bill.cycleMonths);
      }
      return bill.amount;
    }

    function getEffectiveBillTitle(bill) {
      if (billingMode === 'amortized' && bill.cycleMonths > 1) {
        return `${bill.title} (1/${bill.cycleMonths} mo share)`;
      }
      return bill.title;
    }

    function syncPaidRecurringBillsWithMode() {
      recurringBills.forEach((bill) => {
        if (bill.paid && bill.linkedExpenseId !== null) {
          const exp = transactions.find((e) => e.id === bill.linkedExpenseId);
          if (exp) {
            exp.amount = getEffectiveBillAmount(bill);
            exp.title = getEffectiveBillTitle(bill);
          }
        }
      });
    }

    // Switch active bottom tab (Home, Expenses, Categories)
    function switchTab(tabName) {
      activeTab = tabName;
      viewHome.classList.toggle('hidden', tabName !== 'home');
      viewExpenses.classList.toggle('hidden', tabName !== 'expenses');
      viewCategories.classList.toggle('hidden', tabName !== 'categories');

      const tabTitles = {
        home: 'Dashboard • Monthly Account',
        expenses: 'Expenses • Monthly Ledger',
        categories: 'Categories • Budgets & Limits'
      };
      headerTabSubtitle.textContent = tabTitles[tabName] || 'Dashboard • Overview';

      const navButtons = [
        { el: navTabHome, id: 'home' },
        { el: navTabExpenses, id: 'expenses' },
        { el: navTabCategories, id: 'categories' }
      ];
      navButtons.forEach(({ el, id }) => {
        if (id === tabName) {
          el.className = 'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl text-indigo-600 bg-indigo-50 font-semibold transition';
        } else {
          el.className = 'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl text-slate-400 hover:text-slate-700 font-medium transition';
        }
      });

      renderDashboard();
    }

    // Switch Period (Current, 3M, 6M, 1Y)
    function switchPeriod(period) {
      activePeriod = period;

      const buttons = [
        { el: periodCurrentBtn, id: 'current' },
        { el: period3MBtn, id: '3m' },
        { el: period6MBtn, id: '6m' },
        { el: period1YBtn, id: '1y' }
      ];

      buttons.forEach(({ el, id }) => {
        if (id === period) {
          el.className = 'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-white text-indigo-700 shadow-sm';
        } else {
          el.className = 'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition text-slate-600 hover:text-slate-800';
        }
      });

      const isCurrent = period === 'current';
      currentMonthDashboardPanel.classList.toggle('hidden', !isCurrent);
      comparisonReportPanel.classList.toggle('hidden', isCurrent);

      renderDashboard();
    }

    // Set Log Type (Expense vs Income)
    // Helper: update visibility of reimbursableRow based on account and transaction type
    function updateReimbursementVisibility() {
      const reimbRow = document.getElementById('reimbursableRow');
      const isPersonal = activeAccount === 'personal';
      if (reimbRow) {
        if (logType === 'expense' && !isPersonal) {
          reimbRow.classList.remove('hidden');
        } else {
          reimbRow.classList.add('hidden');
          const cb = document.getElementById('isReimbursableCheckbox');
          if (cb) cb.checked = false;
        }
      }
    }

    function setLogType(type) {
      logType = type;
      updateReimbursementVisibility();
      if (type === 'expense') {
        logTypeExpenseBtn.className = 'px-3 py-1 rounded-md transition bg-white text-rose-700 shadow-sm font-semibold';
        logTypeIncomeBtn.className = 'px-3 py-1 rounded-md transition text-slate-600 hover:text-slate-900 font-medium';
        txTitleLabel.textContent = 'Expense Description';
        expenseTitle.placeholder = activeAccount === 'personal'
          ? 'e.g., SIP Investment, Gadgets, Health'
          : 'e.g., Plumber Repair, Monthly Groceries';
        txCategoryLabel.textContent = 'Expense Category';
        txSubmitBtn.className = 'w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-1.5';
        txSubmitBtn.innerHTML = '<span>+ Add to Monthly Log</span>';
      } else {
        logTypeIncomeBtn.className = 'px-3 py-1 rounded-md transition bg-white text-emerald-700 shadow-sm font-semibold';
        logTypeExpenseBtn.className = 'px-3 py-1 rounded-md transition text-slate-600 hover:text-slate-900 font-medium';
        txTitleLabel.textContent = 'Income Source / Title';
        expenseTitle.placeholder = activeAccount === 'personal'
          ? 'e.g., Personal Allocation from Salary, Dividend, Gift'
          : 'e.g., Salary Credit, Rental Payment, Consulting';
        txCategoryLabel.textContent = 'Income Category';
        txSubmitBtn.className = 'w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-1.5';
        txSubmitBtn.innerHTML = '<span>+ Record Income</span>';
      }
      populateCategorySelects();
    }

    // Populate Category <select> dropdowns based on chosen account & transaction type
    function populateCategorySelects() {
      const targetAccount = activeAccount;

      expenseCategory.innerHTML = '';
      billCategorySelect.innerHTML = '';

      if (logType === 'expense') {
        const selectableCats = categories.filter((c) => !c.accountId || c.accountId === targetAccount);
        selectableCats.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = `${cat.icon} ${cat.name}`;
          expenseCategory.appendChild(opt);
        });
      } else {
        incomeSources.forEach((inc) => {
          const opt = document.createElement('option');
          opt.value = inc.id;
          opt.textContent = `${inc.icon} ${inc.name}`;
          expenseCategory.appendChild(opt);
        });
      }

      // Populate recurring bills categories based on active account (Regular vs Personal!)
      const recurringTargetAccount = activeAccount === 'both' ? 'regular' : activeAccount;
      const recurringCats = categories.filter((c) => !c.accountId || c.accountId === recurringTargetAccount);
      recurringCats.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.icon} ${cat.name}`;
        billCategorySelect.appendChild(opt);
      });
    }

    // --- 4. RENDER CURRENT MONTH DOUGHNUT CHART & HOME SNAPSHOT ---
    function updateCategoryBreakdown(totalSpent, totalsByCategory) {
      const currentCats = getActiveCategories();
      const activeCats = currentCats.filter((c) => (totalsByCategory[c.id] || 0) > 0);

      if (activeCats.length === 0) {
        topCategoryBadge.textContent = 'No data yet';
        emptyChartMessage.classList.remove('hidden');
        chartCanvas.classList.add('opacity-0');
      } else {
        emptyChartMessage.classList.add('hidden');
        chartCanvas.classList.remove('opacity-0');
        const topCat = activeCats.reduce((a, b) =>
          totalsByCategory[a.id] >= totalsByCategory[b.id] ? a : b
        );
        topCategoryBadge.textContent = `Top: ${topCat.icon} ${topCat.name}`;
      }

      const labels = activeCats.map((c) => c.name);
      const dataValues = activeCats.map((c) => totalsByCategory[c.id]);
      const bgColors = activeCats.map((c) => c.color);

      if (!doughnutChartInstance) {
        doughnutChartInstance = new Chart(chartCanvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: dataValues,
              backgroundColor: bgColors,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '66%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw || 0;
                    const pct = totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0;
                    return ` ${formatCurrency(value)} (${pct}%)`;
                  }
                }
              }
            }
          }
        });
      } else {
        doughnutChartInstance.data.labels = labels;
        doughnutChartInstance.data.datasets[0].data = dataValues;
        doughnutChartInstance.data.datasets[0].backgroundColor = bgColors;
        doughnutChartInstance.update();
      }

      categoryLegendList.innerHTML = '';
      getActiveCategories().forEach((cat) => {
        const catTotal = totalsByCategory[cat.id] || 0;
        const catBudget = cat.budget || 1;
        const budgetPct = Math.min(Math.round((catTotal / catBudget) * 100), 100);
        const isOver = catTotal > catBudget;

        const itemEl = document.createElement('button');
        itemEl.type = 'button';
        itemEl.className = 'w-full p-1.5 rounded-lg text-left hover:bg-slate-50 transition block';
        itemEl.innerHTML = `
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${cat.color}"></span>
              <span class="font-medium text-slate-700 truncate">${cat.name}</span>
            </div>
            <span class="font-semibold ${isOver ? 'text-rose-600' : 'text-slate-800'} shrink-0 ml-1">
              ${formatCurrency(catTotal)} <span class="text-[10px] font-normal text-slate-400">/ ${formatCurrency(cat.budget)}</span>
            </span>
          </div>
          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300" style="width: ${budgetPct}%; background-color: ${isOver ? '#f43f5e' : cat.color}"></div>
          </div>
        `;
        itemEl.addEventListener('click', () => {
          selectedCategory = cat.id;
          filterLedgerType = 'expense';
          switchTab('expenses');
        });
        categoryLegendList.appendChild(itemEl);
      });
    }

    // --- 5. RENDER 3 MONTHS, 6 MONTHS & 1 YEAR CATEGORY-WISE COMPARISONS ---
    function renderComparisonReports(currentMonthSpent, currentMonthIncome) {
      if (activePeriod === 'current') return;

      let sliceCount = 3;
      let title = '3 Months Category Comparison';
      let sub = 'August 2026 – October 2026';

      if (activePeriod === '6m') {
        sliceCount = 6;
        title = '6 Months Category Comparison';
        sub = 'May 2026 – October 2026';
      } else if (activePeriod === '1y') {
        sliceCount = 12;
        title = '1 Year Annual Category Report';
        sub = 'November 2025 – October 2026 (Category-Wise Breakdown)';
      }

      comparisonReportHeading.textContent = title;
      comparisonReportSubheading.textContent = sub;

      // Real live category totals for October 2026
      const liveOctCategoryTotals = getCategorySpentMap();

      // Total category budget benchmark
      const totalBudget = getOverallBudget() || 1;

      // Construct category breakdown for each month in the selected horizon
      const activeHistSource = activeAccount === 'personal' ? personalHistoricalMonths : historicalMonths;
      const isFreshClearedMode = window._isFreshClearedMode === true || transactions.length === 0;
      const selectedMonths = activeHistSource.slice(-sliceCount).map((m) => {
        // Compute actual transactions logged for this month & account
        const monthTxs = transactions.filter((t) => t.accountId === activeAccount && getTxMonthYear(t) === m.monthKey);
        const realMonthIncome = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const realMonthSpent = monthTxs.filter((t) => t.type === 'expense' && !(t.isReimbursable && t.reimbursementStatus === 'settled')).reduce((sum, t) => sum + t.amount, 0);

        const hasRealData = monthTxs.length > 0 || m.monthKey === 'Oct 2026' || m.monthKey === 'Nov 2026' || isFreshClearedMode;
        const inc = hasRealData ? realMonthIncome : (m.income || 0);
        const sp = hasRealData ? realMonthSpent : (m.totalSpent || 0);

        // Calculate category breakdown for this month
        const catMap = {};
        if (hasRealData) {
          categories.forEach((c) => { catMap[c.id] = 0; });
          monthTxs.filter((t) => t.type === 'expense' && !(t.isReimbursable && t.reimbursementStatus === 'settled')).forEach((t) => {
            if (catMap[t.categoryId] !== undefined) {
              catMap[t.categoryId] += t.amount;
            }
          });
        } else {
          categories.forEach((c) => {
            const share = (c.budget || 0) / totalBudget;
            catMap[c.id] = Math.round(sp * share);
          });
        }

        return {
          ...m,
          income: inc,
          spent: sp,
          balance: inc - sp,
          catMap
        };
      });

      // KPI Totals (Remain intact and accurate as requested)
      const totalPeriodIncome = selectedMonths.reduce((sum, m) => sum + m.income, 0);
      const totalPeriodSpent = selectedMonths.reduce((sum, m) => sum + m.spent, 0);
      const avgMonthlySpent = Math.round(totalPeriodSpent / selectedMonths.length);
      const netPeriodBalance = totalPeriodIncome - totalPeriodSpent;

      kpiTotalIncome.textContent = formatCurrency(totalPeriodIncome);
      kpiTotalSpent.textContent = formatCurrency(totalPeriodSpent);
      kpiMonthlyAvg.textContent = `${formatCurrency(avgMonthlySpent)}/mo`;
      kpiNetSavings.textContent = (netPeriodBalance >= 0 ? '+' : '-') + formatCurrency(Math.abs(netPeriodBalance));

      // Category-Wise Stacked Bar Chart
      const chartLabels = selectedMonths.map((m) => m.label);

      // Create a dataset for each category in its exact custom color
      const currentReportCats = getActiveCategories();
      const categoryDatasets = currentReportCats.map((cat) => {
        return {
          type: 'bar',
          label: `${cat.icon} ${cat.name}`,
          data: selectedMonths.map((m) => m.catMap[cat.id] || 0),
          backgroundColor: cat.color,
          borderRadius: 4,
          maxBarThickness: 32
        };
      });

      // Render chart legend pills above the canvas
      const chartLegendPills = document.getElementById('chartLegendPills');
      if (chartLegendPills) {
        chartLegendPills.innerHTML = '';
        getActiveCategories().forEach((cat) => {
          const pill = document.createElement('span');
          pill.className = 'inline-flex items-center gap-1 font-medium text-slate-600';
          pill.innerHTML = `<span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${cat.color}"></span><span>${cat.name}</span>`;
          chartLegendPills.appendChild(pill);
        });
      }

      if (!comparisonChartInstance) {
        comparisonChartInstance = new Chart(comparisonChartCanvas, {
          data: {
            labels: chartLabels,
            datasets: categoryDatasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    return ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
                  },
                  footer: function(items) {
                    const monthTotal = items.reduce((sum, it) => sum + (it.raw || 0), 0);
                    return `Total: ${formatCurrency(monthTotal)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { size: 10 } }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: {
                  callback: function(v) { return '₹' + (v / 1000) + 'k'; },
                  font: { size: 10 }
                }
              }
            }
          }
        });
      } else {
        comparisonChartInstance.data.labels = chartLabels;
        comparisonChartInstance.data.datasets = categoryDatasets;
        comparisonChartInstance.options.scales.x.stacked = true;
        comparisonChartInstance.options.scales.y.stacked = true;
        comparisonChartInstance.update();
      }

      // Compute Total Spent per category across the selected period
      const periodCatTotals = getActiveCategories().map((cat) => {
        const totalCatSpent = selectedMonths.reduce((sum, m) => sum + (m.catMap[cat.id] || 0), 0);
        const catAvg = Math.round(totalCatSpent / selectedMonths.length);
        const catPeriodBudget = (cat.budget || 0) * selectedMonths.length;
        const catVariance = catPeriodBudget - totalCatSpent;
        return {
          ...cat,
          totalSpent: totalCatSpent,
          monthlyAvg: catAvg,
          periodBudget: catPeriodBudget,
          variance: catVariance
        };
      });

      const topReportCat = [...periodCatTotals].sort((a, b) => b.totalSpent - a.totalSpent)[0];
      if (topReportCat) {
        reportTopCategoryBadge.textContent = `Top Outflow: ${topReportCat.icon} ${topReportCat.name}`;
      }

      // Render Category Comparison Cards (Spent, Avg, Budget, Variance)
      reportCategoryBarsList.innerHTML = '';
      periodCatTotals.forEach((cat) => {
        const pct = totalPeriodSpent > 0 ? Math.round((cat.totalSpent / totalPeriodSpent) * 100) : 0;
        const budgetPct = cat.periodBudget > 0 ? Math.min(Math.round((cat.totalSpent / cat.periodBudget) * 100), 100) : 0;
        const isUnder = cat.variance >= 0;

        // Generate month-wise breakdown badges (e.g. Aug: ₹3,000, Sep: ₹2,500, Oct: ₹4,000)
        let monthChipsHtml = '';
        selectedMonths.forEach((m) => {
          const monthAmt = m.catMap[cat.id] || 0;
          const isLive = m.monthKey === 'Oct 2026';
          monthChipsHtml += `
            <div class="bg-white border ${isLive ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-slate-200'} rounded-lg px-2 py-1 text-center shrink-0 min-w-[64px] shadow-2xs">
              <div class="flex items-center justify-center gap-1">
                <span class="text-[9px] font-bold ${isLive ? 'text-indigo-600' : 'text-slate-400'} uppercase">${m.label}</span>
                ${isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>' : ''}
              </div>
              <span class="text-[11px] font-extrabold text-slate-800 block mt-0.5">${formatCurrency(monthAmt)}</span>
            </div>
          `;
        });

        const row = document.createElement('div');
        row.className = 'p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2';
        row.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white shadow-2xs" style="background-color: ${cat.color}">
                ${cat.icon}
              </span>
              <span class="text-xs sm:text-sm">${cat.name}</span>
            </span>
            <div class="text-right">
              <span class="font-extrabold text-slate-900 text-xs sm:text-sm">${formatCurrency(cat.totalSpent)}</span>
              <span class="text-[10px] text-slate-400 font-normal"> (${pct}% of period)</span>
            </div>
          </div>

          <!-- Progress Bar against Category Period Budget -->
          <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" style="width: ${budgetPct}%; background-color: ${isUnder ? cat.color : '#f43f5e'}"></div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Avg: <strong>${formatCurrency(cat.monthlyAvg)}/mo</strong> • Target: ${formatCurrency(cat.periodBudget)}</span>
            <span class="${isUnder ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}">
              ${isUnder ? '🟢 ' + formatCurrency(cat.variance) + ' saved' : '🔴 ' + formatCurrency(Math.abs(cat.variance)) + ' over'}
            </span>
          </div>

          <!-- Month-Wise Expense Breakdown Chips (Aug, Sep, Oct...) -->
          <div class="pt-2 border-t border-slate-200/60">
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              <span>Month-Wise Spending</span>
              <span>${selectedMonths.length} Months</span>
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              ${monthChipsHtml}
            </div>
          </div>
        `;
        reportCategoryBarsList.appendChild(row);
      });

      // Render Month-by-Month Statement Table with Category Highlights
      reportMonthlyTable.innerHTML = '';
      [...selectedMonths].reverse().forEach((m) => {
        const isSurplus = m.balance >= 0;
        
        // Find top category for this specific month
        let topMonthCatName = 'None';
        let topMonthCatAmt = 0;
        categories.forEach((cat) => {
          if ((m.catMap[cat.id] || 0) > topMonthCatAmt) {
            topMonthCatAmt = m.catMap[cat.id];
            topMonthCatName = `${cat.icon} ${cat.name}`;
          }
        });

        const row = document.createElement('div');
        row.className = 'py-2.5 flex items-center justify-between gap-2';
        row.innerHTML = `
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="font-semibold text-slate-800">${m.monthKey}</p>
              ${m.monthKey === 'Oct 2026' ? '<span class="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">Live</span>' : ''}
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">
              Spent: <span class="font-semibold text-slate-700">${formatCurrency(m.spent)}</span> • Top: <span class="text-slate-600 font-medium">${topMonthCatName} (${formatCurrency(topMonthCatAmt)})</span>
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-bold ${isSurplus ? 'text-indigo-900' : 'text-rose-600'}">
              ${isSurplus ? '+' : ''}${formatCurrency(m.balance)}
            </p>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSurplus ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
              ${isSurplus ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        `;
        reportMonthlyTable.appendChild(row);
      });
    }

    // Export CSV of the comparison report with Category-Wise Breakdown
    function exportReportCSV() {
      let sliceCount = activePeriod === '6m' ? 6 : (activePeriod === '1y' ? 12 : 3);
      const activeHistSource = activeAccount === 'personal' ? personalHistoricalMonths : historicalMonths;
      const selected = activeHistSource.slice(-sliceCount);
      const currentMonthSpent = getMonthExpenses();
      const currentMonthIncome = getMonthIncome();
      const liveOctCategoryTotals = getCategorySpentMap();
      const totalBudget = getOverallBudget() || 1;

      // Header row with category names
      const catHeaders = categories.map((c) => `"${c.name} (INR)"`).join(',');
      let csv = `Month,Total Income (INR),Total Spent (INR),${catHeaders},Net Balance (INR),Status\n`;

      selected.forEach((m) => {
        const inc = m.monthKey === 'Oct 2026' ? currentMonthIncome : m.income;
        const spent = m.monthKey === 'Oct 2026' ? currentMonthSpent : m.totalSpent;
        const bal = inc - spent;
        const status = bal >= 0 ? 'Surplus' : 'Deficit';

        const catValues = categories.map((c) => {
          if (m.monthKey === 'Oct 2026') return liveOctCategoryTotals[c.id] || 0;
          return Math.round(spent * ((c.budget || 0) / totalBudget));
        }).join(',');

        csv += `"${m.monthKey}",${inc},${spent},${catValues},${bal},"${status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MySmartPlan_Report_${activePeriod.toUpperCase()}_Oct2026.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // --- 6. RENDER RECURRING BILLS ---
    function renderRecurringBills() {
      // Filter recurring bills by active account
      const activeBills = activeAccount === 'both'
        ? recurringBills
        : recurringBills.filter((b) => !b.accountId || b.accountId === activeAccount);

      const paidCount = activeBills.filter((b) => b.paid).length;
      const pendingEffectiveTotal = activeBills
        .filter((b) => !b.paid)
        .reduce((sum, b) => sum + getEffectiveBillAmount(b), 0);

      billsStatusBadge.textContent = pendingEffectiveTotal > 0
        ? `${paidCount}/${activeBills.length} Active • ${formatCurrency(pendingEffectiveTotal)} Pending`
        : `All ${activeBills.length} Covered 🎉`;

      recurringBillsList.innerHTML = '';
      if (activeBills.length === 0) {
        recurringBillsList.innerHTML = `
          <div class="text-center py-4 px-3 rounded-xl border border-dashed border-indigo-200 text-slate-400 text-xs">
            No recurring commitments added for ${activeAccount === 'personal' ? 'Personal Account' : 'Regular Expense'}. Tap "+ Custom Bill" to add one!
          </div>
        `;
        return;
      }

      activeBills.forEach((bill) => {
        const badge = cycleBadges[bill.cycleMonths] || cycleBadges[1];
        const effectiveAmt = getEffectiveBillAmount(bill);
        const monthlyShare = Math.round(bill.amount / bill.cycleMonths);
        const cat = getAnyCategoryById(bill.categoryId);

        const card = document.createElement('div');
        card.className = `w-full flex items-center justify-between p-3 rounded-xl border transition ${
          bill.paid
            ? 'bg-white/95 border-emerald-200 text-slate-700'
            : 'bg-white border-amber-200 shadow-sm hover:border-indigo-300'
        }`;

        const cycleBreakdownText = bill.cycleMonths > 1
          ? `Full: ${formatCurrency(bill.amount)} / ${bill.cycleMonths}M (${formatCurrency(monthlyShare)}/mo) • ${cat.name}`
          : `Due ${bill.dueDay} • ${cat.name}`;

        card.innerHTML = `
          <button type="button" class="toggle-bill-btn flex items-center gap-3 min-w-0 flex-1 text-left">
            <span class="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
              bill.paid
                ? 'bg-emerald-500 text-white'
                : 'border-2 border-amber-400 text-transparent'
            }">✓</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <p class="text-xs font-semibold truncate ${bill.paid ? 'line-through text-slate-400' : 'text-slate-800'}">
                  ${bill.title}
                </p>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}">
                  ${badge.label}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 truncate">${cycleBreakdownText}</p>
            </div>
          </button>

          <div class="flex items-center gap-2 shrink-0 ml-2">
            <div class="text-right">
              <span class="text-xs font-bold block ${bill.paid ? 'text-slate-400' : 'text-slate-800'}">
                ${formatCurrency(effectiveAmt)}
              </span>
              <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                bill.paid
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }">
                ${bill.paid ? (bill.cycleMonths > 1 && billingMode === 'amortized' ? 'Set Aside' : 'Paid') : 'Pending'}
              </span>
            </div>
            <button
              type="button"
              class="remove-bill-btn text-slate-300 hover:text-rose-500 p-1 text-xs transition"
              title="Delete recurring bill"
              aria-label="Delete recurring bill"
            >
              ✕
            </button>
          </div>
        `;

        card.querySelector('.toggle-bill-btn').addEventListener('click', () => {
          bill.paid = !bill.paid;
          if (bill.paid) {
            const newId = Date.now();
            bill.linkedExpenseId = newId;
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            transactions.unshift({
              id: newId,
              accountId: bill.accountId || 'regular',
              type: 'expense',
              title: getEffectiveBillTitle(bill),
              amount: getEffectiveBillAmount(bill),
              categoryId: bill.categoryId,
              date: today,
              isoDate: new Date().toISOString().split('T')[0]
            });
          } else if (bill.linkedExpenseId !== null) {
            transactions = transactions.filter((e) => e.id !== bill.linkedExpenseId);
            bill.linkedExpenseId = null;
          }
          renderDashboard();
        });

        card.querySelector('.remove-bill-btn').addEventListener('click', () => {
          if (bill.linkedExpenseId !== null) {
            transactions = transactions.filter((e) => e.id !== bill.linkedExpenseId);
          }
          recurringBills = recurringBills.filter((b) => b.id !== bill.id);
          renderDashboard();
        });

        recurringBillsList.appendChild(card);
      });
    }

    // --- 7. RENDER FILTER PILLS (LEDGER TAB) ---
    function renderFilterBar() {
      categoryFilterBar.innerHTML = '';
      const currentTxs = getActiveTransactions();
      let filterItems = [{ id: 'All', name: 'All Categories', icon: '🏷️' }];

      if (filterLedgerType === 'income') {
        filterItems = [...filterItems, ...incomeSources];
      } else {
        filterItems = [...filterItems, ...getActiveCategories()];
      }
      updateLedgerCategoryDropdown();

      filterItems.forEach((item) => {
        const isActive = selectedCategory === item.id;
        const count = item.id === 'All'
          ? currentTxs.length
          : currentTxs.filter((e) => e.categoryId === item.id).length;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `px-3 py-1.5 rounded-full text-xs font-medium shrink-0 flex items-center gap-1.5 transition border ${
          isActive
            ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
        }`;
        btn.innerHTML = `
          <span>${item.icon}</span>
          <span>${item.name}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
            isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
          }">${count}</span>
        `;
        btn.addEventListener('click', () => {
          selectedCategory = item.id;
          renderDashboard();
        });
        categoryFilterBar.appendChild(btn);
      });
    }

    // --- 8. RENDER CATEGORIES & BUDGETS MANAGER ---
    function renderColorSwatches() {
      colorSwatchPicker.innerHTML = '';
      colorPalette.forEach((hex) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isSelected = selectedEditColor.toLowerCase() === hex.toLowerCase();
        btn.className = `w-7 h-7 rounded-full transition flex items-center justify-center ${
          isSelected ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : ' opacity-80 hover:opacity-100'
        }`;
        btn.style.backgroundColor = hex;
        btn.innerHTML = isSelected ? '<span class="text-white text-xs font-bold">✓</span>' : '';
        btn.addEventListener('click', () => {
          selectedEditColor = hex;
          renderColorSwatches();
        });
        colorSwatchPicker.appendChild(btn);
      });
    }

    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

    function openCategoryEditor(catId) {
      editingCategoryId = catId;
      categoryEditorCard.classList.remove('hidden');

      if (catId === 'new') {
        categoryEditorHeading.textContent = 'Create New Category';
        catEditIconInput.value = '💡';
        catEditNameInput.value = '';
        catEditBudgetInput.value = 3000;
        selectedEditColor = colorPalette[categories.length % colorPalette.length];
        if (deleteCategoryBtn) deleteCategoryBtn.classList.add('hidden');
      } else {
        const cat = getAnyCategoryById(catId);
        categoryEditorHeading.textContent = `Edit ${cat.name}`;
        catEditIconInput.value = cat.icon;
        catEditNameInput.value = cat.name;
        catEditBudgetInput.value = cat.budget || 2000;
        selectedEditColor = cat.color;
        if (deleteCategoryBtn) deleteCategoryBtn.classList.remove('hidden');
      }
      renderColorSwatches();
      catEditNameInput.focus();
    }

    function renderCategoriesManager(totalsByCategory) {
      const totalCatBudgets = getOverallBudget();
      categoryBudgetsTotalText.textContent = formatCurrency(totalCatBudgets);

      categoriesManagerList.innerHTML = '';
      getActiveCategories().forEach((cat) => {
        const spent = totalsByCategory[cat.id] || 0;
        const limit = cat.budget || 1;
        const rawPct = Math.round((spent / limit) * 100);
        const barWidth = Math.min(rawPct, 100);
        const remaining = limit - spent;
        const isEditingThis = editingCategoryId === cat.id;

        const card = document.createElement('button');
        card.type = 'button';
        card.className = `w-full text-left p-4 rounded-2xl bg-white border transition shadow-sm hover:border-indigo-300 block ${
          isEditingThis ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200/80'
        }`;

        card.innerHTML = `
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 text-white shadow-sm" style="background-color: ${cat.color}">
                ${cat.icon}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm font-bold text-slate-800 truncate">${cat.name}</p>
                  <span class="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Tap to edit</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">
                  Monthly Budget: <span class="font-semibold text-slate-600">${formatCurrency(limit)}</span>
                </p>
              </div>
            </div>
            <div class="text-right shrink-0 ml-2">
              <p class="text-sm font-bold ${spent > limit ? 'text-rose-600' : 'text-slate-800'}">${formatCurrency(spent)}</p>
              <p class="text-[11px] font-medium ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-500'}">
                ${remaining >= 0 ? formatCurrency(remaining) + ' left' : formatCurrency(Math.abs(remaining)) + ' over'}
              </p>
            </div>
          </div>

          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300" style="width: ${barWidth}%; background-color: ${spent > limit ? '#f43f5e' : cat.color}"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>${rawPct}% of category budget</span>
            <span>Limit: ${formatCurrency(limit)}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          openCategoryEditor(cat.id);
        });

        categoriesManagerList.appendChild(card);
      });
    }

    // --- 9. MAIN RENDER FUNCTION ---
    function renderDashboard() {
      populateCategorySelects();

      const totalIncome = getMonthIncome();
      const totalExpenses = getMonthExpenses();
      const netBalance = totalIncome - totalExpenses;
      const syncedOverallBudget = getOverallBudget();
      const totalsByCategory = getCategorySpentMap();

      // Savings rate calculation
      const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;
      const budgetUsedPct = syncedOverallBudget > 0 ? Math.round((totalExpenses / syncedOverallBudget) * 100) : 0;
      const budgetBarWidth = Math.min(budgetUsedPct, 100);
      const budgetRemaining = syncedOverallBudget - totalExpenses;

      // Update Header Cards
      netBalanceDisplay.textContent = (netBalance >= 0 ? '+' : '-') + formatCurrency(Math.abs(netBalance));
      totalIncomeDisplay.textContent = formatCurrency(totalIncome);
      totalSpentDisplay.textContent = formatCurrency(totalExpenses);
      budgetLimitDisplay.textContent = formatCurrency(syncedOverallBudget);

      savingsRateBadge.textContent = `${savingsRate}% Saved`;
      if (savingsRate >= 30) {
        savingsRateBadge.className = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30';
      } else if (savingsRate >= 0) {
        savingsRateBadge.className = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30';
      } else {
        savingsRateBadge.className = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300 border border-rose-400/30';
      }

      budgetProgressBar.style.width = budgetBarWidth + '%';
      budgetPercentageText.textContent = `${budgetUsedPct}% used`;
      if (budgetRemaining >= 0) {
        remainingBalanceText.textContent = `${formatCurrency(budgetRemaining)} remaining to spend`;
      } else {
        remainingBalanceText.textContent = `${formatCurrency(Math.abs(budgetRemaining))} over budget!`;
      }

      // Update Monthly Account Equation Box
      eqIncomeText.textContent = formatCurrency(totalIncome);
      eqExpenseText.textContent = formatCurrency(totalExpenses);
      eqBalanceText.textContent = (netBalance >= 0 ? '+' : '-') + formatCurrency(Math.abs(netBalance));

      // Render View Components
      updateCategoryBreakdown(totalExpenses, totalsByCategory);
      renderRecurringBills();
      checkUpcomingBills();
      renderFilterBar();
      renderCategoriesManager(totalsByCategory);
      renderComparisonReports(totalExpenses, totalIncome);

      // Update Pending Returns (Office + Friends) Summary Banner: ONLY shown on Regular Expense account!
      const pendingReturnsBanner = document.getElementById('pendingReturnsBanner');
      const pendingReturnsTitle = document.getElementById('pendingReturnsTitle');
      const pendingReturnsAmount = document.getElementById('pendingReturnsAmount');
      if (pendingReturnsBanner) {
        if (activeAccount === 'personal') {
          // Strictly disable/hide office reimbursement details when viewing Personal Account
          pendingReturnsBanner.classList.add('hidden');
        } else {
          // Filter pending claims for Regular Expense account
          const pendingClaims = transactions.filter((t) => t.accountId === 'regular' && t.type === 'expense' && t.isReimbursable && t.reimbursementStatus === 'pending');
          const pendingTotal = pendingClaims.reduce((sum, t) => sum + t.amount, 0);
          if (pendingClaims.length > 0) {
            pendingReturnsBanner.classList.remove('hidden');
            pendingReturnsTitle.textContent = `${pendingClaims.length} Pending Return${pendingClaims.length > 1 ? 's' : ''} (Office / Friends)`;
            pendingReturnsAmount.textContent = `${formatCurrency(pendingTotal)} Due`;
          } else {
            pendingReturnsBanner.classList.add('hidden');
          }
        }
      }

      // Filter & Sort Transactions Ledger (Partitioned by Account & Date Range)
      let visibleTransactions = getActiveTransactions().filter((item) => {
        const cat = getAnyCategoryById(item.categoryId);
        const matchesCategory = selectedCategory === 'All' || item.categoryId === selectedCategory;
        const matchesType = filterLedgerType === 'all' || item.type === filterLedgerType;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              cat.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Date-wise timeline filtering
        let matchesDateRange = true;
        const itemIso = item.isoDate || dateToIso(item.date);
        const todayIso = getTodayIso();
        const yestIso = getYesterdayIso();

        if (filterDateTimeline === 'today') {
          matchesDateRange = itemIso === todayIso;
        } else if (filterDateTimeline === 'yesterday') {
          matchesDateRange = itemIso === yestIso;
        } else if (filterDateTimeline === 'week') {
          const itemTime = new Date(itemIso + 'T00:00:00').getTime();
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          matchesDateRange = itemTime >= sevenDaysAgo;
        }

        return matchesCategory && matchesType && matchesSearch && matchesDateRange;
      });

      visibleTransactions = [...visibleTransactions].sort((a, b) => {
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        if (sortBy === 'oldest') {
          const diff = getTxTimestamp(a) - getTxTimestamp(b);
          return diff !== 0 ? diff : a.id - b.id;
        }
        // newest first (default): sort by actual expense date descending
        const diff = getTxTimestamp(b) - getTxTimestamp(a);
        return diff !== 0 ? diff : b.id - a.id;
      });

      itemCountBadge.textContent = `${visibleTransactions.length} entries`;

      expenseList.innerHTML = '';
      if (visibleTransactions.length === 0) {
        const curM = getSelectedMonthName();
        expenseList.innerHTML = `
          <div class="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-1">
            <span class="text-xl block">📅</span>
            <p class="font-semibold text-slate-600">No transactions for ${curM} yet</p>
            <p class="text-[11px] text-slate-400">This month is clean and ready. Your ₹${getOverallBudget().toLocaleString('en-IN')} budget is set!</p>
          </div>
        `;
        return;
      }

      // Group visibleTransactions by Date (Day-by-Day grouping)
      const dayGroups = {};
      const dayOrder = [];

      visibleTransactions.forEach((item) => {
        const itemIso = item.isoDate || dateToIso(item.date);
        if (!dayGroups[itemIso]) {
          dayGroups[itemIso] = {
            iso: itemIso,
            displayDate: item.date,
            items: []
          };
          dayOrder.push(itemIso);
        }
        dayGroups[itemIso].items.push(item);
      });

      // Render Day-Wise Group Cards with "Day Total"
      const todayIso = getTodayIso();
      const yestIso = getYesterdayIso();

      dayOrder.forEach((dayIso) => {
        const group = dayGroups[dayIso];
        const dayItems = group.items;

        // Calculate Day Total (Income minus Net Expenses)
        let dayIncome = 0;
        let dayExpense = 0;
        dayItems.forEach((it) => {
          if (it.type === 'income') {
            dayIncome += it.amount;
          } else if (it.type === 'expense') {
            if (!(it.isReimbursable && it.reimbursementStatus === 'settled')) {
              dayExpense += it.amount;
            }
          }
        });
        const dayTotal = dayIncome - dayExpense;

        // Format Day Banner Title
        let dayLabel = isoToDisplayDate(dayIso);
        let dayBadgeClass = 'bg-slate-100 text-slate-700';

        if (dayIso === todayIso) {
          dayLabel = `Today • ${isoToDisplayDate(dayIso)}`;
          dayBadgeClass = 'bg-indigo-100 text-indigo-800 font-bold';
        } else if (dayIso === yestIso) {
          dayLabel = `Yesterday • ${isoToDisplayDate(dayIso)}`;
          dayBadgeClass = 'bg-slate-200 text-slate-800 font-bold';
        }

        const dayCard = document.createElement('div');
        dayCard.className = 'rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden mb-3';

        // Context-Aware Day Total: Natural and clear (e.g. "₹1,250 spent" on normal days, "+₹55,000 in • ₹8,950 spent" on salary day)
        let dayTotalHtml = '';
        if (dayIncome > 0 && dayExpense > 0) {
          dayTotalHtml = `
            <span class="text-[11px] font-semibold text-slate-500">Day Spent: </span>
            <span class="text-xs font-bold text-slate-800">${formatCurrency(dayExpense)}</span>
            <span class="text-slate-300 mx-1">•</span>
            <span class="text-xs font-bold text-emerald-700">+${formatCurrency(dayIncome)} income</span>
          `;
        } else if (dayIncome > 0 && dayExpense === 0) {
          dayTotalHtml = `
            <span class="text-[11px] font-semibold text-slate-500">Day Income: </span>
            <span class="text-xs font-extrabold text-emerald-700">+${formatCurrency(dayIncome)}</span>
          `;
        } else if (dayExpense > 0) {
          dayTotalHtml = `
            <span class="text-[11px] font-semibold text-slate-500">Day Spent: </span>
            <span class="text-xs font-bold text-slate-800">${formatCurrency(dayExpense)}</span>
          `;
        } else {
          dayTotalHtml = `
            <span class="text-[11px] font-semibold text-slate-500">Day Spent: </span>
            <span class="text-xs font-bold text-slate-600">₹0</span>
          `;
        }

        // Day Banner Header with natural Day Total
        const headerEl = document.createElement('div');
        headerEl.className = 'bg-slate-50/95 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs flex-wrap gap-1';
        headerEl.innerHTML = `
          <div class="flex items-center gap-1.5 font-bold text-slate-800">
            <span>📅</span>
            <span>${dayLabel}</span>
            <span class="text-[10px] text-slate-400 font-medium">(${dayItems.length} ${dayItems.length === 1 ? 'entry' : 'entries'})</span>
          </div>
          <div class="text-right">
            ${dayTotalHtml}
          </div>
        `;
        dayCard.appendChild(headerEl);

        // Day Transaction List
        const listContainer = document.createElement('div');
        listContainer.className = 'divide-y divide-slate-100';

        dayItems.forEach((item) => {
          const cat = getAnyCategoryById(item.categoryId);
          const isIncome = item.type === 'income';
          const isSettled = item.isReimbursable && item.reimbursementStatus === 'settled';
          const isPendingClaim = item.isReimbursable && item.reimbursementStatus === 'pending';

          const reimbSourceMeta = {
            office: { icon: '🏢', pendingLabel: 'Office Claim', settledLabel: 'Office Reimbursed', returnedBy: 'Office returned' },
            friend: { icon: '🤝', pendingLabel: 'Friend Return', settledLabel: 'Friend Paid Back', returnedBy: 'Friend returned' },
            family: { icon: '🏠', pendingLabel: 'Family Return', settledLabel: 'Family Returned', returnedBy: 'Family returned' }
          };
          const rMeta = reimbSourceMeta[item.reimbursableSource || 'office'] || reimbSourceMeta.office;

          let claimBadgeHtml = '';
          if (isPendingClaim) {
            claimBadgeHtml = `
              <button type="button" data-id="${item.id}" class="settle-claim-btn text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800 transition flex items-center gap-1" title="Tap when money is returned">
                <span>${rMeta.icon} ${rMeta.pendingLabel}</span> • <span class="underline">Pending (Tap when Returned)</span>
              </button>
            `;
          } else if (isSettled) {
            claimBadgeHtml = `
              <button type="button" data-id="${item.id}" class="settle-claim-btn text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-amber-100 transition flex items-center gap-1" title="Money returned: ₹0 net personal expense">
                <span>${rMeta.icon} ${rMeta.settledLabel} (Net ₹0)</span> ✓
              </button>
            `;
          }

          const row = document.createElement('div');
          row.className = `flex items-center justify-between p-3 bg-white hover:bg-slate-50/60 transition`;
          row.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 text-white shadow-2xs" style="background-color: ${isSettled ? '#10b981' : cat.color}">
                ${item.isReimbursable ? rMeta.icon : cat.icon}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <p class="text-xs sm:text-sm font-semibold text-slate-800 truncate ${isSettled ? 'line-through text-slate-400' : ''}">${item.title}</p>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                    ${isIncome ? 'INCOME' : 'EXPENSE'}
                  </span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${item.accountId === 'personal' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}">
                    ${item.accountId === 'personal' ? '👤 Personal' : '💳 Regular'}
                  </span>
                  ${claimBadgeHtml}
                </div>
                <p class="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span>${cat.name}</span>
                  ${isSettled ? '<span>•</span><span class="text-emerald-600 font-semibold">' + rMeta.returnedBy + ' ₹' + item.amount + ' (₹0 Net)</span>' : ''}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 ml-2">
              <div class="text-right">
                <span class="text-xs sm:text-sm font-bold block ${isIncome ? 'text-emerald-600' : (isSettled ? 'text-slate-400 line-through' : 'text-slate-800')}">
                  ${isIncome ? '+' : '-'}${formatCurrency(item.amount)}
                </span>
                ${isSettled ? '<span class="text-[9px] font-bold text-emerald-600 block">₹0 Net</span>' : ''}
              </div>
              <button
                data-id="${item.id}"
                class="edit-btn text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg text-xs transition cursor-pointer"
                title="Edit entry"
                aria-label="Edit entry"
              >
                ✎
              </button>
              <button
                data-id="${item.id}"
                class="delete-btn text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs transition cursor-pointer"
                title="Remove entry"
                aria-label="Remove entry"
              >
                ✕
              </button>
            </div>
          `;
          listContainer.appendChild(row);
        });

        dayCard.appendChild(listContainer);
        expenseList.appendChild(dayCard);
      });

      // Attach Settle Claim Listeners (When office returns the money)
      document.querySelectorAll('.settle-claim-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = Number(e.currentTarget.getAttribute('data-id'));
          const tx = transactions.find((t) => t.id === id);
          if (tx) {
            tx.reimbursementStatus = tx.reimbursementStatus === 'settled' ? 'pending' : 'settled';
            renderDashboard();
          }
        });
      });

      // Attach Edit Listeners to all transaction items
      document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idToEdit = Number(e.currentTarget.getAttribute('data-id'));
          openEditTxModal(idToEdit);
        });
      });

      document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idToRemove = Number(e.currentTarget.getAttribute('data-id'));
          transactions = transactions.filter((item) => item.id !== idToRemove);
          recurringBills.forEach((bill) => {
            if (bill.linkedExpenseId === idToRemove) {
              bill.paid = false;
              bill.linkedExpenseId = null;
            }
          });
          renderDashboard();
        });
      });

      // Automatically persist updated state to device storage
      saveToLocalStorage();
    }

    // --- 10. EVENT LISTENERS ---
    navTabHome.addEventListener('click', () => switchTab('home'));
    navTabExpenses.addEventListener('click', () => switchTab('expenses'));
    navTabCategories.addEventListener('click', () => switchTab('categories'));
    jumpToCategoriesBtn.addEventListener('click', () => switchTab('categories'));
    goToCategoriesFromHeaderBtn.addEventListener('click', () => switchTab('categories'));

    // Period Switcher Listeners
    periodCurrentBtn.addEventListener('click', () => switchPeriod('current'));
    period3MBtn.addEventListener('click', () => switchPeriod('3m'));
    period6MBtn.addEventListener('click', () => switchPeriod('6m'));
    period1YBtn.addEventListener('click', () => switchPeriod('1y'));
    exportReportCsvBtn.addEventListener('click', exportReportCSV);

    // Income vs Expense Log Toggle
    logTypeExpenseBtn.addEventListener('click', () => setLogType('expense'));
    logTypeIncomeBtn.addEventListener('click', () => setLogType('income'));

    // Ledger Type Filters (All, Income, Expense)
    filterTypeAllBtn.addEventListener('click', () => {
      filterLedgerType = 'all';
      selectedCategory = 'All';
      filterTypeAllBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm shrink-0';
      filterTypeIncomeBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 shrink-0';
      filterTypeExpenseBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:border-rose-400 shrink-0';
      renderDashboard();
    });

    filterTypeIncomeBtn.addEventListener('click', () => {
      filterLedgerType = 'income';
      selectedCategory = 'All'; // Reset category filter so income transactions are never accidentally hidden by expense category filters
      filterTypeIncomeBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm shrink-0';
      filterTypeAllBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-400 shrink-0';
      filterTypeExpenseBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:border-rose-400 shrink-0';
      renderDashboard();
    });

    filterTypeExpenseBtn.addEventListener('click', () => {
      filterLedgerType = 'expense';
      selectedCategory = 'All';
      filterTypeExpenseBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm shrink-0';
      filterTypeAllBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-400 shrink-0';
      filterTypeIncomeBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 shrink-0';
      renderDashboard();
    });

    // --- DATE CUSTOMIZATION HELPERS ---
    const expenseDateInput = document.getElementById('expenseDateInput');
    const quickDayTodayBtn = document.getElementById('quickDayTodayBtn');
    const quickDayYesterdayBtn = document.getElementById('quickDayYesterdayBtn');
    const modalDateTodayBtn = document.getElementById('modalDateTodayBtn');
    const modalDateYesterdayBtn = document.getElementById('modalDateYesterdayBtn');

    function getTodayIso() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function getYesterdayIso() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function isoToDisplayDate(isoStr) {
      if (!isoStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(y, m, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      }
      return isoStr;
    }

    function dateToIso(dateStr) {
      if (!dateStr) return getTodayIso();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length === 2 && monthMap[parts[0]]) {
        const m = monthMap[parts[0]];
        const d = parts[1].padStart(2, '0');
        return `2026-${m}-${d}`;
      }
      return getTodayIso();
    }

    function getTxTimestamp(tx) {
      const iso = tx.isoDate || dateToIso(tx.date);
      const t = new Date(iso + 'T00:00:00').getTime();
      return isNaN(t) ? (tx.id || 0) : t;
    }

    if (expenseDateInput) {
      expenseDateInput.value = getTodayIso();
    }
    if (quickDayTodayBtn) {
      quickDayTodayBtn.addEventListener('click', () => {
        expenseDateInput.value = getTodayIso();
      });
    }
    if (quickDayYesterdayBtn) {
      quickDayYesterdayBtn.addEventListener('click', () => {
        expenseDateInput.value = getYesterdayIso();
      });
    }
    if (modalDateTodayBtn) {
      modalDateTodayBtn.addEventListener('click', () => {
        document.getElementById('editTxDate').value = getTodayIso();
      });
    }
    if (modalDateYesterdayBtn) {
      modalDateYesterdayBtn.addEventListener('click', () => {
        document.getElementById('editTxDate').value = getYesterdayIso();
      });
    }

    // Form Submission: Log Transaction (Expense or Income with Customized Date)
    expenseForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = expenseTitle.value.trim();
      const amount = parseFloat(expenseAmount.value);
      const categoryId = expenseCategory.value;

      if (!title || isNaN(amount) || amount <= 0) return;

      const chosenIso = (expenseDateInput && expenseDateInput.value) ? expenseDateInput.value : getTodayIso();
      const displayDate = isoToDisplayDate(chosenIso);
      const chosenAccountId = activeAccount;

      const isReimbursable = logType === 'expense' && document.getElementById('isReimbursableCheckbox').checked;
      const reimbursableSource = document.getElementById('reimbursableSourceSelect').value || 'office';
      const txMonthYear = getTxMonthYear({ isoDate: chosenIso, date: displayDate });
      transactions.unshift({
        id: Date.now(),
        accountId: chosenAccountId,
        type: logType,
        title,
        amount,
        categoryId,
        date: displayDate,
        isoDate: chosenIso,
        monthYear: txMonthYear,
        isReimbursable,
        reimbursableSource,
        reimbursementStatus: isReimbursable ? 'pending' : 'none'
      });
      document.getElementById('isReimbursableCheckbox').checked = false;

      expenseTitle.value = '';
      expenseAmount.value = '';
      if (expenseDateInput) {
        expenseDateInput.value = getTodayIso();
      }
      renderDashboard();
    });

    searchExpenseInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderDashboard();
    });

    sortExpenseSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderDashboard();
    });

    // Recurring Bills Listeners
    toggleAddBillFormBtn.addEventListener('click', () => {
      customBillForm.classList.toggle('hidden');
      if (!customBillForm.classList.contains('hidden')) {
        billTitleInput.focus();
      }
    });

    function updateCustomBillPreview() {
      const amt = parseFloat(billAmountInput.value) || 0;
      const cycle = parseInt(billCycleSelect.value, 10) || 1;
      const monthlyShare = Math.round(amt / cycle);
      customBillPreviewText.textContent = `${formatCurrency(monthlyShare)} / mo share`;
    }

    billAmountInput.addEventListener('input', updateCustomBillPreview);
    billCycleSelect.addEventListener('change', updateCustomBillPreview);

    customBillForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = billTitleInput.value.trim();
      const amount = parseFloat(billAmountInput.value);
      const cycleMonths = parseInt(billCycleSelect.value, 10) || 1;
      const categoryId = billCategorySelect.value;
      const dueDay = billDueInput.value.trim() || '15th';

      if (!title || isNaN(amount) || amount <= 0) return;

      const newExpenseId = Date.now();
      const billAccount = activeAccount === 'both' ? 'regular' : activeAccount;
      const newBill = {
        id: 'bill-' + newExpenseId,
        accountId: billAccount,
        title,
        amount,
        cycleMonths,
        categoryId,
        dueDay,
        paid: true,
        linkedExpenseId: newExpenseId
      };

      recurringBills.unshift(newBill);

      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      transactions.unshift({
        id: newExpenseId,
        accountId: billAccount,
        type: 'expense',
        title: getEffectiveBillTitle(newBill),
        amount: getEffectiveBillAmount(newBill),
        categoryId: newBill.categoryId,
        date: today,
        isoDate: new Date().toISOString().split('T')[0]
      });

      billTitleInput.value = '';
      billAmountInput.value = '';
      billDueInput.value = '';
      customBillPreviewText.textContent = '₹0 / mo';
      customBillForm.classList.add('hidden');
      renderDashboard();
    });

    modeMonthlySetAsideBtn.addEventListener('click', () => {
      billingMode = 'amortized';
      modeMonthlySetAsideBtn.className = 'text-[11px] font-semibold py-1.5 px-2 rounded-md transition bg-white text-indigo-700 shadow-sm';
      modeFullPaymentBtn.className = 'text-[11px] font-semibold py-1.5 px-2 rounded-md transition text-slate-600 hover:text-slate-800';
      cycleModeHelperText.textContent = 'Splits 3M/6M/12M bills into equal monthly shares (e.g., ₹900 / 3M = ₹300/mo) so your monthly budget stays smooth.';
      syncPaidRecurringBillsWithMode();
      renderDashboard();
    });

    modeFullPaymentBtn.addEventListener('click', () => {
      billingMode = 'full';
      modeFullPaymentBtn.className = 'text-[11px] font-semibold py-1.5 px-2 rounded-md transition bg-white text-indigo-700 shadow-sm';
      modeMonthlySetAsideBtn.className = 'text-[11px] font-semibold py-1.5 px-2 rounded-md transition text-slate-600 hover:text-slate-800';
      cycleModeHelperText.textContent = 'Logs the entire 3M/6M/12M bill amount in the month you pay it (e.g., full ₹900 logged today).';
      syncPaidRecurringBillsWithMode();
      renderDashboard();
    });

    // Category Editor Listeners
    addNewCategoryBtn.addEventListener('click', () => {
      openCategoryEditor('new');
    });

    cancelCategoryEditBtn.addEventListener('click', () => {
      editingCategoryId = null;
      categoryEditorCard.classList.add('hidden');
      renderDashboard();
    });

    
    if (deleteCategoryBtn) {
      deleteCategoryBtn.addEventListener('click', () => {
        if (!editingCategoryId || editingCategoryId === 'new') return;

        const targetCat = categories.find((c) => c.id === editingCategoryId);
        if (!targetCat) return;

        const catAccount = targetCat.accountId || (activeAccount === 'both' ? 'regular' : activeAccount);
        const remainingInAccount = categories.filter((c) => (!c.accountId || c.accountId === catAccount) && c.id !== editingCategoryId);

        if (remainingInAccount.length === 0) {
          showToast(`Must keep at least 1 category in ${catAccount === 'personal' ? 'Personal Account' : 'Regular Expense'}`);
          return;
        }

        // Safely reassign any transactions or recurring bills using this category to remaining category
        const fallbackCat = remainingInAccount[0];
        transactions.forEach((t) => {
          if (t.categoryId === editingCategoryId) {
            t.categoryId = fallbackCat.id;
          }
        });
        recurringBills.forEach((b) => {
          if (b.categoryId === editingCategoryId) {
            b.categoryId = fallbackCat.id;
          }
        });

        // Delete from categories
        categories = categories.filter((c) => c.id !== editingCategoryId);

        editingCategoryId = null;
        categoryEditorCard.classList.add('hidden');
        renderDashboard();
        saveToLocalStorage();
        showToast(`Deleted "${targetCat.name}" category`);
      });
    }

    categoryEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const icon = catEditIconInput.value.trim() || '✨';
      const name = catEditNameInput.value.trim();
      const budget = parseFloat(catEditBudgetInput.value);

      if (!name || isNaN(budget) || budget <= 0) return;

      if (editingCategoryId === 'new') {
        const catAccount = activeAccount === 'both' ? 'regular' : activeAccount;
        categories.push({
          id: 'cat-' + Date.now(),
          accountId: catAccount,
          name,
          icon,
          color: selectedEditColor,
          budget
        });
      } else {
        const target = categories.find((c) => c.id === editingCategoryId);
        if (target) {
          target.name = name;
          target.icon = icon;
          target.color = selectedEditColor;
          target.budget = budget;
        }
      }

      editingCategoryId = null;
      categoryEditorCard.classList.add('hidden');
      renderDashboard();
    });

    
    // --- 11. EDIT TRANSACTION MODAL LOGIC ---
    let editingTransactionId = null;
    let editModalType = 'expense';

    const editTxModal = document.getElementById('editTxModal');
    const closeEditTxModalBtn = document.getElementById('closeEditTxModalBtn');
    const editTxForm = document.getElementById('editTxForm');
    const modalTypeExpenseBtn = document.getElementById('modalTypeExpenseBtn');
    const modalTypeIncomeBtn = document.getElementById('modalTypeIncomeBtn');
    const modalTitleLabel = document.getElementById('modalTitleLabel');
    const modalCategoryLabel = document.getElementById('modalCategoryLabel');
    const editTxTitle = document.getElementById('editTxTitle');
    const editTxAmount = document.getElementById('editTxAmount');
    const editTxCategory = document.getElementById('editTxCategory');
    const editTxDate = document.getElementById('editTxDate');
    const deleteFromModalBtn = document.getElementById('deleteFromModalBtn');

    function populateEditModalCategories(type) {
      const modalTxAccountSelect = document.getElementById('modalTxAccountSelect');
      const targetAccount = modalTxAccountSelect ? modalTxAccountSelect.value : (activeAccount === 'both' ? 'regular' : activeAccount);

      editTxCategory.innerHTML = '';
      if (type === 'expense') {
        const modalCats = categories.filter((c) => !c.accountId || c.accountId === targetAccount);
        modalCats.forEach((cat) => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = `${cat.icon} ${cat.name}`;
          editTxCategory.appendChild(opt);
        });
      } else {
        incomeSources.forEach((inc) => {
          const opt = document.createElement('option');
          opt.value = inc.id;
          opt.textContent = `${inc.icon} ${inc.name}`;
          editTxCategory.appendChild(opt);
        });
      }
    }

    function setEditModalType(type) {
      editModalType = type;
      if (type === 'expense') {
        modalTypeExpenseBtn.className = 'flex-1 py-1.5 rounded-lg transition bg-white text-rose-700 shadow-sm font-semibold';
        modalTypeIncomeBtn.className = 'flex-1 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900 font-medium';
        modalTitleLabel.textContent = 'Expense Description';
        modalCategoryLabel.textContent = 'Expense Category';
      } else {
        modalTypeIncomeBtn.className = 'flex-1 py-1.5 rounded-lg transition bg-white text-emerald-700 shadow-sm font-semibold';
        modalTypeExpenseBtn.className = 'flex-1 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900 font-medium';
        modalTitleLabel.textContent = 'Income Source / Title';
        modalCategoryLabel.textContent = 'Income Category';
      }
      populateEditModalCategories(type);
    }

    function openEditTxModal(txId) {
      const tx = transactions.find((t) => t.id === txId);
      if (!tx) return;

      editingTransactionId = txId;
      const modalTxAccountSelect = document.getElementById('modalTxAccountSelect');
      if (modalTxAccountSelect) {
        modalTxAccountSelect.value = tx.accountId || 'regular';
      }
      setEditModalType(tx.type);

      editTxTitle.value = tx.title;
      editTxAmount.value = tx.amount;
      editTxCategory.value = tx.categoryId;
      editTxDate.value = tx.isoDate || dateToIso(tx.date);
      const modalReimbRow = document.getElementById('modalReimbursableRow');
      const modalReimbCheckbox = document.getElementById('modalIsReimbursableCheckbox');
      const modalReimbSource = document.getElementById('modalReimbursableSourceSelect');
      const isModalPersonal = tx.accountId === 'personal';

      if (modalReimbRow) {
        if (isModalPersonal) {
          modalReimbRow.classList.add('hidden');
        } else {
          modalReimbRow.classList.remove('hidden');
        }
      }

      if (modalReimbCheckbox) {
        modalReimbCheckbox.checked = isModalPersonal ? false : !!tx.isReimbursable;
      }
      if (modalReimbSource) {
        modalReimbSource.value = tx.reimbursableSource || 'office';
      }

      editTxModal.classList.remove('hidden');
      editTxTitle.focus();
    }

    function closeEditTxModal() {
      editingTransactionId = null;
      editTxModal.classList.add('hidden');
    }

    closeEditTxModalBtn.addEventListener('click', closeEditTxModal);
    editTxModal.addEventListener('click', (e) => {
      if (e.target === editTxModal) closeEditTxModal();
    });

    modalTypeExpenseBtn.addEventListener('click', () => setEditModalType('expense'));
    modalTypeIncomeBtn.addEventListener('click', () => setEditModalType('income'));

    deleteFromModalBtn.addEventListener('click', () => {
      if (editingTransactionId !== null) {
        transactions = transactions.filter((t) => t.id !== editingTransactionId);
        recurringBills.forEach((bill) => {
          if (bill.linkedExpenseId === editingTransactionId) {
            bill.paid = false;
            bill.linkedExpenseId = null;
          }
        });
        closeEditTxModal();
        renderDashboard();
      }
    });

    editTxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (editingTransactionId === null) return;

      const title = editTxTitle.value.trim();
      const amount = parseFloat(editTxAmount.value);
      const categoryId = editTxCategory.value;
      const chosenIso = editTxDate.value || getTodayIso();
      const displayDate = isoToDisplayDate(chosenIso);

      if (!title || isNaN(amount) || amount <= 0) return;

      const target = transactions.find((t) => t.id === editingTransactionId);
      if (target) {
        const modalTxAccountSelect = document.getElementById('modalTxAccountSelect');
        target.accountId = modalTxAccountSelect ? modalTxAccountSelect.value : (target.accountId || 'regular');
        target.title = title;
        target.amount = amount;
        target.categoryId = categoryId;
        target.type = editModalType;
        target.date = displayDate;
        target.isoDate = chosenIso;
        target.monthYear = getTxMonthYear({ isoDate: chosenIso, date: displayDate });
        const modalReimbCheckbox = document.getElementById('modalIsReimbursableCheckbox');
        const modalReimbSource = document.getElementById('modalReimbursableSourceSelect');
        target.isReimbursable = editModalType === 'expense' && modalReimbCheckbox && modalReimbCheckbox.checked;
        target.reimbursableSource = modalReimbSource ? modalReimbSource.value : 'office';
        if (target.isReimbursable && (!target.reimbursementStatus || target.reimbursementStatus === 'none')) {
          target.reimbursementStatus = 'pending';
        } else if (!target.isReimbursable) {
          target.reimbursementStatus = 'none';
        }
      }

      closeEditTxModal();
      renderDashboard();
    });


    // ==========================================
    // STEP 4: PERSISTENT STORAGE & MONTH SWITCHER
    // ==========================================
    const STORAGE_KEY = 'mysmartplan_multi_account_data_v4';

    const availableMonths = [
      'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027'
    ];
    let currentMonthIndex = 4; // Defaults to 'Nov 2026' (Current Month)

    // DOM Elements for Step 4
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const currentMonthYearBadge = document.getElementById('currentMonthYearBadge');

    const appToast = document.getElementById('appToast');
    const appToastText = document.getElementById('appToastText');
    let toastTimeout = null;

    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const triggerResetModalBtn = document.getElementById('triggerResetModalBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const exportJsonBackupBtn = document.getElementById('exportJsonBackupBtn');
    const deployProtectionToggle = document.getElementById('deployProtectionToggle');
    const resetBtnLabel = document.getElementById('resetBtnLabel');
    const triggerRestoreModalBtn = document.getElementById('triggerRestoreModalBtn');
    const restoreDataModal = document.getElementById('restoreDataModal');
    const closeRestoreModalBtn = document.getElementById('closeRestoreModalBtn');
    const cancelRestoreModalBtn = document.getElementById('cancelRestoreModalBtn');
    const confirmRestoreBtn = document.getElementById('confirmRestoreBtn');
    const restoreFileInput = document.getElementById('restoreFileInput');
    const restoreJsonTextarea = document.getElementById('restoreJsonTextarea');
    const upcomingBillsBanner = document.getElementById('upcomingBillsBanner');
    const upcomingBillsTitle = document.getElementById('upcomingBillsTitle');
    const upcomingBillsDesc = document.getElementById('upcomingBillsDesc');
    const dismissUpcomingBillsBtn = document.getElementById('dismissUpcomingBillsBtn');
    const exportCalendarIcsBtn = document.getElementById('exportCalendarIcsBtn');
    const enableBillAlertsBtn = document.getElementById('enableBillAlertsBtn');
    const billAlertsBtnLabel = document.getElementById('billAlertsBtnLabel');
    const persistStorageStatusText = document.getElementById('persistStorageStatusText');
    const requestPersistStorageBtn = document.getElementById('requestPersistStorageBtn');
    const recoverySnapshotsList = document.getElementById('recoverySnapshotsList');
    const cloudSyncStatusBadge = document.getElementById('cloudSyncStatusBadge');
    const cloudSyncUrlInput = document.getElementById('cloudSyncUrlInput');
    const saveCloudSyncBtn = document.getElementById('saveCloudSyncBtn');

    
    // ==========================================
    // STRICT TWO-ACCOUNT SWITCHER & FIXED DESTINATION
    // ==========================================
    const accountRegularBtn = document.getElementById('accountRegularBtn');
    const accountPersonalBtn = document.getElementById('accountPersonalBtn');
    const activeAccountFixedBadge = document.getElementById('activeAccountFixedBadge');
    const modalTxAccountSelect = document.getElementById('modalTxAccountSelect');

    function switchAccount(accId) {
      activeAccount = (accId === 'personal') ? 'personal' : 'regular';

      // Update top header button styling
      if (accountRegularBtn) {
        accountRegularBtn.className = activeAccount === 'regular'
          ? 'flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 bg-white text-indigo-900 shadow-sm font-bold text-xs'
          : 'flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 text-indigo-200 hover:text-white font-bold text-xs';
      }
      if (accountPersonalBtn) {
        accountPersonalBtn.className = activeAccount === 'personal'
          ? 'flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 bg-white text-teal-900 shadow-sm font-bold text-xs'
          : 'flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 text-indigo-200 hover:text-white font-bold text-xs';
      }

      // Update non-editable fixed account destination badge in form
      if (activeAccountFixedBadge) {
        if (activeAccount === 'personal') {
          activeAccountFixedBadge.className = 'font-bold text-teal-800 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-teal-200 shadow-2xs';
          activeAccountFixedBadge.innerHTML = '<span>👤</span><span>Personal Account</span>';
        } else {
          activeAccountFixedBadge.className = 'font-bold text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs';
          activeAccountFixedBadge.innerHTML = '<span>💳</span><span>Regular Expense</span>';
        }
      }

      // Update header subtitle
      const sub = document.getElementById('headerTabSubtitle');
      if (sub) {
        sub.textContent = activeAccount === 'personal' ? 'Personal Account' : 'Regular Expense';
      }

      selectedCategory = 'All';
      filterLedgerType = 'all';
      if (filterTypeAllBtn && filterTypeIncomeBtn && filterTypeExpenseBtn) {
        filterTypeAllBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm shrink-0';
        filterTypeIncomeBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-400 shrink-0';
        filterTypeExpenseBtn.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:border-rose-400 shrink-0';
      }
      populateCategorySelects();
      updateReimbursementVisibility();
      renderDashboard();
      saveToLocalStorage();

      showToast(activeAccount === 'personal' ? 'Switched to 👤 Personal Account' : 'Switched to 💳 Regular Expense');
    }

    if (accountRegularBtn) accountRegularBtn.addEventListener('click', () => switchAccount('regular'));
    if (accountPersonalBtn) accountPersonalBtn.addEventListener('click', () => switchAccount('personal'));
    if (modalTxAccountSelect) {
      modalTxAccountSelect.addEventListener('change', () => {
        populateEditModalCategories(editModalType);
        const modalReimbRow = document.getElementById('modalReimbursableRow');
        const modalReimbCheckbox = document.getElementById('modalIsReimbursableCheckbox');
        if (modalReimbRow) {
          if (modalTxAccountSelect.value === 'personal') {
            modalReimbRow.classList.add('hidden');
            if (modalReimbCheckbox) modalReimbCheckbox.checked = false;
          } else {
            modalReimbRow.classList.remove('hidden');
          }
        }
      });
    }


    // ==========================================
    // FUNDS TRANSFER LOGIC: Regular ➔ Personal
    // ==========================================
    const openTransferModalHeaderBtn = document.getElementById('openTransferModalHeaderBtn');
    const openTransferModalLedgerBtn = document.getElementById('openTransferModalLedgerBtn');
    const closeTransferModalBtn = document.getElementById('closeTransferModalBtn');
    const transferFundsModal = document.getElementById('transferFundsModal');
    const transferFundsForm = document.getElementById('transferFundsForm');
    const transferAmountInput = document.getElementById('transferAmountInput');
    const transferDateInput = document.getElementById('transferDateInput');
    const transferNoteInput = document.getElementById('transferNoteInput');

    function openTransferModal() {
      if (!transferFundsModal) return;
      if (transferDateInput) transferDateInput.value = getTodayIso();
      if (transferAmountInput) transferAmountInput.value = '';
      if (transferNoteInput) transferNoteInput.value = '';
      transferFundsModal.classList.remove('hidden');
      if (transferAmountInput) transferAmountInput.focus();
    }

    function closeTransferModal() {
      if (!transferFundsModal) return;
      transferFundsModal.classList.add('hidden');
    }

    if (openTransferModalHeaderBtn) openTransferModalHeaderBtn.addEventListener('click', openTransferModal);
    if (openTransferModalLedgerBtn) openTransferModalLedgerBtn.addEventListener('click', openTransferModal);
    if (closeTransferModalBtn) closeTransferModalBtn.addEventListener('click', closeTransferModal);
    if (transferFundsModal) {
      transferFundsModal.addEventListener('click', (e) => {
        if (e.target === transferFundsModal) closeTransferModal();
      });
    }

    // Quick Chips (+₹5,000, +₹10,000, +₹15,000, +₹25,000)
    document.querySelectorAll('.quick-transfer-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const amt = e.currentTarget.getAttribute('data-amt');
        if (transferAmountInput) {
          transferAmountInput.value = amt;
        }
      });
    });

    if (transferFundsForm) {
      transferFundsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amt = parseFloat(transferAmountInput.value);
        if (isNaN(amt) || amt <= 0) return;

        const chosenIso = transferDateInput.value || getTodayIso();
        const displayDate = isoToDisplayDate(chosenIso);
        const note = transferNoteInput.value.trim();
        const pairId = 'transfer-' + Date.now();

        const trMonthYear = getTxMonthYear({ isoDate: chosenIso, date: displayDate });
        // 1. Outflow from Regular Expense Account
        transactions.unshift({
          id: Date.now(),
          accountId: 'regular',
          type: 'expense',
          title: '⇄ Transfer ➔ Personal Account' + (note ? ` (${note})` : ''),
          amount: amt,
          categoryId: 'cat-other',
          date: displayDate,
          isoDate: chosenIso,
          monthYear: trMonthYear,
          isTransfer: true,
          transferPairId: pairId
        });

        // 2. Corresponding Inflow into Personal Account
        transactions.unshift({
          id: Date.now() + 1,
          accountId: 'personal',
          type: 'income',
          title: '⇄ Transfer In ➔ From Regular Account' + (note ? ` (${note})` : ''),
          amount: amt,
          categoryId: 'inc-sal',
          date: displayDate,
          isoDate: chosenIso,
          monthYear: trMonthYear,
          isTransfer: true,
          transferPairId: pairId
        });

        closeTransferModal();
        renderDashboard();
        saveToLocalStorage();
        showToast(`Transferred ${formatCurrency(amt)} to Personal Account!`);
      });
    }


    // --- DATE TIMELINE FILTERS & CATEGORY DROPDOWN LOGIC ---
    let filterDateTimeline = 'all'; // 'all' | 'today' | 'yesterday' | 'week'
    const dateFilterAllBtn = document.getElementById('dateFilterAllBtn');
    const dateFilterTodayBtn = document.getElementById('dateFilterTodayBtn');
    const dateFilterYesterdayBtn = document.getElementById('dateFilterYesterdayBtn');
    const dateFilterWeekBtn = document.getElementById('dateFilterWeekBtn');
    const ledgerCategorySelect = document.getElementById('ledgerCategorySelect');

    function setDateTimelineFilter(range) {
      filterDateTimeline = range;
      const buttons = [
        { el: dateFilterAllBtn, id: 'all' },
        { el: dateFilterTodayBtn, id: 'today' },
        { el: dateFilterYesterdayBtn, id: 'yesterday' },
        { el: dateFilterWeekBtn, id: 'week' }
      ];

      buttons.forEach(({ el, id }) => {
        if (!el) return;
        if (id === range) {
          el.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-white shadow-2xs shrink-0 transition';
        } else {
          el.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:border-slate-400 shrink-0 transition';
        }
      });
      renderDashboard();
    }

    if (dateFilterAllBtn) dateFilterAllBtn.addEventListener('click', () => setDateTimelineFilter('all'));
    if (dateFilterTodayBtn) dateFilterTodayBtn.addEventListener('click', () => setDateTimelineFilter('today'));
    if (dateFilterYesterdayBtn) dateFilterYesterdayBtn.addEventListener('click', () => setDateTimelineFilter('yesterday'));
    if (dateFilterWeekBtn) dateFilterWeekBtn.addEventListener('click', () => setDateTimelineFilter('week'));

    if (ledgerCategorySelect) {
      ledgerCategorySelect.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        renderDashboard();
      });
    }

    // Populate Category Dropdown whenever categories or active account change
    function updateLedgerCategoryDropdown() {
      if (!ledgerCategorySelect) return;
      const currentSelected = selectedCategory;
      ledgerCategorySelect.innerHTML = '<option value="All">All Categories</option>';

      let catList = [];
      if (filterLedgerType === 'income') {
        catList = incomeSources;
      } else {
        catList = getActiveCategories();
      }

      catList.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.icon} ${cat.name}`;
        ledgerCategorySelect.appendChild(opt);
      });

      if (catList.some((c) => c.id === currentSelected)) {
        ledgerCategorySelect.value = currentSelected;
      } else {
        ledgerCategorySelect.value = 'All';
      }
    }

function showToast(message) {
      if (!appToast || !appToastText) return;
      appToastText.textContent = message;
      appToast.classList.remove('hidden');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        appToast.classList.add('hidden');
      }, 2500);
    }

    // Default seed state backup
    const initialCategoriesSeed = JSON.parse(JSON.stringify(categories));
    const initialTransactionsSeed = JSON.parse(JSON.stringify(transactions));
    const initialRecurringBillsSeed = JSON.parse(JSON.stringify(recurringBills));

    const SNAPSHOT_KEY = 'mysmartplan_recovery_snapshots';
    const CLOUD_SYNC_KEY = 'mysmartplan_cloud_sync_url';

    function saveRecoverySnapshot(payload) {
      try {
        let snapshots = [];
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        if (raw) {
          snapshots = JSON.parse(raw);
          if (!Array.isArray(snapshots)) snapshots = [];
        }
        const now = new Date();
        const timeLabel = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const snapshotEntry = {
          id: Date.now(),
          time: timeLabel,
          txCount: (payload.transactions || []).length,
          data: payload
        };
        if (snapshots.length > 0 && (Date.now() - snapshots[0].id) < 3000) {
          snapshots[0] = snapshotEntry;
        } else {
          snapshots.unshift(snapshotEntry);
        }
        snapshots = snapshots.slice(0, 3);
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
      } catch (e) {
        console.warn('Snapshot error:', e);
      }
    }

    async function pushToCloudSync(payload) {
      try {
        const url = localStorage.getItem(CLOUD_SYNC_KEY);
        if (!url || !url.startsWith('http')) return;
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Cloud sync push error:', e);
      }
    }

    function saveToLocalStorage(shouldPushCloud = true) {
      try {
        const payload = {
          categories,
          transactions,
          recurringBills,
          billingMode,
          currentMonthIndex,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        saveRecoverySnapshot(payload);
        if (shouldPushCloud) {
          pushToCloudSync(payload);
        }
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }

    function loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            categories = parsed.categories;
          }
          if (Array.isArray(parsed.transactions)) {
            transactions = parsed.transactions;
          }
          if (Array.isArray(parsed.recurringBills)) {
            recurringBills = parsed.recurringBills;
          }
          if (parsed.billingMode) {
            billingMode = parsed.billingMode;
          }
          if (typeof parsed.currentMonthIndex === 'number' && parsed.currentMonthIndex >= 0 && parsed.currentMonthIndex < availableMonths.length) {
            currentMonthIndex = parsed.currentMonthIndex;
          }
        }
      } catch (err) {
        console.warn('LocalStorage load failed:', err);
      }
    }

    function exportJsonBackup() {
      const backupData = {
        app: 'MySmart Plan',
        exportDate: new Date().toISOString(),
        activeMonth: availableMonths[currentMonthIndex],
        overallBudget: getOverallBudget(),
        categories,
        transactions,
        recurringBills,
        billingMode
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MySmartPlan_Backup_${availableMonths[currentMonthIndex].replace(' ', '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded as JSON!');
    }

    function resetToDemoDefaults() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}

      categories = JSON.parse(JSON.stringify(initialCategoriesSeed));
      transactions = JSON.parse(JSON.stringify(initialTransactionsSeed));
      recurringBills = JSON.parse(JSON.stringify(initialRecurringBillsSeed));
      billingMode = 'amortized';
      currentMonthIndex = 4; // 'Nov 2026'
      currentMonthYearBadge.textContent = availableMonths[currentMonthIndex];

      resetConfirmModal.classList.add('hidden');
      renderDashboard();
      saveToLocalStorage();
      showToast('Restored sample demo data!');
    }

    function clearAllStartFresh() {
      window._isFreshClearedMode = true;
      // Wipe all demo transactions and mark recurring bills as unpaid/unlinked for a clean ₹0 start
      transactions = [];
      recurringBills.forEach((b) => {
        b.paid = false;
        b.linkedExpenseId = null;
      });
      currentMonthIndex = 4; // 'Nov 2026'
      currentMonthYearBadge.textContent = availableMonths[currentMonthIndex];

      resetConfirmModal.classList.add('hidden');
      renderDashboard();
      saveToLocalStorage();
      showToast('✅ All demo data wiped! Everything is now ₹0.');
    }

    // Month Navigation Listeners
    prevMonthBtn.addEventListener('click', () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        currentMonthYearBadge.textContent = availableMonths[currentMonthIndex];
        renderDashboard();
        saveToLocalStorage();
        showToast(`Viewing ${availableMonths[currentMonthIndex]}`);
      } else {
        showToast('Reached earliest available month');
      }
    });

    nextMonthBtn.addEventListener('click', () => {
      if (currentMonthIndex < availableMonths.length - 1) {
        currentMonthIndex++;
        currentMonthYearBadge.textContent = availableMonths[currentMonthIndex];
        renderDashboard();
        saveToLocalStorage();
        showToast(`Viewing ${availableMonths[currentMonthIndex]}`);
      } else {
        showToast('Reached latest available month');
      }
    });

    // ==========================================
    // DEPLOYED PROTECTION MODE & RESTORE/SYNC LOGIC
    // ==========================================
    const DEPLOY_PROTECT_KEY = 'mysmartplan_deploy_protection';

    function setDeployProtection(isProtected, save = true) {
      if (deployProtectionToggle) {
        deployProtectionToggle.checked = isProtected;
      }
      if (triggerResetModalBtn && resetBtnLabel) {
        if (isProtected) {
          triggerResetModalBtn.disabled = true;
          triggerResetModalBtn.className = "w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60";
          resetBtnLabel.textContent = "🔒 Reset Disabled (Deployed Mode)";
        } else {
          triggerResetModalBtn.disabled = false;
          triggerResetModalBtn.className = "w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95";
          resetBtnLabel.textContent = "🔄 Reset Demo";
        }
      }
      if (save) {
        try {
          localStorage.setItem(DEPLOY_PROTECT_KEY, isProtected ? 'true' : 'false');
        } catch (e) {}
      }
    }

    if (deployProtectionToggle) {
      deployProtectionToggle.addEventListener('change', (e) => {
        setDeployProtection(e.target.checked, true);
        if (e.target.checked) {
          showToast('🛡️ Deployed Protection ON: Reset button locked & disabled');
        } else {
          showToast('Deployed Protection OFF: Reset button unlocked');
        }
      });
    }

    // Reset Modal Listeners with Protection Guard
    triggerResetModalBtn.addEventListener('click', () => {
      if (deployProtectionToggle && deployProtectionToggle.checked) {
        showToast('🛡️ Reset is locked to protect your deployed data. Turn off Deployed Protection above to unlock.');
        return;
      }
      resetConfirmModal.classList.remove('hidden');
    });

    cancelResetBtn.addEventListener('click', () => {
      resetConfirmModal.classList.add('hidden');
    });

    resetConfirmModal.addEventListener('click', (e) => {
      if (e.target === resetConfirmModal) {
        resetConfirmModal.classList.add('hidden');
      }
    });

    const clearAllStartFreshBtn = document.getElementById('clearAllStartFreshBtn');
    if (clearAllStartFreshBtn) {
      clearAllStartFreshBtn.addEventListener('click', () => {
        if (deployProtectionToggle && deployProtectionToggle.checked) {
          showToast('🛡️ Reset is locked in Deployed Protection Mode.');
          return;
        }
        clearAllStartFresh();
      });
    }
    confirmResetBtn.addEventListener('click', () => {
      if (deployProtectionToggle && deployProtectionToggle.checked) {
        showToast('🛡️ Reset is locked in Deployed Protection Mode.');
        return;
      }
      resetToDemoDefaults();
    });
    exportJsonBackupBtn.addEventListener('click', exportJsonBackup);

    // ==========================================
    // RECOVERY SNAPSHOTS & CLOUD SYNC LOGIC
    // ==========================================
    function renderRecoverySnapshotsList() {
      if (!recoverySnapshotsList) return;
      try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        const snapshots = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(snapshots) || snapshots.length === 0) {
          recoverySnapshotsList.innerHTML = '<p class="text-[10px] text-slate-400 italic">No auto-recovery snapshots yet.</p>';
          return;
        }
        recoverySnapshotsList.innerHTML = snapshots.map((s, idx) => `
          <div class="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div>
              <p class="text-[10px] font-semibold text-slate-800">${s.time}</p>
              <p class="text-[9px] text-slate-500">${s.txCount} transactions</p>
            </div>
            <button type="button" onclick="window.restoreSnapshotByIndex(${idx})" class="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 cursor-pointer">
              Restore
            </button>
          </div>
        `).join('');
      } catch (e) {
        recoverySnapshotsList.innerHTML = '<p class="text-[10px] text-rose-500">Error loading snapshots</p>';
      }
    }

    window.restoreSnapshotByIndex = function(idx) {
      try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        const snapshots = raw ? JSON.parse(raw) : [];
        if (snapshots[idx] && snapshots[idx].data) {
          const s = snapshots[idx].data;
          if (Array.isArray(s.categories) && s.categories.length > 0) categories = s.categories;
          if (Array.isArray(s.transactions)) transactions = s.transactions;
          if (Array.isArray(s.recurringBills)) recurringBills = s.recurringBills;
          if (s.billingMode) billingMode = s.billingMode;
          if (typeof s.currentMonthIndex === 'number') currentMonthIndex = s.currentMonthIndex;
          saveToLocalStorage(true);
          renderDashboard();
          if (restoreDataModal) restoreDataModal.classList.add('hidden');
          showToast(`Restored snapshot from ${snapshots[idx].time}! 🎉`);
        }
      } catch (e) {
        showToast('Snapshot restore failed: ' + e.message);
      }
    };

    // Calendar Export (.ics)
    function exportBillsToCalendarIcs() {
      if (!recurringBills || recurringBills.length === 0) {
        showToast('No recurring bills found to export.');
        return;
      }
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      let icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MySmartPlan//RecurringBills//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      recurringBills.forEach((bill, index) => {
        const dayMatch = (bill.dueDay || '').match(/\d+/);
        const day = dayMatch ? parseInt(dayMatch[0], 10) : 5;
        const dayStr = String(Math.min(Math.max(day, 1), 28)).padStart(2, '0');
        const dtstart = `${year}${month}${dayStr}T090000`;
        const dtend = `${year}${month}${dayStr}T100000`;
        const uid = `bill-${bill.id || index}-${year}${month}@mysmartplan.app`;
        
        icsLines.push('BEGIN:VEVENT');
        icsLines.push(`UID:${uid}`);
        icsLines.push(`DTSTAMP:${year}${month}01T000000Z`);
        icsLines.push(`DTSTART:${dtstart}`);
        icsLines.push(`DTEND:${dtend}`);
        icsLines.push(`SUMMARY:Bill Due: ${bill.title} (₹${bill.amount})`);
        icsLines.push(`DESCRIPTION:MySmart Plan recurring bill reminder for ${bill.title}. Amount: ₹${bill.amount}.`);
        if (bill.cycleMonths && bill.cycleMonths > 1) {
          icsLines.push(`RRULE:FREQ=MONTHLY;INTERVAL=${bill.cycleMonths}`);
        } else {
          icsLines.push('RRULE:FREQ=MONTHLY;INTERVAL=1');
        }
        icsLines.push('BEGIN:VALARM');
        icsLines.push('TRIGGER:-P1D');
        icsLines.push('ACTION:DISPLAY');
        icsLines.push(`DESCRIPTION:Reminder: ${bill.title} is due tomorrow!`);
        icsLines.push('END:VALARM');
        icsLines.push('END:VEVENT');
      });

      icsLines.push('END:VCALENDAR');
      
      const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MySmartPlan_Bill_Reminders.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📅 Calendar reminders exported! Open with Google Calendar to set native phone alarms.');
    }

    if (exportCalendarIcsBtn) {
      exportCalendarIcsBtn.addEventListener('click', exportBillsToCalendarIcs);
    }

    // Upcoming Bills Check & Due Alerts
    function checkUpcomingBills() {
      if (!upcomingBillsBanner || !upcomingBillsDesc) return;
      const now = new Date();
      const currentDay = now.getDate();
      
      const dueSoonBills = recurringBills.filter(b => {
        if (b.paid) return false;
        const dayMatch = (b.dueDay || '').match(/\d+/);
        if (!dayMatch) return false;
        const due = parseInt(dayMatch[0], 10);
        return due >= currentDay && due <= (currentDay + 4);
      });

      if (dueSoonBills.length > 0) {
        const first = dueSoonBills[0];
        upcomingBillsDesc.textContent = `${first.title} (₹${first.amount}) is due on ${first.dueDay}!`;
        upcomingBillsBanner.classList.remove('hidden');
      } else {
        upcomingBillsBanner.classList.add('hidden');
      }
    }

    if (dismissUpcomingBillsBtn) {
      dismissUpcomingBillsBtn.addEventListener('click', () => {
        if (upcomingBillsBanner) upcomingBillsBanner.classList.add('hidden');
      });
    }

    if (enableBillAlertsBtn) {
      enableBillAlertsBtn.addEventListener('click', async () => {
        if (!('Notification' in window)) {
          showToast('Notifications not supported by this browser. Use Calendar .ics export instead!');
          return;
        }
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            if (billAlertsBtnLabel) billAlertsBtnLabel.textContent = '🔔 Alerts ON';
            showToast('🔔 Due alerts active! You will be notified when bills are near.');
          } else {
            showToast('Notification permission was ' + perm);
          }
        } catch (e) {
          showToast('Alerts: ' + e.message);
        }
      });
    }

    // Storage Shield: Persistent Memory Protection
    function updatePersistentStorageUI(isPersisted) {
      if (persistStorageStatusText && requestPersistStorageBtn) {
        if (isPersisted) {
          persistStorageStatusText.textContent = 'Permanent storage active (Immune to cleanups)';
          persistStorageStatusText.className = 'text-[10px] font-semibold text-emerald-700';
          requestPersistStorageBtn.textContent = 'Active ✓';
          requestPersistStorageBtn.className = 'px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold pointer-events-none';
        } else {
          persistStorageStatusText.textContent = 'Standard storage: Tap to lock & protect';
          persistStorageStatusText.className = 'text-[10px] text-slate-500';
          requestPersistStorageBtn.textContent = 'Protect ✓';
          requestPersistStorageBtn.className = 'px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer';
        }
      }
    }

    async function checkPersistentStorage() {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
        try {
          const isPersisted = await navigator.storage.persisted();
          updatePersistentStorageUI(isPersisted);
        } catch (e) {
          console.warn('Persist check failed:', e);
        }
      } else {
        if (persistStorageStatusText) persistStorageStatusText.textContent = 'Standard persistent browser storage';
      }
    }

    if (requestPersistStorageBtn) {
      requestPersistStorageBtn.addEventListener('click', async () => {
        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
          try {
            const isPersisted = await navigator.storage.persist();
            updatePersistentStorageUI(isPersisted);
            if (isPersisted) {
              showToast('🛡️ Storage Shield Active: Data won\'t be cleared by Android!');
            } else {
              showToast('Protected under standard browser profile storage.');
            }
          } catch (e) {
            showToast('Storage API: ' + e.message);
          }
        } else {
          showToast('Persistent Storage is active by default in your browser.');
        }
      });
    }

    // Cloud Sync (Firebase REST)
    function initCloudSync() {
      try {
        const savedUrl = localStorage.getItem(CLOUD_SYNC_KEY);
        if (savedUrl) {
          if (cloudSyncUrlInput) cloudSyncUrlInput.value = savedUrl;
          if (cloudSyncStatusBadge) {
            cloudSyncStatusBadge.textContent = '🟢 Connected';
            cloudSyncStatusBadge.className = 'text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full';
          }
          pullFromCloudSync(savedUrl);
        }
      } catch (e) {}
    }

    async function pullFromCloudSync(url) {
      if (!url || !url.startsWith('http')) return;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data && (data.transactions || data.categories)) {
          if (Array.isArray(data.categories) && data.categories.length > 0) categories = data.categories;
          if (Array.isArray(data.transactions)) transactions = data.transactions;
          if (Array.isArray(data.recurringBills)) recurringBills = data.recurringBills;
          if (data.billingMode) billingMode = data.billingMode;
          saveToLocalStorage(false);
          renderDashboard();
        }
      } catch (e) {
        console.warn('Cloud sync pull error:', e);
      }
    }

    if (saveCloudSyncBtn && cloudSyncUrlInput) {
      saveCloudSyncBtn.addEventListener('click', async () => {
        const url = cloudSyncUrlInput.value.trim();
        if (!url) {
          localStorage.removeItem(CLOUD_SYNC_KEY);
          if (cloudSyncStatusBadge) {
            cloudSyncStatusBadge.textContent = 'Offline';
            cloudSyncStatusBadge.className = 'text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full';
          }
          showToast('Cloud Sync disconnected. Using local offline storage.');
          return;
        }
        if (!url.startsWith('https://')) {
          showToast('Please enter a valid https:// database URL.');
          return;
        }
        try {
          saveCloudSyncBtn.textContent = 'Connecting...';
          const payload = {
            categories,
            transactions,
            recurringBills,
            billingMode,
            currentMonthIndex,
            timestamp: Date.now()
          };
          const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            localStorage.setItem(CLOUD_SYNC_KEY, url);
            if (cloudSyncStatusBadge) {
              cloudSyncStatusBadge.textContent = '🟢 Connected';
              cloudSyncStatusBadge.className = 'text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full';
            }
            showToast('Cloud Sync connected! 🎉 All devices with this URL will stay synced.');
          } else {
            showToast('Server returned: ' + res.status);
          }
        } catch (err) {
          showToast('Failed to connect to cloud URL: ' + err.message);
        } finally {
          saveCloudSyncBtn.textContent = 'Sync';
        }
      });
    }

    // Restore / Sync Modal Listeners
    if (triggerRestoreModalBtn) {
      triggerRestoreModalBtn.addEventListener('click', () => {
        renderRecoverySnapshotsList();
        if (restoreDataModal) restoreDataModal.classList.remove('hidden');
      });
    }
    if (closeRestoreModalBtn) {
      closeRestoreModalBtn.addEventListener('click', () => {
        if (restoreDataModal) restoreDataModal.classList.add('hidden');
      });
    }
    if (cancelRestoreModalBtn) {
      cancelRestoreModalBtn.addEventListener('click', () => {
        if (restoreDataModal) restoreDataModal.classList.add('hidden');
      });
    }
    if (restoreDataModal) {
      restoreDataModal.addEventListener('click', (e) => {
        if (e.target === restoreDataModal) restoreDataModal.classList.add('hidden');
      });
    }

    let pendingImportJsonText = '';

    if (restoreFileInput) {
      restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            pendingImportJsonText = evt.target.result;
            if (restoreJsonTextarea) restoreJsonTextarea.value = pendingImportJsonText;
          };
          reader.readAsText(file);
        }
      });
    }

    function applyRestoreSync(jsonString) {
      if (!jsonString || !jsonString.trim()) {
        showToast('Please select a JSON backup file or paste backup text.');
        return;
      }
      try {
        const parsed = JSON.parse(jsonString.trim());
        if (!parsed || typeof parsed !== 'object') {
          showToast('Invalid backup format');
          return;
        }
        if (!parsed.transactions && !parsed.categories) {
          showToast('File does not contain valid MySmart Plan data');
          return;
        }

        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          categories = parsed.categories;
        }
        if (Array.isArray(parsed.transactions)) {
          transactions = parsed.transactions;
        }
        if (Array.isArray(parsed.recurringBills)) {
          recurringBills = parsed.recurringBills;
        }
        if (parsed.billingMode) {
          billingMode = parsed.billingMode;
        }
        if (typeof parsed.currentMonthIndex === 'number' && parsed.currentMonthIndex >= 0 && parsed.currentMonthIndex < availableMonths.length) {
          currentMonthIndex = parsed.currentMonthIndex;
        }

        saveToLocalStorage();
        renderDashboard();
        if (restoreDataModal) restoreDataModal.classList.add('hidden');
        showToast('Data restored & synced successfully! 🎉');
      } catch (err) {
        showToast('Failed to parse JSON backup: ' + (err.message || 'Syntax error'));
      }
    }

    if (confirmRestoreBtn) {
      confirmRestoreBtn.addEventListener('click', () => {
        const textToImport = (restoreJsonTextarea && restoreJsonTextarea.value.trim()) || pendingImportJsonText;
        applyRestoreSync(textToImport);
      });
    }

    window.openResetConfirmModal = function() {
      if (deployProtectionToggle && deployProtectionToggle.checked) {
        showToast('🛡️ Reset is locked to protect your deployed data. Turn off Deployed Protection above to unlock.');
        return;
      }
      const m = document.getElementById('resetConfirmModal');
      if (m) m.classList.remove('hidden');
    };
    window.closeResetConfirmModal = function() {
      const m = document.getElementById('resetConfirmModal');
      if (m) m.classList.add('hidden');
    };
    window.runClearAllStartFresh = function() {
      if (deployProtectionToggle && deployProtectionToggle.checked) {
        showToast('🛡️ Reset is locked in Deployed Protection Mode.');
        return;
      }
      clearAllStartFresh();
    };
    window.runResetToDemoDefaults = function() {
      if (deployProtectionToggle && deployProtectionToggle.checked) {
        showToast('🛡️ Reset is locked in Deployed Protection Mode.');
        return;
      }
      resetToDemoDefaults();
    };

    // Load saved data and deployed protection state from localStorage on app launch
    loadFromLocalStorage();
    try {
      const savedProtect = localStorage.getItem(DEPLOY_PROTECT_KEY);
      if (savedProtect === 'true') {
        setDeployProtection(true, false);
      } else {
        setDeployProtection(false, false);
      }
    } catch (e) {}
    currentMonthYearBadge.textContent = availableMonths[currentMonthIndex];


// Initialize Storage Shield, Cloud Sync, and Initial render
    checkPersistentStorage();
    initCloudSync();
    renderDashboard();