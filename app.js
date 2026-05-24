/* FraudDetect-AI v2.0 — Advanced Transaction Fraud Detection Engine */

(function () {
  'use strict';

  // ─── DOM References ─────────────────────────────────────
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const uploadArea = document.getElementById('upload-area');
  const demoBtn = document.getElementById('demo-btn');
  const demoCount = document.getElementById('demo-count');
  const demoMix = document.getElementById('demo-mix-suspicious');
  const controlsSection = document.getElementById('controls-section');
  const analyzeBtn = document.getElementById('analyze-btn');
  const resetBtn = document.getElementById('reset-btn');
  const clearBtn = document.getElementById('clear-btn');
  const summarySection = document.getElementById('summary-section');
  const statsGrid = document.getElementById('stats-grid');
  const riskDist = document.getElementById('risk-distribution');
  const flaggedSection = document.getElementById('flagged-section');
  const flaggedCount = document.getElementById('flagged-count');
  const flaggedThead = document.getElementById('flagged-thead');
  const flaggedTbody = document.getElementById('flagged-tbody');
  const allSection = document.getElementById('all-section');
  const allCount = document.getElementById('all-count');
  const allThead = document.getElementById('all-thead');
  const allTbody = document.getElementById('all-tbody');
  const exportFlaggedBtn = document.getElementById('export-flagged-btn');
  const exportAllBtn = document.getElementById('export-all-btn');
  const exportReportBtn = document.getElementById('export-report-btn');
  const filterLevel = document.getElementById('filter-level');
  const filterSearch = document.getElementById('filter-search');
  const filterSort = document.getElementById('filter-sort');
  const previewSection = document.getElementById('data-preview');
  const previewCount = document.getElementById('preview-count');
  const previewThead = document.getElementById('preview-thead');
  const previewTbody = document.getElementById('preview-tbody');
  const detailsSection = document.getElementById('details-section');
  const flagBreakdown = document.getElementById('flag-breakdown');

  // ─── State ──────────────────────────────────────────────
  let transactions = [];
  let analyzedTransactions = [];

  const DEFAULT_PARAMS = {
    thresholdHigh: 5000,
    rapidWindow: 15,
    roundNumberMin: 500,
    oddHours: '0-5',
    riskThreshold: 25,
    riskMax: 100,
  };

  // ─── File Upload ────────────────────────────────────────
  browseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  uploadArea.addEventListener('click', function () {
    fileInput.click();
  });

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    var file = e.dataTransfer.files[0];
    if (file) loadCSV(file);
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files[0]) loadCSV(fileInput.files[0]);
  });

  clearBtn.addEventListener('click', function () {
    transactions = [];
    analyzedTransactions = [];
    previewSection.classList.add('hidden');
    controlsSection.classList.add('hidden');
    summarySection.classList.add('hidden');
    flaggedSection.classList.add('hidden');
    allSection.classList.add('hidden');
    detailsSection.classList.add('hidden');
  });

  // ─── Demo Data Generator ────────────────────────────────
  demoBtn.addEventListener('click', function () {
    var count = parseInt(demoCount.value) || 50;
    var includeSuspicious = demoMix.checked;
    transactions = generateDemoData(count, includeSuspicious);
    showPreview(transactions);
    controlsSection.classList.remove('hidden');
  });

  function generateDemoData(count, includeSuspicious) {
    var senders = [
      'John Smith', 'Alice Johnson', 'Bob Williams', 'Emma Davis',
      'Mike Brown', 'Sarah Wilson', 'Tom Anderson', 'Linda Taylor',
      'James Martinez', 'Nina Patel', 'Chris Lee', 'Rachel Green',
      'Unknown User', 'anon_3x9f2', 'test_account'
    ];
    var recipients = [
      'Amazon', 'Netflix', 'Walmart', 'Target', 'Starbucks',
      'Crypto Wallet 0x7a3f', 'Offshore Bank Ltd', 'Gift Card Service',
      'PayPal', 'Venmo', 'Wire Transfer intl', 'Shell Corp LLC',
      'Unknown Account', 'Cash App', 'Zelle'
    ];
    var descriptions = [
      'Online purchase', 'Subscription renewal', 'Wire transfer',
      'ATM withdrawal', 'Point of sale', 'Refund',
      'Gift card purchase', 'Cash advance', 'Bank transfer',
      'Direct deposit', 'International wire', 'ACH payment'
    ];

    var rows = [];
    var now = Date.now();

    for (var i = 0; i < count; i++) {
      var date = new Date(now - Math.random() * 30 * 86400000);
      var hour = Math.floor(Math.random() * 24);
      var minute = Math.floor(Math.random() * 60);
      var amount;

      if (!includeSuspicious) {
        amount = (Math.random() * 2000 + 5).toFixed(2);
      } else {
        // Mix of normal and suspicious patterns
        var pattern = i % 20;
        if (pattern === 0) {
          // Very large amount
          amount = (10000 + Math.random() * 40000).toFixed(2);
        } else if (pattern === 5) {
          // Just under threshold
          amount = (4800 + Math.random() * 180).toFixed(2);
        } else if (pattern === 8) {
          // Round number
          amount = [1000, 2000, 5000, 10000, 9999][Math.floor(Math.random() * 5)];
        } else if (pattern === 12) {
          // Small but odd hour
          amount = (10 + Math.random() * 200).toFixed(2);
          hour = Math.floor(Math.random() * 5);
        } else {
          amount = (Math.random() * 2000 + 10).toFixed(2);
        }
      }

      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');

      rows.push({
        id: 'TXN-' + String(i + 1).padStart(4, '0'),
        date: year + '-' + month + '-' + day,
        time: String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0'),
        sender: senders[Math.floor(Math.random() * senders.length)],
        recipient: recipients[Math.floor(Math.random() * recipients.length)],
        amount: parseFloat(amount),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        _sortKey: new Date(year + '-' + month + '-' + day).getTime() + hour * 3600000 + minute * 60000,
      });
    }

    // Add rapid succession cluster (suspicious pattern)
    if (includeSuspicious) {
      var rapidBase = now - 3 * 86400000;
      var rapidSender = 'Unknown User';
      for (var j = 0; j < 8; j++) {
        var t = rapidBase + j * 60000 * (1 + Math.random() * 4);
        var d = new Date(t);
        rows.push({
          id: 'TXN-RAPID-' + String(j + 1).padStart(3, '0'),
          date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
          time: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'),
          sender: rapidSender,
          recipient: 'Crypto Wallet 0x7a3f',
          amount: parseFloat((300 + Math.random() * 200).toFixed(2)),
          description: 'Wire transfer',
          _sortKey: t,
        });
      }

      // Add late-night transactions
      for (var k = 0; k < 5; k++) {
        var nDate = new Date(now - Math.random() * 15 * 86400000);
        var nHour = Math.floor(Math.random() * 5);
        rows.push({
          id: 'TXN-NIGHT-' + String(k + 1).padStart(3, '0'),
          date: nDate.getFullYear() + '-' + String(nDate.getMonth() + 1).padStart(2, '0') + '-' + String(nDate.getDate()).padStart(2, '0'),
          time: String(nHour).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
          sender: 'anon_3x9f2',
          recipient: 'Offshore Bank Ltd',
          amount: parseFloat((9999 + Math.random() * 10000).toFixed(2)),
          description: 'International wire',
          _sortKey: nDate.getTime() + nHour * 3600000,
        });
      }
    }

    return rows.sort(function (a, b) { return a._sortKey - b._sortKey; });
  }

  // ─── CSV Loading ────────────────────────────────────────
  function loadCSV(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var lines = e.target.result.split(/\r?\n/).filter(function (l) { return l.trim(); });
      if (lines.length < 2) {
        alert('CSV must have a header row and at least one data row.');
        return;
      }

      var headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase().replace(/"/g, ''); });
      transactions = [];

      for (var i = 1; i < lines.length; i++) {
        var vals = parseCSVLine(lines[i]);
        var row = {};
        headers.forEach(function (h, idx) {
          row[h] = vals[idx] || '';
        });

        // Flexible column mapping
        row.amount = parseFloat(row.amount || row.value || row.price || row.total || 0);
        row.date = row.date || row.tx_date || row.transaction_date || '';
        row.time = row.time || row.timestamp || row.tx_time || '';
        row.sender = row.sender || row.from || row.payer || row.originator || '';
        row.recipient = row.recipient || row.to || row.payee || row.destination || '';
        row.description = row.description || row.desc || row.memo || row.note || row.purpose || '';
        row.id = row.id || row.transaction_id || row.tx_id || row.ref || String(i);

        transactions.push(row);
      }

      showPreview(transactions);
      controlsSection.classList.remove('hidden');
    };
    reader.readAsText(file);
  }

  function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  // ─── Preview ────────────────────────────────────────────
  function showPreview(data) {
    previewSection.classList.remove('hidden');
    previewCount.textContent = data.length + ' records';

    var cols = ['id', 'date', 'time', 'sender', 'recipient', 'amount', 'description'];
    previewThead.innerHTML = '<tr>' + cols.map(function (c) {
      return '<th>' + esc(c.toUpperCase()) + '</th>';
    }).join('') + '</tr>';

    var displayRows = data.slice(0, 5);
    previewTbody.innerHTML = displayRows.map(function (row) {
      return '<tr>' + cols.map(function (c) {
        var val = c === 'amount' ? '$' + (row[c] || 0).toFixed(2) : esc(String(row[c] || ''));
        return '<td>' + val + '</td>';
      }).join('') + '</tr>';
    }).join('');

    if (data.length > 5) {
      previewTbody.innerHTML += '<tr><td colspan="' + cols.length + '" class="preview-more">... and ' + (data.length - 5) + ' more rows</td></tr>';
    }
  }

  // ─── Analysis ───────────────────────────────────────────
  analyzeBtn.addEventListener('click', function () {
    if (transactions.length === 0) {
      alert('Please load transaction data first.');
      return;
    }

    var params = getParams();
    analyzedTransactions = transactions.map(function (t) {
      return analyzeTransaction(t, transactions, params);
    });

    displayResults(analyzedTransactions, params);
  });

  resetBtn.addEventListener('click', function () {
    document.getElementById('threshold-high').value = DEFAULT_PARAMS.thresholdHigh;
    document.getElementById('threshold-rapid').value = DEFAULT_PARAMS.rapidWindow;
    document.getElementById('threshold-round').value = DEFAULT_PARAMS.roundNumberMin;
    document.getElementById('odd-hours').value = DEFAULT_PARAMS.oddHours;
    document.getElementById('risk-threshold').value = DEFAULT_PARAMS.riskThreshold;
    document.getElementById('risk-max').value = DEFAULT_PARAMS.riskMax;
  });

  function getParams() {
    return {
      thresholdHigh: parseFloat(document.getElementById('threshold-high').value) || DEFAULT_PARAMS.thresholdHigh,
      rapidWindow: parseFloat(document.getElementById('threshold-rapid').value) || DEFAULT_PARAMS.rapidWindow,
      roundNumberMin: parseFloat(document.getElementById('threshold-round').value) || DEFAULT_PARAMS.roundNumberMin,
      oddHours: (document.getElementById('odd-hours').value || DEFAULT_PARAMS.oddHours).split('-').map(Number),
      riskThreshold: parseFloat(document.getElementById('risk-threshold').value) || DEFAULT_PARAMS.riskThreshold,
      riskMax: parseFloat(document.getElementById('risk-max').value) || DEFAULT_PARAMS.riskMax,
    };
  }

  function analyzeTransaction(tx, allTx, params) {
    var riskScore = 0;
    var flags = [];
    var reasons = [];
    var amount = tx.amount || 0;
    var riskScale = params.riskMax / 100; // Normalize to 100 scale

    // 1. Unusual Amount Detection
    if (amount > params.thresholdHigh) {
      var severity = amount > params.thresholdHigh * 3 ? 35 : amount > params.thresholdHigh * 2 ? 25 : 15;
      riskScore += severity;
      flags.push('HIGH_AMOUNT');
      reasons.push('Amount $' + amount.toFixed(2) + ' exceeds threshold $' + params.thresholdHigh);
    }

    // 2. Just-Under-Threshold Detection (structuring)
    if (amount >= params.thresholdHigh * 0.9 && amount < params.thresholdHigh && amount >= 500) {
      riskScore += 20;
      flags.push('UNDER_THRESHOLD');
      reasons.push('Amount $' + amount.toFixed(2) + ' suspiciously close to $' + params.thresholdHigh + ' threshold');
    }

    // 3. Round Number Detection
    if (amount >= params.roundNumberMin && amount % 100 === 0) {
      riskScore += 12;
      flags.push('ROUND_NUMBER');
      reasons.push('Exact round amount: $' + amount.toFixed(2));
    } else if (amount >= 1000 && amount % 1000 === 0) {
      riskScore += 15;
      flags.push('ROUND_NUMBER');
      reasons.push('Large round number: $' + amount.toFixed(2));
    }

    // 4. Odd Hours Detection
    var hour = parseInt(String(tx.time).split(':')[0], 10);
    if (!isNaN(hour)) {
      var oddStart = params.oddHours[0] || 0;
      var oddEnd = params.oddHours[1] || 5;
      if (hour >= oddStart && hour <= oddEnd) {
        riskScore += 15;
        flags.push('ODD_HOURS');
        reasons.push('Transaction at ' + tx.time + ' (unusual hour window: ' + oddStart + ':00-' + oddEnd + ':00)');
      }
    }

    // 5. Unknown/Suspicious Sender Detection
    var suspiciousSenders = ['unknown', 'anonymous', 'anon', 'test_', 'temp_'];
    var senderLower = (tx.sender || '').toLowerCase();
    if (suspiciousSenders.some(function (s) { return senderLower.includes(s); })) {
      riskScore += 18;
      flags.push('UNKNOWN_SENDER');
      reasons.push('Suspicious or unknown sender: ' + tx.sender);
    }

    // 6. Suspicious Recipient Detection
    var suspiciousRecipients = ['unknown', 'crypto', 'offshore', 'anonymous', 'shell'];
    var recipientLower = (tx.recipient || '').toLowerCase();
    if (suspiciousRecipients.some(function (s) { return recipientLower.includes(s); })) {
      riskScore += 12;
      flags.push('SUSPICIOUS_RECIPIENT');
      reasons.push('High-risk recipient: ' + tx.recipient);
    }

    // 7. Rapid Succession Detection
    var txTime = parseDateTime(tx.date, tx.time);
    if (txTime) {
      var rapidCount = 0;
      for (var i = 0; i < allTx.length; i++) {
        var other = allTx[i];
        if (other === tx) continue;
        if (other.sender !== tx.sender) continue;
        var otherTime = parseDateTime(other.date, other.time);
        if (!otherTime) continue;
        var diffMinutes = Math.abs(otherTime - txTime) / 60000;
        if (diffMinutes <= params.rapidWindow) {
          rapidCount++;
        }
      }
      if (rapidCount >= 3) {
        riskScore += 30;
        flags.push('RAPID_SUCCESSION');
        reasons.push((rapidCount + 1) + ' transactions from ' + tx.sender + ' within ' + params.rapidWindow + ' min');
      } else if (rapidCount >= 2) {
        riskScore += 20;
        flags.push('RAPID_SUCCESSION');
        reasons.push((rapidCount + 1) + ' transactions from ' + tx.sender + ' within ' + params.rapidWindow + ' min');
      }
    }

    // 8. Weekend/Late-Night Pattern
    if (!isNaN(hour)) {
      var dateObj = new Date(tx.date);
      var dayOfWeek = dateObj.getDay();
      var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend && (hour < 6 || hour > 23)) {
        riskScore += 8;
        flags.push('WEEKEND_ODD');
        reasons.push('Weekend late-night transaction at ' + tx.time);
      }
    }

    // Cap risk score
    riskScore = Math.min(params.riskMax, Math.max(0, riskScore));

    // Determine risk level
    var level;
    var pct = riskScore / params.riskMax;
    if (pct >= 0.75) level = 'critical';
    else if (pct >= 0.50) level = 'high';
    else if (pct >= 0.25) level = 'medium';
    else level = 'low';

    return {
      id: tx.id,
      date: tx.date,
      time: tx.time,
      sender: tx.sender,
      recipient: tx.recipient,
      amount: tx.amount,
      description: tx.description,
      riskScore: riskScore,
      level: level,
      flags: flags,
      reasons: reasons,
      flagged: riskScore >= params.riskThreshold,
    };
  }

  function parseDateTime(date, time) {
    if (!date) return null;
    var d = new Date(date + (time ? 'T' + time : 'T00:00:00'));
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  // ─── Display Results ────────────────────────────────────
  function displayResults(data, params) {
    var flagged = data.filter(function (t) { return t.flagged; });
    var clean = data.filter(function (t) { return !t.flagged; });
    var amounts = data.map(function (t) { return t.amount || 0; });
    var totalAmount = amounts.reduce(function (a, b) { return a + b; }, 0);
    var avgAmount = totalAmount / amounts.length;
    var maxAmount = Math.max.apply(null, amounts);
    var minAmount = Math.min.apply(null, amounts);
    var critical = data.filter(function (t) { return t.level === 'critical'; }).length;
    var high = data.filter(function (t) { return t.level === 'high'; }).length;
    var medium = data.filter(function (t) { return t.level === 'medium'; }).length;
    var low = data.filter(function (t) { return t.level === 'low'; }).length;
    var avgRisk = data.reduce(function (s, t) { return s + t.riskScore; }, 0) / data.length;

    // Summary stats
    summarySection.classList.remove('hidden');
    statsGrid.innerHTML = [
      statCard(data.length, 'Total Transactions', 'blue'),
      statCard(flagged.length, 'Flagged', 'red'),
      statCard(clean.length, 'Clean', 'green'),
      statCard(critical, 'Critical', 'red'),
      statCard(high + critical, 'High Risk', 'orange'),
      statCard('$' + avgAmount.toFixed(2), 'Avg Amount', 'yellow'),
      statCard('$' + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'Total Volume', 'blue'),
      statCard(avgRisk.toFixed(1) + '/' + params.riskMax, 'Avg Risk Score', 'yellow'),
    ].join('');

    // Risk distribution bar
    riskDist.innerHTML =
      '<div class="dist-header">Risk Distribution</div>' +
      '<div class="dist-bar">' +
        '<div class="dist-segment dist-critical" style="width:' + pct(critical, data.length) + '" title="Critical: ' + critical + '"></div>' +
        '<div class="dist-segment dist-high" style="width:' + pct(high, data.length) + '" title="High: ' + high + '"></div>' +
        '<div class="dist-segment dist-medium" style="width:' + pct(medium, data.length) + '" title="Medium: ' + medium + '"></div>' +
        '<div class="dist-segment dist-low" style="width:' + pct(low, data.length) + '" title="Low: ' + low + '"></div>' +
      '</div>' +
      '<div class="dist-legend">' +
        '<span class="dist-legend-item"><span class="dot dot-critical"></span>Critical (' + critical + ')</span>' +
        '<span class="dist-legend-item"><span class="dot dot-high"></span>High (' + high + ')</span>' +
        '<span class="dist-legend-item"><span class="dot dot-medium"></span>Medium (' + medium + ')</span>' +
        '<span class="dist-legend-item"><span class="dot dot-low"></span>Low (' + low + ')</span>' +
      '</div>';

    // Flag breakdown
    var flagCounts = {};
    data.forEach(function (t) {
      t.flags.forEach(function (f) {
        flagCounts[f] = (flagCounts[f] || 0) + 1;
      });
    });
    var flagKeys = Object.keys(flagCounts).sort(function (a, b) { return flagCounts[b] - flagCounts[a]; });
    flagBreakdown.innerHTML = '<div class="flag-cards">' +
      flagKeys.map(function (k) {
        var label = k.replace(/_/g, ' ');
        return '<div class="flag-card"><div class="fc-count">' + flagCounts[k] + '</div><div class="fc-label">' + esc(label) + '</div></div>';
      }).join('') + '</div>';
    detailsSection.classList.remove('hidden');

    // Populate and render flagged table
    renderFlaggedTable(data, params);
    flaggedSection.classList.remove('hidden');
    flaggedCount.textContent = flagged.length + ' flagged';

    // All transactions
    allSection.classList.remove('hidden');
    allCount.textContent = data.length + ' total';
    allThead.innerHTML = '<tr><th>ID</th><th>Date</th><th>Time</th><th>Sender</th><th>Recipient</th><th>Amount</th><th>Description</th><th>Risk</th></tr>';
    allTbody.innerHTML = data.map(function (t) {
      return '<tr class="row-' + t.level + (t.flagged ? ' row-flagged' : '') + '">' +
        '<td>' + esc(t.id) + '</td>' +
        '<td>' + esc(t.date) + '</td>' +
        '<td>' + esc(t.time) + '</td>' +
        '<td>' + esc(t.sender) + '</td>' +
        '<td>' + esc(t.recipient) + '</td>' +
        '<td class="amount">$' + (t.amount || 0).toFixed(2) + '</td>' +
        '<td>' + esc(t.description) + '</td>' +
        '<td><span class="risk-badge risk-' + t.level + '">' + t.riskScore + '</span></td>' +
      '</tr>';
    }).join('');

    // Export handlers
    exportFlaggedBtn.onclick = function () { exportFlaggedCSV(flagged); };
    exportAllBtn.onclick = function () { exportAllJSON(data); };
    exportReportBtn.onclick = function () { exportHTMLReport(data, params, flagged); };
  }

  function renderFlaggedTable(data, params) {
    var filtered = filterFlaggedData(data);
    var flagged = filtered.filter(function (t) { return t.flagged; });

    flaggedThead.innerHTML = '<tr><th>ID</th><th>Date</th><th>Time</th><th>Sender</th><th>Recipient</th><th>Amount</th><th>Risk</th><th>Level</th><th>Flags</th></tr>';
    flaggedTbody.innerHTML = flagged.length > 0
      ? flagged.map(function (t) {
          return '<tr class="row-' + t.level + '">' +
            '<td>' + esc(t.id) + '</td>' +
            '<td>' + esc(t.date) + '</td>' +
            '<td>' + esc(t.time) + '</td>' +
            '<td>' + esc(t.sender) + '</td>' +
            '<td>' + esc(t.recipient) + '</td>' +
            '<td class="amount">$' + (t.amount || 0).toFixed(2) + '</td>' +
            '<td><strong>' + t.riskScore + '</strong>/' + params.riskMax + '</td>' +
            '<td><span class="risk-badge risk-' + t.level + '">' + t.level.toUpperCase() + '</span></td>' +
            '<td title="' + esc(t.reasons.join('\n')) + '">' + t.flags.join(', ') + '</td>' +
          '</tr>';
        }).join('')
      : '<tr><td colspan="9" class="empty-msg">No flagged transactions match current filters</td></tr>';
  }

  function filterFlaggedData(data) {
    var level = filterLevel.value;
    var search = filterSearch.value.toLowerCase();
    var sort = filterSort.value;

    var filtered = data.filter(function (t) {
      if (level !== 'all') {
        if (level === 'critical' && t.level !== 'critical') return false;
        if (level === 'high' && t.riskScore < 50) return false;
        if (level === 'medium' && t.riskScore < 25) return false;
      }
      if (search) {
        var haystack = (t.sender + ' ' + t.recipient + ' ' + t.flags.join(' ') + ' ' + t.description).toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) {
      switch (sort) {
        case 'risk-desc': return b.riskScore - a.riskScore;
        case 'risk-asc': return a.riskScore - b.riskScore;
        case 'amount-desc': return (b.amount || 0) - (a.amount || 0);
        case 'date-desc': return (parseDateTime(b.date, b.time) || 0) - (parseDateTime(a.date, a.time) || 0);
        default: return b.riskScore - a.riskScore;
      }
    });

    return filtered;
  }

  // Filter event listeners
  filterLevel.addEventListener('change', function () {
    if (analyzedTransactions.length) renderFlaggedTable(analyzedTransactions, getParams());
  });
  filterSearch.addEventListener('input', function () {
    if (analyzedTransactions.length) renderFlaggedTable(analyzedTransactions, getParams());
  });
  filterSort.addEventListener('change', function () {
    if (analyzedTransactions.length) renderFlaggedTable(analyzedTransactions, getParams());
  });

  // ─── Export Functions ───────────────────────────────────
  function exportFlaggedCSV(flagged) {
    var header = 'id,date,time,sender,recipient,amount,description,riskScore,level,flags,reasons';
    var rows = flagged.map(function (t) {
      return [t.id, t.date, t.time, '"' + t.sender + '"', '"' + t.recipient + '"',
        t.amount, '"' + t.description + '"', t.riskScore, t.level,
        '"' + t.flags.join(';') + '"', '"' + t.reasons.join(';') + '"'
      ].join(',');
    });
    download([header].concat(rows).join('\n'), 'fraud_flagged_' + Date.now() + '.csv', 'text/csv');
  }

  function exportAllJSON(data) {
    var exportData = data.map(function (t) {
      return {
        id: t.id, date: t.date, time: t.time, sender: t.sender, recipient: t.recipient,
        amount: t.amount, description: t.description,
        riskScore: t.riskScore, level: t.level, flagged: t.flagged,
        flags: t.flags, reasons: t.reasons,
      };
    });
    download(JSON.stringify({ summary: { total: data.length, flagged: data.filter(function (t) { return t.flagged; }).length, timestamp: new Date().toISOString() }, transactions: exportData }, null, 2), 'fraud_analysis_' + Date.now() + '.json', 'application/json');
  }

  function exportHTMLReport(data, params, flagged) {
    var criticalCount = data.filter(function (t) { return t.level === 'critical'; }).length;
    var highCount = data.filter(function (t) { return t.level === 'high'; }).length;
    var html = '<!DOCTYPE html><html><head><title>Fraud Detection Report</title><style>body{font-family:sans-serif;max-width:900px;margin:40px auto;padding:20px;background:#0a0a0f;color:#ecf0f1}h1{color:#ff6b6b}table{width:100%;border-collapse:collapse;font-size:0.85rem}th,td{padding:8px;border-bottom:1px solid #333;text-align:left}th{background:#1a1a2e;color:#ff6b6b}.crit{color:#e74c3c}.high{color:#e67e22}.med{color:#f1c40f}.low{color:#2ecc71}.stat{display:inline-block;background:#12121e;padding:15px;border-radius:8px;margin:5px;text-align:center}.stat-val{font-size:2rem;font-weight:bold}.stat-lbl{font-size:0.8rem;color:#7f8c8d}</style></head><body>';
    html += '<h1>🔍 Fraud Detection Report</h1>';
    html += '<p>Generated: ' + new Date().toLocaleString() + ' | ' + data.length + ' transactions analyzed</p>';
    html += '<div class="stat"><div class="stat-val" style="color:#e74c3c">' + flagged.length + '</div><div class="stat-lbl">Flagged</div></div>';
    html += '<div class="stat"><div class="stat-val" style="color:#c0392b">' + criticalCount + '</div><div class="stat-lbl">Critical</div></div>';
    html += '<div class="stat"><div class="stat-val" style="color:#e67e22">' + highCount + '</div><div class="stat-lbl">High Risk</div></div>';
    html += '<h2>Flagged Transactions</h2>';
    html += '<table><tr><th>ID</th><th>Date</th><th>Sender</th><th>Recipient</th><th>Amount</th><th>Risk</th><th>Level</th><th>Flags</th></tr>';
    flagged.forEach(function (t) {
      html += '<tr><td>' + esc(t.id) + '</td><td>' + esc(t.date) + '</td><td>' + esc(t.sender) + '</td><td>' + esc(t.recipient) + '</td><td>$' + t.amount.toFixed(2) + '</td><td>' + t.riskScore + '</td><td class="' + t.level.charAt(0) + '">' + t.level.toUpperCase() + '</td><td>' + t.flags.join(', ') + '</td></tr>';
    });
    html += '</table></body></html>';
    download(html, 'fraud_report_' + Date.now() + '.html', 'text/html');
  }

  // ─── Utilities ──────────────────────────────────────────
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function statCard(value, label, color) {
    return '<div class="stat-card"><div class="stat-value ' + color + '">' + value + '</div><div class="stat-label">' + label + '</div></div>';
  }

  function pct(count, total) {
    return total > 0 ? Math.round((count / total) * 100) + '%' : '0%';
  }

  function download(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
})();
