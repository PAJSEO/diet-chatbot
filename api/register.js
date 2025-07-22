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

// 회원가입 API
app.post('/api/register', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).send('UserID and password are required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:A',
        });
        const existingUsers = response.data.values ? response.data.values.flat() : [];
        if (existingUsers.includes(userId)) {
            return res.status(409).send('UserID already exists.');
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:B',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[userId, password]],
            },
        });

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Registration failed.');
    }
});

export default app;