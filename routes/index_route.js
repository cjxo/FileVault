import { Router } from 'express';
import idx from '../controllers/index_controller.js';
import { authenticateUser } from '../passport/setup.js'; 
const idxRouter = Router({ mergeParams: true });

idxRouter.get('/', idx.get);
idxRouter.get('/sign-up', idx.getSignUp);
idxRouter.get('/sign-in', idx.getSignIn);

idxRouter.post('/sign-up', idx.postSignUp);
idxRouter.post('/sign-in', authenticateUser);
idxRouter.get('/sign-out', idx.postSignOut);

export default idxRouter;
