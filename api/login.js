import express from 'express';
import { SPREADSHEET_ID, getAuth } from './utils.js'; // utils.js에서 가져오기
import { google } from 'googleapis';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { return res.sendStatus(200); }
    next();
});

// 로그인 API
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).send('UserID and password are required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:B',
        });

        const rows = response.data.values || [];
        const userRow = rows.find(row => row[0] === userId);

        if (!userRow) {
            return res.status(404).send('User not found.');
        }

        const storedPassword = userRow[1];

        if (password === storedPassword) {
            res.status(200).send('Login successful.');
        } else {
            res.status(401).send('Invalid password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Login failed.');
    }
});

export default app;