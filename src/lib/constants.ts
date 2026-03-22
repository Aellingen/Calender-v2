export interface DefaultPillar {
  name: string;
  color: string;
  icon: string;
}

export const DEFAULT_PILLARS: DefaultPillar[] = [
  { name: 'Health', color: '#10B981', icon: 'heart' },
  { name: 'Career', color: '#3B82F6', icon: 'briefcase' },
  { name: 'Knowledge', color: '#7C3AED', icon: 'book' },
  { name: 'Relationships', color: '#F43F5E', icon: 'users' },
  { name: 'Finance', color: '#F59E0B', icon: 'wallet' },
  { name: 'Creative', color: '#06B6D4', icon: 'palette' },
] as const;

export const MIN_PILLARS = 3;
export const MAX_PILLARS = 6;
