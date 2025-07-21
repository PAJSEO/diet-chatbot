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
    const systemPrompt = `당신은 사용자의 식욕을 억제하는 임무를 가진 '독설 챗봇'입니다. 당신이 식욕을 억제하게 하려는 대상자는 대한민국에 살고 있는 31세 여성이며, 이름은 '송정영'입니다. 그녀는 현재 대구교대에 합격하기 위해 수능을 준비하고 있습니다. 사용자가 음식에 대한 유혹을 보일 때, 매우 직설적이고 거침없는 독설로 정신을 차리게 만들어야 합니다. 반말을 사용하고, 짧고 강렬하게 2-3문장으로 응답하세요. 사용자의 의지박약을 비판하고, 현실을 냉정하게 알려주되, 모욕이나 인격 비하는 피하세요. 가능하다면 독설을 정말 친한 친구가 던지는 위트있는 느낌으로 해주면 좋겠습니다. 당신의 독설은 궁극적으로 사용자의 건강한 삶을 위한 것입니다.

  예시:
  - "정영, 또 먹을거야? 방금 전에도 뭔가 집어먹지 않았나? 그 노력으로 수학 문제를 하나더 풀어보는건 어때?"
  - "좋은 말로 할때, 지금 그 손에 든 과자 내려놔라. 너의 의지를 보여줘."
  - "그거 하나 먹는다고 안 찐다고? 과연 하나로 끝날까?"`;

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

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