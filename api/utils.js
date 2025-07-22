import { google } from 'googleapis';

// 스프레드시트 ID를 여기서 한 번만 선언합니다.
export const SPREADSHEET_ID = '1rAc4ioPe-iC5FsBa6VdGwGdSPOnBlW3RYjW1hNnQ9uY';

// 구글 인증 함수도 여기서 한 번만 정의합니다.
export async function getAuth() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
}