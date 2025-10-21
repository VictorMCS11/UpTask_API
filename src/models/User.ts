import mongoose, { Schema, Document, trusted } from "mongoose";

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User', userSchema)

export default User