import TelegramApi from 'node-telegram-bot-api';
import { redisClient } from '../app';
import {
	createRoute,
	createSpotContent,
	editRoute,
	editSpotContent,
	getAllRoutes,
	getAllSpots,
	uploadSpotAudio,
} from '../controllers/adminController';
import { adminState } from '../enums';
import Route from '../models/routeModel';
import Spot from '../models/spotModel';
import fs from 'fs';

export async function adminRouter(
	msg: TelegramApi.Message,
	chatId: number,
	bot: TelegramApi
) {
	// redisClient.hSet(chatId.toString(), 'adminState', adminState.);
	const state = await redisClient.hGet(chatId.toString(), 'adminState');
	console.log(state);
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
			'Чтобы создать маршрут введите значения полей (Название, Тема, Описание) каждое с новой строки\n\n<i><u>Например:</u></i>\nЛенинградский рок\nсубкультура\nКакое-то описание\n',
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
	} else if (msg.text?.match(/^\/editspot/)) {
		const spotId = msg.text?.match(/\/editspot(.*)/)![1];
		await redisClient
			.multi()
			.hSet(chatId.toString(), 'adminState', adminState.edit_spot)
			.hSet(chatId.toString(), 'spotId', spotId)
			.exec();
		bot.sendMessage(
			chatId,
			'Чтобы изменить информацию о точке введите название поля (name, description, lat, lng, question, answer, points, url) и его значение через двоеточие и пробел. Каждое значение с новой строки\n\n<i><u>Например:</u></i>\nname: Московский джаз\ndescription: какое-то новое описание без переноса строки',
			{
				parse_mode: 'HTML',
				reply_markup: {
					remove_keyboard: true,
				},
			}
		);
		return;
	} else if (msg.text?.match(/^\/createspot/)) {
		const spotId = msg.text?.match(/\/createspot(.*)/)![1];
		await redisClient
			.multi()
			.hSet(chatId.toString(), 'adminState', adminState.create_spot)
			.hSet(chatId.toString(), 'spotId', spotId)
			.exec();
		bot.sendMessage(
			chatId,
			'Чтобы создать точку на маршруте введите значения полей (название, описание, широта, долгота, вопрос, ответ, количество очков, сслыка на точку) каждое с новой строки\n\n<i><u>Например:</u></i>\nЛенинградский Рок клуб\nКакое-то описание точки\n59.929407\n30.343949\nЗимой и летом одним цветом?\nелка\n10\nhttps://yandex.ru/maps/-/CCUWyBUj~A',
			{
				parse_mode: 'HTML',
				reply_markup: {
					remove_keyboard: true,
				},
			}
		);
		return;
	} else if (msg.text?.match(/^\/deleteroute/)) {
		const routeId = msg.text?.match(/\/deleteroute(.*)/)![1];
		const route = await Route.findById(routeId);
		if (!route) {
			bot.sendMessage(chatId, 'Такого маршрута не сущетсвует');
			return;
		}
		await Spot.remove({ _id: { $in: route.spots } });
		await Route.remove({ _id: routeId });
		bot.sendMessage(chatId, 'Маршрут и все его точки успешно удалены', {
			parse_mode: 'HTML',
		});
		return;
	} else if (msg.text?.match(/^\/deletespot/)) {
		const spotId = msg.text?.match(/\/deletespot(.*)/)![1];
		const spot = await Spot.findById(spotId);
		if (!spot) {
			bot.sendMessage(chatId, 'Такой точки не сущетсвует');
			return;
		}
		await Spot.remove({ _id: spotId });
		bot.sendMessage(chatId, 'Точка успешно удалена', {
			parse_mode: 'HTML',
		});
		return;
	} else if (msg.text?.match(/^\/addaudio/)) {
		const spotId = msg.text?.match(/\/addaudio(.*)/)![1];
		const spot = await Spot.findById(spotId);
		if (!spot) {
			bot.sendMessage(chatId, 'Такой точки не сущетсвует');
			return;
		}
		await redisClient
			.multi()
			.hSet(chatId.toString(), 'adminState', adminState.upload_audio)
			.hSet(chatId.toString(), 'spotId', spotId)
			.exec();
		bot.sendMessage(chatId, 'Отправь мне аудиогид в формате mp3', {
			parse_mode: 'HTML',
			reply_markup: {
				remove_keyboard: true,
			},
		});
		return;
	} else if (msg.text?.match(/^\/addaudio/)) {
		const spotId = msg.text?.match(/\/addaudio(.*)/)![1];
		const spot = await Spot.findById(spotId);
		if (!spot) {
			bot.sendMessage(chatId, 'Такой точки не сущетсвует');
			return;
		}
		await redisClient
			.multi()
			.hSet(chatId.toString(), 'adminState', adminState.upload_audio)
			.hSet(chatId.toString(), 'spotId', spotId)
			.exec();
		bot.sendMessage(chatId, 'Отправь мне аудиогид в формате mp3', {
			parse_mode: 'HTML',
			reply_markup: {
				remove_keyboard: true,
			},
		});
		return;
	} else if (msg.text?.match(/^\/deleteaudio/)) {
		const spotId = msg.text?.match(/\/deleteaudio(.*)/)![1];
		const spot = await Spot.findById(spotId);
		if (!spot) {
			bot.sendMessage(chatId, 'Такой точки не сущетсвует');
			return;
		}
		fs.rm(`./src/view/audio/${spot.audioUrl}`, async (e) => {
			if (!e) {
				await Spot.findByIdAndUpdate(spotId, { $unset: { audioUrl: '' } });
				bot.sendMessage(chatId, 'Аудиогид успешно удален', {});
			} else {
				bot.sendMessage(chatId, 'Произошла ошибка, попробуй еще раз', {});
			}
		});
		return;
	}
	switch (state) {
		case adminState.create_route:
			createRoute(chatId, bot, msg.text!);
			break;
		case adminState.edit_route:
			const routeId = await redisClient.hGet(chatId.toString(), 'routeId');
			editRoute(chatId, bot, msg.text!, routeId!);
			break;
		case adminState.edit_spot:
			const editRouteSpotId = await redisClient.hGet(
				chatId.toString(),
				'spotId'
			);
			editSpotContent(chatId, bot, msg.text!, editRouteSpotId!);
			break;
		case adminState.create_spot:
			const createSpotId = await redisClient.hGet(chatId.toString(), 'spotId');
			createSpotContent(chatId, bot, msg.text!, createSpotId!);
			break;
		case adminState.upload_audio:
			const audioSpotId = await redisClient.hGet(chatId.toString(), 'spotId');
			uploadSpotAudio(chatId, bot, msg, audioSpotId!);
			break;
		default:
			bot.sendMessage(chatId, 'Я не знаю такой команды');
			break;
	}
}
