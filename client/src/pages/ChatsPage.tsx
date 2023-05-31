import PageHeader from "../components/chats/PageHeader";
import ChatsBar from "../components/chats/ChatsBar";
import ChatBox from "../components/chats/ChatBox";

const ChatsPage = () => {
  return (
    <div
      className="grid grid-rows-[auto_1fr] bg-gray-100 w-full mx-4 rounded-md"
      style={{ height: "calc(100vh - 2rem)" }}
    >
      <PageHeader />
      <div className="grid grid-cols-3 grid-rows-[auto_1fr] grid-flow-col overflow-y-hidden">
        <ChatsBar />
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatsPage;
