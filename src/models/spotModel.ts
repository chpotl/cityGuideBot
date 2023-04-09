import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
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
});

const Spot = mongoose.model('Spot', spotSchema);
export default Spot;
