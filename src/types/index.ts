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

export interface Activity {
  id?: number;
  family_id: number;
  date: string;
  status: ActivityStatusEnum;
  type: string;
  description: string;
  category: ActivityCategoryEnum;
}
