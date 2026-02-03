import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SpendZen Server is running on port ${PORT}`);
    console.log(`📊 API Version: v1`);
    console.log(`🛡️  Error handling middleware active`);
    console.log(`🌐 Accessible on network at: http://172.20.10.11:${PORT}`); // Hint for mobile access if IP matches
});
