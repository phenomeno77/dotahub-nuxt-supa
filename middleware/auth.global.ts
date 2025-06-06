import { useAuth } from "@/composables/useAuth";
import { useLoading } from "@/composables/useLoading";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  const loading = useLoading();

  loading.startLoading();

  // Make sure user is authenticated
  auth.checkAuth();

  // Optional: You can await verifyUserStatus if needed
  // try {
  //   if (auth.loggedIn.value) {
  //     await auth.verifyUserStatus()
  //   }
  // } catch (error) {
  //   console.error(error)
  // }

  // Auth-required routes
  if (to.meta.requiresAuth && !auth.loggedIn.value) {
    loading.stopLoading();
    return navigateTo("/");
  }

  // Role-based access
  if (to.meta.role && auth.userRole.value !== to.meta.role) {
    loading.stopLoading();
    return navigateTo("/");
  }

  loading.stopLoading();
});
