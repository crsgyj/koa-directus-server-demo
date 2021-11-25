export { serviceMiddleware } from "@/lib/service";

/** IService */
export interface IService {
  user: import('./user').default,
  tool: import('./tool').default,
}