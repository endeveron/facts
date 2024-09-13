import { Schema, model } from 'mongoose';

import { Num, NumReq, Str, StrReq } from '../types/common.js';
import { TUser } from '../types/user.js';

const userSchema = new Schema<TUser>(
  {
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
  },
  {
    versionKey: false,
  }
);

const UserModel = model<TUser>('User', userSchema);
export default UserModel;
