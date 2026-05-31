export type RoleName = 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN'

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'PENDING_DOCUMENTS'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export interface StudentProfile {
  id: string
  userId: string
  program: string
  semester: number
  studentCode: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  documentNumber: string
  role: RoleName
  isActive: boolean
  studentProfile?: StudentProfile
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
}

export interface RequestType {
  id: string
  name: string
  description: string | null
  estimatedDays: number
  isActive: boolean
}

export interface Attachment {
  id: string
  requestId: string
  fileName: string
  originalName: string
  url: string
  mimeType: string
  fileSize: number
  provider: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface RequestHistory {
  id: string
  requestId: string
  previousStatus: RequestStatus | null
  newStatus: RequestStatus
  userId: string | null
  comment: string | null
  createdAt: string
}

export interface Request {
  id: string
  trackingNumber: string
  title: string
  description: string | null
  status: RequestStatus
  userId: string
  requestTypeId: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  user?: AuthUser
  requestType?: RequestType
  attachments?: Attachment[]
  history?: RequestHistory[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  total: number
  draft: number
  submitted: number
  inReview: number
  approved: number
  rejected: number
  cancelled: number
  recentActivity: {
    id: string
    trackingNumber: string
    title: string
    status: RequestStatus
    updatedAt: string
    user: { fullName: string }
    requestType: { name: string }
  }[]
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
  timestamp?: string
  path?: string
}

export interface ValidationErrorDetail {
  property: string
  constraints: Record<string, string>
}

export interface ValidationError extends Omit<ApiError, 'message'> {
  message: ValidationErrorDetail[]
}
