import express from 'express';
import { google } from 'googleapis';

const app = express();
app.use(express.json());

// CORS 헤더 설정
app.use((req, res, next) => {
    res.setHeader('Access-control-allow-origin', '*');
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

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { return res.sendStatus(200); }
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

// 회원가입 API
app.post('/api/register', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).send('UserID and password are required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // 이미 존재하는 ID인지 확인
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:A',
        });
        const existingUsers = response.data.values ? response.data.values.flat() : [];
        if (existingUsers.includes(userId)) {
            return res.status(409).send('UserID already exists.');
        }

        // 비밀번호를 Sheet2에 저장
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:B',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[userId, password]], // password를 그대로 저장
            },
        });

        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Registration failed.');
    }
});

export default app;