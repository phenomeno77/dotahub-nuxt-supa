export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  await supabase.auth.getSession()

  if (!user.value && to.path !== '/') {
    return navigateTo('/')
  }
})
