import { Schema, model } from 'mongoose';
import { Num, NumReq, Str, StrReq } from '../types/common.js';
const userSchema = new Schema({
    account: {
        name: {
            minlength: 2,
            maxlength: 20,
            ...StrReq,
        },
        email: StrReq,
        password: {
            minlength: 6,
            ...StrReq,
        },
        role: {
            index: NumReq,
            name: StrReq,
        },
    },
    facts: {
        liked: [Str],
        offset: Num,
    },
}, {
    versionKey: false,
});
const UserModel = model('User', userSchema);
export default UserModel;
