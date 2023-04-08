import TelegramApi from 'node-telegram-bot-api';
import { setDistrict, setRoute } from '../controllers/guideController';
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
	const [state, district, routeName, pointIndex] = await redisClient
		.multi()
		.hGet(chatId.toString(), 'state')
		.hGet(chatId.toString(), 'district')
		.hGet(chatId.toString(), 'routeName')
		.hGet(chatId.toString(), 'pointIndex')
		.exec();
	console.log(state, district, routeName, pointIndex);
	switch (state) {
		case userState.district:
			setDistrict(chatId, bot, msg.text!);
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
