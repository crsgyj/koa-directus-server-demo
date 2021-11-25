import { Directus, ModelMap } from '@/models/directus';
import { consts } from '@/utils';
import { Middleware } from 'koa';

type UserInfoBase64 = {
  id: string;
  iat: number;
  exp: number;
  iss: string;
}

/** 登录权限验证 */
export function authorize(config: AppConfig): Middleware {
  return async (ctx, next) => {
    const token: string = (<string[]>[]).concat(ctx.header[consts.AUTH_HEADER_V1] ?? (<string[]>[]))[0] ?? '';

    if (token) {
      const [_, userInfoBase64] = token.split('.');
      
      try {
        const userInfo = ctx.utils.helper.resolveBase64json<UserInfoBase64>(userInfoBase64);
        ctx.logger.info('[Authorize] user_id: ' + userInfo.id);
        /** 当前用户-directus */
        const userDts = await new Promise<Directus<ModelMap>>((resolve, reject) => {
          const dts = ctx.Directus({
            token: token
          }, (err) => {
            if (err) {
              return reject(err);
            }
            resolve(dts);
          });
        });
        /** 当前用户信息 */
        const currUser = await userDts.users.me.read()
          .then(e => {
            return e
          })
          .catch(err => {
            return null
          });
        // 用户存在，存到上下文
        if (currUser) {
          ctx.state.userDts = userDts;
          ctx.state.currUser = currUser;
        }
      } catch(err) {
        return next();
      }
    }

    return next();
  };
}

/** 登录校验 */
export const loginRequired: Middleware = (ctx, next) => {
  if (!ctx.state.currUser) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.UNAUTHORIZED,
      message: '请登录'
    });
  }
  return next()
}

/** admin管理员权限校验 */
export const adminRequired: Middleware = (ctx, next) => {
  if (!!ctx.state.currUser?.role?.admin_access) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.FORBIDDEN,
      message: '需要管理员权限'
    });
  }
  return next();
}