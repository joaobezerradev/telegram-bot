import { Router } from 'express';
import MessageController from './controller/MessageController';

const routes = Router();

routes.get('/', MessageController.save);

export default routes;
