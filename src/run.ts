// import 'module-alias/register'
import App from '@/app'
import path from 'path'
const env = process.env.NODE_ENV || 'development';
/** 根目录 */
const appRootPath = require('app-root-path').path;
const config: AppConfig = require(path.join(appRootPath, `config/${env}.json`));
/** apidoc目录 */
const apidocPath = path.join(appRootPath, 'apidoc');

// config
const app = new App({
  ...config,
  rootPath: appRootPath,
  apidocPath: apidocPath,
  env: env,
});

// 启动
app.start(config.port);