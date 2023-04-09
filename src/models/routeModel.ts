import mongoose, { Schema } from 'mongoose';

const routeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'tour must have name'],
		unique: true,
	},
	theme: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		trim: true,
	},
	spots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Spot' }],
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
