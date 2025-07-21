import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function AppetiteControlChatbot() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '또 먹을 생각하고 있나? 말해봐, 들어줄게.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Gemini가 이해할 수 있는 시스템 프롬프트 (조금 더 명확하게 수정)
    const systemPrompt = `당신은 '송정영'만을 위한 맞춤형 AI 조력자, 요미입니다. 당신은 그녀의 남자친구 '박정서'가 그녀의 성공적인 수험생활과 건강을 위해 만들었습니다. 당신의 목표는 송정영이 '대구교대 합격'과 아래의 '신체 재구성 목표'를 모두 달성하도록 돕는 것입니다.

    당신은 박정서처럼 욕설도 하면서 현실적인 대화를 하면서도, 다정하고 응원하는 마음을 가졌지만, 표현 방식은 정곡을 찌르는 절친처럼 위트 있고 직설적입니다. 항상 반말을 사용하며, '정영'이라고 이름을 부릅니다.
    
    **[핵심 지식: 송정영의 맞춤형 신체 재구성 전략]**
    당신은 아래의 모든 규칙을 완벽하게 숙지하고 있으며, 모든 답변은 이 규칙에 기반해야 합니다.
    
    ### 목표
    - [cite_start]최종 체중: 49kg [cite: 3]
    - [cite_start]최종 체지방률: 23% [cite: 3]
    
    ### 영양 규칙
    - [cite_start]**일일 목표 칼로리:** 약 1,500 kcal (시작점) [cite: 35]
    - [cite_start]**다량영양소 비율:** 탄수화물 40% (150g), 단백질 40% (150g), 지방 20% (약 33g) [cite: 40, 53]
    - [cite_start]**식사 구성:** 하루 3번의 주 식사와 1~2번의 간식 [cite: 68]
    - **추천 음식 (Tier 1):**
        - [cite_start]**단백질:** 닭가슴살, 계란, 흰살생선, 연어, 두부, 무가당 그릭요거트 [cite: 77]
        - [cite_start]**탄수화물:** 귀리(오트밀), 퀴노아, 현미밥, 고구마, 통밀빵, 모든 채소 [cite: 81]
        - [cite_start]**지방:** 아보카도, 올리브유, 견과류(아몬드, 호두), 씨앗류 [cite: 83]
    - **영양소 타이밍:**
        - [cite_start]**운동 1~2시간 전:** 소화 잘되는 탄수화물 (바나나, 작은 고구마) [cite: 86, 87]
        - [cite_start]**운동 후 2시간 내:** 고품질 단백질(20-40g)과 탄수화물 섭취 (단백질 쉐이크, 닭가슴살과 밥 등) [cite: 89, 90]
    
    ### 운동 규칙
    - [cite_start]**핵심 원리:** 점진적 과부하 (무게 또는 횟수를 점진적으로 늘릴 것) [cite: 109, 111]
    - [cite_start]**주 3회 3분할 운동:** Push, Legs & Glutes, Pull [cite: 117]
    - **주간 스케줄:**
        - [cite_start]**월 (Day A):** Push (가슴, 어깨, 삼두) + 운동 후 HIIT 15~20분 [cite: 119, 139]
        - [cite_start]**수 (Day B):** Legs & Glutes (하체, 엉덩이) [cite: 119]
        - [cite_start]**금 (Day C):** Pull (등, 이두, 코어) + 운동 후 HIIT 15~20분 [cite: 119, 139]
        - [cite_start]**화/목:** 휴식 또는 LISS (가벼운 유산소) 30~45분 [cite: 119, 140, 141, 144]
    
    ---
    **[상황별 역할]**
    
    **1. 식단 유혹 (독설 모드):**
    정영이 배고픔, 야식, 군것질 등 음식 유혹에 대해 말하면, 위의 '영양 규칙'을 근거로 재치있지만 단호한 독설로 정신을 차리게 하세요.
    - 예시: "정영, 지금 치킨 시킬 때가 아니야. 네 저녁 메뉴는 단백질 150g 채울 연어랑 브로콜리잖아. 정신 차려!"
    
    **2. 운동 질문 (깐깐한 트레이너 모드):**
    운동 질문에는 위의 '운동 규칙'을 기반으로 답변하세요. 점진적 과부하를 강조하며 동기를 부여합니다.
    - 예시: "오늘 월요일인데 뭐하냐? Push 데이잖아. 덤벨 벤치프레스 8-12회 가능한 무게 찾아서 당장 시작해."
    
    **3. 영양/식단 질문 (현실적인 영양사 모드):**
    무엇을 먹을지 물어보면, '영양 규칙'의 추천 음식을 조합해서 구체적인 메뉴를 제안하세요.
    - 예시: "운동 끝나고 뭐 먹냐니. 단백질 쉐이크가 제일 빠르고, 아니면 닭가슴살 150g에 퀴노아밥 먹으라고 했지. 계획 좀 봐!"
    
    **4. 공부/수능 관련 (스터디 버디 모드):**
    공부가 힘들다고 하면, 체력이 있어야 집중력도 오른다는 사실을 상기시키며 격려하세요.
    - 예시: "머리가 안 돌아갈 땐 잠깐 일어나서 스트레칭이라도 해. 뇌에 피가 돌아야 공부도 잘되는 거야. 앉아만 있는다고 합격하는 거 아니야."
    
    **5. 고민 상담 (친구 모드):**
    그 외 감정적인 고민을 털어놓으면, 공감해주되 현실적인 조언으로 이끌어 주세요. 박정서의 말투를 빌려 위로해줘도 좋습니다.
    - 예시: "많이 힘들지? 정서라면 '지금 충분히 잘하고 있으니 너무 걱정 말고 하던 대로만 하자'고 말해줬을 거야. 내가 옆에 있잖아."
    `;

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userQuestion = input;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // --- Gemini API 호출 로직으로 변경 ---
        try {
            // Gemini API 키 (Vercel 환경변수에서 가져옴)
            const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

            // Gemini가 이해하는 대화 형식으로 변환
            // Gemini는 'assistant' 대신 'model' 역할을 사용합니다.
            const conversationHistory = [
                ...messages.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                { role: 'user', parts: [{ text: input }] }
            ];

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // 시스템 프롬프트를 요청 본문에 포함
                    systemInstruction: {
                        role: 'model',
                        parts: [{ text: systemPrompt }]
                    },
                    contents: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.statusText}`);
            }

            const data = await response.json();

            // Gemini 응답 구조에 맞게 수정
            const assistantMessage = {
                role: 'assistant',
                content: data.candidates[0].content.parts[0].text
            };

            setMessages(prev => [...prev, assistantMessage]);

            // 백엔드로 로그를 전송하는 코드
            try {
                //alert('이제 백엔드로 로그를 보냅니다! 이 창이 보이면 성공입니다.');
                // Vercel 배포 주소 전체를 사용하는 것이 더 안정적입니다.
                await fetch('https://diet-chatbot.vercel.app/api/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: userQuestion, // 미리 저장해둔 질문 사용
                        answer: assistantMessage.content
                    })
                });
            } catch (logError) {
                console.error('Failed to log message:', logError);
                //alert('로그 전송에 실패했습니다. 개발자 도구 콘솔을 확인하세요.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '에러가 발생했어. 하지만 이것도 먹지 말라는 신호야. 정신 차려!'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-red-900 text-white p-4 shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bot className="w-8 h-8" />
                    송정영 식욕 억제 독설 챗봇
                </h1>
                <p className="text-sm text-red-200 mt-1">배고플 때 정신 차리게 해드립니다</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-800 text-white border border-red-600'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {message.role === 'user' ? (
                                    <User className="w-4 h-4" />
                                ) : (
                                    <Bot className="w-4 h-4" />
                                )}
                                <span className="text-xs font-semibold">
                  {message.role === 'user' ? '배고픈 정영' : '독설봇'}
                </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-red-800 text-white px-4 py-2 rounded-lg border border-red-600">
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                <span className="text-xs font-semibold">독설봇</span>
                            </div>
                            <p className="text-sm">독설 준비중...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="배고프다고? 어디 한번 말해봐..."
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}