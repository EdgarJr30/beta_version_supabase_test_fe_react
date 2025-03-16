export const rolePermissions: Record<string, string[]> = {
    admin: ["/admin", "/tenant", "/user", "/testing", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/"], // Admin puede acceder a todo
    user: ["/user", "/emision-eNCF", "/AnularSecuenciaAutorizada",], // Usuario normal solo puede acceder a /user
    testing: ["/testing"], // Testing solo puede acceder a /testing
  };
  