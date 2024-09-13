import { Schema, model } from 'mongoose';
import { Str } from '../types/common.js';
const factSchema = new Schema({
    title: { Str },
    details: { Str },
    category: { Str },
    source: { Str },
}, {
    versionKey: false,
});
const FactModel = model('Fact', factSchema);
export default FactModel;
