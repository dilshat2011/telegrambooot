// Admin Authentication — Simple password check
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2011';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  
  try {
    const { password } = JSON.parse(event.body || '{}');
    
    if (password === ADMIN_PASSWORD) {
      // In a real app, generate a JWT. For this demo, we use a simple "logged_in" flag and a timestamp.
      const token = Buffer.from(`admin:${Date.now()}:auth`).toString('base64url');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          message: 'Admin paneline xosh keldińiz!'
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Parol qate!'
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Server qatesi' })
    };
  }
};
