import Controller from "@/lib/controller";

/** UserController */
export class UserController extends Controller {

  /** 获取用户详情 */
  async userInfo() {
    const { ctx, service, utils } = this;
    const userId = ctx.state.reqBody!.userId as number;

    const userInfo = await service.user.findUserById(userId);
    if (!userInfo) {
      throw new ctx.errors.HttpError({
        type: ctx.errors.ERRORS.NOT_FOUND,
        message: '用户未找到'
      })
    }

    ctx.type = 'json';
    ctx.body = utils.httpHelper.success({
      data: userInfo
    });
  }
}