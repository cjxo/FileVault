import { Router } from 'express';
import idx from '../controllers/index_controller.js';
const idxRouter = Router({ mergeParams: true });

idxRouter.get('/', idx.get);

export default idxRouter;
