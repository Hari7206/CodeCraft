import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    avatar: {
        type: String
    },
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    
},{timestamps: true})
        

const User = mongoose.model('user', userSchema);
export default User;