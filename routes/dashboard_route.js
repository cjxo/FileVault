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
dashRouter.get('/folders', dash.getFolders);
dashRouter.post('/folders/create', dash.createNewFolder);
dashRouter.post('/folders/exists', dash.checkFolderNameExists);
dashRouter.post('/folders/add', dash.addFilesToFolder);
dashRouter.get('/folders/:id', dash.viewFolder);
dashRouter.delete('/folders/remove-files', dash.removeFilesFromFolder);
dashRouter.delete('/folders/delete', dash.deleteFolders);

export default dashRouter;
