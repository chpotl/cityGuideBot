import TelegramApi from 'node-telegram-bot-api';
import { redisClient } from '../app';
import {
	createRoute,
	editRoute,
	getAllRoutes,
	getAllSpots,
} from '../controllers/adminController';
import { adminState } from '../enums';
import Route from '../models/routeModel';

export async function adminRouter(
	msg: TelegramApi.Message,
	chatId: number,
	bot: TelegramApi
) {
	// redisClient.hSet(chatId.toString(), 'adminState', adminState.);
	const state = await redisClient.hGet(chatId.toString(), 'adminState');
	if (msg.text == 'Вывести/Редактировать маршруты') {
		getAllRoutes(chatId, bot);
		return;
	} else if (msg.text == 'Создать маршрут') {
		await redisClient.hSet(
			chatId.toString(),
			'adminState',
			adminState.create_route
		);
		bot.sendMessage(
			chatId,
			'Чтобы создать маршрут введите значения полей (Название, Тема, Описание) каждое с новой строки\n\n<i><u>Например:</u></i>\nЛенинградский рок\ncубкультура\nКакое-то описание\n',
			{
				reply_markup: {
					remove_keyboard: true,
				},
				parse_mode: 'HTML',
			}
		);
		return;
	} else if (msg.text?.match(/^\/listspots/)) {
		const routeId = msg.text?.match(/\/listspots(.*)/)![1];
		getAllSpots(chatId, bot, routeId);
		return;
	} else if (msg.text?.match(/^\/editroute/)) {
		const routeId = msg.text?.match(/\/editroute(.*)/)![1];
		await redisClient
			.multi()
			.hSet(chatId.toString(), 'adminState', adminState.edit_route)
			.hSet(chatId.toString(), 'routeId', routeId)
			.exec();
		bot.sendMessage(
			chatId,
			'Чтобы изменить информацию о маршруте введите название поля (name, theme, description) и его значение через двоеточие и пробел. Каждое значение с новой строки\n\n<i><u>Например:</u></i>\nname: Московский джаз\ndescription: какое-то новое описание без переноса строки',
			{
				parse_mode: 'HTML',
				reply_markup: {
					remove_keyboard: true,
				},
			}
		);
		return;
	}
	switch (state) {
		case adminState.create_route:
			createRoute(chatId, bot, msg.text!);
			break;
		case adminState.edit_route:
			const routeId = await redisClient.hGet(chatId.toString(), 'routeId');
			editRoute(chatId, bot, msg.text!, routeId!);
		default:
			break;
	}
}
