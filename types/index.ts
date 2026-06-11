export type UserRole = 'admin' | 'student';
export type UserType = 'student' | 'staff';
export type ComplaintType = 'student' | 'staff';

export interface StudentDetails {
  roll_number?: string;
  department?: string;
  year?: string;
  phone?: string;
  course?: string;
}

export interface TeacherDetails {
  employee_id?: string;
  department?: string;
  designation?: string;
  phone?: string;
}

export interface User {
  id: string;
  clerk_id: string | null;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  user_type: UserType;
  email_notifications: boolean;
  student_details: StudentDetails | null;
  teacher_details: TeacherDetails | null;
  // Student-specific auth fields (set by admin)
  student_id: string | null;
  branch: string | null;
  semester: string | null;
  password_hash: string | null;
  created_at: string;
}

export type ComplaintStatus = 'Pending' | 'In Review' | 'Resolved';
export type ComplaintCategory = 'Infrastructure' | 'Academic' | 'Administration' | 'Hostel' | 'Other';

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  complaint_type: ComplaintType;
  image_url: string | null;
  status: ComplaintStatus;
  priority: number | null;
  rating: number | null;
  ai_reply: string | null;
  admin_reply: string | null;
  in_review_image_url: string | null;
  resolution_steps: string | null;
  is_read: boolean;
  created_at: string;
  user?: Partial<User>;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string | null;
  stage_label: string | null;
  message: string;
  is_admin_note: boolean;
  created_at: string;
  author?: Pick<User, 'name' | 'avatar_url' | 'role'>;
}

export interface CategoryCount {
  category: string;
  count: number;
}

// Student session payload stored in JWT cookie
export interface StudentSession {
  userId: string;
  studentId: string;
  email: string;
  name: string | null;
}

