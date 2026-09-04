import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Plan,
  CustomPlanConfig,
  ServerLocation,
  Server,
  Order,
  Coupon,
  Payment,
  SupportTicket,
  Notification,
  AuditLog,
  SystemSettings,
  OrderStatus,
} from '../types.js';

interface DatabaseSchema {
  users: User[];
  userPasswords: Record<string, { hash: string; salt: string }>;
  plans: Plan[];
  customPlanConfig: CustomPlanConfig;
  locations: ServerLocation[];
  servers: Server[];
  orders: Order[];
  coupons: Coupon[];
  couponUsage: Record<string, string[]>; // couponCode -> userIds
  payments: Payment[];
  supportTickets: SupportTicket[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  sessions: Record<string, { userId: string; expiresAt: number; role: 'customer' | 'admin' }>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'devilcloud_db.json');

// Password hashing using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

// Generate unique order ID
export function generateOrderId(count: number): string {
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(6, '0');
  return `MC-${year}-${seq}`;
}

// Initial Database Seeder
function getInitialData(): DatabaseSchema {
  // Admin user
  const adminId = 'usr_admin_001';
  const adminPasswordHash = hashPassword('ataw1717');

  const adminUser: User = {
    id: adminId,
    name: 'Ashvik Raj (Root Admin)',
    email: 'ashvikraj12@gmail.com',
    username: 'ashvik_admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
  };

  // Default Hosting Plans: AMD Ryzen 9 9950X, Intel Xeon Platinum, and Intel VPS
  const plans: Plan[] = [
    // --- AMD Ryzen 9 9950X (High Performance) ---
    {
      id: 'ryzen_dirt',
      name: 'Dirt',
      tagline: 'Ideal for vanilla co-op & small friend groups',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 60,
      price3Months: 162,
      priceAnnually: 576,
      ram: 2,
      cpu: '100%',
      storage: 6,
      backups: 1,
      features: ['2 GB DDR5 RAM', '100% AMD Ryzen 9 9950X', '6 GB NVMe SSD', '1 Auto Backup Slot', 'DDoS Protection', 'Java & Bedrock Support'],
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ryzen_standard',
      name: 'Standard',
      tagline: 'Standard survival SMP with friends',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 110,
      price3Months: 297,
      priceAnnually: 1056,
      ram: 4,
      cpu: '100%',
      storage: 10,
      backups: 2,
      features: ['4 GB DDR5 RAM', '100% AMD Ryzen 9 9950X', '10 GB NVMe SSD', '2 Auto Backup Slots', 'Sub-30ms India Node', 'Java & Bedrock Support'],
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'ryzen_sugarcane',
      name: 'Sugarcane',
      tagline: 'Best value for plugin-heavy survival servers',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 200,
      price3Months: 540,
      priceAnnually: 1920,
      ram: 8,
      cpu: '200%',
      storage: 20,
      backups: 3,
      isPopular: true,
      features: ['8 GB DDR5 RAM', '200% AMD Ryzen 9 9950X', '20 GB NVMe SSD', '3 Auto Backup Slots', 'Ultra-Low Ping India & Singapore', 'Standard Support'],
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'ryzen_hammer',
      name: 'Hammer',
      tagline: 'Heavy modding, Forge/Fabric & mini-games',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 300,
      price3Months: 810,
      priceAnnually: 2880,
      ram: 12,
      cpu: '250%',
      storage: 30,
      backups: 4,
      features: ['12 GB DDR5 RAM', '250% AMD Ryzen 9 9950X', '30 GB NVMe SSD', '4 Auto Backup Slots', 'All Minecraft Modpacks', 'Priority Support'],
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'ryzen_store',
      name: 'Store',
      tagline: 'Community SMP & large economy realms',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 400,
      price3Months: 1080,
      priceAnnually: 3840,
      ram: 16,
      cpu: '300%',
      storage: 40,
      backups: 5,
      features: ['16 GB DDR5 RAM', '300% AMD Ryzen 9 9950X', '40 GB NVMe SSD', '5 Auto Backup Slots', 'Dedicated Subdomain', 'Priority Support'],
      isActive: true,
      sortOrder: 5,
    },
    {
      id: 'ryzen_knight',
      name: 'Knight',
      tagline: 'High player cap community & faction servers',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 550,
      price3Months: 1485,
      priceAnnually: 5280,
      ram: 24,
      cpu: '400%',
      storage: 45,
      backups: 6,
      features: ['24 GB DDR5 RAM', '400% AMD Ryzen 9 9950X', '45 GB NVMe SSD', '6 Auto Backup Slots', 'High Tickrate Guarantee', '24/7 Dedicated Support'],
      isActive: true,
      sortOrder: 6,
    },
    {
      id: 'ryzen_paper',
      name: 'Paper',
      tagline: 'High tick-rate network proxy & mini-game hub',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 700,
      price3Months: 1890,
      priceAnnually: 6720,
      ram: 32,
      cpu: '500%',
      storage: 50,
      backups: 8,
      features: ['32 GB DDR5 RAM', '500% AMD Ryzen 9 9950X', '50 GB NVMe SSD', '8 Auto Backup Slots', 'BungeeCord / Velocity', 'Dedicated Account Lead'],
      isActive: true,
      sortOrder: 7,
    },
    {
      id: 'ryzen_heart',
      name: 'Heart',
      tagline: 'Ultimate powerhouse for massive Minecraft communities',
      category: 'minecraft',
      processor: 'ryzen',
      priceMonth: 900,
      price3Months: 2430,
      priceAnnually: 8640,
      ram: 48,
      cpu: '600%',
      storage: 60,
      backups: 10,
      features: ['48 GB DDR5 RAM', '600% AMD Ryzen 9 9950X', '60 GB NVMe SSD', '10 Daily Backups', 'VIP Dedicated Node Allocation', 'Instant Fast-Track Support'],
      isActive: true,
      sortOrder: 8,
    },

    // --- Intel Xeon Platinum (Value & Reliability) ---
    {
      id: 'intel_dirt',
      name: 'Dirt',
      tagline: 'Lightweight vanilla server at lowest price',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 25,
      price3Months: 68,
      priceAnnually: 240,
      ram: 2,
      cpu: '100%',
      storage: 6,
      backups: 1,
      features: ['2 GB DDR4 RAM', '100% Intel Xeon Platinum', '6 GB NVMe SSD', '1 Auto Backup Slot', 'Standard DDoS Mitigation', 'Basic Support'],
      isActive: true,
      sortOrder: 9,
    },
    {
      id: 'intel_standard',
      name: 'Standard',
      tagline: 'Affordable vanilla SMP for small friend groups',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 60,
      price3Months: 162,
      priceAnnually: 576,
      ram: 4,
      cpu: '100%',
      storage: 10,
      backups: 2,
      features: ['4 GB DDR4 RAM', '100% Intel Xeon Platinum', '10 GB NVMe SSD', '2 Auto Backup Slots', 'Sub-30ms India Latency', 'Java & Bedrock Support'],
      isActive: true,
      sortOrder: 10,
    },
    {
      id: 'intel_sugarcane',
      name: 'Sugarcane',
      tagline: 'Best value for plugin-enabled survival SMP',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 110,
      price3Months: 297,
      priceAnnually: 1056,
      ram: 8,
      cpu: '200%',
      storage: 20,
      backups: 3,
      isPopular: true,
      features: ['8 GB DDR4 RAM', '200% Intel Xeon Platinum', '20 GB NVMe SSD', '3 Auto Backup Slots', 'Optimized Delhi/Mumbai Route', 'PaperMC / Purpur'],
      isActive: true,
      sortOrder: 11,
    },
    {
      id: 'intel_hammer',
      name: 'Hammer',
      tagline: 'Modded survival & light modpacks',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 135,
      price3Months: 365,
      priceAnnually: 1296,
      ram: 12,
      cpu: '250%',
      storage: 30,
      backups: 4,
      features: ['12 GB DDR4 RAM', '250% Intel Xeon Platinum', '30 GB NVMe SSD', '4 Auto Backup Slots', 'All Minecraft Modpacks', 'Standard Support'],
      isActive: true,
      sortOrder: 12,
    },
    {
      id: 'intel_store',
      name: 'Store',
      tagline: 'Multi-world SMP with Towny & economy plugins',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 180,
      price3Months: 486,
      priceAnnually: 1728,
      ram: 16,
      cpu: '300%',
      storage: 40,
      backups: 5,
      features: ['16 GB DDR4 RAM', '300% Intel Xeon Platinum', '40 GB NVMe SSD', '5 Auto Backup Slots', 'Free Subdomain', 'Priority Support'],
      isActive: true,
      sortOrder: 13,
    },
    {
      id: 'intel_knight',
      name: 'Knight',
      tagline: 'High player cap community server',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 260,
      price3Months: 702,
      priceAnnually: 2496,
      ram: 24,
      cpu: '400%',
      storage: 45,
      backups: 6,
      features: ['24 GB DDR4 RAM', '400% Intel Xeon Platinum', '45 GB NVMe SSD', '6 Auto Backup Slots', 'DDoS Mitigation (12Tbps)', 'Fast-Track Support'],
      isActive: true,
      sortOrder: 14,
    },
    {
      id: 'intel_paper',
      name: 'Paper',
      tagline: 'Public network hub & proxy server',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 360,
      price3Months: 972,
      priceAnnually: 3456,
      ram: 32,
      cpu: '500%',
      storage: 50,
      backups: 8,
      features: ['32 GB DDR4 RAM', '500% Intel Xeon Platinum', '50 GB NVMe SSD', '8 Auto Backup Slots', 'BungeeCord / Velocity', 'Dedicated Account Lead'],
      isActive: true,
      sortOrder: 15,
    },
    {
      id: 'intel_heart',
      name: 'Heart',
      tagline: 'Enterprise scale Minecraft cluster',
      category: 'minecraft',
      processor: 'intel',
      priceMonth: 500,
      price3Months: 1350,
      priceAnnually: 4800,
      ram: 48,
      cpu: '600%',
      storage: 60,
      backups: 10,
      features: ['48 GB DDR4 RAM', '600% Intel Xeon Platinum', '60 GB NVMe SSD', '10 Daily Backups', 'VIP Dedicated Node Allocation', 'Instant Fast-Track Support'],
      isActive: true,
      sortOrder: 16,
    },

    // --- Intel Platinum 8269-CY VPS Plans (Monthly Only) ---
    {
      id: 'vps_intel_basic4',
      name: 'Basic - 4',
      tagline: 'Intel Platinum 8269-CY VPS • Monthly',
      category: 'vps',
      processor: 'intel',
      priceMonth: 200,
      ram: 4,
      cpu: '1 vCore',
      storage: 40,
      backups: 1,
      features: ['4GB DDR4 RAM', '1 vCore Intel Platinum 8269-CY', '40GB NVMe SSD', 'Dedicated IPv4 Address', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 17,
    },
    {
      id: 'vps_intel_devil8',
      name: 'Devil - 8',
      tagline: 'Intel Platinum 8269-CY VPS • Monthly',
      category: 'vps',
      processor: 'intel',
      priceMonth: 300,
      ram: 8,
      cpu: '2 vCores',
      storage: 60,
      backups: 2,
      isPopular: true,
      features: ['8GB DDR4 RAM', '2 vCores Intel Platinum 8269-CY', '60GB NVMe SSD', 'Dedicated IPv4 Address', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 18,
    },
    {
      id: 'vps_intel_titan16',
      name: 'Titan - 16',
      tagline: 'Intel Platinum 8269-CY VPS • Monthly',
      category: 'vps',
      processor: 'intel',
      priceMonth: 500,
      ram: 16,
      cpu: '4 vCores',
      storage: 60,
      backups: 3,
      features: ['16GB DDR4 RAM', '4 vCores Intel Platinum 8269-CY', '60GB NVMe SSD', 'Dedicated IPv4 Address', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 19,
    },

    // --- AMD Ryzen 9 9950X VPS Plans (Monthly Only) ---
    {
      id: 'vps_ryzen_basic4',
      name: 'Ryzen Basic - 4',
      tagline: 'AMD Ryzen 9 9950X High-Freq VPS • Monthly',
      category: 'vps',
      processor: 'ryzen',
      priceMonth: 280,
      ram: 4,
      cpu: '1 vCore (5.7GHz)',
      storage: 40,
      backups: 1,
      features: ['4GB DDR5 5600MHz RAM', '1 vCore AMD Ryzen 9 9950X (5.7GHz)', '40GB Gen4 NVMe SSD', 'Dedicated IPv4 + IPv6', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 20,
    },
    {
      id: 'vps_ryzen_devil8',
      name: 'Ryzen Devil - 8',
      tagline: 'AMD Ryzen 9 9950X High-Freq VPS • Monthly',
      category: 'vps',
      processor: 'ryzen',
      priceMonth: 420,
      ram: 8,
      cpu: '2 vCores (5.7GHz)',
      storage: 60,
      backups: 2,
      isPopular: true,
      features: ['8GB DDR5 5600MHz RAM', '2 vCores AMD Ryzen 9 9950X (5.7GHz)', '60GB Gen4 NVMe SSD', 'Dedicated IPv4 + IPv6', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 21,
    },
    {
      id: 'vps_ryzen_titan16',
      name: 'Ryzen Titan - 16',
      tagline: 'AMD Ryzen 9 9950X High-Freq VPS • Monthly',
      category: 'vps',
      processor: 'ryzen',
      priceMonth: 750,
      ram: 16,
      cpu: '4 vCores (5.7GHz)',
      storage: 100,
      backups: 3,
      features: ['16GB DDR5 5600MHz RAM', '4 vCores AMD Ryzen 9 9950X (5.7GHz)', '100GB Gen4 NVMe SSD', 'Dedicated IPv4 + IPv6', 'Full Root / SSH Access', '1 Gbps Unmetered Port'],
      isActive: true,
      sortOrder: 22,
    },
  ];

  const customPlanConfig: CustomPlanConfig = {
    minRam: 2,
    maxRam: 32,
    ramPricePerGb: 40,
    minCpu: 1,
    maxCpu: 16,
    cpuPricePerCore: 35,
    minStorage: 10,
    maxStorage: 500,
    storagePricePerGb: 1.5,
    minBackups: 0,
    maxBackups: 30,
    backupPricePerSlot: 10,
    basePrice: 49,
    supportedSoftware: ['Paper 1.21', 'Purpur 1.21', 'Spigot 1.21', 'Vanilla 1.21', 'Fabric 1.21', 'Forge 1.20.1', 'Bedrock Dedicated'],
    supportedVersions: ['1.21.4 (Latest)', '1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.9'],
    supportedLocations: ['loc_in_mum', 'loc_in_del', 'loc_sg_sin', 'loc_eu_fra', 'loc_us_east'],
  };

  const locations: ServerLocation[] = [
    {
      id: 'loc_in_mum',
      name: 'India Central',
      city: 'Mumbai',
      country: 'India',
      flag: '🇮🇳',
      status: 'active',
      latency: '12ms',
      datacenter: 'Equinix MB1 Tier-4',
      available: true,
    },
    {
      id: 'loc_in_del',
      name: 'India North',
      city: 'Delhi NCR',
      country: 'India',
      flag: '🇮🇳',
      status: 'active',
      latency: '16ms',
      datacenter: 'CtrlS Noida DC Tier-4',
      available: true,
    },
    {
      id: 'loc_sg_sin',
      name: 'Southeast Asia',
      city: 'Singapore',
      country: 'Singapore',
      flag: '🇸🇬',
      status: 'active',
      latency: '24ms',
      datacenter: 'Singtel SGCS2 Tier-3+',
      available: true,
    },
    {
      id: 'loc_eu_fra',
      name: 'Europe West',
      city: 'Frankfurt',
      country: 'Germany',
      flag: '🇩🇪',
      status: 'active',
      latency: '71ms',
      datacenter: 'Interxion FRA14',
      available: true,
    },
    {
      id: 'loc_us_east',
      name: 'US East Coast',
      city: 'Ashburn, VA',
      country: 'United States',
      flag: '🇺🇸',
      status: 'active',
      latency: '76ms',
      datacenter: 'Coresite VA2 Tier-4',
      available: true,
    },
  ];

  const coupons: Coupon[] = [
    {
      id: 'cpn_welcome10',
      code: 'WELCOME10',
      discountType: 'percent',
      discountValue: 10,
      minOrder: 50,
      maxUses: 1000,
      usedCount: 14,
      expiryDate: '2027-12-31',
      isActive: true,
      perUserLimit: 1,
      description: '10% Discount for new server owners',
    },
    {
      id: 'cpn_minecraft20',
      code: 'MINECRAFT20',
      discountType: 'percent',
      discountValue: 20,
      minOrder: 100,
      maxUses: 500,
      usedCount: 28,
      expiryDate: '2027-12-31',
      isActive: true,
      perUserLimit: 1,
      description: '20% Off on high performance servers',
    },
    {
      id: 'cpn_host50',
      code: 'HOST50',
      discountType: 'fixed',
      discountValue: 50,
      minOrder: 150,
      maxUses: 300,
      usedCount: 42,
      expiryDate: '2027-12-31',
      isActive: true,
      perUserLimit: 1,
      description: 'Flat ₹50 discount on qualified tiers',
    },
  ];

  const settings: SystemSettings = {
    brandName: 'DEVILCLOUD',
    tagline: 'High-Performance Game Server Infrastructure',
    currency: 'INR',
    currencySymbol: '₹',
    upiId: 'ashvikraj@fam',
    upiPayeeName: 'Ashvik Raj (DevilCloud Hosting)',
    contactEmail: 'support@devilcloud.fun',
    supportPhone: '+91 98765 43210',
    discordUrl: 'https://discord.gg/EUnQbdx9E8',
    controlPanelUrl: 'https://panel.devilcloud.fun',
    allowRegistrations: true,
    maintenanceMode: false,
    emailProviderConfigured: false,
    provisioningApiConfigured: false,
    stripeConfigured: false,
    deliveryNotice:
      'Server delivery can take between 1 minute and 1 hour after payment verification. Please do not worry if your server is not available immediately.',
  };

  return {
    users: [adminUser],
    userPasswords: {
      [adminId]: adminPasswordHash,
    },
    plans,
    customPlanConfig,
    locations,
    servers: [],
    orders: [],
    coupons,
    couponUsage: {},
    payments: [],
    supportTickets: [],
    notifications: [],
    auditLogs: [
      {
        id: 'log_init',
        adminEmail: 'system@devilcloud.fun',
        action: 'SYSTEM_BOOTSTRAP',
        details: 'Initial database schema generated with default plans, coupons, and nodes for DevilCloud',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      },
    ],
    settings,
    sessions: {},
  };
}

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with initial data to ensure all keys exist
        const initial = getInitialData();
        const hasNewPlans = parsed.plans && parsed.plans.length > 5 && parsed.plans.some((p: any) => p.id === 'ryzen_dirt');
        let currentPlans: Plan[] = hasNewPlans ? [...parsed.plans] : [...initial.plans];
        for (const initPlan of initial.plans) {
          if (!currentPlans.some((p) => p.id === initPlan.id)) {
            currentPlans.push(initPlan);
          }
        }
        this.data = {
          ...initial,
          ...parsed,
          plans: currentPlans,
          locations: initial.locations,
          settings: { ...initial.settings, ...(parsed.settings || {}) },
          customPlanConfig: { ...initial.customPlanConfig, ...(parsed.customPlanConfig || {}) },
        };
        // Ensure default URLs are set if empty or outdated
        if (!this.data.settings.discordUrl || this.data.settings.discordUrl.includes('discord.gg/devilcloud')) {
          this.data.settings.discordUrl = 'https://discord.gg/EUnQbdx9E8';
        }
        if (!this.data.settings.controlPanelUrl) {
          this.data.settings.controlPanelUrl = 'https://panel.devilcloud.fun';
        }
        this.saveSync();
      } catch (err) {
        console.error('Failed to parse database file, re-initializing:', err);
        this.data = getInitialData();
        this.saveSync();
      }
    } else {
      this.data = getInitialData();
      this.saveSync();
    }
  }

  public saveSync(): void {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSync();
      this.saveTimeout = null;
    }, 100);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Sessions
  public createSession(userId: string, role: 'customer' | 'admin'): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.data.sessions[token] = { userId, expiresAt, role };
    this.save();
    return token;
  }

  public getSession(token: string): { user: User; role: 'customer' | 'admin' } | null {
    if (!token) return null;
    const session = this.data.sessions[token];
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      delete this.data.sessions[token];
      this.save();
      return null;
    }
    const user = this.data.users.find((u) => u.id === session.userId);
    if (!user || user.isSuspended) return null;
    return { user, role: session.role };
  }

  public deleteSession(token: string): void {
    delete this.data.sessions[token];
    this.save();
  }

  // Audit Logs
  public logAudit(adminEmail: string, action: string, details: string, ipAddress = '0.0.0.0'): void {
    this.data.auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      adminEmail,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
    });
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // Notification helper
  public sendNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string): void {
    this.data.notifications.unshift({
      id: `ntf_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }
}

export const db = new Database();
