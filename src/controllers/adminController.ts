//@ts-nocheck
import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import Route from '../models/routeModel';
import { adminKeyboard, themeKeyboard } from '../view/keyboard';
import { getPoint } from './walkController';
import Spot from '../models/spotModel';

export async function getAllRoutes(chatId: number, bot: TelegramBot) {
	const routes = await Route.find();
	if (!routes.length) {
		bot.sendMessage(chatId, 'Пока ты не создал ни одного маршрута');
		return;
	}
	let message = '';
	routes.forEach(async (route, routeIndex) => {
		message += `<b><u>Маршрут №${routeIndex + 1}</u></b>\n`;
		message += `Название: ${route.name}\n`;
		message += `Тема: ${route.theme}\n`;
		message += `Описание: ${route.description}\n\n`;
		message += `Посмотреть точки машрута:\n/listspots${route._id}\n`;
		message += `Редкатировать машрут:\n/editroute${route._id}\n`;
		message += `Добавить точку:\n/createspot${route._id}\n`;
		message += `<u>Удалить Маршрут:</u>\n/deleteroute${route._id}\n\n`;
	});
	bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
}

export async function getAllSpots(
	chatId: number,
	bot: TelegramBot,
	routeId: string
) {
	const route = await Route.findById(routeId).populate('spots');
	if (!route?.spots.length) {
		bot.sendMessage(chatId, 'Пока ты не создал ни одной точки');
		return;
	}
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
		res += `Редкатировать точку:\n/editspot${spot._id}\n`;
		res += `Удалить точку:\n/deletespot${spot._id}\n\n`;
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
		bot.sendMessage(
			chatId,
			'ERROR\n' + e._message.toString() + '\n\nПопробуй еще раз'
		);
	}
}

export async function editRoute(
	chatId: number,
	bot: TelegramBot,
	message: string,
	id: string
) {
	try {
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
		const newRoute = await Route.findOneAndUpdate({ _id: id }, res);
		console.log(res);
		if (newRoute) {
			bot.sendMessage(
				chatId,
				`Маршрут успешно изменен\n\nЗатронуты поля:\n${
					res.name ? 'name: ' + res.name + '\n' : ''
				}${res.theme ? 'theme: ' + res.theme + '\n' : ''}${
					res.description ? 'description: ' + res.description + '\n' : ''
				}
        `,
				{
					reply_markup: adminKeyboard,
				}
			);
		}
		redisClient.del(chatId.toString());
	} catch (e) {
		//@ts-ignore
		bot.sendMessage(
			chatId,
			'ERROR\n' + e._message.toString() + '\n\nПопробуй еще раз'
		);
	}
}

export async function editSpotContent(
	chatId: number,
	bot: TelegramBot,
	message: string,
	id: string
) {
	try {
		const arr = message.split('\n');
		const res: {
			name: string | undefined;
			description: string | undefined;
			lat: string | undefined;
			lng: string | undefined;
			question: string | undefined;
			answer: string | undefined;
			points: string | undefined;
			url: string | undefined;
		} = {
			name: undefined,
			description: undefined,
			lat: undefined,
			lng: undefined,
			question: undefined,
			answer: undefined,
			points: undefined,
			url: undefined,
		};
		arr.forEach((el) => {
			if (el.includes('name: ')) {
				res.name = el.match(/name: (.*)/)![1];
			} else if (el.includes('description: ')) {
				res.description = el.match(/description: (.*)/)![1];
			} else if (el.includes('lat: ')) {
				res.lat = el.match(/lng: (.*)/)![1];
			} else if (el.includes('lng: ')) {
				res.lng = el.match(/lng: (.*)/)![1];
			} else if (el.includes('question: ')) {
				res.question = el.match(/question: (.*)/)![1];
			} else if (el.includes('answer: ')) {
				res.answer = el.match(/answer: (.*)/)![1];
			} else if (el.includes('points: ')) {
				res.points = el.match(/points: (.*)/)![1];
			} else if (el.includes('url: ')) {
				res.url = el.match(/url: (.*)/)![1];
			}
		});
		const newSpot = await Spot.findOneAndUpdate({ _id: id }, res);
		console.log(res);
		if (newSpot) {
			bot.sendMessage(
				chatId,
				`Маршрут успешно изменен\n\nЗатронуты поля:\n${
					res.name ? 'name: ' + res.name + '\n' : ''
				}${res.description ? 'description: ' + res.description + '\n' : ''}${
					res.lat ? 'lat: ' + res.lat + '\n' : ''
				}${res.lng ? 'lng: ' + res.lng + '\n' : ''}${
					res.question ? 'question: ' + res.question + '\n' : ''
				}${res.answer ? 'answer: ' + res.answer + '\n' : ''}${
					res.points ? 'points: ' + res.points + '\n' : ''
				}${res.url ? 'url: ' + res.url + '\n' : ''}
        `,
				{
					reply_markup: adminKeyboard,
				}
			);
		}
		redisClient.del(chatId.toString());
	} catch (e) {
		//@ts-ignore
		bot.sendMessage(
			chatId,
			'ERROR\n' + e._message.toString() + '\n\nПопробуй еще раз'
		);
	}
}

export async function createSpotContent(
	chatId: number,
	bot: TelegramBot,
	message: string,
	id: string
) {
	try {
		const [name, description, lat, lng, question, answer, points, url] =
			message.split('\n');
		const newSpot = await Spot.create({
			name,
			description,
			lat,
			lng,
			question,
			answer,
			points,
			url,
		});
		if (!newSpot) {
			bot.sendMessage(chatId, 'Ошибка при создании точки');
		} else {
			bot.sendMessage(chatId, 'Новая точка успешно создан', {
				reply_markup: adminKeyboard,
			});
		}
		await Route.findByIdAndUpdate(id, {
			$push: {
				spots: newSpot._id,
			},
		});
		redisClient.del(chatId.toString());
	} catch (e) {
		//@ts-ignore
		bot.sendMessage(
			chatId,
			'ERROR\n' + e._message.toString() + '\n\nПопробуй еще раз'
		);
	}
}
