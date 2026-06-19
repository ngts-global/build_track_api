export const DATA_API_TABLES = [
  'user_projects_role_map',
  'ex_categories',
  'super_admins',
  'projects',
  'user_otps',
  'plans',
  'expenses',
  'users',
  'ex_subcategories',
  'roles',
  'budgets',
] as const;

export type DataApiTable = (typeof DATA_API_TABLES)[number];

export const DATA_API_TABLE_ROUTES: string[] = [...DATA_API_TABLES];

export const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-profile',
  'content-profile',
  'content-type',
  'prefer',
  'range',
  'range-unit',
] as const;

export const FORWARDED_RESPONSE_HEADERS = [
  'content-location',
  'content-profile',
  'content-range',
  'content-type',
  'location',
  'preference-applied',
] as const;
