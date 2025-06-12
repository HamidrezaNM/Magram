import { createContext, useMemo, useState } from "react";

export const ChatContext = createContext();

export default function ChatContextProvider({ children }) {
    const [activeChat, setActiveChat] = useState();
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
    const [contextMenu, setContextMenu] = useState();
    const [replyToMessage, setReplyToMessage] = useState();
    const [editMessage, setEditMessage] = useState();

    const [page, setPage] = useState();
    const [showPage, setShowPage] = useState(false);
    const [pageTitle, setPageTitle] = useState();

    const contextValue = useMemo(() => ({
        activeChat,
        setActiveChat,
        contextMenu,
        setContextMenu,
        replyToMessage,
        setReplyToMessage,
        editMessage,
        setEditMessage,
        messages,
        setMessages,
        showPage,
        setShowPage,
        pageTitle,
        setPageTitle,
        page,
        setPage
    }), [activeChat,
        setActiveChat,
        contextMenu,
        setContextMenu,
        replyToMessage,
        setReplyToMessage,
        editMessage,
        setEditMessage,
        messages,
        setMessages,
        showPage,
        setShowPage,
        pageTitle,
        setPageTitle,
        page,
        setPage])

    return <ChatContext.Provider
        value={contextValue}
    >
        {children}
    </ChatContext.Provider>
}