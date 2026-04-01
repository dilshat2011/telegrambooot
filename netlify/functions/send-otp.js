const { getStore } = require('@netlify/blobs');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  
  try {
    const { phone, name, surname } = JSON.parse(event.body || '{}');
    const normalPhone = (phone || '').replace(/\D/g, '').replace(/^998/, '').slice(-9);

    if (normalPhone.length < 9) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Telefon nomeri qate' }) };
    }

    try {
      if (name && surname) {
        const phoneStore = getStore('phones');
        await phoneStore.set(normalPhone, JSON.stringify({
          name: `${name} ${surname}`,
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('Blobs fallback in send-otp');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Kirdińiz!',
        token: 'demo',
        phone: normalPhone
      })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: err.message }) };
  }
};



