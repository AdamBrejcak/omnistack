export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("fb_token");
  const isAuthPage = to.path === "/login" || to.path === "/register";
  const isPublicPage = to.path === "/" || isAuthPage;

  if (!token.value && !isPublicPage) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (token.value && isPublicPage) {
    return navigateTo("/dashboard");
  }
});