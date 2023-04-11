import TelegramApi from 'node-telegram-bot-api';
import { getTheme } from '../controllers/guideController';
import { redisClient } from '../app';
import { startController } from '../controllers/startController';
import { userState } from '../enums';
import { pointsController } from '../controllers/pointsController';
import { guideRouter } from './guideRouter';
import TelegramBot from 'node-telegram-bot-api';
import User from '../models/userModel';
import { adminRouter } from './adminRouter';
export async function router(
	msg: TelegramBot.Message,
	message: string,
	chatId: number,
	bot: TelegramApi
) {
	const [state, theme, routeName, pointIndex] = await redisClient
		.multi()
		.hGet(chatId.toString(), 'state')
		.hGet(chatId.toString(), 'theme')
		.hGet(chatId.toString(), 'routeName')
		.hGet(chatId.toString(), 'pointIndex')
		.exec();
	const user = await User.findOne({ chatId: msg.chat.id });

	if (message == '/start') {
		startController(chatId, bot, msg);
		return;
	}
	if (user?.role == 'admin') {
		adminRouter(msg, chatId, bot);
		return;
	}
	switch (message) {
		case '/state':
			bot.sendMessage(
				chatId,
				`${state}\n${theme}\n${routeName}\n${pointIndex}\n`
			);
			break;
		case 'Выбрать маршрут':
			getTheme(chatId, bot);
			break;
		case 'Мои баллы':
			pointsController(chatId, bot);
			break;
		default:
			guideRouter(msg, chatId, bot);
			break;
	}
}
