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

// 로그인 API
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).send('UserID and password are required.');
    }

    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Sheet2에서 모든 사용자 정보 읽기
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet2!A:B',
        });

        const rows = response.data.values || [];
        const userRow = rows.find(row => row[0] === userId);

        if (!userRow) {
            return res.status(404).send('User not found.');
        }

        const storedPassword = userRow[1]; // 저장된 평문 비밀번호

        // 입력된 비밀번호와 저장된 비밀번호를 단순 비교
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