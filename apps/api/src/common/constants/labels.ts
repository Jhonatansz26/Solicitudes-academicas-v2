export const ROLE_LABELS = {
  STUDENT: 'Estudiante',
  STAFF: 'Funcionario',
  COORDINATOR: 'Coordinador',
  ADMIN: 'Administrador',
} as const;

export const REQUEST_STATUS_LABELS = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  PENDING_DOCUMENTS: 'Documentos pendientes',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
} as const;

export const OFFICIAL_DOCUMENT_TYPE_LABELS = {
  CERTIFICATE: 'Certificado',
  TRANSCRIPT: 'Récord académico',
  RESOLUTION: 'Resolución',
  CONSTANCY: 'Constancia',
  OTHER: 'Otro',
} as const;

export const NOTIFICATION_CHANNEL_LABELS = {
  EMAIL: 'Correo electrónico',
  SYSTEM: 'Sistema',
} as const;
