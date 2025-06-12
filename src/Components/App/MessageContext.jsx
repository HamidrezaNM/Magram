import { createContext, useState } from "react";

export const MessageContext = createContext()

export default function MessageContextProvider({ children }) {
    const [messages, setMessages] = useState([
        {
            chatId: 1,
            date: Date.now() / 1000,
            forwardId: null,
            from: { id: 2, firstname: "test" },
            fromId: 2,
            id: Date.now(),
            message: "test message",
            reply: 0,
            seen: null,
            type: "text",
            messageType: "message",
        },
    ]);

    return <>{children}</>
}