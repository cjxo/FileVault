import { Router } from 'express';
import dash from '../controllers/dashboard_controller.js';

const dashRouter = Router({ mergeParams: true });

dashRouter.get('/', dash.get);
dashRouter.post('/upload', dash.postUpload);
dashRouter.get('/upload', dash.getUpload);
dashRouter.delete('/files/delete/:id', dash.deleteFile);

export default dashRouter;
