
import App from '../app';
import  { ParameterizedContext, DefaultState, DefaultContext} from 'koa';
import path from 'path';
import Koa from 'koa';
import fs from 'fs';

declare interface ServiceProps {
  ctx: any,
  app: App
}

export default abstract class Service {
  protected ctx: ParameterizedContext<DefaultState, DefaultContext>
  protected app: App

  constructor({ ctx, app }: ServiceProps) {
    this.ctx = ctx;
    this.app = app;
  }
  /** 配置 */
  protected get utils() {
    return this.ctx.utils;
  }

  /** 配置 */
  protected get config() {
    return this.ctx.config;
  }

  /** logger */
  protected get logger() {
    return this.ctx.logger;
  }

  /** 错误 */
  protected get errors() {
    return this.ctx.errors;
  }
  
  /** 管理员model */
  protected get adminDts() {
    return this.ctx.adminDts;
  }
  /** 用户model */
  protected get userDts() {
    return this.ctx.state.userDts;
  }

  /** service */
  protected get service() {
    return this.ctx.service;
  }

  /** directus */
  protected get directus() {
    return this.ctx.directus;
  }
}


const PATHNAME = Symbol('PAHNAMEMAP');
const MODULE = Symbol('JSMODULE');
const MODULE_NAME = Symbol('MODULENAME');
const modules = new Map();

// service中间件参数
interface ServiceOption {
  servDir: string, app: any
}
// service中间件
interface ServiceMiddleware {
  (option: ServiceOption): Koa.Middleware
} 

export const serviceMiddleware: ServiceMiddleware = function ({ servDir, app }) {
  fs.readdirSync(servDir)
    .filter((file) => {
      const fileDir = path.join(servDir, file);
      return fs.lstatSync(fileDir).isDirectory();
    }).forEach((m) => {
      const moduleFile = path.join(servDir, m);
      modules.set(m, {
        [MODULE_NAME]: m,
        [PATHNAME]: moduleFile,
        [MODULE]: require(moduleFile).default,
      });
    });

  // 访问时实例化service
  const Handler: (ctx: Koa.ParameterizedContext) => ProxyHandler<Map<string, any>> = (ctx) => ({
    get: (target, key: string) => {
      const moduleInfo = modules.get(key);
      if (!moduleInfo) {
        return undefined;
      }

      let serv = target.get(key);

      if (serv) {
        return serv;
      }
      const ServClass = moduleInfo[MODULE];
      serv = new ServClass({ ctx, app });
      target.set(key, serv);
      return serv;
    },
  });
  return async (ctx, next) => {
    const service = Object.setPrototypeOf({}, new Proxy(new Map(), Handler(ctx)));
    ctx.service = service;
    return next();
  };
};