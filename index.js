const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initial default projects
const defaultProjects = [
  { id: 1, icon: '🏗️', category: 'Infrastruktura', filter: 'infrastructure', name: "Kósheni rawajlandırıw", desc: "Shımbay rayonındaǵı tiykarǵı kóshelerdı zámanagóy órtewler menen tólewlew hám jarıtıw sistemasın keńeytiw.", votes: 312, maxVotes: 500, color: '#6C3FF5' },
  { id: 2, icon: '🌳', category: 'Ekologiya', filter: 'ecology', name: "Jasıl park qurıw", desc: "Nókis qalasında 2 gektarlıq aymaqta zámanagóy dem alıs bagın barpo etiw.", votes: 278, maxVotes: 500, color: '#22C55E' },
  { id: 3, icon: '📚', category: "Bilimlendiriw", filter: 'education', name: "Mektep kitebanasın modernizatsiyalaw", desc: "34-mektep kitebanasına zámanagóy kompyuterler, elektron resurslar hám jańa kitaplar qosıw.", votes: 445, maxVotes: 500, color: '#F59E0B' },
  { id: 4, icon: '🏥', category: "Sálametliklendiriw", filter: 'health', name: "Poliklinika abzallandırıw", desc: "5-qala poliklinikasına zámanagóy medicinlıq qurallar satıp alıw hám shipakerler shifasın asırıw.", votes: 389, maxVotes: 500, color: '#EF4444' },
  { id: 5, icon: '💧', category: 'Infrastruktura', filter: 'infrastructure', name: "Ishimilik suw sisteması", desc: "Beruniy rayonındaǵı 3 mahallede jańa suw taminatı qubırların salıw.", votes: 201, maxVotes: 500, color: '#00D2FF' },
  { id: 6, icon: '🎭', category: "Bilimlendiriw", filter: 'education', name: "Jaslar oraylın ashıw", desc: "Qońırat rayonında sport, óner hám texnologiya úyirmelerin ózinde jámlegen jaslar orayın tashkil etiw.", votes: 356, maxVotes: 500, color: '#8B63FF' }
];

// Helper to Load/Save Data
async function loadData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    const initialData = { projects: defaultProjects, votes: {} };
    await saveData(initialData);
    return initialData;
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Routes
app.get('/api/projects', async (req, res) => {
  const data = await loadData();
  res.json({ success: true, data: data.projects });
});

app.post('/api/send-otp', async (req, res) => {
  const { phone, name, surname } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Telefon nomeri kerek' });
  
  // Demo Mode: Always return success and a token
  res.json({
    success: true,
    message: 'OTP jiberildi (Demo)',
    token: 'demo-token-' + Date.now(),
    phone: phone
  });
});

app.post('/api/vote', async (req, res) => {
  const { phone, projectId } = req.body;
  if (!phone || !projectId) return res.status(400).json({ success: false, message: 'Maǵlıwmat jetispeydi' });

  const data = await loadData();
  const normalPhone = phone.replace(/\D/g, '').replace(/^998/, '').slice(-9);
  
  // Check if already voted
  if (data.votes[normalPhone]) {
    return res.status(400).json({ success: false, message: 'Bir paydalanıwshı tek bir márte dawıs bere aladı.' });
  }

  // Update Project
  const project = data.projects.find(p => p.id === parseInt(projectId));
  if (!project) return res.status(404).json({ success: false, message: 'Joba tabılmadı' });

  project.votes = (project.votes || 0) + 1;
  data.votes[normalPhone] = { projectId, votedAt: new Date().toISOString() };
  
  await saveData(data);
  res.json({ success: true, message: 'Dawısıńız qabıl etildi!', project });
});

// Admin Routes
app.post('/api/admin-auth', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') { // Simple default password
    res.json({ success: true, token: 'admin-session-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Parol qate!' });
  }
});

app.get('/api/admin-stats', async (req, res) => {
  const data = await loadData();
  const projects = data.projects;
  const votes = Object.values(data.votes);
  
  // Prepare stats structure for admin.js
  res.json({
    success: true,
    stats: {
      votes: votes.length,
      users: Object.keys(data.votes).length,
      projects: projects.length
    },
    projects: projects,
    votes: votes.slice(-20).map(v => ({
      userName: 'Puqara',
      projectName: projects.find(p => p.id == v.projectId)?.name || 'Námálum',
      timestamp: v.votedAt
    })),
    rankings: [...projects].sort((a, b) => b.votes - a.votes).slice(0, 10),
    users: Object.keys(data.votes).map(phone => ({
      phone: phone,
      name: 'Puqara',
      updatedAt: new Date().toISOString()
    })),
    categories: [
      { name: 'Infrastruktura', count: projects.filter(p => p.filter === 'infrastructure').length },
      { name: 'Bilimlendiriw', count: projects.filter(p => p.filter === 'education').length }
    ]
  });
});

app.post('/api/admin-actions', async (req, res) => {
  const { action, payload } = req.body;
  const data = await loadData();

  if (action === 'UPSERT_PROJECT') {
    if (payload.id) {
      const idx = data.projects.findIndex(p => p.id == payload.id);
      if (idx !== -1) data.projects[idx] = { ...data.projects[idx], ...payload };
    } else {
      const newId = data.projects.length > 0 ? Math.max(...data.projects.map(p => p.id)) + 1 : 1;
      data.projects.push({ ...payload, id: newId, votes: 0 });
    }
  } else if (action === 'DELETE_PROJECT') {
    data.projects = data.projects.filter(p => p.id != payload.id);
  }

  await saveData(data);
  res.json({ success: true });
});

// Serve Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve Main Page for all other routes (Single Page App style fallback if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
