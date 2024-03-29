import { Document, Schema, Types, model, Model } from "mongoose";

export interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  mode: string;
  content: string;
  language?: string;
  chatId: Schema.Types.ObjectId;
}

export enum EMode {
  text,
  math,
  code,
}

export enum ELanguage {
  cpp,
  java,
  python,
  c,
  csharp,
  javascript,
  ruby,
  swift,
  go,
  scala,
  kotlin,
  rust,
  typescript,
}

const messageSchema: Schema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: Object.values(EMode),
    },

    language: {
      type: String,
      required: false,
      enum: [
        "cpp",
        "java",
        "python",
        "c",
        "csharp",
        "javascript",
        "ruby",
        "swift",
        "go",
        "scala",
        "kotlin",
        "rust",
        "typescript",
      ],
    },
    chatId: {
      type: Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = model<IMessage>("Message", messageSchema);
export default Message;
