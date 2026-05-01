export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type MemberRole = 'owner' | 'manager' | 'staff';

export interface RestaurantMember {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface RestaurantFormData {
  name: string;
}

export interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  members: RestaurantMember[];
  currentRole: MemberRole | null;
  rolesMap: Record<string, MemberRole>;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: RestaurantFormData) => Promise<Restaurant | null>;
  select: (restaurant: Restaurant) => void;
  updateRestaurant: (id: string, data: RestaurantFormData) => Promise<void>;
  fetchMembers: () => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<void>;
  reset: () => void;
}
