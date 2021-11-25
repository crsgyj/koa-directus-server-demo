import { v1Controller } from '@/controller';
import { loginRequired } from '@/middleware/authorize';
import Router from '@koa/router';
/**
 * @apiDefine V1_Limits 权限
 */
const router = new Router();

// 登录校验
router.use(loginRequired);
/**
 * 
 * @api {Get} /v1/auth/profile 获取登录用户信息
 * @apiName 获取登录用户信息
 * @apiGroup V1_Limits
 * @apiVersion 1.0.0
 * 
 */
router.get('登录用户信息', '/profile', v1Controller.auth.profile);

export default router;