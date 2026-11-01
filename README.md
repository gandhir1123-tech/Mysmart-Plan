# MySmart Plan 📱💰

**MySmart Plan** is a mobile-first personal and daily maintenance accounting web app designed for clean personal finance tracking and shared household or friend budgeting.

---

## 🌟 Key Features

* **Strict Two-Account Separation:**
  * **Regular Expense:** Daily living, groceries, utilities, and returnable colleague/friend claims.
  * **Personal Account:** Long-term wealth, SIP investments, emergency funds, and personal gadgets.
* **Linked Funds Transfer (`⇄ Transfer`):** Move funds between Regular and Personal accounts without distorting monthly net income or expense totals.
* **Day-Wise Ledger Cards:** Transactions are grouped chronologically by date under a clear **"Day Spent: ₹X"** header.
* **Recurring & Multi-Month Bills:** Tracks monthly, quarterly, semi-annual, and yearly recurring expenses with amortized budgeting.
* **Native Phone Calendar Alarms (`.ics`):** Export bill reminders directly into Google Calendar or Apple Calendar with automated alarms 1 day before due dates.
* **100% Offline-First & Private:** All data is saved inside your browser's persistent memory (`localStorage`). No servers, no tracking, and zero subscription fees.
* **Storage Protection Shield:** Leverages `navigator.storage.persist()` to lock storage and prevent automatic OS cache cleanups.
* **Backup, Sync & Auto-Snapshots:**
  * `💾 Backup (JSON)` and `📥 Restore / Sync` for easy data migration between devices.
  * Rolling 1-tap undo recovery snapshots.
  * Optional free real-time multi-device cloud sync via Firebase REST.
* **Deployed Protection Mode:** Built-in lock switch to disable the "Reset Demo" button once deployed with real accounting data.

---

## 📁 Repository Structure

```text
├── index.html     # Semantic HTML5 layout, Tailwind CSS styling, modals & UI views
├── script.js       # Core accounting logic, transaction management, filters & storage
└── README.md       # Project documentation & GitHub Pages deployment instructions
```

---

## 🚀 How to Run on GitHub Pages

1. **Upload Files:** Upload `index.html`, `script.js`, and `README.md` to the root of your GitHub repository (e.g., `mysmartplan`).
2. **Enable GitHub Pages:**
   * In your repository, click **Settings** (top navigation tab).
   * Click **Pages** in the left sidebar under *Code and automation*.
   * Under **Build and deployment > Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
3. **Open Your App:**
   * Wait 60 seconds for GitHub Actions to complete deployment.
   * Access your live app at:
     ```text
     https://<your-username>.github.io/<repository-name>/
     ```
   * Example: `https://gandhir1123-tech.github.io/mysmartplan/`
4. **Install on Mobile:**
   * Open the link in Chrome (Android) or Safari (iPhone).
   * Tap the browser menu **(⋮) → Add to Home screen**.
   * The app will launch in full-screen mode like a native mobile app!

---

## 🔒 Privacy & Data Ownership

All transaction data, category customizations, and monthly budgets remain strictly on your local device. No financial records are ever sent to external third parties.
