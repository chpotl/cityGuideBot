import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	chatId: {
		type: String,
		required: [true, 'tour must have name'],
		unique: true,
	},
	first_name: {
		type: String,
	},
	username: {
		type: String,
	},
	score: {
		type: Number,
		min: 0,
		default: 0,
		required: [true, 'tour must have name'],
	},
});

const User = mongoose.model('User', userSchema);
export default User;
