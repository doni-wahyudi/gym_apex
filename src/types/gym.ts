export type MembershipStatus = 'active' | 'expiring' | 'expired' | 'frozen';

export interface MembershipPlan {
  id: string;
  name: string;
  type: 'day_pass' | 'monthly' | 'quarterly' | 'annual' | 'punch_card' | 'vip';
  price: number;
  durationDays: number;
  visitLimit?: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  emergencyContact: string;
  emergencyPhone: string;
  joinDate: string;
  tierId: string;
  tierName: string;
  status: MembershipStatus;
  expiryDate: string;
  lastVisitDate?: string;
  totalVisits: number;
  remainingPTSessions: number;
  waiverSigned: boolean;
  notes?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
}

export interface CheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  tierName: string;
  timestamp: string;
  type: 'entry' | 'exit';
  status: 'granted' | 'denied' | 'flagged';
  denialReason?: string;
}

export type ProductCategory = 
  | 'membership' 
  | 'beverage' 
  | 'supplement' 
  | 'merchandise' 
  | 'pt_package' 
  | 'snack';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  isTaxable: boolean;
  planId?: string; // If product is a membership
}

export type PaymentMethod = 'cash' | 'card' | 'qris' | 'member_wallet';

export interface SaleItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerName: string;
  memberId?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  cashierName: string;
  timestamp: string;
  status: 'completed' | 'refunded';
}

export interface CashShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface GymClass {
  id: string;
  title: string;
  instructorName: string;
  instructorAvatar: string;
  category: 'crossfit' | 'hiit' | 'yoga' | 'spin' | 'boxing' | 'pilates';
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  startTime: string; // "07:00"
  endTime: string;   // "08:00"
  maxCapacity: number;
  enrolledMemberIds: string[];
  locationRoom: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Extreme';
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  activeClientsCount: number;
  hourlyRate: number;
  commissionRatePercent: number;
  availableHours: string;
}

export interface PTSession {
  id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  memberName: string;
  date: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface BodyMetric {
  id: string;
  memberId: string;
  recordedAt: string;
  weightKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armCm?: number;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  memberId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  achievedAt: string;
  previousRecordKg?: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12"
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  memberId: string;
  title: string;
  splitType: 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Upper' | 'Lower';
  exercises: WorkoutExercise[];
  updatedAt: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Cardio' | 'Strength Machines' | 'Free Weights' | 'Facility & Saunas';
  serialNumber: string;
  locationFloor: string;
  purchaseDate: string;
  condition: 'operational' | 'maintenance_due' | 'out_of_order';
  lastServiceDate: string;
  nextServiceDueDate: string;
  notes?: string;
}

export interface GymStats {
  occupancyCount: number;
  maxCapacity: number;
  todayRevenue: number;
  todayCheckIns: number;
  activeMembersCount: number;
  expiringThisWeekCount: number;
  atRiskMembersCount: number;
}

export type UserRole = 'owner' | 'front_desk' | 'trainer' | 'member';

export interface StaffShift {
  id: string;
  staffName: string;
  role: 'front_desk' | 'trainer' | 'manager';
  clockInTime: string;
  clockOutTime?: string;
  hoursLogged?: number;
  notes?: string;
}

