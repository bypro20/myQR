import { permanentRedirect } from "next/navigation";

/** /register → /signup kalıcı yönlendirme (middleware yedek) */
export default function RegisterPage() {
  permanentRedirect("/signup");
}
