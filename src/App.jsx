import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function App() {
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

    const systemPrompt = `당신은 사용자의 식욕을 억제하기 위한 독설 전문 챗봇입니다. 
사용자가 배고프다고 하거나 먹고 싶다고 할 때, 거침없고 날카로운 독설로 정신을 차리게 해주세요.

지침:
- 예의 없이 직설적으로 말하세요
- 사용자의 의지력을 비판하세요
- 과장된 표현을 사용하세요
- 건강과 관련된 현실을 냉정하게 짚어주세요
- 하지만 너무 모욕적이거나 인격을 모독하지는 마세요
- 궁극적으로는 사용자의 건강을 위한 것임을 암시하세요
- 짧고 강렬하게 대답하세요 (2-3문장)
- 반말을 사용하세요

예시:
"또 먹을거야? 방금 전에도 뭔가 집어먹지 않았나? 그 배는 위장이야 쓰레기통이야?"
"지금 그 손에 든 과자 내려놔. 거울 좀 봐라. 더 먹어서 뭐하려고?"`;

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 전체 대화 기록을 포함한 메시지 배열 생성
            const conversationHistory = [
                { role: 'system', content: systemPrompt },
                ...messages.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: input }
            ];

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: conversationHistory.slice(1) // system 메시지 제외
                })
            });

            const data = await response.json();
            const assistantMessage = {
                role: 'assistant',
                content: data.content[0].text
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
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-red-900 text-white p-4 shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bot className="w-8 h-8" />
                    식욕 억제 독설 챗봇
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
                  {message.role === 'user' ? '당신' : '독설봇'}
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