import TelegramApi from 'node-telegram-bot-api';
require('dotenv').config('./');
const bot = new TelegramApi(process.env.API_KEY!, { polling: true });
import mongoose from 'mongoose';
import * as fs from 'fs';
import Route from '../models/routeModel';

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB!).then(() => {
	console.log('connected');
});

const data = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));
console.log(data);

const importData = async () => {
	try {
		await Route.create(data);
		console.log('OK 🤡');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};
importData();
