import { v1Controller } from '@/controller';
import Router from '@koa/router'
import v1 from './v1';

   
/**
 * @apiDefine V0_Env 环境
 */
/**
 * @apiDefine V0_Doc 文档
 */
const router = new Router();

/**
 * 
 * @api {Get} /status.ok 健康检查
 * @apiName 健康检查
 * @apiGroup V0_Env
 * @apiVersion 1.0.0
 * 
 * @apiSuccessExample {text} Success-Response:
 *  HTTP/1.1 200 OK
 *  ok
 * 
 * @apiSampleRequest /status.ok
 * 
 */
router.get('/status.ok', v1Controller.home.ok);
/**
 * 
 * @api {Get} /apidoc 文档
 * @apiName apidoc
 * @apiGroup V0_Doc
 * @apiVersion 1.0.0
 * @apiDescription 项目文档地址
 * 
 */
router.get(['/apidoc', '/apidoc/:file*'], v1Controller.home.apidoc);

router.use('/v1', v1.routes())

export default router;