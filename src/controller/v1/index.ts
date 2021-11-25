import { proxyAll } from "@/lib/controller";
import { AuthController } from "./auth";
import { HomeController } from "./home";

const v1Controller = proxyAll({
  home: new HomeController(),
  auth: new AuthController(),
});

export default v1Controller;