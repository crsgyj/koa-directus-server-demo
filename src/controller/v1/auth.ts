import Controller from "@/lib/controller";

/** AuthController */
export class AuthController extends Controller {

  /** 获取登录用户详情 */
  async profile() {
    const { ctx, utils } = this;

    ctx.type = 'json';
    this.ctx.body = utils.httpHelper.success({
      data: ctx.state.currUser
    });
  }
}