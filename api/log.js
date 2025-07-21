import express from 'express';
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

const SPREADSHEET_ID = '1rAc4ioPe-iC5FsBa6VdGwGdSPOnBlW3RYjW1hNnQ9uY';

// 구글 인증 함수 (재사용을 위해 분리)
async function getAuth() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
}

// --- 대화 내역을 '읽어오는' 새로운 API ---
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
            range: 'Sheet1!A:E', // 전체 데이터를 읽어옴
        });

        const rows = response.data.values || [];
        const userHistory = rows
            .filter(row => row[0] === userId) // 해당 UserID의 대화만 필터링
            .slice(1) // 헤더 행 제외
            .flatMap(row => [ // 프론트엔드 형식으로 변환
                { role: 'user', content: row[3] }, // 질문
                { role: 'assistant', content: row[4] } // 답변
            ]);

        res.status(200).json(userHistory);
    } catch (error) {
        console.error('Error reading sheet history:', error);
        res.status(500).send('Failed to read history.');
    }
});


// --- 대화 내역을 '기록하는' 기존 API 수정 ---
app.post('/api/log', async (req, res) => {
    const { userId, question, answer } = req.body; // userId 추가
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
            range: 'Sheet1!A:E', // 기록 범위 수정
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