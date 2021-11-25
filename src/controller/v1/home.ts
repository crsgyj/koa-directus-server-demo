import Controller from "@/lib/controller";
import fs from 'fs';
import path from 'path';
import mime from 'mime';

/** HomeController */
export class HomeController extends Controller {
  /** 服务状态检查 */
  ok() {
    this.ctx.body = 'ok';
  }

  /** 文档 */
  apidoc() {
    const { ctx } = this;
    let filePath = path.join(ctx.appConfig.apidocPath, ctx.params.file ?? '');
    let state = fs.statSync(filePath, {
      throwIfNoEntry: false
    })
    if (!state || state.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      state = fs.statSync(filePath, {
        throwIfNoEntry: false
      });
    }
    if (!state) {
      throw new Error('File Not Found - ' + ctx.params.file)
    }
  
    ctx.type = 'text/html';
    const fileType = mime.getType(filePath);
    if (fileType) {
      ctx.type = fileType;
    }
    ctx.body = fs.createReadStream(filePath);
  }
}