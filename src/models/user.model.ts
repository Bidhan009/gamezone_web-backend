import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";
import { string } from "zod";
const UserSchema: Schema = new Schema<UserType>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        profileImage: { type: String, default: null },
        phone: {type:string, default:null},
        mfaSecret: { type: String, default: null, select: false },  // NEW — never returned by default
        mfaEnabled: { type: Boolean, default: false },              // NEW
    },
    {
        timestamps: true, // auto createdAt and updatedAt
        toJSON: {
            transform: function (doc, ret) {
                delete (ret as any).password;
                return ret;
            }
        }
    }
);

export interface IUser extends UserType, Document { // combine UserType and Document
    _id: mongoose.Types.ObjectId; // mongo related attribute/ custom attributes
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
// UserModel is the mongoose model for User collection
// db.users in MongoDB