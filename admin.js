/**
 * ASHIQ BYUDJET - ADMIN PANEL LOGIC
 * Features: Dashboard, Project CRUD, User Management, Analytics
 */

const API = {
  auth: '/.netlify/functions/admin-auth',
  stats: '/.netlify/functions/admin-stats',
  actions: '/.netlify/functions/admin-actions'
};

class AdminPanel {
  constructor() {
    this.token = localStorage.getItem('admin_token');
    this.data = { projects: [], users: [], votes: [] };
    this.chart = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    if (this.token) {
      await this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  setupEventListeners() {
    // Login
    document.getElementById('adminLoginBtn').addEventListener('click', () => this.handleLogin());
    document.getElementById('adminLogoutBtn').addEventListener('click', () => this.handleLogout());

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(item.dataset.view);
      });
    });

    // Mobile Sidebar
    document.getElementById('openSidebar').addEventListener('click', () => this.toggleSidebar(true));
    document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar(false));

    // Dashboard Refresh (Interval)
    setInterval(() => { if(this.token) this.loadStats(); }, 30000); // Every 30s

    // Project Modals
    document.getElementById('addNewProjectBtn').addEventListener('click', () => this.openProjectModal());
    document.querySelectorAll('.am-close').forEach(b => b.addEventListener('click', () => this.closeProjectModal()));
    // Filters & Search
    document.getElementById('userSearch').addEventListener('input', (e) => this.filterUsers(e.target.value));
    document.getElementById('exportUsersBtn').addEventListener('click', () => this.exportUsersCSV());

    // Settings
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());
  }

  // --- AUTH ---
  async handleLogin() {
    const password = document.getElementById('adminPass').value;
    const btn = document.getElementById('adminLoginBtn');
    
    if(!password) { this.showToast('Parolni kiritiń!'); return; }
    
    btn.textContent = '⏳ Tekserilmekte...';
    btn.disabled = true;

    try {
      const res = await fetch(API.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }).then(r => r.json());

      if (res.success) {
        this.token = res.token;
        localStorage.setItem('admin_token', this.token);
        this.showToast('🎉 Xosh keldińiz!', 'success');
        this.showDashboard();
      } else {
        this.showToast('❌ Parol qate!', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      this.showToast('‼️ Server menen baylanıs joq! (Netlify dev isletiliwi kerek)', 'error');
    } finally {
      btn.textContent = 'Kiriw';
      btn.disabled = false;
    }
  }

  handleLogout() {
    this.token = null;
    localStorage.removeItem('admin_token');
    location.reload();
  }

  // --- UI FLOW ---
  showLogin() {
    document.getElementById('adminLoginOverlay').classList.add('open');
    document.getElementById('adminDashboard').style.display = 'none';
  }

  async showDashboard() {
    document.getElementById('adminLoginOverlay').classList.remove('open');
    document.getElementById('adminDashboard').style.display = 'flex';
    this.switchView('dashboard');
    await this.loadStats();
    this.initChart();
  }

  switchView(viewId) {
    // Update Nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Update Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active-panel');
      if (panel.id === `view-${viewId}`) panel.classList.add('active-panel');
    });

    // Update Title
    const titles = {
      dashboard: '📊 Dashboard Overview',
      projects: '🏗️ Project Management',
      users: '👥 Registered Citizens',
      votes: '🗳️ Live Voting Audit',
      categories: '📁 Infrastructure Categories',
      settings: '⚙️ Global System Settings'
    };
    document.getElementById('viewTitle').textContent = titles[viewId] || 'Admin Panel';

    // Close Mobile Sidebar
    this.toggleSidebar(false);
  }

  toggleSidebar(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
  }

  // --- DATA LOADING ---
  async loadStats() {
    try {
      const res = await fetch(API.stats, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }).then(r => r.json());

      if (res.success) {
        this.data = res;
        document.getElementById('statTotalVotes').textContent = res.stats.votes.toLocaleString();
        document.getElementById('statTotalUsers').textContent = res.stats.users;
        document.getElementById('statTotalProjects').textContent = res.stats.projects;

        this.renderRankingList(res.rankings);
        this.renderProjectsTable(res.projects);
        this.renderUsersTable(res.users);
        this.renderVotesTable(res.votes);
        this.renderCategoriesTable(res.categories);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }

  // --- VOTES & CATEGORIES ---
  renderVotesTable(votes) {
    const body = document.getElementById('votesTableBody');
    if (!body) return;
    if (!votes?.length) { body.innerHTML = '<tr><td colspan="3">Dawıslar tabılmadı</td></tr>'; return; }
    body.innerHTML = votes.map(v => `
      <tr>
        <td>${v.userName || 'Anonymous'}</td>
        <td>${v.projectName || 'Unknown Project'}</td>
        <td>${new Date(v.timestamp).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  renderCategoriesTable(cats) {
    const body = document.getElementById('categoriesTableBody');
    if (!body) return;
    if (!cats?.length) { body.innerHTML = '<tr><td colspan="4">Kategoriyalar tabılmadı</td></tr>'; return; }
    body.innerHTML = cats.map(c => `
      <tr>
        <td>${c.icon || '📁'}</td>
        <td style="font-weight:600">${c.name}</td>
        <td>${c.count || 0}</td>
        <td><button class="admin-btn-small" onclick="admin.showToast('Category editing soon')">✏️</button></td>
      </tr>
    `).join('');
  }

  // --- SETTINGS ---
  async saveSettings() {
    const title = document.getElementById('sTitle').value;
    const status = document.getElementById('sVoteStatus').value;
    
    this.showToast('⏳ Sazlamalar saqlanbaqta...', 'info');
    
    // Simulating API call for settings
    setTimeout(() => {
      this.showToast('✅ Sazlamalar tabıslı saqlandı!', 'success');
    }, 1000);
  }

  // --- USERS ---
  renderUsersTable(users) {
    const body = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
      body.innerHTML = '<tr><td colspan="5" style="text-align:center">Paydalanıwshı tabılmadı</td></tr>';
      return;
    }

    body.innerHTML = users.map(u => `
      <tr>
        <td style="font-weight:600">${u.name || 'Anonym'}</td>
        <td>+998 ${u.phone}</td>
        <td>${new Date(u.updatedAt).toLocaleDateString()}</td>
        <td>1</td>
        <td><button class="admin-btn-small" onclick="admin.showToast('User detail feature coming soon')">👁️</button></td>
      </tr>
    `).join('');
  }

  filterUsers(query) {
    const filtered = this.allUsers.filter(u => 
      u.name?.toLowerCase().includes(query.toLowerCase()) || 
      u.phone?.includes(query)
    );
    this.renderUsersTable(filtered);
  }

  exportUsersCSV() {
    if(!this.allUsers?.length) return this.showToast('Export ushın maǵlıwmat joq', 'error');
    
    let csv = 'Name,Phone,Joined\n';
    this.allUsers.forEach(u => csv += `${u.name},${u.phone},${u.updatedAt}\n`);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${Date.now()}.csv`;
    a.click();
    this.showToast('✅ CSV júklendi!', 'success');
  }

  renderRankingList(rankings) {
    const list = document.getElementById('projectRankingList');
    if (!rankings || rankings.length === 0) {
      list.innerHTML = '<p style="text-align:center;padding:20px;color:var(--admin-text-dim)">Maǵlıwmat joq</p>';
      return;
    }

    list.innerHTML = rankings.map((p, i) => `
      <div class="ranking-item anim-slide-up" style="animation-delay: ${0.1 * i}s">
        <div class="ri-index">#${i + 1}</div>
        <div class="ri-info">
          <div class="ri-name">${p.name}</div>
          <div class="ri-bar-bg"><div class="ri-bar-fill" style="width: ${(p.votes/500)*100}%; background: ${p.color || '#6366F1'}"></div></div>
        </div>
        <div class="ri-votes">${p.votes}</div>
      </div>
    `).join('');
  }

  renderProjectsTable(projects) {
    const body = document.getElementById('projectsTableBody');
    if (!projects || projects.length === 0) {
      body.innerHTML = '<tr><td colspan="6" style="text-align:center">Jobalar tabılmadı</td></tr>';
      return;
    }

    body.innerHTML = projects.map(p => `
      <tr>
        <td style="font-size:20px">${p.icon || '🏗️'}</td>
        <td style="font-weight:600">${p.name}</td>
        <td><span class="project-category">${p.category}</span></td>
        <td style="font-weight:700;color:var(--admin-primary)">${p.votes}</td>
        <td><span class="status-badge">Active</span></td>
        <td>
          <div style="display:flex;gap:10px">
            <button class="edit-p-btn" onclick="admin.openProjectModal(${p.id})">✏️</button>
            <button class="del-p-btn" onclick="admin.deleteProject(${p.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // --- PROJECT ACTIONS ---
  openProjectModal(id = null) {
    const modal = document.getElementById('projectModal');
    const p = id ? this.data.projects.find(x => x.id === id) : null;
    
    document.getElementById('projectModalTitle').textContent = p ? 'Jobanı ózgertiw' : 'Jańa joba qosıw';
    document.getElementById('pName').value = p ? p.name : '';
    document.getElementById('pIcon').value = p ? p.icon : '🏗️';
    document.getElementById('pCategory').value = p ? p.category : 'Abadanlastırıw';
    document.getElementById('pDesc').value = p ? p.desc : '';
    
    this.currentProjectId = id;
    modal.classList.add('open');
  }

  closeProjectModal() {
    document.getElementById('projectModal').classList.remove('open');
  }

  async handleSaveProject() {
    const payload = {
      id: this.currentProjectId,
      name: document.getElementById('pName').value,
      icon: document.getElementById('pIcon').value,
      category: document.getElementById('pCategory').value,
      desc: document.getElementById('pDesc').value
    };

    if(!payload.name) return this.showToast('Atın kiritiń!', 'error');

    try {
      const res = await fetch(API.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
        body: JSON.stringify({ action: 'UPSERT_PROJECT', payload })
      }).then(r => r.json());

      if(res.success) {
        this.showToast('✅ Joba saqlandı!', 'success');
        this.closeProjectModal();
        this.loadStats();
      }
    } catch { this.showToast('❌ Qate!', 'error'); }
  }

  async deleteProject(id) {
    if(!confirm('Bul jobanı óshiriwge isenimińiz kámbe?')) return;

    try {
      const res = await fetch(API.actions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
        body: JSON.stringify({ action: 'DELETE_PROJECT', payload: { id } })
      }).then(r => r.json());

      if(res.success) {
        this.showToast('🗑️ Joba óshirildi');
        this.loadStats();
      }
    } catch { this.showToast('❌ Qate!', 'error'); }
  }

  // --- ANALYTICS ---
  initChart() {
    const ctx = document.getElementById('votingTrendChart').getContext('2d');
    if (this.chart) this.chart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        datasets: [{
          label: 'Votes per hour',
          data: [42, 85, 112, 94, 156, 182, 142, 168],
          borderColor: '#6366F1',
          borderWidth: 3,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  // --- TOAST ---
  showToast(msg, type = 'info') {
    const t = document.getElementById('adminToast');
    t.textContent = msg;
    t.style.borderLeft = `5px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6366F1'}`;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }
}

// Global Ranking Item styling (Quick fix for missing styles in admin.css)
const style = document.createElement('style');
style.textContent = `
  .ranking-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--admin-border); }
  .ri-index { font-weight: 800; color: var(--admin-text-dim); width: 24px; }
  .ri-info { flex: 1; }
  .ri-name { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .ri-bar-bg { height: 6px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; }
  .ri-bar-fill { height: 100%; border-radius: 10px; transition: 1s ease; }
  .ri-votes { font-weight: 700; font-size: 14px; color: var(--admin-primary); }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  window.admin = new AdminPanel();
});
