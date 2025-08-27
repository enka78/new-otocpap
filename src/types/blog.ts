export interface Blog {
  id: number;
  title: string;
  sub_title: string;
  description: string;
  image?: string;
  order: number;
  is_featured: boolean;
  created_add: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}
