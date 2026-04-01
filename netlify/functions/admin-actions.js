// admin-actions.js — CRUD Operations for projects & data management
const { getStore } = require('@netlify/blobs');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const auth = event.headers.authorization;
  if (!auth) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Unauthenticated' }) };
  }

  try {
    const { action, payload } = JSON.parse(event.body || '{}');
    const projectStore = getStore('projects');
    const voteStore = getStore('votes');

    switch (action) {
      case 'UPSERT_PROJECT':
        // payload includes id, name, icon, category, desc
        if (!payload.id) payload.id = Date.now();
        payload.votes = payload.votes || 0;
        await projectStore.set(payload.id.toString(), JSON.stringify(payload));
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, project: payload }) };

      case 'DELETE_PROJECT':
        await projectStore.delete(payload.id.toString());
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Joba óshirildi' }) };

      case 'RESET_VOTES':
        // Warning: This clears all votes!
        const vList = await voteStore.list();
        for (const v of vList.blobs) {
          await voteStore.delete(v.key);
        }
        // Also reset vote counts in projects
        const pList = await projectStore.list();
        for (const p of pList.blobs) {
          const val = await projectStore.get(p.key, { type: 'json' });
          val.votes = 0;
          await projectStore.set(p.key, JSON.stringify(val));
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Barlıq dawıslar óshirildi' }) };

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Unknown action' }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
