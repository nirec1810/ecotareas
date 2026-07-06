export type TaskType = 'reforestacion' | 'limpieza' | 'educacion' | 'reciclaje' | 'otro'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type UserRole = 'coordinator' | 'volunteer'

export type AssignmentStatus = 'assigned' | 'accepted' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  bio: string | null
  is_active: boolean
  points: number
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  full_name: string
  phone: string | null
  bio: string | null
}

export interface Task {
  id: string
  title: string
  description: string | null
  type: TaskType
  location: string
  latitude: number | null
  longitude: number | null
  scheduled_date: string
  status: TaskStatus
  created_by: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Assignment {
  id: string
  task_id: string
  volunteer_id: string
  assigned_at: string
  status: AssignmentStatus
  completed_at: string | null
}

export interface AssignmentWithTask extends Assignment {
  task: Task
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Evidence {
  id: string
  task_id: string
  user_id: string
  image_url: string
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CommentWithAuthor extends Comment {
  profiles: { full_name: string }
}

export interface TaskFilters {
  status?: TaskStatus
  fecha_desde?: string
  fecha_hasta?: string
  ubicacion?: string
}

export interface TaskMetrics {
  id: string
  task_id: string
  trees_planted: number
  waste_kg: number
  registered_by: string
  created_at: string
}

export interface ImpactIndicators {
  tareasCompletadas: number
  voluntariosParticipantes: number
  arbolesPlantados: number
  residuosRecolectados: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  threshold_points: number
}

export interface UserBadge {
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}

export interface AuditLog {
  id: string
  task_id: string
  user_id: string
  action: string
  changed_fields: Record<string, any> | null
  created_at: string
  profiles?: { full_name: string }
}

export interface VoluntarioConEmail {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  bio: string | null
  is_active: boolean
  points: number
  created_at: string
}

export interface RankingEntry {
  id: string
  full_name: string
  avatar_url: string | null
  points: number
  position: number
  badges: Badge[]
}
