import { toast } from 'sonner'

/**
 * Sistema centralizado de notificaciones.
 * Reglas:
 *  - Éxito: describe el resultado concreto de la acción ("Solicitud enviada correctamente")
 *  - Error: describe la causa probable y referencia la acción ("No fue posible enviar la solicitud")
 *  - Info: comunica una acción requerida por el usuario ("Se requiere documentación adicional")
 *  - Warning: alerta preventiva sin bloqueo ("Hay acciones pendientes")
 *
 * Los errores siempre deben ser accionables y provenir del backend
 * (message de la API) cuando existan.
 */

const DEFAULT_DURATIONS = {
  success: 3500,
  info: 4500,
  warning: 5000,
  error: 6000,
} as const

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback
  if (typeof err === 'string') return err
  const message = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message
  if (Array.isArray(message)) return message[0] ?? fallback
  if (typeof message === 'string' && message.trim().length > 0) return message
  return fallback
}

export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, {
      description,
      duration: DEFAULT_DURATIONS.success,
    }),

  info: (message: string, description?: string) =>
    toast.info(message, {
      description,
      duration: DEFAULT_DURATIONS.info,
    }),

  warning: (message: string, description?: string) =>
    toast.warning(message, {
      description,
      duration: DEFAULT_DURATIONS.warning,
    }),

  error: (message: string, err?: unknown, description?: string) => {
    const fullMessage = err ? `${message} ${extractErrorMessage(err, '')}`.trim() : message
    return toast.error(fullMessage, {
      description,
      duration: DEFAULT_DURATIONS.error,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
}

/** Mensajes estandarizados en español. */
export const NOTIFY = {
  request: {
    created: 'Solicitud creada correctamente',
    createdError: 'No fue posible crear la solicitud',
    submitted: 'Solicitud enviada a revisión',
    submittedError: 'No fue posible enviar la solicitud',
    cancelled: 'Solicitud cancelada',
    cancelledError: 'No fue posible cancelar la solicitud',
    approved: 'Solicitud aprobada',
    approvedError: 'No fue posible aprobar la solicitud',
    rejected: 'Solicitud rechazada',
    rejectedError: 'No fue posible rechazar la solicitud',
    docsRequested: 'Se solicitó documentación adicional',
    docsRequestedError: 'No fue posible solicitar la documentación',
    reviewStarted: 'Revisión iniciada',
    reviewStartedError: 'No fue posible iniciar la revisión',
  },
  document: {
    uploaded: 'Documento adjuntado correctamente',
    uploadedError: 'No fue posible adjuntar el documento',
    deleted: 'Documento eliminado',
    deletedError: 'No fue posible eliminar el documento',
    downloaded: 'Descarga iniciada',
  },
  user: {
    created: 'Usuario creado correctamente',
    createdError: 'No fue posible crear el usuario',
    updated: 'Usuario actualizado',
    updatedError: 'No fue posible actualizar el usuario',
    deleted: 'Usuario eliminado',
    deletedError: 'No fue posible eliminar el usuario',
    activated: 'Usuario activado',
    deactivated: 'Usuario desactivado',
    statusError: 'No fue posible cambiar el estado del usuario',
    passwordMismatch: 'Las contraseñas no coinciden',
  },
  requestType: {
    created: 'Tipo de solicitud creado',
    createdError: 'No fue posible crear el tipo de solicitud',
    updated: 'Tipo de solicitud actualizado',
    updatedError: 'No fue posible actualizar el tipo de solicitud',
    deactivated: 'Tipo de solicitud desactivado',
    deactivatedError: 'No fue posible desactivar el tipo de solicitud',
  },
  profile: {
    updated: 'Perfil actualizado correctamente',
    updatedError: 'No fue posible actualizar el perfil',
    passwordChanged: 'Contraseña actualizada correctamente',
    passwordChangedError: 'No fue posible cambiar la contraseña',
  },
  auth: {
    invalidCredentials: 'Credenciales inválidas',
    sessionExpired: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    networkError: 'Sin conexión. Verifica tu red e intenta de nuevo.',
  },
  generic: {
    loadError: 'No fue posible cargar la información',
    saveError: 'No fue posible guardar los cambios',
    deleteError: 'No fue posible eliminar el elemento',
    updateError: 'No fue posible actualizar la información',
  },
} as const
