import type { 
  Member, 
  MembershipPlan, 
  Product, 
  CheckInRecord, 
  GymClass, 
  Trainer, 
  BodyMetric, 
  PersonalRecord, 
  WorkoutRoutine, 
  EquipmentItem, 
  CashShift, 
  Sale, 
  GymStats,
  SaleItem,
  PaymentMethod
} from '../types/gym';
import { 
  INITIAL_PLANS, 
  INITIAL_MEMBERS, 
  INITIAL_PRODUCTS, 
  INITIAL_CHECKINS, 
  INITIAL_TRAINERS, 
  INITIAL_CLASSES, 
  INITIAL_EQUIPMENT, 
  INITIAL_PRS, 
  INITIAL_BODY_METRICS, 
  INITIAL_ROUTINES, 
  INITIAL_SALES, 
  INITIAL_SHIFT 
} from './mockData';
import { getSupabase } from './supabaseClient';

const STORAGE_KEY = 'apexforge_gym_data_v1';

interface StoreData {
  members: Member[];
  plans: MembershipPlan[];
  products: Product[];
  checkIns: CheckInRecord[];
  trainers: Trainer[];
  classes: GymClass[];
  equipment: EquipmentItem[];
  prs: PersonalRecord[];
  metrics: BodyMetric[];
  routines: WorkoutRoutine[];
  sales: Sale[];
  shift: CashShift;
}

class GymStore {
  private data: StoreData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): StoreData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse local storage gym data:', err);
      }
    }
    return {
      members: INITIAL_MEMBERS,
      plans: INITIAL_PLANS,
      products: INITIAL_PRODUCTS,
      checkIns: INITIAL_CHECKINS,
      trainers: INITIAL_TRAINERS,
      classes: INITIAL_CLASSES,
      equipment: INITIAL_EQUIPMENT,
      prs: INITIAL_PRS,
      metrics: INITIAL_BODY_METRICS,
      routines: INITIAL_ROUTINES,
      sales: INITIAL_SALES,
      shift: INITIAL_SHIFT,
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('Failed to persist gym data:', err);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Members ---
  public getMembers(): Member[] {
    return this.data.members;
  }

  public getMemberById(id: string): Member | undefined {
    return this.data.members.find((m) => m.id === id);
  }

  public getMemberByCode(code: string): Member | undefined {
    return this.data.members.find((m) => m.memberCode.toLowerCase() === code.trim().toLowerCase());
  }

  public addMember(memberData: Omit<Member, 'id' | 'memberCode' | 'totalVisits' | 'remainingPTSessions'>): Member {
    const nextNum = 1000 + this.data.members.length + 1;
    const newMember: Member = {
      ...memberData,
      id: 'mem-' + Date.now(),
      memberCode: `AF-${nextNum}`,
      totalVisits: 0,
      remainingPTSessions: 0,
    };
    this.data.members = [newMember, ...this.data.members];
    this.persist();

    // Async sync to Supabase if connected
    const sb = getSupabase();
    if (sb) {
      sb.from('members').insert({
        member_code: newMember.memberCode,
        full_name: newMember.fullName,
        email: newMember.email,
        phone: newMember.phone,
        avatar_url: newMember.avatarUrl,
        emergency_contact: newMember.emergencyContact,
        emergency_phone: newMember.emergencyPhone,
        gender: newMember.gender,
        status: newMember.status,
        expiry_date: newMember.expiryDate,
        waiver_signed: newMember.waiverSigned,
        notes: newMember.notes,
      }).then();
    }

    return newMember;
  }

  public updateMember(updated: Member): void {
    this.data.members = this.data.members.map((m) => (m.id === updated.id ? updated : m));
    this.persist();
  }

  public renewMembership(memberId: string, planId: string): void {
    const plan = this.data.plans.find((p) => p.id === planId);
    if (!plan) return;

    const now = new Date();
    const expiry = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    this.data.members = this.data.members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          tierId: plan.id,
          tierName: plan.name,
          status: 'active',
          expiryDate: expiry.toISOString().split('T')[0],
        };
      }
      return m;
    });
    this.persist();
  }

  // --- Check-Ins & Access Control ---
  public getCheckIns(): CheckInRecord[] {
    return this.data.checkIns;
  }

  public getOccupancy(): { currentCount: number; maxCapacity: number; activeAttendees: Member[] } {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Member is inside if their last checkin today is an 'entry' and granted
    const insideMemberIds = new Set<string>();
    
    // Sort chronological
    const sorted = [...this.data.checkIns].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const record of sorted) {
      if (record.timestamp.startsWith(todayStr)) {
        if (record.status === 'granted') {
          if (record.type === 'entry') {
            insideMemberIds.add(record.memberId);
          } else if (record.type === 'exit') {
            insideMemberIds.delete(record.memberId);
          }
        }
      }
    }

    const activeAttendees = this.data.members.filter((m) => insideMemberIds.has(m.id));
    return {
      currentCount: activeAttendees.length,
      maxCapacity: 60,
      activeAttendees,
    };
  }

  public checkInMember(memberId: string, type: 'entry' | 'exit' = 'entry'): CheckInRecord {
    const member = this.getMemberById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const now = new Date().toISOString();
    let status: 'granted' | 'denied' | 'flagged' = 'granted';
    let denialReason: string | undefined = undefined;

    // Check expiry
    const expiryDate = new Date(member.expiryDate);
    if (new Date() > expiryDate && type === 'entry') {
      status = 'denied';
      denialReason = `Membership expired on ${member.expiryDate}. Please renew to enter.`;
    } else if (member.status === 'frozen') {
      status = 'denied';
      denialReason = 'Membership is currently frozen. Please contact front desk.';
    }

    const record: CheckInRecord = {
      id: 'chk-' + Date.now(),
      memberId: member.id,
      memberName: member.fullName,
      memberAvatar: member.avatarUrl,
      tierName: member.tierName,
      timestamp: now,
      type,
      status,
      denialReason,
    };

    this.data.checkIns = [record, ...this.data.checkIns];

    if (status === 'granted') {
      this.data.members = this.data.members.map((m) => {
        if (m.id === member.id) {
          return {
            ...m,
            lastVisitDate: now,
            totalVisits: type === 'entry' ? m.totalVisits + 1 : m.totalVisits,
          };
        }
        return m;
      });
    }

    this.persist();
    return record;
  }

  public checkOutMember(memberId: string): CheckInRecord {
    return this.checkInMember(memberId, 'exit');
  }

  // --- Plans ---
  public getPlans(): MembershipPlan[] {
    return this.data.plans;
  }

  // --- Products & Inventory ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public addProduct(product: Omit<Product, 'id'>): Product {
    const newProd: Product = {
      ...product,
      id: 'prod-' + Date.now(),
    };
    this.data.products = [newProd, ...this.data.products];
    this.persist();
    return newProd;
  }

  public updateProductStock(productId: string, delta: number): void {
    this.data.products = this.data.products.map((p) => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    this.persist();
  }

  // --- Sales & POS ---
  public getSales(): Sale[] {
    return this.data.sales;
  }

  public processSale(saleData: {
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
  }): Sale {
    const nextInvoice = `INV-${new Date().getFullYear()}-${String(this.data.sales.length + 41).padStart(4, '0')}`;
    
    const sale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNo: nextInvoice,
      customerName: saleData.customerName,
      memberId: saleData.memberId,
      items: saleData.items,
      subtotal: saleData.subtotal,
      tax: saleData.tax,
      discount: saleData.discount,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod,
      cashReceived: saleData.cashReceived,
      changeGiven: saleData.changeGiven,
      cashierName: saleData.cashierName,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    // Decrement stock for retail items
    for (const item of sale.items) {
      this.updateProductStock(item.productId, -item.quantity);
      
      // If item is a membership or renewal, renew member
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod?.planId && sale.memberId) {
        this.renewMembership(sale.memberId, prod.planId);
      }
    }

    // If payment was cash, update shift expected cash
    if (sale.paymentMethod === 'cash') {
      this.data.shift.expectedCash = +(this.data.shift.expectedCash + sale.total).toFixed(2);
    }

    this.data.sales = [sale, ...this.data.sales];
    this.persist();
    return sale;
  }

  // --- Cash Shift ---
  public getShift(): CashShift {
    return this.data.shift;
  }

  public openShift(openingFloat: number, cashierName: string): void {
    this.data.shift = {
      id: 'shift-' + Date.now(),
      cashierName,
      startTime: new Date().toISOString(),
      openingFloat,
      expectedCash: openingFloat,
      status: 'open',
      notes: 'Shift opened.',
    };
    this.persist();
  }

  public closeShift(actualCash: number, notes?: string): CashShift {
    const diff = +(actualCash - this.data.shift.expectedCash).toFixed(2);
    this.data.shift = {
      ...this.data.shift,
      endTime: new Date().toISOString(),
      actualCash,
      cashDifference: diff,
      status: 'closed',
      notes: notes || this.data.shift.notes,
    };
    this.persist();
    return this.data.shift;
  }

  // --- Classes ---
  public getClasses(): GymClass[] {
    return this.data.classes;
  }

  public bookClass(classId: string, memberId: string): boolean {
    const gymClass = this.data.classes.find((c) => c.id === classId);
    if (!gymClass) return false;
    if (gymClass.enrolledMemberIds.includes(memberId)) return true;
    if (gymClass.enrolledMemberIds.length >= gymClass.maxCapacity) return false;

    this.data.classes = this.data.classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          enrolledMemberIds: [...c.enrolledMemberIds, memberId],
        };
      }
      return c;
    });
    this.persist();
    return true;
  }

  public cancelClassBooking(classId: string, memberId: string): void {
    this.data.classes = this.data.classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          enrolledMemberIds: c.enrolledMemberIds.filter((id) => id !== memberId),
        };
      }
      return c;
    });
    this.persist();
  }

  // --- Trainers & PT ---
  public getTrainers(): Trainer[] {
    return this.data.trainers;
  }

  // --- Fitness Metrics & PRs ---
  public getMetrics(memberId?: string): BodyMetric[] {
    if (!memberId) return this.data.metrics;
    return this.data.metrics
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }

  public addMetric(metric: Omit<BodyMetric, 'id'>): BodyMetric {
    const newMetric: BodyMetric = {
      ...metric,
      id: 'bm-' + Date.now(),
    };
    this.data.metrics = [...this.data.metrics, newMetric];
    this.persist();
    return newMetric;
  }

  public getPRs(memberId?: string): PersonalRecord[] {
    if (!memberId) return this.data.prs;
    return this.data.prs.filter((pr) => pr.memberId === memberId);
  }

  public addPR(pr: Omit<PersonalRecord, 'id'>): PersonalRecord {
    const newPr: PersonalRecord = {
      ...pr,
      id: 'pr-' + Date.now(),
    };
    this.data.prs = [newPr, ...this.data.prs];
    this.persist();
    return newPr;
  }

  public getRoutines(memberId?: string): WorkoutRoutine[] {
    if (!memberId) return this.data.routines;
    return this.data.routines.filter((r) => r.memberId === memberId);
  }

  public saveRoutine(routine: WorkoutRoutine): void {
    const exists = this.data.routines.some((r) => r.id === routine.id);
    if (exists) {
      this.data.routines = this.data.routines.map((r) => (r.id === routine.id ? routine : r));
    } else {
      this.data.routines = [routine, ...this.data.routines];
    }
    this.persist();
  }

  // --- Equipment ---
  public getEquipment(): EquipmentItem[] {
    return this.data.equipment;
  }

  public updateEquipmentCondition(id: string, condition: 'operational' | 'maintenance_due' | 'out_of_order', notes?: string): void {
    this.data.equipment = this.data.equipment.map((eq) => {
      if (eq.id === id) {
        return {
          ...eq,
          condition,
          notes: notes !== undefined ? notes : eq.notes,
          lastServiceDate: condition === 'operational' ? new Date().toISOString().split('T')[0] : eq.lastServiceDate,
        };
      }
      return eq;
    });
    this.persist();
  }

  // --- Global Stats ---
  public getStats(): GymStats {
    const occupancy = this.getOccupancy();
    const todayStr = new Date().toISOString().split('T')[0];

    const todaySales = this.data.sales.filter((s) => s.timestamp.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    const todayCheckIns = this.data.checkIns.filter(
      (c) => c.timestamp.startsWith(todayStr) && c.type === 'entry' && c.status === 'granted'
    ).length;

    const activeMembersCount = this.data.members.filter((m) => m.status === 'active').length;

    // Expiring within 7 days
    const nowMs = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiringThisWeekCount = this.data.members.filter((m) => {
      if (m.status !== 'active' && m.status !== 'expiring') return false;
      const expMs = new Date(m.expiryDate).getTime();
      return expMs >= nowMs && expMs <= nowMs + sevenDaysMs;
    }).length;

    // At risk: active members who have not visited in > 14 days
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const atRiskMembersCount = this.data.members.filter((m) => {
      if (m.status !== 'active') return false;
      if (!m.lastVisitDate) return true;
      const lastVisitMs = new Date(m.lastVisitDate).getTime();
      return nowMs - lastVisitMs > fourteenDaysMs;
    }).length;

    return {
      occupancyCount: occupancy.currentCount,
      maxCapacity: occupancy.maxCapacity,
      todayRevenue: +todayRevenue.toFixed(2),
      todayCheckIns,
      activeMembersCount,
      expiringThisWeekCount,
      atRiskMembersCount,
    };
  }

  // --- Utility & Backup ---
  public exportDataJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public resetToDefaultData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadFromStorage();
    this.notify();
  }
}

export const gymStore = new GymStore();
