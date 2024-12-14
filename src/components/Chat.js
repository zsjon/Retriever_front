import { useState } from "react";

export default function Chat() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiEndpoint = "https://api.openai.com/v1/chat/completions";
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);

    const addMessage = (sender, message) => {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };

    const handleSendMessage = async () => {
        const message = userInput.trim();
        if (message.length === 0) return;

        addMessage("user", message);
        setUserInput("");
        setLoading(true);

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: message }],
                    max_tokens: 1024,
                    top_p: 1,
                    temperature: 1,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5,
                    stop: ["문장 생성 중단 단어"],
                }),
            });

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || "No response";
            addMessage("bot", aiResponse);
        } catch (error) {
            console.error("오류 발생!", error);
            addMessage("bot", "오류 발생!");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-wrapper">
            {/* Chat messages container */}
            <div className="chat-messages">
                {loading && (
                    <div className="loading-indicator">답변을 기다리고 있습니다...</div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            msg.sender === "user" ? "user-message" : "bot-message"
                        }`}
                    >
                        <p>{`${msg.sender === "user" ? "나" : "챗봇"}: ${msg.message}`}</p>
                    </div>
                ))}
            </div>

            {/* Chat input */}
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="메시지를 입력하세요"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </div>
    );
}
