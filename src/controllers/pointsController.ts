import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import { themeKeyboard } from '../view/keyboard';

export function pointsController(chatId: number, bot: TelegramBot) {
	bot.sendMessage(chatId, 'У тебя 10 очков');
}
