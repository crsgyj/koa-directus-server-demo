/** directus_settings -  */
export type MTYPE_DIRECTUS_SETTINGS = {
  /** id -  */
  id: number;
  /** project_name -  */
  project_name: string;
  /** project_url -  */
  project_url: string;
  /** project_color -  */
  project_color: string;
  /** project_logo -  */
  project_logo: string;
  /** public_foreground -  */
  public_foreground: string;
  /** public_background -  */
  public_background: string;
  /** public_note -  */
  public_note: string;
  /** auth_login_attempts -  */
  auth_login_attempts: number;
  /** auth_password_policy -  */
  auth_password_policy: string;
  /** storage_asset_transform -  */
  storage_asset_transform: string;
  /** storage_asset_presets -  */
  storage_asset_presets: string;
  /** custom_css -  */
  custom_css: string;
  /** storage_default_folder -  */
  storage_default_folder: string;
  /** basemaps -  */
  basemaps: string;
  /** mapbox_key -  */
  mapbox_key: string;
  /** module_bar -  */
  module_bar: string;
}