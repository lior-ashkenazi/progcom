import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { useFetchMessagesQuery, useSendMessageMutation } from "../../store";

import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";

import { User } from "../../types/userTypes";
import { Message, SendMessageType } from "../../types/messageTypes";
import { Chat } from "../../types/chatTypes";
import ChatSearchWindow from "./ChatSearchWindow";

const ENDPOINT = import.meta.env.VITE_ENDPOINT as string;

interface ChatBoxProps {
  user: User;
  chat: Chat;
}

interface ChatBodyHandle {
  scrollToMessage: (index: number) => void;
}

const ChatBox = ({ user, chat }: ChatBoxProps) => {
  const socketRef = useRef<Socket | null>(null);

  const {
    data,
    isLoading: messagesIsLoading,
    isError: messagesIsError,
  } = useFetchMessagesQuery(chat._id);
  const [sendMessage, { isLoading: sendMessageIsLoading, isError: sendMessageIsError }] =
    useSendMessageMutation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingText, setTypingText] = useState<string>("");

  const [searchWindowVisible, setSearchWindowVisible] = useState<boolean>(false);
  const chatBodyRef = useRef<ChatBodyHandle | null>(null); // create a ref

  useEffect(() => {
    if (data?.messages) setMessages(data?.messages);
  }, [data]);

  useEffect(() => {
    socketRef.current = io(ENDPOINT, { forceNew: true });

    console.log(ENDPOINT);
    console.log(socketRef.current);

    socketRef.current.emit("setup", user);
    socketRef.current.emit("access chat", chat);

    socketRef.current.on("message received", (message: Message) => {
      console.log("message received");

      setMessages((prev) => [...prev, message]);

      console.log("set messages");
    });

    socketRef.current.on("typing", (user) => {
      console.log("step 2" + user);

      setTypingText(user.userName);
    });

    socketRef.current.on("stop typing", () => {
      setTypingText("");
    });

    return () => {
      socketRef.current!.off("setup"); //eslint-disable-line
      socketRef.current!.disconnect(); //eslint-disable-line
    };
  }, [chat, user]);

  const handleUserTyping = (isUserTyping: boolean) => {
    console.log("step 1 " + isUserTyping);

    if (isUserTyping) {
      socketRef.current!.emit("typing", chat, user); //eslint-disable-line
    } else {
      socketRef.current!.emit("stop typing", chat, user); //eslint-disable-line
    }
  };

  const handleSendMessage = async (message: SendMessageType) => {
    const { message: populatedMessage } = await sendMessage(message).unwrap();

    socketRef.current!.emit("new message", chat, populatedMessage); //eslint-disable-line
    setMessages((prev) => [...prev, populatedMessage]);
  };

  const handleSearchClick = (messageId: string) => {
    setSearchWindowVisible(false);

    const index = messages.findIndex((message) => message._id === messageId);
    if (index !== -1) {
      chatBodyRef.current?.scrollToMessage(index);
    }
  };

  return (
    messages && (
      <>
        {!searchWindowVisible ? (
          <>
            <div className="col-span-2">
              <ChatHeader
                user={user}
                chat={chat}
                setSearchWindowVisible={setSearchWindowVisible}
                typingText={typingText}
              />
            </div>
            <div className="col-span-2 grid grid grid-rows-[400px_auto] overflow-y-auto">
              <ChatBody
                ref={chatBodyRef}
                user={user}
                messages={messages}
                messagesIsLoading={messagesIsLoading}
                messagesIsError={messagesIsError}
              />
              <ChatFooter
                user={user}
                chat={chat}
                handleSendMessage={handleSendMessage}
                sendMessageIsLoading={sendMessageIsLoading}
                sendMessageIsError={sendMessageIsError}
                handleUserTyping={handleUserTyping}
              />
            </div>
          </>
        ) : (
          <>
            <ChatSearchWindow
              setSearchWindowVisible={setSearchWindowVisible}
              messages={messages}
              handleSearchClick={handleSearchClick}
            />
          </>
        )}
      </>
    )
  );
};

export default ChatBox;
