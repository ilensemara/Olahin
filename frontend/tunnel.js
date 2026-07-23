import localtunnel from 'localtunnel';
import fs from 'fs';

(async () => {
  try {
    console.log('Connecting to stable localtunnel mirror (localtunnel.binw.net)...');
    const tunnel = await localtunnel({ 
      port: 5173,
      host: 'https://localtunnel.binw.net'
    });
    const url = tunnel.url;
    console.log('\n=========================================');
    console.log('OLAHIN SECURE PUBLIC HTTPS URL:');
    console.log(url);
    console.log('=========================================\n');
    
    // Save to a file we can easily read
    fs.writeFileSync('tunnel_url.txt', url);
  } catch (err) {
    console.error('Error starting tunnel:', err);
    fs.writeFileSync('tunnel_error.txt', err.message);
  }
})();
