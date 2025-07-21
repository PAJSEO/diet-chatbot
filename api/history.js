import express from 'express';
import { google } from 'googleapis';

const app = express();
app.use(express.json());

// CORS 헤더 설정
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const SPREADSHEET_ID = '1rAc4ioPe-iC5FsBa6VdGwGdSPOnBlW3RYjW1hNnQ9uY';

async function getAuth() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
}

// 이 파일은 /api/history 요청만 처리합니다.
app.get('/api/history', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).send('UserID is required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E',
        });
        const rows = response.data.values || [];
        const userHistory = rows
            .slice(1)
            .filter(row => row && row[0] === userId)
            .flatMap(row => [
                { role: 'user', content: row[3] },
                { role: 'assistant', content: row[4] }
            ]);
        res.status(200).json(userHistory);
    } catch (error) {
        console.error('Error reading sheet history:', error);
        res.status(500).send('Failed to read history.');
    }
});

export default app;