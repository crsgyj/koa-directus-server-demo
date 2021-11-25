import { DefaultState, DefaultContext } from 'koa';
import { RouterContext } from '@koa/router'
import Koa from 'koa';

export default class Controller {
  protected ctx: RouterContext<DefaultState, DefaultContext>
  constructor(ctx?: any) {
    this.ctx = ctx;
  }
  /** service */
  protected get service() {
    return this.ctx!.service;
  }
  /** 工具 */
  protected get utils() {
    return this.ctx!.utils;
  }
  /** 日志 */
  protected get logger() {
    return this.ctx!.logger;
  }
  /** 错误 */
  protected get errors() {
    return this.ctx!.errors;
  }
}

const notFoundController: Koa.Middleware<DefaultState, DefaultContext> = (ctx) => {
  throw new ctx.errors.HttpError({
    type: ctx.errors.ERRORS.NOT_FOUND,
    message: 'Not found'
  })
}

export function proxyController<T extends Controller>(controller: T): T {
  const Handler: ProxyHandler<T> = {
    get: (target, key): Koa.Middleware<DefaultState, DefaultContext> | undefined => {
      if (key in target) {
        const propValue = target[key as keyof T];
        if (typeof propValue === 'function') {
          return async (ctx, next) => {
            if (!ctx['$__baseController']) {
              ctx['$__baseController'] = new Controller(ctx);
            }
            await propValue.apply(ctx['$__baseController'], [ctx, next]); 
          };
        } else {
          return notFoundController;
        }
      } else {
        return notFoundController;
      }
    },
  };
  const proxyController = Object.setPrototypeOf({}, new Proxy(controller, Handler));
  return proxyController;
} 

export function proxyAll<T = any>(obj: T): T {
  return Object.keys(obj).reduce(
    (state, key) => {
      state[key] = proxyController((obj as any)[key]);
      return state;
    },
    {} as any
  );
}