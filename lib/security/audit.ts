import { ActivityKind } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/admin/activity-log";

export async function logSecurityEvent(input: {
  kind: typeof ActivityKind.SECURITY_BLOCKED | typeof ActivityKind.SECURITY_LOGIN_FAILED;
  ip: string;
  message: string;
  path?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}) {
  void logActivity({
    kind: input.kind,
    message: input.message,
    targetType: "security",
    targetLabel: input.ip,
    metadata: {
      ip: input.ip,
      path: input.path,
      email: input.email,
      ...input.metadata,
    },
  });
}
