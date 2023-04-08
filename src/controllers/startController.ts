import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import User from '../models/userModel';
import { startKeyboard } from '../view/keyboard';

export async function startController(
	chatId: number,
	bot: TelegramBot,
	msg: TelegramBot.Message
) {
	redisClient.del(chatId.toString());
	const user = await User.findOne({ chatId: msg.chat.id });
	if (user) {
		bot.sendPhoto(chatId, './src/view/photo/photo1.png', {
			caption: `С возвращением ${msg.from?.first_name} ! Это бот с маршрутами по городу 😎\n\nЧтобы начать свое путешествие нажми кнопку “Выбрать маршрут”`,
			parse_mode: 'HTML',
			reply_markup: startKeyboard,
		});
	} else {
		console.log(msg.from?.first_name, msg.from?.username);
		await User.create({
			chatId: msg.chat.id,
			first_name: msg.from?.first_name,
			username: msg.from?.username,
		});
		bot.sendPhoto(chatId, './src/view/photo/photo1.png', {
			caption: `Добро пожаловать! Это бот с маршрутами по городу 😎\n\nЧтобы выбрать в каком районе ты хочешь найти маршрут нажми кнопку “показать районы”`,
			parse_mode: 'HTML',
			reply_markup: startKeyboard,
		});
	}
}
