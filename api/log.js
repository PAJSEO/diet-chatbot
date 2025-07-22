import express from 'express';
import { SPREADSHEET_ID, getAuth } from './utils.js'; // utils.js에서 가져오기
import { google } from 'googleapis';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 대화 내역 기록하는 API
app.post('/api/log', async (req, res) => {
    const { userId, question, answer } = req.body;
    if (!userId || !question || !answer) {
        return res.status(400).send('UserID, question, and answer are required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const row = [userId, userIp, timestamp, question, answer];
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row],
            },
        });
        res.status(200).send('Log saved successfully.');
    } catch (error) {
        console.error('Error writing to sheet:', error);
        res.status(500).send('Failed to save log.');
    }
});

export default app;