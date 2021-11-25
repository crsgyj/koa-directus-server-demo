import Koa from 'koa';
import cors from '@koa/cors';
import koaBody from '@/middleware/koaBody';
import { userAgent } from 'koa-useragent';
import path from 'path';
import { Server } from 'http';
import router from '@/router';
// import { getLogger, AppLoggers, logLevels } from '@/utils/logger';
import { serviceMiddleware } from '@/service';
import { dtsCreator } from '@/models/directus';
import { errors, errorHandler } from '@/middleware/errors';
import * as utils from '@/utils';
import { logger } from '@/utils';
import { authorize } from './middleware/authorize';

class App {
  /** koa实例 */
  private _koa: Koa | undefined;
  /** app配置 */
  private config: AppConfig;
  /** loggers */
  private loggers: logger.AppLoggers;
  /** 默认logger */
  private logger: logger.AppLoggers['default'];
  /** 是否生产环境 */
  get isProd() {
    return this.config.env === 'production'
  }

  constructor(config: AppConfig) {
    this.config = config;
    /** logger */
    this.loggers = logger.getLogger({
      logDir: path.join(this.config.rootPath, 'logs'),
      level: this.isProd 
        ? logger.logLevels.INFO.levelStr 
        : logger.logLevels.DEBUG.levelStr 
    });
    this.logger = this.loggers.default;
    this.koa!.context.loggers = this.loggers;
    this.koa!.context.logger = this.loggers.default;
    /** utils */
    this.koa!.context.utils = utils;
    /** config */
    this.koa!.context.appConfig = this.config;
    /** 创建directus示例 */
    this.koa!.context.Directus = dtsCreator(this.config.directus.url);
    /** directus admin用户 */
    this.koa!.context.adminDts = dtsCreator(this.config.directus.url)({
      token: this.config.directus.admin_token
    });
    /** error - 错误处理插件 */
    this.koa!.context.errors = errors;
  }

  /** 启动 */
  start(port: number, host: string = '0.0.0.0', callback?: (server: Server) => void) {
    const server = this.koa.listen(port, host, () => {
      const address = resolveServerAddress(server.address());
      this.logger.info('Server started. Listening at ' + address);
      if (callback) {
        callback(server);
      }
    });
    return server;
  }
  
  /** koa示例 */
  get koa() {
    if (this._koa) {
      return this._koa;
    }

    this._koa = new Koa();
    this._koa
      .use(cors({
        maxAge: 60000,
        origin: function (ctx) {
          return ctx.request.header.origin!;
        },
        credentials: true
      }))
      .use(userAgent)
      .use(koaBody({
        uploadDir: path.join(this.config.rootPath, '/uploads')
      }))
      .use(errorHandler())
      .use(serviceMiddleware({
        app: this,
        servDir: path.join(this.config.rootPath, '/src/service')
      }))
      .use(authorize(this.config))
      .use(router.routes())
      .use(router.allowedMethods());

    return this._koa;
  }
}

/** 解析address */
function resolveServerAddress(addr: ReturnType<Server['address']> ) {
  if (!addr) {
    return ''
  }
  if (typeof addr === 'string') {
    return addr
  } else {
    return `[${addr.family}] - ${addr.address}:${addr.port}`;
  }
}

export default App;