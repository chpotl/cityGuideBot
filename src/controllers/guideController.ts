import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import Route from '../models/routeModel';
import { themeKeyboard } from '../view/keyboard';
import { getPoint } from './walkController';

export function getTheme(chatId: number, bot: TelegramBot) {
	redisClient.hSet(chatId.toString(), 'state', userState.theme);
	bot.sendMessage(chatId, 'Выбери тематику маршрута', {
		reply_markup: themeKeyboard,
	});
}

export async function setTheme(
	chatId: number,
	bot: TelegramBot,
	message: string
) {
	let routesKeyboard = {
		keyboard: [],
		resize_keyboard: true,
	};
	const routes = await Route.find({ theme: message });
	// console.log(routes);
	if (routes.length) {
		routes.forEach((el) => {
			//@ts-ignore
			routesKeyboard.keyboard.push([{ text: `${el.name}` }]);
		});
		bot.sendMessage(chatId, 'Выбери интересующий маршрут', {
			reply_markup: routesKeyboard,
		});
		redisClient
			.multi()
			.hSet(chatId.toString(), 'state', userState.route)
			.hSet(chatId.toString(), 'theme', message)
			.exec();
	} else {
		bot.sendMessage(chatId, 'Я пока не знаю такой тематики');
	}
}

export async function setRoute(
	chatId: number,
	bot: TelegramBot,
	message: string
) {
	const spots = await Route.find({ name: message });
	if (spots.length) {
		// console.log('setting ', message);
		redisClient
			.multi()
			.hSet(chatId.toString(), 'state', userState.walking)
			.hSet(chatId.toString(), 'routeName', message)
			.hSet(chatId.toString(), 'pointIndex', 0)
			.exec();
		getPoint(chatId, bot, message);
	} else {
		bot.sendMessage(chatId, 'Я пока не знаю такого маршрут');
	}
}
