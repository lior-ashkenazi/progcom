import { useState } from "react";

import { HiSearch } from "react-icons/hi";

import { User } from "../../../../types/userTypes";
import { Chat } from "../../../../types/chatTypes";
import {
  getChatAvatar,
  getChatIsTyping,
  getChatName,
  getOtherUser,
} from "../../../../utils/usersUtils";

import ChatGroupModal from "../modals/group_chat_modal/ChatGroupModal";
import ProfileModal from "../../../../components/chats/modals/profile_modal/ProfileModal";

interface ChatBoxHeaderProps {
  user: User;
  chat: Chat;
  setSearchWindowVisible: React.Dispatch<React.SetStateAction<boolean>>;
  typingText: string;
}

const ChatBoxHeader = ({ user, chat, setSearchWindowVisible, typingText }: ChatBoxHeaderProps) => {
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  return (
    <div className="p-4 flex justify-between">
      <button
        className="flex items-center justify-center gap-x-4"
        onClick={() => setShowChatModal(true)}
      >
        <img
          src={getChatAvatar(user, chat)}
          alt="Header Avatar"
          className="w-10 h-10 rounded-full"
        />
        <span className="flex flex-col text-left">
          <span className="font-medium truncate">{getChatName(user, chat)}</span>
          <span className="text-xs text-opacity-60 text-gray-900">
            {typingText && getChatIsTyping(typingText, chat)}
          </span>
        </span>
      </button>
      <button className="mr-4" onClick={() => setSearchWindowVisible(true)}>
        <HiSearch
          size={28}
          style={{
            color: "#1e1b4b",
          }}
        />
      </button>
      {chat.isGroupChat ? (
        <ChatGroupModal
          user={user}
          chat={chat}
          showChatGroupModal={showChatModal}
          setShowChatGroupModal={setShowChatModal}
        />
      ) : (
        <ProfileModal
          user={user}
          profileUser={getOtherUser(user, chat)}
          showProfileModal={showChatModal}
          setShowProfileModal={setShowChatModal}
        />
      )}
    </div>
  );
};

export default ChatBoxHeader;
