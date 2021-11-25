import Service from "@/lib/service";

/** 工具 */
export default class ToolService extends Service {

  /** 获取RealIp */
  getRealIPs() {
    if (this.ctx.ips?.length) {
      return this.ctx.ips;
    }
    if (this.ctx.header['top-real-ip']) {
      return [this.ctx.header['top-real-ip']]
    }
    if (this.ctx.header['x-real-ip']) {
      return [this.ctx.header['x-real-ip']]
    }
    return [this.ctx.ip];
  }
  /** 获取real user agent */
  getRealUA() {
    if (this.ctx.header['top-real-ua']) {
      return [this.ctx.header['top-real-ua']]
    }
    return this.ctx.header['user-agent'];
  }
}