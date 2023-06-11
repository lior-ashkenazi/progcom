import { useEffect, useState, useContext, useRef } from "react";

import { useFetchMessagesQuery, useSendMessageMutation } from "../../store";
import { SocketContext } from "../../context/SocketContext";

import ChatBoxHeader from "./ChatBoxHeader";
import ChatBody from "./ChatBoxBody";
import ChatBoxFooter from "./ChatBoxFooter";

import { User } from "../../types/userTypes";
import { Message, SendMessageType } from "../../types/messageTypes";
import { Chat } from "../../types/chatTypes";
import ChatSearchWindow from "./ChatSearchWindow";

interface ChatBoxProps {
  user: User;
  chat: Chat;
}

interface ChatBodyHandle {
  scrollToMessage: (index: number) => void;
}

const ChatBox = ({ user, chat }: ChatBoxProps) => {
  const {
    data,
    isLoading: messagesIsLoading,
    isFetching: messagesIsFetching,
    isError: messagesIsError,
    refetch: refetchMessages,
  } = useFetchMessagesQuery(chat._id);
  const [sendMessage, { isLoading: sendMessageIsLoading, isError: sendMessageIsError }] =
    useSendMessageMutation();
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string>("");

  const [searchWindowVisible, setSearchWindowVisible] = useState<boolean>(false);
  const [messageToScrollTo, setMessageToScrollTo] = useState<number>(-1);
  const chatBodyRef = useRef<ChatBodyHandle | null>(null); // create a ref

  useEffect(() => {
    refetchMessages();
  }, [refetchMessages, chat._id]);

  useEffect(() => {
    if (data?.messages) {
      setMessages(data?.messages);
    }
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("access chat", chat);

    const messageReceivedHandler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const typingHandler = (otherUser: User) => {
      user._id !== otherUser._id && setTypingUser(otherUser.userName);
    };

    const stopTypingHandler = () => {
      setTypingUser("");
    };

    socket.on("message received", messageReceivedHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);

    return () => {
      socket.off("message received", messageReceivedHandler);
      socket.off("typing", typingHandler);
      socket.off("stop typing", stopTypingHandler);
      socket.emit("leave chat", chat);
    };
  }, [chat, user, socket]);

  useEffect(() => {
    if (!searchWindowVisible && messageToScrollTo !== -1) {
      chatBodyRef.current?.scrollToMessage(messageToScrollTo);
      setMessageToScrollTo(-1);
    }
  }, [searchWindowVisible, messageToScrollTo]);

  const handleUserTyping = (isUserTyping: boolean) => {
    if (!socket) return;

    if (isUserTyping) {
      socket.emit("typing", chat, user); //eslint-disable-line
    } else {
      socket.emit("stop typing", chat, user); //eslint-disable-line
    }
  };

  const handleSendMessage = async (message: SendMessageType) => {
    if (!socket) return;

    const { message: populatedMessage } = await sendMessage(message).unwrap();

    socket.emit("new message", chat, populatedMessage); //eslint-disable-line
  };

  const handleSearchClick = (messageId: string) => {
    setSearchWindowVisible(false);

    const index = messages.findIndex((message) => message._id === messageId);
    if (index !== -1) {
      setMessageToScrollTo(index);
    }
  };

  return (
    messages && (
      <>
        {!searchWindowVisible ? (
          <>
            <div className="col-span-2">
              <ChatBoxHeader
                user={user}
                chat={chat}
                setSearchWindowVisible={setSearchWindowVisible}
                typingText={typingUser}
              />
            </div>
            <div className="col-span-2 grid grid grid-rows-[444px_auto] overflow-y-auto">
              <ChatBody
                ref={chatBodyRef}
                user={user}
                messages={messages}
                messagesIsLoading={messagesIsLoading}
                messagesIsFetching={messagesIsFetching}
                messagesIsError={messagesIsError}
              />
              <ChatBoxFooter
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
