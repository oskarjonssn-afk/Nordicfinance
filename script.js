

document.addEventListener('DOMContentLoaded', () => {
    // --- AI Initialization ---
    const apiKey = "5R8LN9ZWL9QZV6Q2"});

    // --- State ---
    let activeTab = 'home';
    let isCollapsed = false;
    let currentMonth = new Date().getMonth();
    let currentStockData = null;
    let currentStockTimeframe = '1D';
    let newExpenseType = 'variable';
    let activeBudgetIndex = 0;
    let currentNewsCategory = 'Sverige';
    let newsData = { 'Sverige': [], 'Europa': [], 'USA': [], 'Asien': [] };

    let budgets = JSON.parse(localStorage.getItem('nordic_budgets')) || [
        { name: 'Huvudbudget', income: 35000, monthlyExpenses: { 0: [], 1: [], 2: [], 3: [{ id: '1', category: 'Boende', amount: 12000, type: 'fixed' }, { id: '2', category: 'Mat', amount: 4500, type: 'variable' }, { id: '3', category: 'Nöje', amount: 2000, type: 'variable' }, { id: '4', category: 'Sparande', amount: 5000, type: 'savings' }], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] } }
    ];

    const TABS_OVERVIEW = [
        { id: 'economy', label: 'Min ekonomi', icon: 'layout-dashboard', desc: 'Få full koll på dina inkomster, utgifter och sparmål.' },
        { id: 'news', label: 'Nyheter', icon: 'newspaper', desc: 'Senaste nytt från finansvärlden, både lokalt och globalt.' },
        { id: 'stocks', label: 'Aktiehubb', icon: 'trending-up', desc: 'Analysera aktier och hitta nästa stora investering.' },
        { id: 'education', label: 'Kunskap', icon: 'book-open', desc: 'Lär dig allt om sparande, aktier och komplexa strategier.' },
        { id: 'projection', label: 'Framtidsanalys', icon: 'calculator', desc: 'Simulera din framtida förmögenhet med ränta-på-ränta.' },
    ];

    const ECONOMY_TIPS = [
        "Det bästa tillfället att börja spara var för 20 år sedan. Det näst bästa tillfället är idag.",
        "Betala dig själv först – sätt undan pengar till sparande så fort lönen kommer.",
        "Små utgifter kan bli stora summor. Se över dina abonnemang och småköp.",
        "Diversifiering är nyckeln till en stabil portfölj. Lägg inte alla ägg i samma korg.",
        "Ränta-på-ränta effekten är världens åttonde underverk. Börja tidigt!",
        "Ha alltid en buffert för oförutsedda utgifter, gärna 2-3 månadslöner.",
        "Investera i din egen kunskap. Den bästa avkastningen får du genom att lära dig mer.",
        "Köp inte saker du inte behöver, med pengar du inte har, för att imponera på folk du inte gillar.",
        "Automatisera ditt sparande så att det sker utan att du behöver tänka på det.",
        "Jämför alltid priser och villkor innan större inköp eller när du tecknar avtal."
    ];

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let expensesPieChart = null, summaryBarChart = null, timeLineChart = null, stockChart = null;

    function switchTab(tabId) {
        activeTab = tabId;
        document.querySelectorAll('.tab-content').forEach(section => section.classList.add('hidden'));
        const targetTab = document.getElementById(`tab-${tabId}`);
        if (targetTab) targetTab.classList.remove('hidden');
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.tab === tabId) {
                item.classList.add('bg-nordic-accent/10', 'text-nordic-accent');
                item.classList.remove('text-nordic-muted', 'hover:text-nordic-text', 'hover:bg-nordic-card');
            } else {
                item.classList.remove('bg-nordic-accent/10', 'text-nordic-accent');
                item.classList.add('text-nordic-muted', 'hover:text-nordic-text', 'hover:bg-nordic-card');
            }
        });
        if (tabId === 'economy') updateEconomyCharts();
    }
    window.switchTab = switchTab;

    function initSidebar() {
        const toggleBtn = document.getElementById('toggle-sidebar'), sidebar = document.getElementById('sidebar'), mainContent = document.getElementById('main-content'), toggleIcon = document.getElementById('toggle-icon');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
                if (isCollapsed) { sidebar.classList.add('sidebar-collapsed'); mainContent.classList.add('main-expanded'); toggleIcon.setAttribute('data-lucide', 'menu'); }
                else { sidebar.classList.remove('sidebar-collapsed'); mainContent.classList.remove('main-expanded'); toggleIcon.setAttribute('data-lucide', 'chevron-left'); }
                lucide.createIcons();
            });
        }
    }

    function initHome() {
        const grid = document.getElementById('tools-grid');
        if (grid) {
            grid.innerHTML = TABS_OVERVIEW.map(tab => `
                <button onclick="switchTab('${tab.id}')" class="glass-panel p-4 text-left hover:border-nordic-accent/40 transition-all group relative overflow-hidden">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 bg-nordic-accent/10 rounded-lg flex items-center justify-center text-nordic-accent group-hover:scale-110 transition-transform"><i data-lucide="${tab.icon}" class="w-4 h-4"></i></div>
                        <h4 class="font-bold text-base">${tab.label}</h4>
                    </div>
                    <p class="text-xs text-nordic-muted leading-relaxed">${tab.desc}</p>
                </button>
            `).join('');
        }
        lucide.createIcons();
    }

    function updateDate() {
        const dateEl = document.getElementById('current-date'), tipEl = document.getElementById('daily-tip-text'), now = new Date();
        if (dateEl) dateEl.textContent = now.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const dateKey = now.toISOString().split('T')[0], savedTipData = JSON.parse(localStorage.getItem('nordic_daily_tip'));
        if (savedTipData && savedTipData.date === dateKey) { if (tipEl) tipEl.textContent = `"${savedTipData.tip}"`; }
        else {
            const newTip = ECONOMY_TIPS[Math.floor(Math.random() * ECONOMY_TIPS.length)];
            localStorage.setItem('nordic_daily_tip', JSON.stringify({ date: dateKey, tip: newTip }));
            if (tipEl) tipEl.textContent = `"${newTip}"`;
        }
    }

    function initEconomy() {
        const incomeInput = document.getElementById('income-input');
        if (incomeInput) incomeInput.addEventListener('input', (e) => { budgets[activeBudgetIndex].income = parseFloat(e.target.value) || 0; updateEconomyUI(); });
        const monthSelector = document.getElementById('month-selector'), inputMonthSelector = document.getElementById('input-month-selector');
        const syncMonths = (e) => { currentMonth = parseInt(e.target.value); if (monthSelector) monthSelector.value = currentMonth; if (inputMonthSelector) inputMonthSelector.value = currentMonth; updateEconomyUI(); };
        if (monthSelector) monthSelector.addEventListener('change', syncMonths);
        if (inputMonthSelector) inputMonthSelector.addEventListener('change', syncMonths);
        updateEconomyUI();
    }

    window.createNewBudget = () => {
        const name = prompt('Ange namn för den nya budgeten:', `${budgets[activeBudgetIndex].name} (Kopia)`);
        if (name) { let nb = JSON.parse(JSON.stringify(budgets[activeBudgetIndex])); nb.name = name; budgets.push(nb); activeBudgetIndex = budgets.length - 1; updateEconomyUI(); }
    };

    window.saveCurrentBudget = () => { localStorage.setItem('nordic_budgets', JSON.stringify(budgets)); alert(`Alla budgetar har sparats.`); };
    window.switchBudget = (i) => { activeBudgetIndex = i; updateEconomyUI(); };

    window.setNewExpenseType = (type) => {
        newExpenseType = type;
        document.querySelectorAll('.expense-type-btn').forEach(btn => btn.classList.replace('bg-nordic-accent/10', 'bg-nordic-bg'));
        document.getElementById(`type-${type}`).classList.replace('bg-nordic-bg', 'bg-nordic-accent/10');
    };

    window.addExpense = () => {
        const cat = document.getElementById('expense-category'), amt = document.getElementById('expense-amount'), val = parseFloat(amt.value);
        if (!cat.value || isNaN(val)) return;
        if (!budgets[activeBudgetIndex].monthlyExpenses[currentMonth]) budgets[activeBudgetIndex].monthlyExpenses[currentMonth] = [];
        budgets[activeBudgetIndex].monthlyExpenses[currentMonth].push({ id: Math.random().toString(36).substr(2, 9), category: cat.value, amount: val, type: newExpenseType });
        cat.value = ''; amt.value = ''; updateEconomyUI();
    };

    window.removeExpense = (id) => { budgets[activeBudgetIndex].monthlyExpenses[currentMonth] = budgets[activeBudgetIndex].monthlyExpenses[currentMonth].filter(e => e.id !== id); updateEconomyUI(); };

    function updateEconomyUI() {
        const b = budgets[activeBudgetIndex], inc = b.income, exp = b.monthlyExpenses[currentMonth] || [];
        const tot = exp.reduce((a, c) => a + c.amount, 0);
        document.getElementById('income-display').textContent = inc.toLocaleString();
        document.getElementById('expenses-display').textContent = tot.toLocaleString();
        document.getElementById('disposable-display').textContent = (inc - tot).toLocaleString();
        const list = document.getElementById('expenses-list');
        if (list) {
            list.innerHTML = exp.map(e => `
                <div class="flex items-center justify-between p-3 bg-nordic-bg rounded-xl border border-nordic-border group">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg border ${e.type === 'fixed' ? 'text-red-500' : (e.type === 'variable' ? 'text-yellow-500' : 'text-green-500')}"><i data-lucide="${e.type === 'fixed' ? 'lock' : (e.type === 'variable' ? 'refresh-cw' : 'piggy-bank')}" class="w-4 h-4"></i></div>
                        <div class="flex flex-col"><span class="font-medium">${e.category}</span><span class="text-[10px] text-nordic-muted uppercase font-bold">${e.type}</span></div>
                    </div>
                    <div class="flex items-center gap-4"><span class="font-semibold">${e.amount.toLocaleString()} kr</span><button onclick="removeExpense('${e.id}')" class="text-nordic-muted hover:text-red-400 opacity-0 group-hover:opacity-100"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
                </div>
            `).join('');
        }
        lucide.createIcons(); updateEconomyCharts();
    }

    function updateEconomyCharts() {
        if (activeTab !== 'economy') return;
        const b = budgets[activeBudgetIndex], exp = b.monthlyExpenses[currentMonth] || [];
        const ctxPie = document.getElementById('expenses-pie-chart').getContext('2d');
        if (expensesPieChart) expensesPieChart.destroy();
        expensesPieChart = new Chart(ctxPie, { type: 'doughnut', data: { labels: exp.map(e => e.category), datasets: [{ data: exp.map(e => e.amount), backgroundColor: CHART_COLORS, borderWidth: 0 }] }, options: { cutout: '70%', plugins: { legend: { display: false } } } });
    }

    async function fetchNews() {
        const loading = document.getElementById('news-loading'), grid = document.getElementById('news-grid');
        if (!loading || !grid) return;
        loading.classList.remove('hidden'); grid.innerHTML = '';
        try {
            const res = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Hämta 6 finansiella nyheter för "${currentNewsCategory}". Svara ENDAST med JSON: { "news": [{ "title": "...", "source": "...", "time": "...", "summary": "..." }] }`,
                config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
            });
            const data = JSON.parse(res.text);
            grid.innerHTML = data.news.map(n => `<div class="glass-panel p-6 flex flex-col gap-4"><h3>${n.title}</h3><p class="text-sm text-nordic-muted">${n.summary}</p></div>`).join('');
        } catch (e) { console.error(e); } finally { loading.classList.add('hidden'); }
    }
    window.switchNewsCategory = (c) => { currentNewsCategory = c; fetchNews(); };

    async function searchStock() {
        const input = document.getElementById('stock-search-input'), query = input.value.trim();
        if (!query) return;
        const loading = document.getElementById('stock-loading'), result = document.getElementById('stock-result-container');
        loading.classList.remove('hidden'); result.classList.add('hidden');
        try {
            const res = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Hämta data för "${query}". Svara ENDAST med JSON: { "name": "...", "symbol": "...", "price": "...", "change": "...", "isPositive": true, "description": "...", "kpis": [], "history": { "1D": { "prices": [], "labels": [] } } }`,
                config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
            });
            currentStockData = JSON.parse(res.text);
            document.getElementById('stock-name').textContent = currentStockData.name;
            document.getElementById('stock-price').textContent = currentStockData.price;
            result.classList.remove('hidden');
            renderStockChart(currentStockData.history['1D']);
        } catch (e) { console.error(e); } finally { loading.classList.add('hidden'); }
    }
    window.searchStock = searchStock;

    function renderStockChart(data) {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        if (stockChart) stockChart.destroy();
        stockChart = new Chart(ctx, { type: 'line', data: { labels: data.labels, datasets: [{ data: data.prices, borderColor: '#1967d2', fill: true, tension: 0, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { position: 'right', beginAtZero: true } } } });
    }

    initSidebar(); initHome(); initEconomy(); initNews(); updateDate();
);
