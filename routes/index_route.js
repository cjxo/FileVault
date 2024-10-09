import { Router } from 'express';
import idx from '../controllers/index_controller.js';
const idxRouter = Router({ mergeParams: true });

idxRouter.get('/', idx.get);
idxRouter.get('/sign-up', idx.getSignUp);
idxRouter.get('/sign-in', idx.getSignIn);

idxRouter.post('/sign-up', idx.postSignUp);

export default idxRouter;
