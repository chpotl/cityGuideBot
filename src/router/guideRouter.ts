import TelegramApi from 'node-telegram-bot-api';
import { setTheme, setRoute } from '../controllers/guideController';
import { redisClient } from '../app';
import { userState } from '../enums';
import {
	checkAnswer,
	checkLocation,
	getPoint,
} from '../controllers/walkController';
export async function guideRouter(
	msg: TelegramApi.Message,
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
	console.log(state, theme, routeName, pointIndex);
	switch (state) {
		case userState.theme:
			setTheme(chatId, bot, msg.text!);
			break;
		case userState.route:
			setRoute(chatId, bot, msg.text!);
			break;
		case userState.walking:
			getPoint(chatId, bot, routeName);
			break;
		case userState.waiting_location:
			checkLocation(
				chatId,
				bot,
				routeName,
				msg.location!.latitude,
				msg.location!.longitude
			);
			break;
		case userState.waiting_answer:
			checkAnswer(chatId, bot, routeName, msg.text!);
			break;
		default:
			break;
	}
}
