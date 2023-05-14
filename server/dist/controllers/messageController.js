"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMessages = exports.sendMessage = void 0;
const express_validator_1 = require("express-validator");
const message_1 = __importDefault(require("../models/message"));
function sendMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { content, mode, language, chatId } = req.body;
            const messageData = {
                sender: req.user._id,
                content,
                chatId,
            };
            let newMessage = yield message_1.default.create(messageData);
            newMessage = yield newMessage.populate("sender", "userName avatar email");
            newMessage = yield newMessage.populate("chatId");
            newMessage = yield newMessage.populate({
                path: "chatId.users",
                select: "username avatar email",
            });
            res.json({ newMessage });
        }
        catch (err) {
            res.status(500).send("Server error");
        }
    });
}
exports.sendMessage = sendMessage;
function fetchMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { chatId } = req.params;
            const fetchedMessages = yield message_1.default.find({ chatId })
                .populate("sender", "userName avatar email")
                .populate("chatId");
            res.json(fetchMessages);
        }
        catch (err) {
            res.status(500).send("Server Error");
        }
    });
}
exports.fetchMessages = fetchMessages;
