import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import { themeKeyboard } from '../view/keyboard';
import User from '../models/userModel';

export async function pointsController(chatId: number, bot: TelegramBot) {
	const user = await User.findOne({ chatId });
	const allUsers = await User.find().sort({ score: -1 }).limit(15);
	if (!user) {
		bot.sendMessage(chatId, 'Ой, что-то пошло не так!');
		return;
	}
	let res = '';
	allUsers.forEach((el, index) => {
		let username = el.username || el.first_name || 'аноним';
		if (el.chatId == chatId.toString()) {
			res += `<b>#${index + 1} ${username} - ${el.score} очков</b>\n`;
		} else {
			res += `#${index + 1} ${username} - ${el.score} очков\n`;
		}
	});
	bot.sendMessage(
		chatId,
		`У тебя ${user.score} очков\n\nЛучшие игроки\n${res}`,
		{
			parse_mode: 'HTML',
		}
	);
}
