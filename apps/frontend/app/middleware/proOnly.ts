export default defineNuxtRouteMiddleware(() => {
  const { user, isPro } = useUser();

  if (!user.value) {
    return navigateTo("/login");
  }

  if (!isPro.value) {
    return navigateTo("/?reason=pro_required");
  }
});