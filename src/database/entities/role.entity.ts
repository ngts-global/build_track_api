export interface RoleEntity {
  role_name: string;
  menus?: Record<string, unknown> | null;
  created_at: string;
}
