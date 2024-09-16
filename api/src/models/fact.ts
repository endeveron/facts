import { Schema, model } from 'mongoose';

import { StrReq } from '../types/common.js';
import { TFact } from '../types/fact.js';

const factSchema = new Schema<TFact>(
  {
    title: StrReq,
    category: StrReq,
  },
  {
    versionKey: false,
  }
);

const FactModel = model<TFact>('Fact', factSchema);
export default FactModel;
