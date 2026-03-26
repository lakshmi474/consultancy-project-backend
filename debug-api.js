import https from 'https';

https.get('https://consultancy-project-backend-b890.onrender.com/api/orders', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('Orders Count:', data.length);
      data.slice(0, 5).forEach((o, i) => {
        console.log(`Order ${i}: _id=${o._id}, hasUser=${!!o.user}, userType=${typeof o.user}, hasTotal=${o.total !== undefined}, createdAt=${o.createdAt}`);
      });
    } catch (e) {
      console.error('Failed to parse:', e.message);
      console.log('Body:', body.slice(0, 100));
    }
  });
}).on('error', e => console.error('Error:', e.message));
