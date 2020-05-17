import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import DestinatarioController from './app/controllers/DestinatarioController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/users/:id', UserController.index);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/destinatarios', DestinatarioController.index);
routes.post('/destinatarios', DestinatarioController.store);
routes.put('/destinatarios/:id', DestinatarioController.update);

export default routes;