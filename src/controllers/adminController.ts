import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import Route from '../models/routeModel';
import { adminKeyboard, themeKeyboard } from '../view/keyboard';
import { getPoint } from './walkController';

export async function getAllRoutes(chatId: number, bot: TelegramBot) {
	const routes = await Route.find();
	let message = '';
	routes.forEach(async (route, routeIndex) => {
		message += `<b><u>Маршрут №${routeIndex + 1}</u></b>\n`;
		message += `Название: ${route.name}\n`;
		message += `Тема: ${route.theme}\n`;
		message += `Описание: ${route.description}\n\n`;
		message += `Посмотреть точки машрута:\n/listspots${route._id}\n`;
		message += `Редкатировать машрут:\n/editroute${route._id}\n\n`;
	});
	bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
}

export async function getAllSpots(
	chatId: number,
	bot: TelegramBot,
	message: string
) {
	const routeId = message.match(/\/listspots(.*)/)![1];
	const route = await Route.findById(routeId);
	let res = '';
	res += `<b>Маршрут ${route!.name}</b>\n\n`;
	route!.spots.forEach(async (spot, spotIndex) => {
		res += `<b>--------Точка №${spotIndex + 1}--------</b>\n`;
		// message += `ID: ${spot._id}\n`;
		res += `<u>Название:</u> ${spot.name}\n`;
		res += `<u>Описание:</u> ${spot.description}\n`;
		res += `<u>Широта:</u> ${spot.lat}\n`;
		res += `<u>Долгота:</u> ${spot.lng}\n`;
		res += `<u>Загадка:</u> ${spot.question}\n`;
		res += `<u>Правильный ответ:</u> ${spot.answer}\n`;
		res += `<u>Очки:</u> ${spot.points}\n`;
		res += `<u>Ссылка на точку:</u> ${spot.url}\n\n`;
		//@ts-ignore
		res += `Редкатировать точку:\n/editspot${spot._id}\n\n`;
	});
	bot.sendMessage(chatId, res, { parse_mode: 'HTML' });
}

export async function createRoute(
	chatId: number,
	bot: TelegramBot,
	message: string
) {
	try {
		const [name, theme, description] = message.split('\n');
		const newRoute = await Route.create({
			name,
			theme,
			description,
			spots: [],
		});
		if (!newRoute) {
			bot.sendMessage(chatId, 'Ошибка при создании маршрута');
		} else {
			bot.sendMessage(chatId, 'Новый маршрут успешно создан', {
				reply_markup: adminKeyboard,
			});
		}
		redisClient.del(chatId.toString());
	} catch (e) {
		//@ts-ignore
		bot.sendMessage(chatId, 'ERROR\n\n' + e._message.toString());
	}
}

export async function editRoute(
	chatId: number,
	bot: TelegramBot,
	message: string,
	id: string
) {
	const arr = message.split('\n');
	const res: {
		name: string | undefined;
		theme: string | undefined;
		description: string | undefined;
	} = {
		name: undefined,
		theme: undefined,
		description: undefined,
	};
	arr.forEach((el) => {
		if (el.includes('name: ')) {
			res.name = el.match(/name: (.*)/)![1];
		} else if (el.includes('theme: ')) {
			res.theme = el.match(/theme: (.*)/)![1];
		} else if (el.includes('description: ')) {
			res.description = el.match(/description: (.*)/)![1];
		}
	});
	await Route.findOneAndUpdate({ _id: id }, res);
}
