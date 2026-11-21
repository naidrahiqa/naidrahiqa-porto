export type VideoType = "none" | "youtube" | "drive" | "storage";

export interface Profile {
  id: number;
  name: string;
  nickname: string;
  tagline: string;
  hero_description: string;
  profile_image: string | null;
  updated_at: string;
}

export interface AboutSection {
  id: string;
  key: string;
  heading: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  platform: string;
  handle: string;
  url: string;
  sort_order: number;
}

export type ProjectCategory = "school" | "personal";

export type ProjectLayout =
  | "text-first"
  | "gallery-first"
  | "cover-hero"
  | "masonry"
  | "video-focus";

export const PROJECT_LAYOUTS: ProjectLayout[] = [
  "text-first",
  "gallery-first",
  "cover-hero",
  "masonry",
  "video-focus",
];

export type ProjectMediaType = "image" | "youtube" | "drive" | "storage";

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_type: ProjectMediaType;
  url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  layout: ProjectLayout;
  class_level: string;
  subject: string;
  description: string;
  content: string;
  cover_image: string | null;
  video_url: string | null;
  video_type: VideoType;
  link: string | null;
  published: boolean;
  featured: boolean;
  language: string;
  sort_order: number;
  repo_name: string | null;
  repo_stars: number;
  repo_forks: number;
  repo_is_fork: boolean;
  repo_archived: boolean;
  repo_pushed_at: string | null;
  repo_homepage: string | null;
  repo_topics: string[];
  repo_languages: Record<string, number>;
  repo_license: string | null;
  repo_open_issues: number;
  repo_size_kb: number;
  repo_created_at: string | null;
  repo_default_branch: string | null;
  repo_release_tag: string | null;
  repo_release_url: string | null;
  repo_release_at: string | null;
  repo_last_commit: string | null;
  repo_last_commit_at: string | null;
  repo_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubProfile {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers: number;
  following: number;
  public_repos: number;
  member_since: string | null;
  synced_at: string;
}

export type AchievementCategory = "competition" | "training" | "seminar";

export interface Achievement {
  id: string;
  title: string;
  event: string;
  category: AchievementCategory;
  year: string;
  description: string;
  certificate_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  title: string;
  slug: string;
  category: ProjectCategory;
  layout?: ProjectLayout;
  class_level?: string;
  subject?: string;
  description?: string;
  content?: string;
  cover_image?: string | null;
  video_url?: string | null;
  video_type?: VideoType;
  link?: string | null;
  published?: boolean;
  featured?: boolean;
  sort_order?: number;
}

export interface ProjectMediaInsert {
  media_type: ProjectMediaType;
  url: string;
  caption?: string;
  sort_order?: number;
}

export interface AchievementInsert {
  title: string;
  event?: string;
  category?: AchievementCategory;
  year?: string;
  description?: string;
  certificate_url?: string | null;
  sort_order?: number;
}
