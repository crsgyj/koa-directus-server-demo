import Service from "@/lib/service";
import { MTYPE_DIRECTUS_USERS } from "@/models/db/directus_users.model";
import { QueryOne } from "@directus/sdk";

/** 用户 */
export default class UserService extends Service {

  async findUserById(id: number, opt?: QueryOne<MTYPE_DIRECTUS_USERS>) {
    return this.userDts!.users.readOne(id, opt);
  }
}