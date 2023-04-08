import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'tour must have name'],
		unique: true,
	},
	theme: [
		{
			type: String,
			required: true,
		},
	],
	description: {
		type: String,
		trim: true,
	},
	spots: [
		{
			name: {
				type: String,
				required: true,
			},
			description: {
				type: String,
				required: true,
			},
			lat: {
				type: Number,
				required: true,
			},
			lng: {
				type: Number,
				required: true,
			},
			question: {
				type: String,
				required: true,
			},
			answer: {
				type: String,
				required: true,
			},
			points: {
				type: Number,
				required: true,
				min: 0,
			},
			url: {
				type: String,
				required: true,
			},
			audioUrl: {
				type: String,
			},
		},
	],
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
