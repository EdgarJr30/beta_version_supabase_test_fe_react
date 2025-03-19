export const rolePermissions: Record<string, string[]> = {
    admin: ["/admin", "/tenant", "/testing", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/aprobacion-eNCF", "/AdmCertificadoDigital", "/AdmRol", "/AdmUsuarios", "/"], // Admin puede acceder a todo
    user: ["/AdmUsuarios", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/aprobacion-eNCF", "/AdmCertificadoDigital",], // Usuario normal solo puede acceder a /user
    testing: ["/testing"], // Testing solo puede acceder a /testing
  };
  