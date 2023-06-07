import { useContext } from "react";
import { LoadingContext } from "../../context/LoadingContext";
import { User } from "../../types/userTypes";
import { Chat } from "../../types/chatTypes";
import { useAccessChatMutation } from "../../store";
import { getShortFormatDate, getOtherUserId, getChatName, getChatAvatar } from "../../utils";

interface ChatsListItemProps {
  user: User;
  chat: Chat;
  itemIndex: number;
  isClicked: boolean;
  handleClickedColor: (index: number) => void;
}

const ChatsListItem = ({
  user,
  chat,
  itemIndex,
  isClicked,
  handleClickedColor,
}: ChatsListItemProps) => {
  const { setChatBoxIsLoading } = useContext(LoadingContext);
  const [accessChat] = useAccessChatMutation();

  const handleClick = async () => {
    handleClickedColor(itemIndex);
    setChatBoxIsLoading(true);

    const otherUserId = getOtherUserId(user, chat);

    await accessChat(otherUserId).unwrap();
  };

  return (
    <button
      className={`inline-block px-6 py-1 h-20 flex items-center justify-between hover:bg-gray-200 active:bg-gray-300 transition-colors rounded-t-sm border-b border-gray-400 border-opacity-50 last:border-b-0 ${
        isClicked && "bg-gray-300 hover:bg-gray-300"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-x-6">
        <img
          src={getChatAvatar(user, chat)}
          alt="Header Avatar"
          className="w-11 h-11 rounded-full"
        />
        <span className="flex flex-col text-left">
          <span className="font-semibold text-lg">{getChatName(user, chat)}</span>
          <span className="text-sm text-opacity-60 text-black">Maybe last message</span>
        </span>
      </div>
      <span
        className={`inline-block h-full mt-3 text-sm ${!chat?.updatedAt && "text-transparent"}`}
      >
        {chat?.updatedAt ? getShortFormatDate(chat?.updatedAt) : "padding"}
      </span>
    </button>
  );
};

export default ChatsListItem;