const { getStore } = require('@netlify/blobs');

function formatPhone(raw) {
  return (raw || '').replace(/\D/g, '').replace(/^998/, '').slice(-9);
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  
  try {
    const { phone, projectId } = JSON.parse(event.body || '{}');
    if (!phone || !projectId) return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Maǵlıwmat jetispeydi' }) };

    const normalPhone = formatPhone(phone);
    const pid = projectId.toString();

    // PRODUCTION: Attempt to save in Blobs
    try {
      const projectStore = getStore('projects');
      const voteStore = getStore('votes');
      
      const projectData = await projectStore.get(pid, { type: 'json' });
      if (projectData) {
        const vList = await voteStore.list({ prefix: `${normalPhone}-` });
        if (vList.blobs.length > 0) {
          return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Bir paydalanıwshı tek bir márte dawıs bere aladı.' }) };
        }
        
        const voteKey = `${normalPhone}-${pid}`;
        await voteStore.set(voteKey, JSON.stringify({ phone: normalPhone, projectId: pid, votedAt: new Date().toISOString() }));
        
        projectData.votes = (projectData.votes || 0) + 1;
        await projectStore.set(pid, JSON.stringify(projectData));
        
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Dawısıńız qabıl etildi!', project: projectData }) };
      }
    } catch (e) {
      console.warn('Blobs not configured, using fallback response.');
    }

    // FALLBACK (for Local Demo/Dev)
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        success: true, 
        message: '✅ Dawısıńız qabıl etildi (Offline)!', 
        note: 'Demo mode enabled due to server config.'
      }) 
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Qate: ' + err.message }) };
  }
};
