import type { Timestamp } from "firebase/firestore";

export interface TemplateItem {
  name: string;
  order: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  items: TemplateItem[];
  createdAt: Timestamp;
}

export interface TemplateCreateInput {
  title: string;
  description?: string;
  category: string;
  items: TemplateItem[];
}

export interface TemplateUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  items?: TemplateItem[];
}







