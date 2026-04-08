/**
 * Nordic Finance - Vanilla JS Logic
 */

// --- State ---
let activeTab = 'home';
let isCollapsed = false;
let income = 35000;
let expenses = [
    { id: '1', category: 'Boende', amount: 12000, type: 'fixed' },
    { id: '2', category: 'Mat', amount: 4500, type: 'variable' },
    { id: '3', category: 'Nöje', amount: 2000, type: 'variable' },
    { id: '4', category: 'Sparande', amount: 5000, type: 'fixed' },
];
let newExpenseType = 'variable';
let profile = {
    firstName: 'Oskar',
    lastName: 'Jonsson',
    email: 'oskar.jonssn@gmail.com',
    phone: '070-123 45 67',
    avatar: ''
};

// --- Constants ---
const TABS_OVERVIEW = [
    { id: 'economy', label: 'Min ekonomi', icon: 'layout-dashboard', desc: 'Få full koll på dina inkomster, utgifter och sparmål.' },
    { id: 'news', label: 'Nyheter', icon: 'newspaper', desc: 'Senaste nytt från finansvärlden, både lokalt och globalt.' },
    { id: 'stocks', label: 'Aktiehubb', icon: 'trending-up', desc: 'Analysera aktier och hitta nästa stora investering.' },
    { id: 'education', label: 'Kunskap', icon: 'book-open', desc: 'Lär dig allt om sparande, aktier och komplexa strategier.' },
    { id: 'projection', label: 'Framtidsanalys', icon: 'calculator', desc: 'Simulera din framtida förmögenhet med ränta-på-ränta.' },
];

const NEWS_EXCERPTS = [
    { id: '1', title: 'Riksbanken lämnar styrräntan oförändrad', date: 'Idag 09:30' },
    { id: '2', title: 'Stockholmsbörsen stiger efter starka rapporter', date: 'Idag 11:15' },
    { id: '3', title: 'Inflationstakten i Eurozonen sjunker', date: 'Idag 10:00' },
    { id: '4', title: 'Tech-jättar drar upp Nasdaq till rekord', date: 'Idag 15:45' },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- Charts ---
let expensesPieChart = null;
let summaryBarChart = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initHome();
    initEconomy();
    initProfile();
    initSidebar();
    updateDate();
});

// --- Navigation ---
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update UI
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Update Sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('bg-nordic-accent/10', 'text-nordic-accent');
            item.classList.remove('text-nordic-muted', 'hover:text-nordic-text', 'hover:bg-nordic-card');
        } else {
            item.classList.remove('bg-nordic-accent/10', 'text-nordic-accent');
            item.classList.add('text-nordic-muted', 'hover:text-nordic-text', 'hover:bg-nordic-card');
        }
    });

    if (tabId === 'economy') {
        updateEconomyCharts();
    }
}

// --- Sidebar ---
function initSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleIcon = document.getElementById('toggle-icon');

    toggleBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            sidebar.classList.add('sidebar-collapsed');
            mainContent.classList.add('main-expanded');
            toggleIcon.setAttribute('data-lucide', 'menu');
        } else {
            sidebar.classList.remove('sidebar-collapsed');
            mainContent.classList.remove('main-expanded');
            toggleIcon.setAttribute('data-lucide', 'chevron-left');
        }
        lucide.createIcons();
    });
}

// --- Home Page ---
function initHome() {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = TABS_OVERVIEW.map(tab => `
        <button onclick="switchTab('${tab.id}')" class="glass-panel p-4 text-left hover:border-nordic-accent/40 transition-all group relative overflow-hidden">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 bg-nordic-accent/10 rounded-lg flex items-center justify-center text-nordic-accent group-hover:scale-110 transition-transform">
                    <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
                </div>
                <h4 class="font-bold text-base">${tab.label}</h4>
            </div>
            <p class="text-xs text-nordic-muted leading-relaxed">
                ${tab.desc}
            </p>
        </button>
    `).join('');

    const newsContainer = document.getElementById('news-excerpts');
    newsContainer.innerHTML = NEWS_EXCERPTS.map(news => `
        <div onclick="switchTab('news')" class="glass-panel p-5 hover:bg-nordic-card/50 cursor-pointer transition-all border-l-2 border-l-transparent hover:border-l-nordic-accent">
            <div class="flex items-center gap-2 mb-2 text-[10px] text-nordic-muted font-bold uppercase tracking-widest">
                <i data-lucide="clock" class="w-3 h-3"></i>
                ${news.date}
            </div>
            <h4 class="text-sm font-bold leading-snug group-hover:text-nordic-accent transition-colors">
                ${news.title}
            </h4>
        </div>
    `).join('');

    lucide.createIcons();
}

function updateDate() {
    const dateEl = document.getElementById('current-date');
    const today = new Date().toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    dateEl.textContent = today;
}

// --- Economy Page ---
function initEconomy() {
    const incomeInput = document.getElementById('income-input');
    incomeInput.addEventListener('input', (e) => {
        income = parseFloat(e.target.value) || 0;
        updateEconomyUI();
    });

    updateEconomyUI();
}

function setNewExpenseType(type) {
    newExpenseType = type;
    document.querySelectorAll('.expense-type-btn').forEach(btn => {
        btn.classList.remove('bg-nordic-accent/10', 'border-nordic-accent', 'text-nordic-accent');
        btn.classList.add('bg-nordic-bg', 'border-nordic-border', 'text-nordic-muted');
    });
    const activeBtn = document.getElementById(`type-${type}`);
    activeBtn.classList.add('bg-nordic-accent/10', 'border-nordic-accent', 'text-nordic-accent');
    activeBtn.classList.remove('bg-nordic-bg', 'border-nordic-border', 'text-nordic-muted');
}

function addExpense() {
    const categoryInput = document.getElementById('expense-category');
    const amountInput = document.getElementById('expense-amount');
    
    const category = categoryInput.value;
    const amount = parseFloat(amountInput.value);

    if (!category || isNaN(amount)) return;

    expenses.push({
        id: Math.random().toString(36).substr(2, 9),
        category,
        amount,
        type: newExpenseType
    });

    categoryInput.value = '';
    amountInput.value = '';
    updateEconomyUI();
}

function removeExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    updateEconomyUI();
}

function toggleExpenseType(id) {
    expenses = expenses.map(e => 
        e.id === id ? { ...e, type: e.type === 'fixed' ? 'variable' : 'fixed' } : e
    );
    updateEconomyUI();
}

function updateEconomyUI() {
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const disposable = income - totalExpenses;
    const fixedTotal = expenses.filter(e => e.type === 'fixed').reduce((acc, curr) => acc + curr.amount, 0);
    const variableTotal = expenses.filter(e => e.type === 'variable').reduce((acc, curr) => acc + curr.amount, 0);

    document.getElementById('income-display').textContent = income.toLocaleString();
    document.getElementById('expenses-display').textContent = totalExpenses.toLocaleString();
    document.getElementById('disposable-display').textContent = disposable.toLocaleString();

    const list = document.getElementById('expenses-list');
    list.innerHTML = expenses.map(expense => `
        <div class="flex items-center justify-between p-3 bg-nordic-bg rounded-xl border border-nordic-border group">
            <div class="flex items-center gap-3">
                <button 
                    onclick="toggleExpenseType('${expense.id}')"
                    class="p-2 rounded-lg border transition-all ${expense.type === 'fixed' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}"
                    title="${expense.type === 'fixed' ? 'Fast utgift - klicka för att ändra' : 'Rörlig utgift - klicka för att ändra'}"
                >
                    <i data-lucide="${expense.type === 'fixed' ? 'lock' : 'refresh-cw'}" class="w-4 h-4"></i>
                </button>
                <div class="flex flex-col">
                    <span class="font-medium">${expense.category}</span>
                    <span class="text-[10px] text-nordic-muted uppercase tracking-widest font-bold">
                        ${expense.type === 'fixed' ? 'Fast' : 'Rörlig'}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-semibold">${expense.amount.toLocaleString()} kr</span>
                <button 
                    onclick="removeExpense('${expense.id}')"
                    class="text-nordic-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('');

    const savingsAmount = expenses.find(e => e.category === 'Sparande')?.amount || 0;
    const savingsPercent = income > 0 ? (savingsAmount / income * 100).toFixed(1) : 0;
    document.getElementById('savings-percentage').textContent = `${savingsPercent}% av din inkomst`;

    const summaryStats = document.getElementById('summary-stats');
    const stats = [
        { name: 'Inkomst', value: income, color: '#3b82f6' },
        { name: 'Fasta', value: fixedTotal, color: '#ef4444' },
        { name: 'Rörliga', value: variableTotal, color: '#f59e0b' }
    ];
    summaryStats.innerHTML = stats.map(item => `
        <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-nordic-muted uppercase tracking-widest">${item.name}</span>
            <span class="text-sm font-bold" style="color: ${item.color}">${item.value.toLocaleString()} kr</span>
        </div>
    `).join('');

    lucide.createIcons();
    updateEconomyCharts();
}

function updateEconomyCharts() {
    if (activeTab !== 'economy') return;

    const pieCtx = document.getElementById('expenses-pie-chart').getContext('2d');
    const barCtx = document.getElementById('summary-bar-chart').getContext('2d');

    const chartData = expenses.map(e => e.amount);
    const chartLabels = expenses.map(e => e.category);

    if (expensesPieChart) expensesPieChart.destroy();
    expensesPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: CHART_COLORS,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#737373', font: { size: 10 } }
                },
                tooltip: {
                    backgroundColor: '#141414',
                    titleColor: '#f5f5f5',
                    bodyColor: '#f5f5f5',
                    borderColor: '#262626',
                    borderWidth: 1
                }
            }
        }
    });

    const fixedTotal = expenses.filter(e => e.type === 'fixed').reduce((acc, curr) => acc + curr.amount, 0);
    const variableTotal = expenses.filter(e => e.type === 'variable').reduce((acc, curr) => acc + curr.amount, 0);

    if (summaryBarChart) summaryBarChart.destroy();
    summaryBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Inkomst', 'Fasta', 'Rörliga'],
            datasets: [{
                data: [income, fixedTotal, variableTotal],
                backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b'],
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#262626' },
                    ticks: { 
                        color: '#737373',
                        callback: (value) => `${value / 1000}k`
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#737373' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#141414',
                    titleColor: '#f5f5f5',
                    bodyColor: '#f5f5f5',
                    borderColor: '#262626',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toLocaleString()} kr`
                    }
                }
            }
        }
    });
}

// --- Profile Page ---
function initProfile() {
    const form = document.getElementById('profile-form');
    const avatarInput = document.getElementById('avatar-input');
    const avatarContainer = document.getElementById('avatar-container');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileUserIcon = document.getElementById('profile-user-icon');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarUserIcon = document.getElementById('sidebar-user-icon');

    avatarContainer.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profile.avatar = event.target.result;
                profileAvatar.src = profile.avatar;
                profileAvatar.classList.remove('hidden');
                profileUserIcon.classList.add('hidden');
                
                sidebarAvatar.src = profile.avatar;
                sidebarAvatar.classList.remove('hidden');
                sidebarUserIcon.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-profile');
        const successMsg = document.getElementById('save-success');
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';

        // Update state
        profile.firstName = document.getElementById('first-name').value;
        profile.lastName = document.getElementById('last-name').value;
        profile.email = document.getElementById('email').value;
        profile.phone = document.getElementById('phone').value;

        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i data-lucide="save" class="w-5 h-5"></i> Spara ändringar';
            lucide.createIcons();
            
            successMsg.classList.remove('hidden');
            setTimeout(() => successMsg.classList.add('hidden'), 3000);
        }, 1000);
    });
}