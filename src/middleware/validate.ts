import Joi from 'joi';
import { omitBy } from 'lodash';
import { Middleware } from '@koa/router';
import { DefaultContext, DefaultState, Context } from 'koa';
/** 字符串，允许空字符串 */
export const joiString = Joi.string().allow('');
/** 字符串，允许空字符串和null */
export const joiStringNil = Joi.string().allow('', null);
/** 数字 */
export const joiNumber = Joi.number();
/** 数字，允许null */
export const joiNumberNil = Joi.number().allow(null);
/** 整数 */
export const joiInteger = joiNumber.integer();
/** 整数, 允许null */
export const joiIntegerNil = joiNumber.integer().allow(null);
/** 正整数 */
export const joiPositiveInt = joiInteger.positive();
/** 正整数, 允许null */
export const joiPositiveIntNil = joiInteger.positive().allow(null);
/** 负整数, */
export const joiNegativeInt = joiInteger.negative();
/** 负整数, 允许null */
export const joiNegativeIntNil = joiInteger.negative().allow(null);

/** 校验对象 */
enum VALIDATE_TARGET {
  query = 'query',
  body = 'body',
  params = 'params'
}
type ParamsedCtx = Context;

interface PVMiddlewareGenerator {
  (options: {
    /** 校验模式 */
    schema: Joi.Schema | ((ctx: ParamsedCtx) => Joi.Schema), 
    /** 参数位置 */
    prop: keyof typeof VALIDATE_TARGET, 
    /** 参数预处理 */
    paramsParser?: (v: any, ctx: ParamsedCtx) => any,
    /** 结果预处理 */
    resultParser?: (v: any, ctx: ParamsedCtx) => any
  }): Middleware<DefaultState, DefaultContext>;
}

/** 参数校验器 */
export const parameterValidater: PVMiddlewareGenerator = ({
  schema, 
  prop, 
  resultParser,
  paramsParser
}) => async (ctx, next) => {
  let _schema = schema instanceof Function ? schema(ctx) : schema;
  // 如果是query查询，自动过滤空字符串参数。
  if (prop === 'query' && paramsParser === undefined) {
    paramsParser = (v) => omitBy(v, e => e === '');
  }
  // 校验对象
  let target = getTarget(ctx, prop);
  if (!target) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.NOT_ACCEPTABLE,
    });
  }
  try {
    target = paramsParser ? paramsParser(target, ctx) : target;
  } catch (err) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.NOT_ACCEPTABLE,
    });
  }
  const { value, error } = _schema.validate(target, { abortEarly: true, allowUnknown: true, stripUnknown: true });
  // 校验失败，抛出错误
  if (error) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.NOT_ACCEPTABLE,
      message: error.message
    });
  }
  // 最终结果赋值给ctx.state
  ctx.state.reqBody = resultParser ? resultParser(value, ctx) : value;
  return next();
};


function getTarget(ctx: ParamsedCtx, prop: string) {
  switch (prop) {
    case VALIDATE_TARGET.body:
      if (typeof ctx.request.body === 'string') {
        return {};
      }
      return { ...ctx.request.body };
    case VALIDATE_TARGET.params:
      return { ...ctx.params };
    case VALIDATE_TARGET.query: {
      return { ...ctx.request.query };
    }
    default:
      return null;
  }
}

export { Joi };