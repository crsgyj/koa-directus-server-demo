import { Directus, TypeMap } from '@directus/sdk'
import { getLogger } from 'log4js'
import { ModelMap } from './map';
// exports
export { Directus } from '@directus/sdk'
export { ModelMap } from './map';

interface DirectusOptions {
  email?: string;
  password?: string;
  token: string;
}

/** 构建directus实例 */ 
export const dtsCreator = (url: string) => 
  (options: DirectusOptions, callback?: (err?: Error) => void) => {
    const dt = new Directus<ModelMap & TypeMap>(url, {
      storage: {
        mode: 'MemoryStorage'
      }
    });

    if (options.token) {
      // 目前只用static模式
      dt.auth.static(options.token)
        .then(e => {
          // 日志
          getLogger().info('[Directus] directus static result: ' + e);
          // 回调
          callback && callback();
        })
        .catch(err => {
          // 日志
          getLogger().error('[DirectusError] ' + err.message + ' token: ' + options.token);
          // 回调
          callback && callback(err);
        });
    } else if (options.email && options.password) {
      // 登录模式15分钟后失效, 自动刷新，服务端维持状态
      dt.auth.login({
        email: options.email,
        password: options.password,
      })
        .then(async () => {
          // 定时器
          ;(function autoRefresh() {
            setTimeout(async () => {
              try {
                // 刷新
                await dt.auth.refresh();
                // 循环
                return autoRefresh();
              } catch(err) {
                // 日志
                getLogger('default').error(`[DirectusError] 刷新token失效, 原token: ${dt.auth.token}`)
              }
            }, 10 * 60 * 1000)  
          }());
          // 回调
          callback && callback();
        })
        .catch(err => {
          // 回调
          callback && callback(new Error('[Directus] ' + err.message));
        });
    }

    return dt;
  };

