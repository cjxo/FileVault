import { Router } from 'express';
import dash from '../controllers/dashboard_controller.js';

const dashRouter = Router({ mergeParams: true });

dashRouter.get('/', dash.get);
dashRouter.get('/all-files', (req, res) => { res.redirect("/") });
dashRouter.post('/upload', dash.postUpload);
dashRouter.get('/upload', dash.getUpload);
dashRouter.delete('/files/delete/:id', dash.deleteFile);
dashRouter.get('/files/:id', dash.getFile);
dashRouter.get('/files/download/:id/', dash.downloadFile);

export default dashRouter;
