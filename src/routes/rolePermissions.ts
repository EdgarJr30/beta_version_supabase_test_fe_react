export const rolePermissions: Record<string, string[]> = {
    super_admin: ["/admin", "/tenant", "/testing", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/aprobacion-eNCF", "/AdmCertificadoDigital", "/AdmRol", "/AdmUsuarios", "/"], // Super Admin puede acceder a todo
    admin: ["/admin", "/tenant", "/testing", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/aprobacion-eNCF", "/AdmCertificadoDigital", "/AdmUsuarios", "/"], // Admin puede acceder a todo
    user: ["/AdmUsuarios", "/emision-eNCF", "/AnularSecuenciaAutorizada", "/aprobacion-eNCF", "/AdmCertificadoDigital",], // Usuario normal solo puede acceder a /user
    testing: ["/testing"], // Testing solo puede acceder a /testing
  };
  