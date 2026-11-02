// MySmart Plan - Application Script
document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const navHome = document.getElementById('navHome');
  const navExpenses = document.getElementById('navExpenses');
  const navCategories = document.getElementById('navCategories');

  const viewHome = document.getElementById('viewHome');
  const viewExpenses = document.getElementById('viewExpenses');
  const viewCategories = document.getElementById('viewCategories');

  function switchTab(activeNav, activeView) {
    [navHome, navExpenses, navCategories].forEach(n => {
      n.classList.remove('text-indigo-600', 'font-bold');
      n.classList.add('text-slate-400', 'font-medium');
    });
    activeNav.classList.remove('text-slate-400', 'font-medium');
    activeNav.classList.add('text-indigo-600', 'font-bold');

    [viewHome, viewExpenses, viewCategories].forEach(v => v.classList.add('hidden'));
    activeView.classList.remove('hidden');
  }

  navHome?.addEventListener('click', () => switchTab(navHome, viewHome));
  navExpenses?.addEventListener('click', () => switchTab(navExpenses, viewExpenses));
  navCategories?.addEventListener('click', () => switchTab(navCategories, viewCategories));

  // Backup functionality
  document.getElementById('backupBtn')?.addEventListener('click', () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('mysmartplan_txs') || '[]'),
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MySmartPlan_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Restore functionality
  document.getElementById('restoreBtn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.transactions) {
            localStorage.setItem('mysmartplan_txs', JSON.stringify(parsed.transactions));
            alert('Data restored successfully!');
            location.reload();
          }
        } catch (err) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Background storage persistence request (silent, no alerts or popups)
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
});
