import { parseJson } from "@/lib/utils";

export const ADMIN_PERMISSIONS = {
  overview: {
    key: "overview",
    label: "Genel Bakış",
    description: "Platform istatistiklerini ve özet paneli görüntüleme",
    group: "Panel",
  },
  users_view: {
    key: "users_view",
    label: "Kullanıcıları Görüntüle",
    description: "Kullanıcı listesini görme",
    group: "Kullanıcılar",
  },
  users_manage: {
    key: "users_manage",
    label: "Kullanıcı Yönetimi",
    description: "Kullanıcı oluşturma, düzenleme, pasifleştirme",
    group: "Kullanıcılar",
  },
  organizations_view: {
    key: "organizations_view",
    label: "Organizasyonları Görüntüle",
    description: "Organizasyon listesini görme",
    group: "Organizasyonlar",
  },
  organizations_manage: {
    key: "organizations_manage",
    label: "Organizasyon Yönetimi",
    description: "Plan, abonelik ve kredi düzenleme",
    group: "Organizasyonlar",
  },
  credits_manage: {
    key: "credits_manage",
    label: "Kredi Yönetimi",
    description: "Sınırsız kredi, toplu yükleme ve bakiye ayarlama",
    group: "Finans",
  },
  payments_view: {
    key: "payments_view",
    label: "Ödemeleri Görüntüle",
    description: "Ödeme geçmişi ve gelir raporu",
    group: "Finans",
  },
  qr_codes_view: {
    key: "qr_codes_view",
    label: "QR Kodları Görüntüle",
    description: "Kullanıcıların oluşturduğu tüm QR kodları listeleme",
    group: "QR Kodlar",
  },
  activity_view: {
    key: "activity_view",
    label: "Canlı Aktivite",
    description: "Platform işlem akışı ve kullanıcı aktiviteleri",
    group: "Panel",
  },
  settings_self: {
    key: "settings_self",
    label: "Kendi Hesap Ayarları",
    description: "Kendi e-posta ve şifresini değiştirme",
    group: "Hesap",
  },
} as const;

export type AdminPermissionKey = keyof typeof ADMIN_PERMISSIONS;

export const ALL_ADMIN_PERMISSIONS = Object.keys(ADMIN_PERMISSIONS) as AdminPermissionKey[];

export type SystemRole = "SUPER_ADMIN" | "PLATFORM_ADMIN" | "CUSTOMER";

export type AdminUserLike = {
  role: SystemRole | string;
  adminPermissions?: string | null;
};

export function parseAdminPermissions(raw: string | null | undefined): AdminPermissionKey[] {
  const parsed = parseJson<string[]>(raw || "[]", []);
  return parsed.filter((p): p is AdminPermissionKey => p in ADMIN_PERMISSIONS);
}

export function getUserAdminPermissions(user: AdminUserLike): AdminPermissionKey[] {
  if (user.role === "SUPER_ADMIN") return ALL_ADMIN_PERMISSIONS;
  if (user.role !== "PLATFORM_ADMIN") return [];
  return parseAdminPermissions(user.adminPermissions);
}

export function hasAdminPanelAccess(user: AdminUserLike): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role !== "PLATFORM_ADMIN") return false;
  return getUserAdminPermissions(user).length > 0;
}

export function userHasPermission(user: AdminUserLike, permission: AdminPermissionKey): boolean {
  return getUserAdminPermissions(user).includes(permission);
}

export function userHasAnyPermission(user: AdminUserLike, permissions: AdminPermissionKey[]): boolean {
  return permissions.some((p) => userHasPermission(user, p));
}

export const ADMIN_ROUTE_PERMISSIONS: Record<string, AdminPermissionKey[]> = {
  "/admin": ["overview"],
  "/admin/activity": ["activity_view"],
  "/admin/users": ["users_view", "users_manage"],
  "/admin/organizations": ["organizations_view", "organizations_manage"],
  "/admin/credits": ["credits_manage", "organizations_manage"],
  "/admin/sales": ["payments_view", "credits_manage", "organizations_manage"],
  "/admin/ads": ["payments_view", "overview"],
  "/admin/payments": ["payments_view"],
  "/admin/qr-codes": ["qr_codes_view"],
  "/admin/settings": ["settings_self"],
};

export function canAccessAdminRoute(user: AdminUserLike, path: string): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  const entry = Object.entries(ADMIN_ROUTE_PERMISSIONS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([route]) => path === route || path.startsWith(`${route}/`));
  if (!entry) return false;
  return userHasAnyPermission(user, entry[1]);
}

export function getDefaultAdminRoute(user: AdminUserLike): string {
  if (user.role === "SUPER_ADMIN") return "/admin";
  for (const [route, perms] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
    if (userHasAnyPermission(user, perms)) return route;
  }
  return "/dashboard";
}

export function serializeAdminPermissions(permissions: AdminPermissionKey[]): string {
  const valid = permissions.filter((p) => p in ADMIN_PERMISSIONS);
  return JSON.stringify([...new Set(valid)]);
}
