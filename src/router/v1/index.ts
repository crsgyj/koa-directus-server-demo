import Router from '@koa/router';
// routes
import auth from './auth';

const router = new Router();

router.use('/auth', auth.routes());

export default router;