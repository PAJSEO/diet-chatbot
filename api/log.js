// api/log.js

import express from 'express';
import { google } from 'googleapis';

const app = express();
app.use(express.json()); // 요청 본문의 JSON 파싱

// 이 부분은 나중에 Vercel 배포 시 CORS 오류를 방지하기 위해 필요합니다.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 출처 허용
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 구글 시트 로깅 함수
async function appendToSheet(ip, question, answer) {
    try {
        // 1. Vercel 환경 변수에서 JSON 텍스트를 가져와 객체로 변환
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

        // 2. keyFile 대신 credentials 객체를 직접 사용
        const auth = new google.auth.GoogleAuth({
            credentials, // <--- 이 부분이 바뀜
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '1rAc4ioPe-iC5FsBa6VdGwGdSPOnBlW3RYjW1hNnQ9uY';

        const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        const row = [ip, timestamp, question, answer];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row],
            },
        });
        return true;
    } catch (error) {
        console.error('Error writing to sheet:', error);
        return false;
    }
}

// 프론트엔드에서 호출할 API 엔드포인트
app.post('/api/log', async (req, res) => {
    const { question, answer } = req.body;

    // Vercel 환경에서는 'x-forwarded-for' 헤더를 통해 IP를 가져옵니다.
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!question || !answer) {
        return res.status(400).send('Question and answer are required.');
    }

    const success = await appendToSheet(userIp, question, answer);

    if (success) {
        res.status(200).send('Log saved successfully.');
    } else {
        res.status(500).send('Failed to save log.');
    }
});

// Vercel에서 서버를 실행하기 위해 export 해줍니다.
export default app;