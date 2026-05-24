// FraudDetect-AI — Fraud Detection Dashboard

const transactions = [
  { id: 'TX-7842', time: '14:32:18', merchant: 'Amazon Web Services', amount: 12499.00, country: 'US', risk: 0.92, type: 'critical' },
  { id: 'TX-7843', time: '14:31:45', merchant: 'Wire Transfer - Offshore Ltd', amount: 50000.00, country: 'KY', risk: 0.97, type: 'critical' },
  { id: 'TX-7844', time: '14:30:22', merchant: 'Coffee House NYC', amount: 5.40, country: 'US', risk: 0.08, type: 'low' },
  { id: 'TX-7845', time: '14:29:58', merchant: 'Crypto Exchange Pro', amount: 8750.00, country: 'SG', risk: 0.88, type: 'critical' },
  { id: 'TX-7846', time: '14:28:12', merchant: 'Office Supplies Depot', amount: 342.18, country: 'US', risk: 0.15, type: 'low' },
  { id: 'TX-7847', time: '14:27:44', merchant: 'Electronics Mart', amount: 2899.00, country: 'CN', risk: 0.72, type: 'high' },
  { id: 'TX-7848', time: '14:26:30', merchant: 'Gas Station Plus', amount: 48.50, country: 'US', risk: 0.05, type: 'low' },
  { id: 'TX-7849', time: '14:25:15', merchant: 'Pharmacy HealthCare', amount: 125.00, country: 'US', risk: 0.22, type: 'low' },
  { id: 'TX-7850', time: '14:24:00', merchant: 'International Wire - Panama', amount: 25000.00, country: 'PA', risk: 0.95, type: 'critical' },
  { id: 'TX-7851', time: '14:22:45', merchant: 'Grocery Market', amount: 89.32, country: 'US', risk: 0.03, type: 'low' },
  { id: 'TX-7852', time: '14:21:18', merchant: 'Electronics World', amount: 4299.00, country: 'RU', risk: 0.81, type: 'high' },
  { id: 'TX-7853', time: '14:19:55', merchant: 'Restaurant Le Bistro', amount: 156.80, country: 'FR', risk: 0.35, type: 'medium' },
  { id: 'TX-7854', time: '14:18:30', merchant: 'Travel Agency World', amount: 3200.00, country: 'AE', risk: 0.68, type: 'high' },
  { id: 'TX-7855', time: '14:17:00', merchant: 'Book Store Reading', amount: 34.99, country: 'US', risk: 0.02, type: 'low' },
];

const alerts = [
  { title: 'Anomalous Wire Transfer', severity: 'critical', time: '2 min ago', desc: 'Large wire transfer ($50K) to offshore account in Cayman Islands. Pattern matches known money laundering technique.' },
  { title: 'Rapid Geo Switching', severity: 'critical', time: '5 min ago', desc: 'Transactions detected from 3 different countries within 10 minutes. Card used in Russia and Panama simultaneously.' },
  { title: 'Unusual Amount Pattern', severity: 'high', time: '12 min ago', desc: 'Multiple purchases just below $10K threshold (structuring). Consider SAR filing.' },
  { title: 'New Merchant Category', severity: 'medium', time: '20 min ago', desc: 'First-time transaction with crypto exchange. Customer profile shows no prior crypto activity.' },
];

function renderTransactions(filter = 'all') {
  const tbody = document.getElementById('txBody');
  tbody.innerHTML = '';

  const filtered = filter === 'all' ? transactions :
    transactions.filter(t => t.type === filter);

  filtered.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${tx.id}</strong></td>
      <td>${tx.time}</td>
      <td>${tx.merchant}</td>
      <td class="amount">$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td>${tx.country}</td>
      <td>
        <div class="risk-bar">
          <div class="risk-bar-bg">
            <div class="risk-bar-fill ${tx.type}" style="width: ${tx.risk * 100}%"></div>
          </div>
          <span class="risk-score-text" style="color: var(--risk-${tx.type})">${tx.risk.toFixed(2)}</span>
        </div>
      </td>
      <td><span class="risk-badge ${tx.type}">${tx.type.toUpperCase()}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAlerts() {
  const container = document.getElementById('alertContainer');
  container.innerHTML = '';
  alerts.forEach(alert => {
    const card = document.createElement('div');
    card.className = `alert-card ${alert.severity}`;
    card.innerHTML = `
      <div class="alert-header">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-time">${alert.time}</div>
      </div>
      <div class="alert-desc">${alert.desc}</div>
      <button class="alert-action">Review Transaction →</button>
    `;
    container.appendChild(card);
  });
}

function renderHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 84; i++) {
    const risk = Math.random();
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    let bg;
    if (risk < 0.25) bg = `rgba(220, 252, 231, ${0.3 + risk * 2})`;
    else if (risk < 0.5) bg = `rgba(254, 240, 138, ${risk * 1.5})`;
    else if (risk < 0.75) bg = `rgba(254, 215, 170, ${risk * 1.5})`;
    else bg = `rgba(254, 202, 202, ${risk * 1.3})`;
    cell.style.background = bg;
    cell.title = `Risk Score: ${risk.toFixed(2)}`;
    grid.appendChild(cell);
  }
}

function renderPieChart() {
  const counts = { critical: 3, high: 3, medium: 2, low: 6 };
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  const colors = { critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a' };

  let angle = 0;
  const gradientParts = [];
  Object.entries(counts).forEach(([type, count]) => {
    const slice = (count / total) * 360;
    gradientParts.push(`${colors[type]} ${angle}deg ${angle + slice}deg`);
    angle += slice;
  });

  document.getElementById('pieChart').style.background = `conic-gradient(${gradientParts.join(', ')})`;

  const legend = document.getElementById('pieLegend');
  legend.innerHTML = '';
  Object.entries(counts).forEach(([type, count]) => {
    const item = document.createElement('div');
    item.className = 'pie-legend-item';
    item.innerHTML = `<span class="pie-dot" style="background:${colors[type]}"></span>${type}: ${count}`;
    legend.appendChild(item);
  });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTransactions(btn.dataset.filter);
  });
});

// Init
renderTransactions();
renderAlerts();
renderHeatmap();
renderPieChart();
