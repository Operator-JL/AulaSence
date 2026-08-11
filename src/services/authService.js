export class AuthNotConfiguredError extends Error {
  constructor() {
    super('El inicio de sesión estará disponible cuando se conecte el backend JWT.')
    this.name = 'AuthNotConfiguredError'
    this.code = 'AUTH_NOT_CONFIGURED'
  }
}

/**
 * Punto único de integración con el futuro backend de AulaSense.
 *
 * Cuando Martín publique el endpoint y su contrato, esta función deberá enviar
 * las credenciales al servidor y normalizar la respuesta a:
 *
 * {
 *   accessToken: string,
 *   expiresAt: string,
 *   user: { id, nombre?, email, rol?, creado_en? }
 * }
 *
 * La verificación Argon2id y la lectura de password_hash pertenecen exclusivamente
 * al backend. No se define una URL ni se simula autenticación en el navegador.
 */
async function login(_credentials, _options = {}) {
  throw new AuthNotConfiguredError()
}

export const authService = Object.freeze({ login })
