import { Router } from 'express';
import dash from '../controllers/dashboard_controller.js';

const dashRouter = Router({ mergeParams: true });

dashRouter.get('/', dash.get);

export default dashRouter;
