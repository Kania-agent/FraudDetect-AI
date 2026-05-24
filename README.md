# FraudDetect AI

Intelligent Transaction Fraud Analysis Engine

## Overview

FraudDetect AI is a browser-based tool that analyzes financial transactions for signs of fraudulent activity. It performs multi-dimensional risk scoring, detects common fraud patterns, and provides actionable insights through an interactive dashboard.

## Features

### Data Input
- **CSV Upload**: Drag-and-drop or browse to upload your transaction CSV files
- **Demo Dataset**: Load 50 pre-built transactions with embedded fraud patterns
- Flexible CSV parser supports various column naming conventions

### Fraud Analysis Engine
The system evaluates each transaction across 8 dimensions:

| Dimension | What It Checks |
|-----------|---------------|
| **Amount Analysis** | Z-score deviation from mean; flags extreme/unusual amounts |
| **Round Numbers** | Detects suspiciously round transaction amounts |
| **Threshold Avoidance** | Flags amounts just below $5,000 and $10,000 reporting thresholds |
| **Rapid Succession** | Identifies multiple transactions within 10-minute windows |
| **Odd Hours** | Flags transactions between midnight and 5 AM |
| **New Recipients** | Flags large transactions to recipients with no prior history |
| **Weekend Activity** | Flags large weekend transactions |
| **Absolute Threshold** | Flags very large transactions (>$15,000) |

### Risk Scoring
- Each transaction receives a risk score from **0 to 100**
- Four risk levels: **Low** (0-29), **Medium** (30-59), **High** (60-79), **Critical** (80-100)
- Transactions scoring 60+ are automatically flagged

### Dashboard
- Summary statistics (total transactions, flagged count, total amount, average risk)
- Risk distribution bar chart
- Detected patterns panel with counts and descriptions
- Sortable, filterable transaction table with pagination

### Export
- Export flagged transactions to CSV
- Export all analyzed results to CSV

## Usage

1. Open `index.html` in a modern web browser
2. Either upload a CSV file or click "Load Demo Dataset"
3. View the analysis results in the dashboard
4. Use filters to focus on specific risk levels
5. Click table headers to sort by any column
6. Export results as CSV for further analysis

## CSV Format

The parser is flexible but expects these column headers (case-insensitive):

```
id, date, amount, recipient, sender, category
```

Alternate column names are supported:
- `transaction_id`, `tx_id` for ID
- `timestamp`, `time`, `created` for date
- `value`, `total`, `sum` for amount
- `to`, `payee`, `beneficiary` for recipient
- `from`, `payer` for sender
- `type`, `description` for category

## Files

- `index.html` - Main page structure
- `style.css` - Dark theme UI styles
- `app.js` - Analysis engine and UI logic
- `README.md` - This documentation

## Technical Notes

- Pure vanilla HTML/CSS/JavaScript — no dependencies
- All processing happens client-side; no data is sent to any server
- The fraud scoring algorithm uses statistical analysis (Z-scores) combined with rule-based heuristics
- Risk scores are capped at 100; individual check contributions are weighted

## Demo Data Patterns

The built-in demo dataset includes these embedded fraud indicators:
- 4 offshore wire transfers exceeding $10,000
- 5 rapid-succession withdrawals within 10 minutes
- 3 round-number transfers ($1,000, $5,000, $9,999)
- 3 just-under-threshold transactions ($9,999, $9,950, $9,800)
- 4 odd-hours transactions (2-5 AM)
- 1 large unknown-recipient transaction ($25,000)
