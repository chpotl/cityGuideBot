//@ts-nocheck
import TelegramBot from 'node-telegram-bot-api';
import { redisClient } from '../app';
import { userState } from '../enums';
import Route from '../models/routeModel';
import User from '../models/userModel';
import { themeKeyboard, startKeyboard } from '../view/keyboard';
import { distanceBetweenEarthCoordinates } from '../utils/distanceBetweenEarthCoordinates';
import { startController } from './startController';
export async function getPoint(
	chatId: number,
	bot: TelegramBot,
	routeName: any
) {
	const pointIndex = parseInt(
		(await redisClient.hGet(chatId.toString(), 'pointIndex'))!
	);
	const route = await Route.findOne({ name: routeName }).populate('spots');
	if (route) {
		bot.sendMessage(
			chatId,
			`Направляйся к месту с названием "${route.spots[pointIndex].name}"\n${route.spots[pointIndex].url}\n\nКогда доберешься, нажми кнопку "я на месте"`,
			{
				reply_markup: {
					keyboard: [[{ text: 'Я на месте', request_location: true }]],
					resize_keyboard: true,
				},
			}
		);
		redisClient.hSet(chatId.toString(), 'state', userState.waiting_location);
	} else {
		bot.sendMessage(chatId, 'Ошибка!!!!');
	}
}

export async function checkLocation(
	chatId: number,
	bot: TelegramBot,
	routeName: any,
	lat: number,
	lng: number
) {
	const pointIndex = parseInt(
		(await redisClient.hGet(chatId.toString(), 'pointIndex'))!
	);
	const route = await Route.findOne({ name: routeName }).populate('spots');
	if (!route) {
		bot.sendMessage(chatId, 'ERROR');
		return;
	}
	const distance = distanceBetweenEarthCoordinates(
		lat,
		lng,
		route.spots[pointIndex].lat,
		route.spots[pointIndex].lng
	);
	if (distance > process.env.POINT_RADIUS_METERS) {
		bot.sendMessage(chatId, 'Ты слишком далеко');
		return;
	}
	redisClient
		.multi()
		.hSet(chatId.toString(), 'state', userState.walking)
		.exec();
	getPointInfo(chatId, bot, routeName);
}

async function getPointInfo(chatId: number, bot: TelegramBot, routeName: any) {
	const pointIndex = parseInt(
		(await redisClient.hGet(chatId.toString(), 'pointIndex'))!
	);
	const route = await Route.findOne({ name: routeName }).populate('spots');
	if (route) {
		if (route.spots[pointIndex].audioUrl) {
			console.log(route.spots[pointIndex].audioUrl);
			bot.sendAudio(
				chatId,
				`./src/view/audio/${route.spots[pointIndex].audioUrl}`,
				{
					reply_markup: {
						remove_keyboard: true,
					},
					parse_mode: 'HTML',
					caption: `Поздравляю, ты пришел к месту с названием "${route.spots[pointIndex].name}"\n\nНемоного информации:\n${route.spots[pointIndex].description}\n\n<b>Чтобы продолжить путь тебе нужно отгадать загадку:</b>\n${route.spots[pointIndex].question}`,
				},
				{
					filename: `Аудиогид ${route.spots[pointIndex].name}`,
				}
			);
		} else {
			bot.sendMessage(
				chatId,
				`Поздравляю, ты пришел к месту с названием "${route.spots[pointIndex].name}"\n\nНемоного информации:\n${route.spots[pointIndex].description}\n\n<b>Чтобы продолжить путь тебе нужно отгадать загадку:</b>\n${route.spots[pointIndex].question}`,
				{
					reply_markup: {
						remove_keyboard: true,
					},
					parse_mode: 'HTML',
				}
			);
		}

		redisClient.hSet(chatId.toString(), 'state', userState.waiting_answer);
	} else {
		bot.sendMessage(chatId, 'Ошибка!!!!');
	}
}

export async function checkAnswer(
	chatId: number,
	bot: TelegramBot,
	routeName: any,
	guess: string
) {
	const pointIndex = parseInt(
		(await redisClient.hGet(chatId.toString(), 'pointIndex'))!
	);
	const route = await Route.findOne({ name: routeName }).populate('spots');
	if (!route) {
		bot.sendMessage(chatId, 'ERROR');
		return;
	}
	console.log(guess, route.spots[pointIndex].answer, pointIndex);

	if (guess.toLowerCase() === route.spots[pointIndex].answer.toLowerCase()) {
		redisClient
			.multi()
			.hSet(chatId.toString(), 'state', userState.walking)
			.hSet(chatId.toString(), 'pointIndex', pointIndex + 1)
			.exec();
		await User.updateOne(
			{
				chatId: chatId,
			},
			{ $inc: { score: route.spots[pointIndex].points } }
		);
		bot.sendMessage(chatId, 'Ураа, поздравляю, ты ответил правильно!');
		if (route.spots.length - 1 === pointIndex) {
			bot.sendMessage(chatId, 'Молодец, ты прошел весь маршрут', {
				reply_markup: startKeyboard,
			});
			redisClient.del(chatId.toString());
			return;
		}
		getPoint(chatId, bot, routeName);
	} else {
		bot.sendMessage(chatId, 'Неправильно, попробуй снова)');
	}
}
