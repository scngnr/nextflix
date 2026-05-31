import { authMiddleware } from "@clerk/nextjs"

// Clerk'in auth() / currentUser() bağlamını doldurması için authMiddleware
// gereklidir. Tüm rotaları public yaparak otomatik yönlendirme/loop'u önlüyoruz;
// sayfa korumasını `requireAuth()` (currentUser + redirect) ile manuel yapıyoruz.
export default authMiddleware({
  publicRoutes: () => true,
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
