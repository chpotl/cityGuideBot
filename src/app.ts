import TelegramApi from 'node-telegram-bot-api';
require('dotenv').config('./');
// const axios = require('axios').default;
const bot = new TelegramApi(process.env.API_KEY!, { polling: true });
import mongoose from 'mongoose';
import { router } from './router/router';
import { createClient } from 'redis';

export const redisClient = createClient(); //?????
redisClient.connect();
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_LOCAL!).then(() => {
	console.log('connected');
});

bot.setMyCommands([
	{
		command: '/start',
		description: 'Запуск бота',
	},
]);

bot.on('message', (msg) => {
	// console.log(msg);
	router(msg, msg.text!, msg.chat.id, bot);
});
