
/** app配置 */
type AppConfig = {
  /** port */
  port: number;
  /** 环境变量NODE_ENV */
  env: string;
  /** 根目录 */
  rootPath: string;
  /** 文档地址 */
  apidocPath: string;
  /** directus连接配置 */
  directus: {
    url: string;
    admin_token: string;
  }
  [s: string]: any;
}