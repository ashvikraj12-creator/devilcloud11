export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  isSuspended?: boolean;
  balance?: number;
  mustChangePassword?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  category?: 'minecraft' | 'vps';
  processor?: 'intel' | 'ryzen';
  priceMonth: number;
  price3Months?: number;
  priceAnnually?: number;
  ram: number; // in GB
  cpu: number | string; // cores or percentage
  storage: number; // in GB NVMe
  backups: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface VPSPlan {
  id: string;
  name: string;
  ram: number;
  cpu: number;
  storage: number;
  priceMonth: number;
  processor: 'intel' | 'ryzen';
}

export interface CustomPlanConfig {
  minRam: number;
  maxRam: number;
  ramPricePerGb: number;
  minCpu: number;
  maxCpu: number;
  cpuPricePerCore: number;
  minStorage: number;
  maxStorage: number;
  storagePricePerGb: number;
  minBackups: number;
  maxBackups: number;
  backupPricePerSlot: number;
  basePrice: number;
  supportedSoftware: string[];
  supportedVersions: string[];
  supportedLocations: string[];
}

export interface ServerLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  status: 'active' | 'maintenance' | 'capacity_full';
  latency: string;
  datacenter: string;
  available: boolean;
}

export type ServerStatus =
  | 'provisioning'
  | 'installing'
  | 'configuring'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'restarting'
  | 'suspended'
  | 'terminated'
  | 'online'
  | 'offline';

export interface ServerFile {
  name: string;
  size: number | string;
  isDirectory?: boolean;
  type?: 'file' | 'directory';
  updatedAt?: string;
}

export interface ServerBackup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
}

export interface ServerPlayer {
  name: string;
  ping: number;
  isOp: boolean;
  joinedAt?: string;
}

export interface ServerInstance {
  id: string;
  orderId?: string;
  userId: string;
  name: string;
  planName: string;
  ram: number;
  cpu: number | string;
  storage: number;
  backups: number;
  location: string;
  version: string;
  software: string;
  status: ServerStatus;
  ip: string;
  port: number;
  maxPlayers: number;
  playerCount?: number;
  onlinePlayers?: number;
  tps: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage?: number;
  storageUsage?: number;
  ping?: number;
  uptime: string;
  createdAt: string;
  expiresAt?: string;
  autoRenew?: boolean;
  pterodactylId?: string | null;
  logs?: string[];
  consoleLogs?: string[];
  properties?: any;
  serverProperties?: Record<string, any>;
  files?: ServerFile[];
}

export interface Server extends ServerInstance {}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verification'
  | 'paid'
  | 'provisioning'
  | 'ready'
  | 'suspended'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  mcUsername: string;
  serverName: string;
  planId: string;
  planName: string;
  isCustom: boolean;
  specs: {
    ram: number;
    cpu: number | string;
    storage: number;
    backups: number;
    location: string;
    software: string;
    version: string;
  };
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  basePrice: number;
  couponCode?: string;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: 'upi' | 'stripe' | 'admin_manual';
  utrNumber?: string;
  paymentProofNote?: string;
  createdAt: string;
  paidAt?: string;
  provisionedAt?: string;
  serverId?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percent' | 'flat' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxUses?: number;
  usedCount?: number;
  expiryDate?: string;
  isActive?: boolean;
  perUserLimit?: number;
  description: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  upiId: string;
  utrNumber?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  verifierAdmin?: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  category: 'billing' | 'technical' | 'plugin' | 'general' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  status: 'open' | 'waiting' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: Role | 'system';
  message: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SystemSettings {
  brandName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  upiId: string;
  upiPayeeName: string;
  contactEmail: string;
  supportPhone: string;
  discordUrl: string;
  controlPanelUrl: string;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  emailProviderConfigured: boolean;
  smtpHost?: string;
  smtpUser?: string;
  provisioningApiConfigured: boolean;
  pterodactylUrl?: string;
  pterodactylApiKey?: string;
  pterodactylNodeId?: string;
  stripeConfigured: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  webhookSecret?: string;
  deliveryNotice: string;
}
