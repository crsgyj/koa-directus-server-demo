import { AppLoggers } from '@/utils/logger'
import { IService } from '@/service';
import { ModelMap, Directus, dtsCreator } from '@/models/directus';
import { errors } from '@/middleware/errors';
import * as utils from '@/utils'

declare module 'koa' {
  /**
   * 用户自定义上下文
   */
  interface DefaultContext {
    /** app配置 */
    appConfig: AppConfig
    /** loggers */
    loggers: AppLoggers
    /** logger */
    logger: AppLoggers['default']
    /** service */
    service: IService
    /** Directus类 */
    Directus: ReturnType<typeof dtsCreator>,
    /** directus admin实例 */
    adminDts: Directus<ModelMap>,
    /** errors */
    errors: typeof errors,
    utils: typeof utils
  }
  /**
   * 用户自定义上状态
   * 通过 ctx.state 拿到
   */
  interface DefaultState {
    reqBody?: Record<string, any>
    /** 跳过打印日志 */
    __skipLogHttp: boolean
    /** 用户数据访问器 */
    userDts?: Directus<ModelMap>,
    /** 当前用户数据 */
    currUser?: Partial<ModelMap['directus_users']>
  }
}