export enum ActivityCategoryEnum {
  Spiritual = "Spiritual",
  Social = "Social",
}

export enum ActivityStatusEnum {
  planned = "Planned",
  Completed = "Completed",
  Ongoing = "Ongoing",
  Cancelled = "Cancelled",
}

export enum ParentGuardianStatusEnum {
  BothParents = "Both Parents",
  OneParent = "One Parent",
  Stepfamily = "Stepfamily",
  Grandparents = "Grandparents",
  Guardian = "Guardian (Non-relative)",
  None = "None",
}

export enum EmploymentTypeEnum {
  FullTimeEmployed = "Full-Time Employed",
  FullTimeSelfEmployed = "Full-Time Self-Employed",
  Freelance = "Freelance",
  PartTime = "Part-Time",
  Temporary = "Temporary",
  Contract = "Contract for a Specific Period",
  Unemployed = "Unemployed",
  Student = "Student",
}

export enum BCCClassStatusEnum {
  Graduate = "Graduate",
  Ongoing = "Ongoing",
  NotStarted = "Not yet Started",
}

export interface Activity {
  id?: number;
  family_id: number;
  date: string;
  start_date?: string | null;
  end_date?: string | null;
  status: ActivityStatusEnum;
  type: string;
  description: string;
  category: ActivityCategoryEnum;
}

export interface FamilyMember {
  id: number;
  family_id: number;
  name: string;
  id_name?: string | null;
  deliverance_name?: string | null;
  profile_photo?: string | null;
  phone: string;
  email?: string | null;
  home_address?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;

  // Residence details
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  living_arrangement?: string | null;

  // Education
  education_level?: string | null;

  // BCC Classes
  bcc_class_participation?: boolean;
  bcc_class_status?: BCCClassStatusEnum | null;
  year_of_graduation?: number | null;
  graduation_mode?: string | null;

  // Church
  commission?: string | null;
  parent_guardian_status?: ParentGuardianStatusEnum | null;
  parental_status?: boolean;

  // Occupation
  employment_type?: EmploymentTypeEnum | null;
  employment_status?: string | null;
  job_title?: string | null;
  organization?: string | null;
  business_type?: string | null;
  business_name?: string | null;
  work_type?: string | null;
  work_description?: string | null;
  work_location?: string | null;

  // Student fields
  institution?: string | null;
  program?: string | null;
  student_level?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface Family {
  id: number;
  name: string;
  category: string;
  cover_photo?: string | null;
  pere?: string | null;
  mere?: string | null;
  members: string[];
  activities: Activity[];
  last_activity_date?: string | null;
  created_at?: string;
  updated_at?: string;
}
