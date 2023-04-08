import TelegramApi from 'node-telegram-bot-api';
import { gettheme } from '../controllers/guideController';
import { redisClient } from '../app';
import { startController } from '../controllers/startController';
import { userState } from '../enums';
import { pointsController } from '../controllers/pointsController';
import { guideRouter } from './guideRouter';
import TelegramBot from 'node-telegram-bot-api';
export async function router(
	msg: TelegramBot.Message,
	message: string,
	chatId: number,
	bot: TelegramApi
) {
	const [state, district, routeName, pointIndex] = await redisClient
		.multi()
		.hGet(chatId.toString(), 'state')
		.hGet(chatId.toString(), 'district')
		.hGet(chatId.toString(), 'routeName')
		.hGet(chatId.toString(), 'pointIndex')
		.exec();

	switch (message) {
		case '/state':
			bot.sendMessage(
				chatId,
				`${state}\n${district}\n${routeName}\n${pointIndex}\n`
			);
			pointsController(chatId, bot);
			break;
		case '/start':
			startController(chatId, bot, msg);
			break;
		case 'Показать районы':
			gettheme(chatId, bot);
			break;
		case 'Мои баллы':
			pointsController(chatId, bot);
			break;
		default:
			guideRouter(msg, chatId, bot);
			break;
	}
}
