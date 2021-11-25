import Koa from 'koa';
import chalk from 'chalk';
import httpStatusCode from 'http-status-codes';
import log4js from 'log4js';

export enum ERRORS {
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DATA_INVALID = 'DATA_INVALID',
  NOT_ACCEPTABLE = 'NOT_ACCEPTABLE',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  SERVICE_DISABLED = 'SERVICE_DISABLED',
  DATA_EXISTED = 'DATA_EXISTED',
  UNAUTHORIZED = 'UNAUTHORIZED'
}
const errMaps: {
  [s: string]: HttpErrorData
} = {
  // [E]
  [ERRORS.DATA_INVALID]: {
    code: 40000,
    status: 400,
    message: 'Data invalid'
  },
  [ERRORS.UNAUTHORIZED]: {
    code: 40001,
    status: 401,
    message: 'Unauthorized'
  },
  [ERRORS.PAYMENT_REQUIRED]: {
    code: 40002,
    status: 402,
    message: 'Payment required'
  },
  [ERRORS.FORBIDDEN]: {
    code: 40003,
    status: 403,
    message: 'Permission denied'
  },
  [ERRORS.NOT_FOUND]: {
    code: 40004,
    status: 404,
    message: 'Data not found'
  },
  [ERRORS.NOT_ACCEPTABLE]: {
    code: 40006,
    status: 406,
    message: 'Paremeter not accept'
  },
  [ERRORS.REQUEST_TIMEOUT]: {
    code: 40008,
    status: 408,
    message: 'Request timeout'
  },
  [ERRORS.CONFLICT]: {
    code: 40009,
    status: 409,
    message: 'Conflict'
  },
  [ERRORS.GONE]: {
    code: 40010,
    status: 410,
    message: 'The requested content has been permenantly deleted'
  },
  [ERRORS.SERVICE_DISABLED]: {
    code: 400018,
    status: 400,
    message: 'Service disabled'
  },
  [ERRORS.DATA_EXISTED]: {
    code: 40019,
    status: 400,
    message: 'Data existed'
  }
};


function reqInfo(ctx: Koa.Context): string {
  const req = ctx.request;
  const headers = req.headers;
  let info = `${req.method.toUpperCase()} - ${req.path} - ${req.protocol} - ${req.host} - ${ctx.service.tool.getRealIPs().join(',')} - query: "${req.querystring}" - data: ${JSON.stringify(req.body)} - user-agent: ${ctx.service.tool.getRealUA()}`;
  return info;
}

function errColorStatus(status: number) {
  if (status >= 500) {
    return chalk.redBright(status);
  }
  
  if (status >= 400) {
    return chalk.yellowBright(status);
  } else {
    return chalk.green(status);
  }
}

export interface HttpErrorData {
  code?: number
  message: string
  status: number
  stack?: string
  data?: any
}

export interface HEOptions {
  code?: number,
  message?: string,
  status?: number,
  type?: string,
  data?: any
}

export class IHttpError extends Error {
  name: string = 'IHttpError'
  code: number | undefined
  status: number | undefined
  data: any = null
  constructor(props: HEOptions) {
    super(props.message);
    this._init(props);
  }

  private _init(props: HEOptions) {
    if (!props.type) {
      props.type = ERRORS.DATA_INVALID;
    }
    const definedErrData = errMaps[props.type];
    if (definedErrData) {
      this.code = props.code || definedErrData.code;
      this.message = props.message || definedErrData.message;
      this.status = props.status || definedErrData.status;
      this.data = props.data || null;
    } else {
      this.code = props.code || 999;
      this.message = props.message || 'unknown error';
      this.status = props.status || 400;
      this.data = props.data || null;
    }
  }

  static output(err: HttpErrorData) {
    let message = err.status >= 500 ? 'Internal Server Error' : err.message;
    return {
      code: err.code || 999,
      message: message
    };
  }
} 

export function errorHandler() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const now = Date.now();
    try {
      await next();
      if (!ctx.state.__skipLogHttp) {
        log4js.getLogger().info(`${errColorStatus(ctx.status)}(${Date.now() - now}ms) ${reqInfo(ctx)}`);
      }
    } catch(err: any) {
      const httpErr: HttpErrorData = err;
      const ctxInfo = reqInfo(ctx);
      if (err instanceof IHttpError == false) {
        httpErr.status = 500;
        httpErr.code = 50000;
      }
      /** 错误栈 */
      const stack = httpErr.code === errMaps[ERRORS.NOT_ACCEPTABLE].code 
        ? `参数错误: ${httpErr.stack?.split(/\n/)[0]}`
        : httpErr.stack?.replace(/.+\.js[0-9:]+[^\w]*/g, '').trim();
      /** 错误信息 */
      const logInfo = `${errColorStatus(httpErr.status)}(${Date.now() - now}ms) - ${ctxInfo}\n${stack}`;
      // 打印错误信息
      log4js.getLogger().error(logInfo);
      // 返回客户端错误
      const errOutput = IHttpError.output(httpErr);
      // 返回
      ctx.status = err instanceof IHttpError 
        ? (err.status ?? 400)
        : (httpErr.status ?? 500);

      ctx.type = 'json';
      ctx.body = ctx.utils.httpHelper.error({
        code: errOutput.code,
        errMsg: errOutput.message,
        status: httpErr.status,
        data: httpErr.data
      });
    }
  };
}

/** ctx绑定的error */
export const errors = {
  ERRORS,
  HttpError: IHttpError
}