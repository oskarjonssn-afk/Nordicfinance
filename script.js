// --- API Konfiguration för Vercel ---
// Använd miljövariabler i Vercel (inställningar -> Environment Variables)
const apiKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_STOCK_API_KEY : 'DIN_API_NYCKEL_HÄR';

// Om du använder Google Gemini SDK via CDN:
// import { GoogleGenAI } from "https://esm.run/@google/genai";
// (Notera: För en helt statisk sida utan bundler krävs CDN-import)

let currentStockData = null;
let stockChart = null;

// --- Funktion för att uppdatera värden i DOM ---
function updateUIValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// --- Exempel på budgetberäkning ---
function calculateBudget(income, expenses) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const disposable = income - totalExpenses;
    
    updateUIValue('income-display', income.toLocaleString() + ' kr');
    updateUIValue('expenses-display', totalExpenses.toLocaleString() + ' kr');
    updateUIValue('disposable-display', disposable.toLocaleString() + ' kr');
}

// --- Google Finance Style Chart ---
function renderStockChart(historyData) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const { prices, labels } = historyData;
    
    if (stockChart) stockChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(25, 103, 210, 0.2)');
    gradient.addColorStop(1, 'rgba(25, 103, 210, 0)');

    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                borderColor: '#1967d2',
                backgroundColor: gradient,
                fill: true,
                tension: 0,
                pointRadius: 0,
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { position: 'right', beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

// Initiera appen
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    console.log("Nordic Finance laddad med API-nyckel konfiguration.");
});