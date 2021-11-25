/** directus_relations -  */
export type MTYPE_DIRECTUS_RELATIONS = {
  /** id -  */
  id: number;
  /** many_collection -  */
  many_collection: string;
  /** many_field -  */
  many_field: string;
  /** one_collection -  */
  one_collection: string;
  /** one_field -  */
  one_field: string;
  /** one_collection_field -  */
  one_collection_field: string;
  /** one_allowed_collections -  */
  one_allowed_collections: string;
  /** junction_field -  */
  junction_field: string;
  /** sort_field -  */
  sort_field: string;
  /** one_deselect_action -  */
  one_deselect_action: string;
}