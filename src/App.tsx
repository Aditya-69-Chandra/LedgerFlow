import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  Sparkles, 
  AlertTriangle,
  User,
  LogOut,
  Calendar,
  Briefcase,
  PieChart as PieIcon,
  FileText,
  Printer,
  ChevronRight,
  Filter,
  Layers,
  Info
} from 'lucide-react';

interface UserProfile {
  name: string;
  profession: string;
  budget: number;
  email?: string;
  currencyCode?: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = ['Food', 'Utilities', 'Entertainment', 'Rent', 'Miscellaneous'];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹ Indian Rupee)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'USD ($ US Dollar)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR (€ Euro)', locale: 'en-IE' },
  { code: 'GBP', symbol: '£', label: 'GBP (£ British Pound)', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥ Japanese Yen)', locale: 'ja-JP' },
  { code: 'CAD', symbol: '$', label: 'CAD ($ Canadian Dollar)', locale: 'en-CA' },
  { code: 'AUD', symbol: '$', label: 'AUD ($ Australian Dollar)', locale: 'en-AU' },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ UAE Dirham)', locale: 'ar-AE' },
  { code: 'SGD', symbol: '$', label: 'SGD ($ Singapore Dollar)', locale: 'en-SG' },
];

const TAG_RULES: Record<string, string[]> = {
  Food: ["food", "bites", "lunch", "dinner", "breakfast", "groceries", "grocery", "restaurant", "cafe", "coffee", "starbucks", "maccas", "mcdonalds", "burger", "pizza", "eat", "eats", "supermarket"],
  Utilities: ["electric", "electricity", "water", "gas", "internet", "wifi", "broadband", "phone", "mobile", "bill", "sewer", "power", "energy", "comcast", "verizon", "t-mobile", "at&t"],
  Entertainment: ["movie", "movies", "cinema", "netflix", "spotify", "hulu", "disney", "prime", "game", "gaming", "steam", "nintendo", "xbox", "playstation", "concert", "gig", "pub", "bar", "club", "party", "ticket"],
  Rent: ["rent", "lease", "mortgage", "apartment", "house", "flat", "room", "landlord", "hoa"]
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function App() {
  // Master app state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Navigation tabs: 'dashboard' | 'reports' | 'executable-guide'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'executable-guide'>('dashboard');

  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardProfession, setOnboardProfession] = useState('');
  const [onboardBudget, setOnboardBudget] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardCurrencyCode, setOnboardCurrencyCode] = useState('INR');

  // Expense Form States
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Auto');
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));

  // Report Settings States
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(() => new Date().getMonth()); // For monthly: 0-11. For quarterly: 1-4.

  // Inline Budget Edit State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const [tempCurrencyCode, setTempCurrencyCode] = useState('INR');

  // Load state from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('localStorageBudgetState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.user) {
          setUser(parsed.user);
        }
        if (parsed.expenses) {
          setExpenses(parsed.expenses);
        }
      } catch (e) {
        console.error("Error restoration from local storage", e);
      }
    }
  }, []);

  // Save changes to local storage
  const saveStateToLocalStorage = (updatedUser: UserProfile | null, updatedExpenses: Expense[]) => {
    localStorage.setItem('localStorageBudgetState', JSON.stringify({
      user: updatedUser,
      expenses: updatedExpenses
    }));
  };

  // Automated smart regex matcher
  const autoTagCategory = (description: string): string => {
    const descLower = description.toLowerCase();
    for (const [cat, keywords] of Object.entries(TAG_RULES)) {
      for (const kw of keywords) {
        if (descLower.includes(kw)) {
          return cat;
        }
      }
    }
    return "Miscellaneous";
  };

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName.trim() || !onboardProfession.trim() || !onboardBudget) return;

    const newUser: UserProfile = {
      name: onboardName.trim(),
      profession: onboardProfession.trim(),
      budget: Math.max(0, roundToTwo(parseFloat(onboardBudget))),
      email: onboardEmail.trim(),
      currencyCode: onboardCurrencyCode
    };

    setUser(newUser);
    saveStateToLocalStorage(newUser, expenses);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || !date) return;

    let finalCategory = category;
    if (category === 'Auto') {
      finalCategory = autoTagCategory(desc);
    }

    const newExpense: Expense = {
      id: Date.now(),
      description: desc.trim(),
      amount: Math.max(0, roundToTwo(parseFloat(amount))),
      category: finalCategory,
      date: date
    };

    const nextExpenses = [...expenses, newExpense];
    setExpenses(nextExpenses);
    saveStateToLocalStorage(user, nextExpenses);

    // Reset inputs
    setDesc('');
    setAmount('');
    setCategory('Auto');
  };

  const handleDeleteExpense = (id: number) => {
    if (!confirm('Are you absolute sure you want to remove this transaction entry from historical tracks?')) return;
    const nextExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(nextExpenses);
    saveStateToLocalStorage(user, nextExpenses);
  };

  const handleReset = () => {
    if (!confirm('DANGER: This action fully wipes your onboarded user capital profile and clears every logged transaction permanently. Continue?')) return;
    setUser(null);
    setExpenses([]);
    setOnboardName('');
    setOnboardProfession('');
    setOnboardBudget('');
    setOnboardEmail('');
    setOnboardCurrencyCode('INR');
    localStorage.removeItem('localStorageBudgetState');
  };

  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    const parsedBudget = parseFloat(tempBudget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      alert("Please enter a valid non-negative number for your budget cap.");
      return;
    }
    const updatedUser = {
      ...user,
      budget: roundToTwo(parsedBudget),
      currencyCode: tempCurrencyCode
    };
    setUser(updatedUser);
    saveStateToLocalStorage(updatedUser, expenses);
    setIsEditingBudget(false);
  };

  const roundToTwo = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  const getCurrencyConfig = () => {
    const code = user?.currencyCode || 'INR';
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
  };

  const formatCurrency = (val: number) => {
    const config = getCurrencyConfig();
    return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.code }).format(val);
  };

  // Global / Month Cumulative Values (Dashboard View)
  const budgetAmount = user?.budget ? parseFloat(user.budget as any) : 0;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = budgetAmount - totalSpent;
  const spentPct = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  // Master lists values
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  expenses.forEach(exp => {
    const cat = CATEGORIES.includes(exp.category) ? exp.category : 'Miscellaneous';
    categoryTotals[cat] += exp.amount;
  });

  const getCategoryTheme = (cat: string) => {
    switch(cat) {
      case 'Food': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', fill: '#10b981', hoverBar: 'hover:bg-emerald-100', textc: 'text-emerald-600' };
      case 'Utilities': return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/50', fill: '#4f46e5', hoverBar: 'hover:bg-indigo-100', textc: 'text-indigo-600' };
      case 'Entertainment': return { bg: 'bg-amber-50 text-amber-700 border-amber-200/50', fill: '#f59e0b', hoverBar: 'hover:bg-amber-100', textc: 'text-amber-600' };
      case 'Rent': return { bg: 'bg-rose-50 text-rose-700 border-rose-200/50', fill: '#f43f5e', hoverBar: 'hover:bg-rose-100', textc: 'text-rose-600' };
      default: return { bg: 'bg-slate-100 text-slate-700 border-slate-200/50', fill: '#94a3b8', hoverBar: 'hover:bg-slate-200', textc: 'text-slate-500' };
    }
  };

  const donutData = Object.entries(categoryTotals).map(([label, value]) => ({
    label,
    value,
    theme: getCategoryTheme(label)
  }));
  const totalCategorySpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // SVG Calculations for Donut segment arcs
  let accumulatedPercentage = 0;

  // REPORT ENGINE INTEGRATION
  // Available Years parsed from transactions
  const availableYears = Array.from(new Set([
    new Date().getFullYear().toString(),
    ...expenses.map(exp => exp.date.substring(0, 4))
  ])).sort().reverse();

  // Filter expenses strictly matching Selected Period settings
  const getFilteredReportExpenses = () => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const year = expDate.getFullYear().toString();
      const month = expDate.getMonth(); // 0-11
      
      if (year !== selectedYear) return false;
      
      if (reportType === 'monthly') {
        return month === selectedPeriodIndex;
      } else if (reportType === 'quarterly') {
        // selectedPeriodIndex is 1, 2, 3, or 4
        const quarter = Math.floor(month / 3) + 1;
        return quarter === selectedPeriodIndex;
      }
      // Annual matches all elements in selectedYear
      return true;
    });
  };

  const reportExpenses = getFilteredReportExpenses();
  const reportSpentTotal = reportExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Pro-rate Budget limits based on selected report types
  let reportBudgetLimit = budgetAmount;
  let reportPeriodName = "";

  if (reportType === 'monthly') {
    reportBudgetLimit = budgetAmount;
    reportPeriodName = `${MONTH_NAMES[selectedPeriodIndex]} ${selectedYear}`;
  } else if (reportType === 'quarterly') {
    reportBudgetLimit = budgetAmount * 3;
    reportPeriodName = `Q${selectedPeriodIndex} (Quarter ${selectedPeriodIndex}), ${selectedYear}`;
  } else {
    reportBudgetLimit = budgetAmount * 12;
    reportPeriodName = `Full Year ${selectedYear}`;
  }

  const reportRemaining = reportBudgetLimit - reportSpentTotal;
  const reportSpentPct = reportBudgetLimit > 0 ? (reportSpentTotal / reportBudgetLimit) * 100 : 0;

  // Report Category Outlay breakdown
  const reportCategoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

  reportExpenses.forEach(exp => {
    const cat = CATEGORIES.includes(exp.category) ? exp.category : 'Miscellaneous';
    reportCategoryTotals[cat] += exp.amount;
  });

  const printReport = () => {
    window.print();
  };

  const emailReport = () => {
    if (!user) return;
    const emailRecipient = user.email || '';
    const subject = encodeURIComponent(`LedgerFlow Statement: ${reportPeriodName}`);
    
    let reportText = `--- LEDGERFLOW BUDGET STATEMENT ---\n`;
    reportText += `Period: ${reportPeriodName}\n`;
    reportText += `Statement Owner: ${user.name} (${user.profession})\n`;
    if (user.email) {
      reportText += `Email Address: ${user.email}\n`;
    }
    reportText += `Date Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    
    reportText += `FINANCIAL METRICS SUMMARY:\n`;
    reportText += `-------------------------------------------\n`;
    reportText += `- Net Allocation Limit : ${formatCurrency(reportBudgetLimit)}\n`;
    reportText += `- Gross Outflows Logged: ${formatCurrency(reportSpentTotal)}\n`;
    reportText += `- Remaining Balance    : ${formatCurrency(reportRemaining)}\n`;
    reportText += `-------------------------------------------\n\n`;
    
    reportText += `OUTLAY CATEGORY DISTRIBUTION:\n`;
    CATEGORIES.forEach(cat => {
      const amount = reportCategoryTotals[cat] || 0;
      const percent = reportBudgetLimit > 0 ? (amount / reportBudgetLimit) * 100 : 0;
      reportText += `- ${cat.padEnd(13)}: ${formatCurrency(amount)} (${percent.toFixed(1)}%)\n`;
    });
    
    reportText += `\nAUDITED TRANSACTIONS CHECKLIST:\n`;
    if (reportExpenses.length === 0) {
      reportText += `No transactions logged for this matching period scope.\n`;
    } else {
      [...reportExpenses]
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(item => {
          reportText += `[${item.date}] ${item.description} (${item.category}): ${formatCurrency(item.amount)}\n`;
        });
    }
    
    reportText += `\nReport generated securely via LedgerFlow. Zero-trust private statement tracker.\n`;
    
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:${emailRecipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div id="budget-app-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans print:bg-white print:text-black">
      
      {/* Navigation Header */}
      <nav id="app-nav" className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center shrink-0 shadow-sm gap-4 print:hidden">
        <div id="brand-logo" className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-100">
            {user ? getCurrencyConfig().symbol : '₹'}
          </div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl text-slate-900 tracking-tight leading-tight">LedgerFlow</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cloud Native Personal Budgeting</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            {/* Tab navigation selectors */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`py-1.5 px-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`py-1.5 px-3 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Reports
              </button>
              <button 
                onClick={() => setActiveTab('executable-guide')}
                className={`py-1.5 px-3 rounded-lg transition-all ${activeTab === 'executable-guide' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Desktop App
              </button>
            </div>

            <div id="user-status-badge" className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 rounded-full py-1.5 px-3">
              <span className="inline-block h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 hidden md:inline">{user.name}</span>
              <button 
                onClick={handleReset} 
                id="reset-state-button"
                className="text-xs text-red-500 hover:text-red-700 font-medium pl-2.5 border-l border-slate-200 transition-colors flex items-center space-x-1"
              >
                <LogOut className="h-3 w-3 inline" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Workspace Frame */}
      <main className="grow flex flex-col justify-center items-center p-4 md:p-8 print:p-0 print:bg-white">
        
        {/* VIEW 1: Onboarding Experience */}
        {!user ? (
          <section id="onboarding-card-panel" className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Capital Deployment
              </span>
              <h2 className="font-display text-2xl font-bold text-slate-900">Define Your Capital Profile</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure your professional profile and monthly net income allocation parameters to unlock real-time telemetry tracking.
              </p>
            </div>

            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    id="onboard-user-name"
                    required
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    placeholder="Jane Doe" 
                    className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profession</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    id="onboard-user-profession"
                    required
                    value={onboardProfession}
                    onChange={(e) => setOnboardProfession(e.target.value)}
                    placeholder="Software Architect" 
                    className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Spend Cap & Currency</label>
                <div className="flex gap-2">
                  <select
                    value={onboardCurrencyCode}
                    onChange={(e) => setOnboardCurrencyCode(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                  <div className="relative grow">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {CURRENCIES.find(c => c.code === onboardCurrencyCode)?.symbol || '₹'}
                    </span>
                    <input 
                      type="number" 
                      id="onboard-user-budget"
                      step="0.01"
                      required
                      value={onboardBudget}
                      onChange={(e) => setOnboardBudget(e.target.value)}
                      placeholder="5000.00" 
                      className="w-full border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gmail / Email Address (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">✉️</span>
                  <input 
                    type="email" 
                    id="onboard-user-email"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder="yourname@gmail.com" 
                    className="w-full border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                id="onboard-submit-button"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl shadow-lg transition-all"
              >
                Access Budget Dashboard
              </button>
            </form>
          </section>
        ) : (
          
          /* VIEW 2: Dashboard Experience */
          <div className="w-full max-w-7xl">
            
            {/* ACTIVE TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <section id="budget-dashboard-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start self-start print:hidden">
                
                {/* LEFT COLUMN (Control Panel) - 4 columns */}
                <div id="deck-left" className="lg:col-span-4 space-y-6">
                  
                  {/* User Greeting Card */}
                  <div id="user-context-card" className="bg-slate-950 text-white border border-slate-850 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <span className="inline-block px-2.5 py-0.5 bg-indigo-550/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                        Ledger Registered
                      </span>
                      <div>
                        <p className="text-xs text-slate-400">Ledger Owner</p>
                        <h3 className="font-display text-2xl font-bold text-white tracking-tight leading-tight">
                          {user.name}
                        </h3>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{user.profession}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                            <span className="text-indigo-400 text-xs font-bold shrink-0">✉️</span>
                            <span className="truncate select-all">{user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Visual mesh bg decor */}
                    <div className="absolute -right-8 -top-8 h-28 w-28 bg-indigo-550/30 rounded-full blur-xl"></div>
                    <div className="absolute -right-4 -bottom-8 h-28 w-28 bg-emerald-500/15 rounded-full blur-xl"></div>
                  </div>

                  {/* Record Transaction Form */}
                  <div id="financial-capture-form" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-slate-900 tracking-tight text-md">Record Transaction</h4>
                      <span className="inline-block text-[10px] bg-slate-150 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Instant Tag
                      </span>
                    </div>

                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <input 
                          type="text" 
                          id="expense-desc-input"
                          required
                          placeholder="e.g., Starbucks Coffee, Electric Company"
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount ({getCurrencyConfig().symbol})</label>
                          <input 
                            type="number" 
                            step="0.01"
                            id="expense-amount-input"
                            required
                            placeholder="12.50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                          <select 
                            id="expense-category-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl py-2.5 px-2 bg-white text-xs font-medium focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 focus:border-indigo-500"
                          >
                            <option value="Auto">✨ Auto-Tag</option>
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Date</label>
                        <div className="relative">
                          <Calendar className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            type="date" 
                            id="expense-date-input"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        id="expense-submit-btn"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Log Expense Range</span>
                      </button>
                    </form>
                  </div>

                  {/* Machine Learning Helper Info Card */}
                  <div id="category-assistant-card" className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4.5 space-y-2.5">
                    <p className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span>Rule-Engine Auto-Tagging</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Assigning expenses dynamically via text regex tracking. Let the engine run on <strong className="text-indigo-900">Auto-Tag</strong> and key statements will organize themselves instantly. Try tags like "grocery", "wifi" or "netflix".
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN (Ledger, Visualization & Analytics) - 8 columns */}
                <div id="deck-right" className="lg:col-span-8 space-y-6">
                  
                  {/* Exhaustion Banner warning (> 85%) */}
                  {spentPct >= 85 && (
                    <div id="threshold-exhaustion-warn" className="border border-amber-200 bg-amber-50 rounded-2xl p-5 flex items-start space-x-3.5 shadow-sm shadow-amber-100/40 animate-fade-in">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-amber-900">Warning: High Consumption Threshold Exceeded!</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Your cumulative tracking metrics indicate total outlays have transcended <strong className="font-bold">85% of your declared net income</strong>. We recommend locking non-essential outlays until the next rollover cycle.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metrics Summary Rows */}
                  <div id="summary-metrics-deck" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Total Net Range Card */}
                    <div id="card-net-cap" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Cap Allocation</span>
                        <ShieldCheck className="h-4 w-4 text-slate-450" />
                      </div>
                      <div>
                        {isEditingBudget ? (
                          <form onSubmit={handleSaveBudget} className="space-y-1.5">
                            <div className="flex flex-col space-y-1.5">
                              <select
                                value={tempCurrencyCode}
                                onChange={(e) => setTempCurrencyCode(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 bg-slate-50 text-slate-900 cursor-pointer"
                              >
                                {CURRENCIES.map(curr => (
                                  <option key={curr.code} value={curr.code}>
                                    {curr.code} ({curr.symbol})
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 text-xs font-semibold">
                                  {CURRENCIES.find(c => c.code === tempCurrencyCode)?.symbol || '₹'}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  autoFocus
                                  value={tempBudget}
                                  onChange={(e) => setTempBudget(e.target.value)}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 text-slate-900"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setIsEditingBudget(false)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="group relative">
                            <div className="flex items-baseline justify-between">
                              <h5 className="font-display text-xl md:text-2xl font-bold text-slate-900">
                                {formatCurrency(budgetAmount)}
                              </h5>
                              <button
                                onClick={() => {
                                  setTempBudget(budgetAmount.toString());
                                  setTempCurrencyCode(user?.currencyCode || 'INR');
                                  setIsEditingBudget(true);
                                }}
                                className="opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-0.5 ml-2 cursor-pointer"
                                title="Modify budget cap instantly"
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 mt-1">
                              Declared Monthly Cap (Click Edit)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Spent Card */}
                    <div id="card-gross-spend" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Outflows</span>
                        <TrendingUp className={`h-4 w-4 ${spentPct >= 85 ? 'text-amber-500 animate-bounce' : 'text-slate-450'}`} />
                      </div>
                      <div>
                        <h5 className="font-display text-xl md:text-2xl font-bold text-slate-900">
                          {formatCurrency(totalSpent)}
                        </h5>
                        <p className="text-[10px] font-medium text-slate-450 mt-1">
                          {spentPct.toFixed(1)}% Consumption velocity
                        </p>
                      </div>
                    </div>

                    {/* Remaining Balance Card */}
                    <div id="card-net-equity" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Capital Equity</span>
                        <Wallet className={`h-4 w-4 ${remainingBalance < 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                      </div>
                      <div>
                        <h5 className={`font-display text-xl md:text-2xl font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {formatCurrency(remainingBalance)}
                        </h5>
                        <p className="text-[10px] font-medium text-slate-450 mt-1">
                          {remainingBalance < 0 ? 'Account Deficit alert' : 'Positive Surplus'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data Visualization Row */}
                  <div id="analytics-deck-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Visual chart (7 columns) */}
                    <div id="visual-pie-breakdown" className="md:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">Allocation Outlay Analysis</h4>
                        <p className="text-[10px] text-slate-400">Relative allocation spent by core categorizations</p>
                      </div>
                      
                      <div className="h-60 w-full flex flex-col justify-center items-center">
                        {expenses.length === 0 ? (
                          <div className="text-center space-y-2 py-8">
                            <PieIcon className="mx-auto h-12 w-12 text-slate-200" />
                            <p className="text-xs text-slate-450">Graph engine dormant</p>
                            <p className="text-[10px] text-slate-405">Awaiting expense logs</p>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-4">
                            <div className="relative w-36 h-36 shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                {donutData.map((item, index) => {
                                  if (item.value === 0) return null;
                                  const currentPercentage = totalCategorySpending > 0 ? (item.value / totalCategorySpending) * 100 : 0;
                                  const strokeDash = `${currentPercentage} ${100 - currentPercentage}`;
                                  const strokeOffset = 100 - accumulatedPercentage;
                                  accumulatedPercentage += currentPercentage;

                                  return (
                                    <circle 
                                      key={index}
                                      cx="21" 
                                      cy="21" 
                                      r="15.915" 
                                      fill="none" 
                                      stroke={item.theme.fill} 
                                      strokeWidth="6" 
                                      strokeDasharray={strokeDash}
                                      strokeDashoffset={strokeOffset}
                                      className="transition-all duration-300"
                                    />
                                  );
                                })}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest leading-none">Gross</span>
                                <span className="text-sm font-bold text-slate-800 tracking-tight mt-0.5">{formatCurrency(totalCategorySpending)}</span>
                              </div>
                            </div>

                            {/* Custom visual key list */}
                            <div className="space-y-1.5 text-xs w-full">
                              {donutData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-1 w-full">
                                  <span className="flex items-center space-x-2">
                                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.theme.fill }}></span>
                                    <span className="font-semibold text-slate-700">{item.label}</span>
                                  </span>
                                  <span className="text-slate-500 font-mono font-medium">{formatCurrency(item.value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Categories progress velocity (5 columns) */}
                    <div id="progress-velocity-tiers" className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">Budget Velocity</h4>
                        <p className="text-[10px] text-slate-400">Consumption rates vs Income limits</p>
                      </div>

                      <div className="space-y-4 grow flex flex-col justify-center">
                        {CATEGORIES.map(cat => {
                          const amount = categoryTotals[cat] || 0;
                          const percent = budgetAmount > 0 ? (amount / budgetAmount) * 100 : 0;
                          
                          let barStyle = 'bg-slate-400';
                          if (cat === 'Food') barStyle = 'bg-emerald-500';
                          if (cat === 'Utilities') barStyle = 'bg-indigo-600';
                          if (cat === 'Entertainment') barStyle = 'bg-amber-500';
                          if (cat === 'Rent') barStyle = 'bg-rose-500';

                          return (
                            <div key={cat} className="space-y-1.5">
                              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                                <span className="flex items-center space-x-1.5">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${barStyle}`}></span>
                                  <strong className="text-slate-800 font-semibold">{cat}</strong>
                                </span>
                                <span>{formatCurrency(amount)} ({percent.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`${barStyle} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Ledger logs tracking */}
                  <div id="transactions-ledger-panel" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">Transaction Ledger</h4>
                        <p className="text-[10px] text-slate-400">Audit checklist logs of financial outflows</p>
                      </div>
                      <span id="logs-count-badge" className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {expenses.length} logs
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 uppercase text-[9px] font-bold text-slate-500 tracking-wider">
                            <th className="py-3 px-2">Date</th>
                            <th className="py-3 px-2">Description</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2 text-right">Amount</th>
                            <th className="py-3 px-2 text-center font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                          {expenses.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-b-xl">
                                <div className="flex flex-col items-center justify-center space-y-1.5">
                                  <span className="text-2xl">📋</span>
                                  <p className="font-semibold text-xs text-slate-500">Log entries to inspect outlays</p>
                                  <p className="text-[10px] text-slate-400">Fill in the capture form on your left side panel.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            [...expenses]
                              .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map(item => {
                                const theme = getCategoryTheme(item.category);
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all text-slate-705">
                                    <td className="py-3.5 px-2 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                                      {item.date}
                                    </td>
                                    <td className="py-3.5 px-2 font-medium text-slate-900 select-all">
                                      {item.description}
                                    </td>
                                    <td className="py-3.5 px-2">
                                      <span className={`inline-block text-[9px] uppercase font-bold py-0.5 px-2 rounded-full ${theme.bg}`}>
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-2 text-right font-bold text-slate-900 font-mono">
                                      {formatCurrency(item.amount)}
                                    </td>
                                    <td className="py-3.5 px-2 text-center">
                                      <button 
                                        onClick={() => handleDeleteExpense(item.id)}
                                        id={`delete-btn-${item.id}`}
                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50/80 py-1 px-2 rounded-lg transition-all font-medium"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 inline" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* ACTIVE TAB: EXPENDITURE REPORTS */}
            {activeTab === 'reports' && (
              <section id="budget-reports-panel" className="space-y-6 print:space-y-0 print:p-0">
                
                {/* Reports Parameters Selectors (Hidden during printing) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 print:hidden">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-display font-bold text-slate-900 text-md">Configure Report Ledger</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    
                    {/* 1. Report Scope Selection */}
                    <div className="lg:col-span-3 space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Interval Scope</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                        <button 
                          onClick={() => setReportType('monthly')}
                          className={`w-full py-1.5 rounded-lg transition-all ${reportType === 'monthly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Monthly
                        </button>
                        <button 
                          onClick={() => setReportType('quarterly')}
                          className={`w-full py-1.5 rounded-lg transition-all ${reportType === 'quarterly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Quarterly
                        </button>
                        <button 
                          onClick={() => setReportType('annual')}
                          className={`w-full py-1.5 rounded-lg transition-all ${reportType === 'annual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Annual
                        </button>
                      </div>
                    </div>

                    {/* 2. Target Year Selection */}
                    <div className="lg:col-span-2 space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Calendar Year</label>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20"
                      >
                        {availableYears.map(yr => (
                          <option key={yr} value={yr}>{yr} Fiscal</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Target Period index (Depends on selection) */}
                    <div className={`${reportType === 'annual' ? 'hidden' : 'lg:col-span-2'} space-y-1.5`}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {reportType === 'monthly' ? 'Target Month Period' : 'Target Fiscal Quarter'}
                      </label>
                      <select 
                        value={selectedPeriodIndex}
                        onChange={(e) => setSelectedPeriodIndex(parseInt(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20"
                      >
                        {reportType === 'monthly' ? (
                          MONTH_NAMES.map((name, idx) => (
                            <option key={idx} value={idx}>{name}</option>
                          ))
                        ) : (
                          <>
                            <option value={1}>Quarter Q1 (Jan - Mar)</option>
                            <option value={2}>Quarter Q2 (Apr - Jun)</option>
                            <option value={3}>Quarter Q3 (Jul - Sep)</option>
                            <option value={4}>Quarter Q4 (Oct - Dec)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* 4. Target Email Address */}
                    <div className={`${reportType === 'annual' ? 'lg:col-span-4' : 'lg:col-span-2'} space-y-1.5`}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Recipient</label>
                      <input 
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={user.email || ''}
                        onChange={(e) => {
                          const updatedUser = { ...user, email: e.target.value };
                          setUser(updatedUser);
                          saveStateToLocalStorage(updatedUser, expenses);
                        }}
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* 5. Action Trigger Buttons */}
                    <div className="lg:col-span-3 flex gap-2 w-full">
                      <button 
                        onClick={printReport}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <Printer className="h-4 w-4" />
                        <span>PDF</span>
                      </button>
                      <button 
                        onClick={emailReport}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <span>✉️</span>
                        <span>Email</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* VISUAL DIGITAL REPORT (A4 Styled Card, which prints flawlessly!) */}
                <div id="printable-financial-statement" className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 shadow-md space-y-8 print:border-none print:shadow-none print:p-0 print:m-0">
                  
                  {/* Print Document Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                    <div>
                      <span className="text-[9px] tracking-widest font-bold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md print:bg-slate-100 print:text-black">
                        OFFICIAL FINANCIAL RECKONING
                      </span>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mt-2">LedgerFlow Statements</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Automated spend audit & capital telemetry</p>
                    </div>

                    <div className="text-right">
                      <h3 className="font-display font-bold text-indigo-600 text-lg md:text-xl print:text-black">{reportPeriodName}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Statement Period</p>
                      <p className="text-[9px] text-slate-350 mt-0.5 font-mono">Issued: {new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Client Context Banner */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 print:bg-white print:border-slate-300">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Statement Owner</p>
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Owner Profession</p>
                      <p className="text-xs font-semibold text-slate-900">{user.profession}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Audit Scope Limit</p>
                      <p className="text-xs font-semibold text-indigo-600 print:text-black font-mono">{formatCurrency(reportBudgetLimit)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Total Transaction logs</p>
                      <p className="text-xs font-semibold text-slate-900">{reportExpenses.length} files matched</p>
                    </div>
                  </div>

                  {/* Core Metrics Triad */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 print:bg-white print:border-slate-300">
                      <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Net Allocation Range</p>
                      <p className="font-display text-xl font-bold text-slate-900 mt-1 font-mono">{formatCurrency(reportBudgetLimit)}</p>
                    </div>
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 print:bg-white print:border-slate-300">
                      <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Gross Outflow Logged</p>
                      <p className="font-display text-xl font-bold text-slate-900 mt-1 font-mono">{formatCurrency(reportSpentTotal)}</p>
                    </div>
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 print:bg-white print:border-slate-300">
                      <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Liquid Margin Balance</p>
                      <p className={`font-display text-xl font-bold mt-1 font-mono ${reportRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(reportRemaining)}
                      </p>
                    </div>
                  </div>

                  {/* Categorical Progression Section */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-900 text-sm pb-1 border-b border-slate-100">Outlay Category Distribution</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {CATEGORIES.map(cat => {
                        const amount = reportCategoryTotals[cat] || 0;
                        const percent = reportBudgetLimit > 0 ? (amount / reportBudgetLimit) * 100 : 0;
                        let barStyle = 'bg-indigo-600';
                        if (cat === 'Food') barStyle = 'bg-emerald-500';
                        if (cat === 'Entertainment') barStyle = 'bg-amber-500';
                        if (cat === 'Rent') barStyle = 'bg-rose-500';
                        if (cat === 'Miscellaneous') barStyle = 'bg-slate-400';

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-600">
                              <span className="flex items-center space-x-2">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${barStyle}`}></span>
                                <span className="font-bold text-slate-900">{cat}</span>
                              </span>
                              <span className="font-semibold text-slate-950 font-mono">
                                {formatCurrency(amount)} ({percent.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden print:border print:border-slate-200">
                              <div 
                                className={`${barStyle} h-full rounded-full transition-all`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Period Transaction Ledgers list */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                      <h4 className="font-display font-bold text-slate-900 text-sm">Audited Transactions Checklist</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{reportExpenses.length} entries matching</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 uppercase text-[9px] font-bold text-slate-500 tracking-wider">
                            <th className="py-2.5 px-2">Date</th>
                            <th className="py-2.5 px-2">Description</th>
                            <th className="py-2.5 px-2">Category</th>
                            <th className="py-2.5 px-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reportExpenses.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-b-xl print:bg-white print:border">
                                No transactions matched the selected scope limits. Modify settings or record items.
                              </td>
                            </tr>
                          ) : (
                            [...reportExpenses]
                              .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map(item => {
                                const theme = getCategoryTheme(item.category);
                                return (
                                  <tr key={item.id} className="text-slate-700">
                                    <td className="py-2.5 px-2 font-mono text-[10px] text-slate-450 whitespace-nowrap">
                                      {item.date}
                                    </td>
                                    <td className="py-2.5 px-2 font-semibold text-slate-900">
                                      {item.description}
                                    </td>
                                    <td className="py-2.5 px-2">
                                      <span className="text-[10px] font-bold text-slate-800">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 font-mono">
                                      {formatCurrency(item.amount)}
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Printed Statement Official Signature footer */}
                  <div className="hidden print:flex justify-between items-end pt-12 mt-12 border-t border-dashed border-slate-300">
                    <div className="text-left space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Statement Compliance Verification</p>
                      <p className="text-xs font-semibold text-slate-800">Verified strictly offline using Browser Storage</p>
                    </div>
                    <div className="text-right border-t border-slate-300 pt-3 w-48">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Auditor Signature</p>
                      <p className="text-xs font-semibold text-slate-900 mt-4 h-6 border-b border-slate-300"></p>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* ACTIVE TAB: COMPILATION GUIDE */}
            {activeTab === 'executable-guide' && (
              <section id="desktop-guide-panel" className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 text-indigo-600 pb-3 border-b border-slate-100">
                  <Layers className="h-6 w-6" />
                  <h3 className="font-display font-bold text-slate-900 text-lg">Build Local Desktop Executable (.EXE / .APP)</h3>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                  <p>
                    Because this application utilizes <strong className="text-indigo-900">localStorage</strong>, it executes completely inside the browser client sandbox. This makes it a perfect candidate for compiling into a native offline Desktop application using lightweight technologies like <strong className="text-slate-900">Tauri</strong> or <strong className="text-slate-900">Electron</strong>.
                  </p>

                  <div className="bg-slate-50 border border-slate-250/60 rounded-xl p-5 space-y-3.5">
                    <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs uppercase tracking-wider text-indigo-600">
                      <Info className="h-4 w-4" />
                      <span>Option A: Tauri (Recommended - Lightweight, Fast)</span>
                    </h4>
                    <p className="text-xs">
                      Tauri packages your Vite + React assets into a native OS web view wrapper written in Rust, producing extremely tiny binary executables (~3-10MB).
                    </p>
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                      <p className="text-slate-500"># 1. Initialize Tauri in your project root</p>
                      <p className="text-emerald-400">npm run build</p>
                      <p className="text-emerald-400">npm install -D @tauri-apps/cli</p>
                      <p className="text-emerald-400">npx tauri init</p>
                      <p className="text-slate-500"># 2. Configure paths: set distDir to "../dist" and devPath to "http://localhost:3000"</p>
                      <p className="text-slate-500"># 3. Build native compiled installer</p>
                      <p className="text-emerald-400">npx tauri build</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-250/60 rounded-xl p-5 space-y-3.5">
                    <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs uppercase tracking-wider text-indigo-600">
                      <Info className="h-4 w-4" />
                      <span>Option B: Electron (Standard - Cross-Platform)</span>
                    </h4>
                    <p className="text-xs">
                      Electron runs a bundled Chromium browser, making it highly compatible but resulting in larger bundle sizes (~60-100MB).
                    </p>
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                      <p className="text-slate-500"># 1. Install electron packager tools</p>
                      <p className="text-emerald-400">npm install -D electron electron-builder</p>
                      <p className="text-slate-500"># 2. Add an electron entry script (e.g. electron.js) to load dist/index.html</p>
                      <p className="text-slate-500"># 3. Build & Package into a setup file (.exe / .dmg)</p>
                      <p className="text-emerald-400">npx electron-builder build</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">How is multi-user isolation guaranteed?</h4>
                    <p className="text-xs leading-relaxed text-slate-500">
                      When shared via a public web link, <strong className="text-slate-800">localStorage</strong> strictly runs inside each user's unique local browser storage instance. Unlike a shared server database, one user's database is physically stored in their browser cache and can never leak to or be accessed by anyone else accessing the same link. This provides complete zero-cost, private, zero-config data protection!
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>
        )}

      </main>

      {/* Global Dashboard Footer */}
      <footer className="bg-slate-950 text-slate-450 text-[10px] border-t border-slate-900 py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 mt-auto print:hidden">
        <div>
          <p>© 2026 LedgerFlow Personal Budget Manager. Preconfigured for seamless Google Cloud Run deployment.</p>
        </div>
        <div className="flex items-center space-x-3.5">
          <span className="hover:text-white transition-colors cursor-help" title="Persistent JSON microdb backups enabled">Database: Pure Local Telemetry Cached</span>
          <span className="text-slate-800">|</span>
          <span className="hover:text-white transition-colors cursor-help" title="Exposes default port 8080 internally">Target Port: 3000 Web Preview</span>
        </div>
      </footer>

    </div>
  );
}
