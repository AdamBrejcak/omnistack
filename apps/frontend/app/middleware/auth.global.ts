export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("fb_token");
  const isAuthPage = to.path === "/login" || to.path === "/register";

  if (!token.value && !isAuthPage) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  if (token.value && isAuthPage) {
    return navigateTo("/");
  }
});