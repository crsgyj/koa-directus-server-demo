import { MTYPE_DIRECTUS_ROLES } from "./directus_roles.model";

/** directus_users -  */
export type MTYPE_DIRECTUS_USERS = {
  /** id -  */
  id: string;
  /** first_name -  */
  first_name: string;
  /** last_name -  */
  last_name: string;
  /** email -  */
  email: string;
  /** password -  */
  password: string;
  /** location -  */
  location: string;
  /** title -  */
  title: string;
  /** description -  */
  description: string;
  /** tags -  */
  tags: string;
  /** avatar -  */
  avatar: string;
  /** language -  */
  language: string;
  /** theme -  */
  theme: string;
  /** tfa_secret -  */
  tfa_secret: string;
  /** status -  */
  status: string;
  /** role -  */
  role: Partial<MTYPE_DIRECTUS_ROLES>;
  /** token -  */
  token: string;
  /** last_access -  */
  last_access: string;
  /** last_page -  */
  last_page: string;
  /** provider -  */
  provider: string;
  /** external_identifier -  */
  external_identifier: string;
  /** auth_data -  */
  auth_data: string;
}