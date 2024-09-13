import UserModel from '../models/user.js';
import { HttpError } from '../utils/error.js';
import logger from '../utils/logger.js';
export const postEvaluateFact = async (req, res, next) => {
    const { factId, userId } = req.body;
    let status = '';
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new HttpError('Unable to find a user with the specified ID.', 404));
        }
        const likedUpd = [...user.facts.liked];
        const index = likedUpd.indexOf(factId);
        if (index === -1) {
            likedUpd.push(factId);
            status = 'liked';
        }
        else {
            likedUpd.splice(index, 1);
            status = 'disliked';
        }
        user.facts.liked = likedUpd;
        await user.save();
        res.status(201).json({
            data: { status },
        });
    }
    catch (err) {
        logger.r('postEvaluateFact', err);
        return next(new HttpError('Unable to evaluate fact.', 500));
    }
};
