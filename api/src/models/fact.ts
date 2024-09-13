import { Schema, model } from 'mongoose';

import { Str } from '../types/common.js';
import { TFact } from '../types/fact.js';

const factSchema = new Schema<TFact>(
  {
    title: { Str },
    details: { Str },
    category: { Str },
    source: { Str },
  },
  {
    versionKey: false,
  }
);

const FactModel = model<TFact>('Fact', factSchema);
export default FactModel;
