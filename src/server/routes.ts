import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword, generateOrderId } from './db.js';
import type { User, Plan, Server, Order, SupportTicket, SupportMessage, Coupon, OrderStatus, Payment } from '../types.js';

export const apiRouter = express.Router();

// Helper to extract session user
function getAuth(req: Request): { user: User; role: 'customer' | 'admin' } | null {
  const authHeader = req.headers.authorization;
  const cookieHeader = req.headers.cookie;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieHeader) {
    const match = cookieHeader.match(/devilcloud_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  return db.getSession(token);
}

// Middleware: Require Authenticated User
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth) {
    res.status(401).json({ error: 'Authentication required. Please login.' });
    return;
  }
  (req as any).user = auth.user;
  (req as any).role = auth.role;
  next();
}

// Middleware: Require Admin Role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth || auth.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  (req as any).user = auth.user;
  (req as any).role = auth.role;
  next();
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (/api/auth)
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, username, password, confirmPassword } = req.body;
  const data = db.getData();

  if (!data.settings.allowRegistrations) {
    res.status(403).json({ error: 'Registration is currently disabled by administrator.' });
    return;
  }

  if (!name || !email || !username || !password) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }

  // Check duplicates
  const existingUser = data.users.find(
    (u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername
  );

  if (existingUser) {
    res.status(409).json({ error: 'An account with this email or username already exists.' });
    return;
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    username: cleanUsername,
    role: 'customer',
    createdAt: new Date().toISOString(),
    balance: 0,
  };

  const { hash, salt } = hashPassword(password);
  data.users.push(newUser);
  data.userPasswords[userId] = { hash, salt };

  db.sendNotification(
    userId,
    'Welcome to DEVILCLOUD!',
    'Your game hosting account is ready. Explore our high-performance Minecraft plans or create a custom server configuration.',
    'success',
    '/pricing'
  );

  db.save();

  const token = db.createSession(userId, 'customer');
  res.cookie('devilcloud_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.json({
    success: true,
    token,
    user: newUser,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: 'Email/Username and password are required.' });
    return;
  }

  const data = db.getData();
  const cleanIdent = identifier.trim().toLowerCase();
  const user = data.users.find(
    (u) => u.email.toLowerCase() === cleanIdent || u.username.toLowerCase() === cleanIdent
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    return;
  }

  const passData = data.userPasswords[user.id];
  if (!passData || !verifyPassword(password, passData.hash, passData.salt)) {
    res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    return;
  }

  const token = db.createSession(user.id, user.role);
  res.cookie('devilcloud_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.json({
    success: true,
    token,
    user,
  });
});

apiRouter.post('/auth/admin/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: 'Admin identifier and password required.' });
    return;
  }

  const data = db.getData();
  const cleanIdent = identifier.trim().toLowerCase();
  const user = data.users.find(
    (u) => (u.email.toLowerCase() === cleanIdent || u.username.toLowerCase() === cleanIdent) && u.role === 'admin'
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const passData = data.userPasswords[user.id];
  if (!passData || !verifyPassword(password, passData.hash, passData.salt)) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }

  const token = db.createSession(user.id, 'admin');
  db.logAudit(user.email, 'ADMIN_LOGIN', 'Administrator logged into operations panel', req.ip);

  res.cookie('devilcloud_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.json({
    success: true,
    token,
    user,
  });
});

apiRouter.post('/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Old password and new password are required.' });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New passwords do not match.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const data = db.getData();
  const passData = data.userPasswords[user.id];
  if (!passData || !verifyPassword(oldPassword, passData.hash, passData.salt)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  data.userPasswords[user.id] = { hash, salt };

  // Update user state
  const foundUser = data.users.find((u) => u.id === user.id);
  if (foundUser) {
    foundUser.mustChangePassword = false;
  }

  if (user.role === 'admin') {
    db.logAudit(user.email, 'PASSWORD_CHANGE', 'Admin updated root password', req.ip);
  }

  db.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth) {
    res.json({ authenticated: false, user: null });
    return;
  }
  const data = db.getData();
  const unreadNotifications = data.notifications.filter((n) => n.userId === auth.user.id && !n.read).length;
  res.json({
    authenticated: true,
    user: auth.user,
    role: auth.role,
    unreadNotifications,
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    db.deleteSession(authHeader.substring(7));
  }
  res.clearCookie('devilcloud_session');
  res.json({ success: true });
});

// ==========================================
// 2. PUBLIC & CONFIG ENDPOINTS (/api/public)
// ==========================================

apiRouter.get('/public/plans', (req: Request, res: Response) => {
  const data = db.getData();
  const activePlans = data.plans
    .filter((p) => p.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  res.json({ plans: activePlans });
});

apiRouter.get('/public/custom-plan-config', (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ config: data.customPlanConfig });
});

apiRouter.get('/public/locations', (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ locations: data.locations });
});

apiRouter.get('/public/settings', (req: Request, res: Response) => {
  const data = db.getData();
  const { settings } = data;
  res.json({
    brandName: settings.brandName,
    tagline: settings.tagline,
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    upiId: settings.upiId,
    upiPayeeName: settings.upiPayeeName,
    contactEmail: settings.contactEmail,
    supportPhone: settings.supportPhone,
    discordUrl: settings.discordUrl,
    controlPanelUrl: settings.controlPanelUrl || 'https://panel.devilcloud.fun',
    allowRegistrations: settings.allowRegistrations,
    maintenanceMode: settings.maintenanceMode,
    deliveryNotice: settings.deliveryNotice,
    stripeConfigured: settings.stripeConfigured,
    stripePublishableKey: settings.stripeConfigured ? settings.stripePublishableKey : undefined,
    provisioningApiConfigured: settings.provisioningApiConfigured,
  });
});

apiRouter.post('/public/calculate-price', (req: Request, res: Response) => {
  const { ram, cpu, storage, backups, billingPeriod } = req.body;
  const data = db.getData();
  const cfg = data.customPlanConfig;

  const validRam = Math.max(cfg.minRam, Math.min(cfg.maxRam, Number(ram) || cfg.minRam));
  const validCpu = Math.max(cfg.minCpu, Math.min(cfg.maxCpu, Number(cpu) || cfg.minCpu));
  const validStorage = Math.max(cfg.minStorage, Math.min(cfg.maxStorage, Number(storage) || cfg.minStorage));
  const validBackups = Math.max(cfg.minBackups, Math.min(cfg.maxBackups, Number(backups) || 0));

  let monthly =
    cfg.basePrice +
    validRam * cfg.ramPricePerGb +
    validCpu * cfg.cpuPricePerCore +
    validStorage * cfg.storagePricePerGb +
    validBackups * cfg.backupPricePerSlot;

  // Round up to nearest whole rupee
  monthly = Math.ceil(monthly);

  let multiplier = 1;
  let discountPct = 0;
  if (billingPeriod === 'quarterly') {
    multiplier = 3;
    discountPct = 0.05; // 5% discount
  } else if (billingPeriod === 'annually') {
    multiplier = 12;
    discountPct = 0.15; // 15% discount
  }

  const rawTotal = monthly * multiplier;
  const total = Math.ceil(rawTotal * (1 - discountPct));

  res.json({
    monthlyPrice: monthly,
    period: billingPeriod || 'monthly',
    totalPrice: total,
    discountApplied: discountPct > 0 ? `${discountPct * 100}%` : 'None',
    specs: {
      ram: validRam,
      cpu: validCpu,
      storage: validStorage,
      backups: validBackups,
    },
  });
});

apiRouter.post('/public/validate-coupon', (req: Request, res: Response) => {
  const { code, amount } = req.body;
  if (!code) {
    res.status(400).json({ valid: false, error: 'Coupon code required.' });
    return;
  }

  const data = db.getData();
  const coupon = data.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon || !coupon.isActive) {
    res.status(404).json({ valid: false, error: 'Invalid or expired coupon code.' });
    return;
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    res.status(400).json({ valid: false, error: 'This coupon has expired.' });
    return;
  }

  if (coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ valid: false, error: 'Coupon usage limit reached.' });
    return;
  }

  const orderAmount = Number(amount) || 0;
  if (orderAmount < coupon.minOrder) {
    res.status(400).json({
      valid: false,
      error: `Minimum order amount of ₹${coupon.minOrder} required for this coupon.`,
    });
    return;
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, orderAmount);

  res.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
    discountAmount: discount,
    finalAmount: Math.max(0, orderAmount - discount),
  });
});

apiRouter.get('/public/live-stats', (req: Request, res: Response) => {
  const data = db.getData();
  const totalServers = data.servers.length;
  const onlineServers = data.servers.filter((s) => s.status === 'running' || s.status === 'ready').length;
  const totalPlayers = data.servers.reduce((acc, s) => acc + (s.onlinePlayers || 0), 0);

  res.json({
    totalServers: Math.max(148, totalServers + 148),
    onlineServers: Math.max(136, onlineServers + 136),
    onlinePlayers: Math.max(892, totalPlayers + 892),
    activeNodes: data.locations.length,
    averagePing: '18ms',
    uptimePercentage: '99.98%',
  });
});

// ==========================================
// 3. ORDERS & PAYMENTS (/api/orders)
// ==========================================

apiRouter.post('/orders/create', (req: Request, res: Response) => {
  const auth = getAuth(req);
  const {
    planId,
    isCustom,
    specs,
    billingPeriod,
    serverName,
    mcUsername,
    customerEmail,
    customerName,
    location,
    software,
    version,
    couponCode,
    paymentMethod,
  } = req.body;

  const data = db.getData();

  if (!serverName) {
    res.status(400).json({ error: 'Server Name is required.' });
    return;
  }

  const effectiveEmail = (auth?.user?.email || customerEmail || 'guest@devilcloud.fun').trim();
  const effectiveName = (auth?.user?.name || customerName || 'Valued Customer').trim();
  const effectiveUserId = auth?.user?.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  let basePrice = 0;
  let finalSpecs = {
    ram: 2,
    cpu: '100%' as number | string,
    storage: 10,
    backups: 1,
    location: location || 'loc_in_mum',
    software: software || 'Paper 1.21',
    version: version || '1.21.4 (Latest)',
  };
  let planName = 'Custom Plan';
  let planCategory: 'minecraft' | 'vps' = 'minecraft';
  let planPrice3Months: number | undefined;
  let planPriceAnnually: number | undefined;

  if (!isCustom) {
    const plan = data.plans.find((p) => p.id === planId && p.isActive);
    if (!plan) {
      res.status(400).json({ error: 'Selected plan is not available.' });
      return;
    }
    planName = plan.name;
    basePrice = plan.priceMonth;
    planCategory = plan.category || 'minecraft';
    planPrice3Months = plan.price3Months;
    planPriceAnnually = plan.priceAnnually;

    finalSpecs = {
      ram: plan.ram,
      cpu: plan.cpu,
      storage: plan.storage,
      backups: plan.backups,
      location: location || 'loc_in_mum',
      software: software || (plan.category === 'vps' ? 'Ubuntu 22.04 LTS' : 'Paper 1.21'),
      version: version || (plan.category === 'vps' ? 'Latest' : '1.21.4 (Latest)'),
    };
  } else {
    // Validate Custom Plan specs & calculate price securely
    const cfg = data.customPlanConfig;
    const ram = Math.max(cfg.minRam, Math.min(cfg.maxRam, Number(specs?.ram) || cfg.minRam));
    const cpu = Math.max(cfg.minCpu, Math.min(cfg.maxCpu, Number(specs?.cpu) || cfg.minCpu));
    const storage = Math.max(cfg.minStorage, Math.min(cfg.maxStorage, Number(specs?.storage) || cfg.minStorage));
    const backups = Math.max(cfg.minBackups, Math.min(cfg.maxBackups, Number(specs?.backups) || 0));

    basePrice = Math.ceil(
      cfg.basePrice +
        ram * cfg.ramPricePerGb +
        cpu * cfg.cpuPricePerCore +
        storage * cfg.storagePricePerGb +
        backups * cfg.backupPricePerSlot
    );

    finalSpecs = {
      ram,
      cpu,
      storage,
      backups,
      location: location || 'loc_in_mum',
      software: software || 'Paper 1.21',
      version: version || '1.21.4 (Latest)',
    };
  }

  // Adjust for billing cycle (VPS is strictly monthly)
  let period: 'monthly' | 'quarterly' | 'annually' = 'monthly';
  let subtotal = basePrice;

  if (planCategory === 'vps') {
    period = 'monthly';
    subtotal = basePrice;
  } else {
    period = billingPeriod === 'annually' ? 'annually' : billingPeriod === 'quarterly' ? 'quarterly' : 'monthly';
    if (period === 'quarterly') {
      subtotal = planPrice3Months || Math.round(basePrice * 3 * 0.90);
    } else if (period === 'annually') {
      subtotal = planPriceAnnually || Math.round(basePrice * 12 * 0.80);
    } else {
      subtotal = basePrice;
    }
  }

  let discount = 0;
  let validatedCouponCode: string | undefined = undefined;

  if (couponCode) {
    const coupon = data.coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon && coupon.isActive && new Date(coupon.expiryDate) >= new Date() && coupon.usedCount < coupon.maxUses) {
      if (subtotal >= coupon.minOrder) {
        if (coupon.discountType === 'percent') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        validatedCouponCode = coupon.code;
        coupon.usedCount += 1;
      }
    }
  }

  const finalAmount = Math.max(0, subtotal - discount);
  const orderId = generateOrderId(data.orders.length);

  const newOrder: Order = {
    id: orderId,
    userId: effectiveUserId,
    customerName: effectiveName,
    customerEmail: effectiveEmail,
    mcUsername: (mcUsername || 'Player1').trim(),
    serverName: serverName.trim(),
    planId: isCustom ? 'custom' : planId,
    planName,
    isCustom: !!isCustom,
    specs: finalSpecs,
    billingPeriod: period,
    basePrice: subtotal,
    couponCode: validatedCouponCode,
    discount,
    finalAmount,
    status: 'pending_payment',
    paymentMethod: paymentMethod === 'stripe' ? 'stripe' : 'upi',
    createdAt: new Date().toISOString(),
  };

  data.orders.unshift(newOrder);

  if (auth?.user?.id) {
    db.sendNotification(
      auth.user.id,
      `Order Created: ${orderId}`,
      `Your order for server "${serverName}" is awaiting payment of ₹${finalAmount}. Complete payment to begin provisioning.`,
      'info',
      `/payment/${orderId}`
    );
  }

  db.save();

  res.json({
    success: true,
    order: newOrder,
    paymentUrl: `/payment/${orderId}`,
  });
});

apiRouter.get('/orders/my', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth) {
    res.json({ orders: [] });
    return;
  }
  const data = db.getData();
  const myOrders = data.orders.filter((o) => o.userId === auth.user.id);
  res.json({ orders: myOrders });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  // Generate UPI Intent String
  const upiId = data.settings.upiId || 'ashvikraj@fam';
  const payee = encodeURIComponent(data.settings.upiPayeeName || 'DevilCloud Hosting');
  const amount = order.finalAmount;
  const note = encodeURIComponent(`DevilCloud MC Host Order ${order.id}`);
  const upiIntentUri = `upi://pay?pa=${upiId}&pn=${payee}&am=${amount}&tn=${note}&cu=INR`;

  res.json({
    order,
    upi: {
      upiId,
      payeeName: data.settings.upiPayeeName,
      amount: order.finalAmount,
      currency: 'INR',
      note: `DevilCloud Order ${order.id}`,
      upiIntentUri,
    },
    deliveryNotice: data.settings.deliveryNotice,
  });
});

apiRouter.post(['/orders/:id/submit-utr', '/payments/submit-utr'], (req: Request, res: Response) => {
  const { orderId: bodyOrderId, utrNumber, paymentProofNote } = req.body;
  const orderId = req.params.id || bodyOrderId;

  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required.' });
    return;
  }

  const data = db.getData();
  const order = data.orders.find((o) => o.id === orderId);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if (!utrNumber || utrNumber.trim().length < 6) {
    res.status(400).json({ error: 'Please enter a valid 12-digit UPI Reference / UTR Number from your banking app.' });
    return;
  }

  const cleanUtr = utrNumber.trim();
  order.utrNumber = cleanUtr;
  order.paymentProofNote = paymentProofNote ? String(paymentProofNote).trim() : undefined;
  order.status = 'payment_verification';

  // Create payment record in DB
  const paymentRecord: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    orderId: order.id,
    userId: order.userId,
    amount: order.finalAmount,
    currency: 'INR',
    upiId: data.settings.upiId,
    utrNumber: cleanUtr,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: paymentProofNote,
  };

  data.payments.unshift(paymentRecord);

  if (order.userId && !order.userId.startsWith('guest_')) {
    db.sendNotification(
      order.userId,
      `Payment Submitted for ${order.id}`,
      `UTR ${cleanUtr} received. Our verification team is verifying your payment with the bank. Server provisioning will start automatically.`,
      'info',
      `/payment/${order.id}`
    );
  }

  db.save();

  res.json({
    success: true,
    message: 'Payment reference submitted. Verification in progress.',
    order,
  });
});

// ==========================================
// 4. SERVER MANAGEMENT (/api/servers)
// ==========================================

apiRouter.get('/servers/my', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const myServers = data.servers.filter((s) => s.userId === user.id);
  res.json({ servers: myServers });
});

apiRouter.get('/servers/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const role = (req as any).role as string;
  const data = db.getData();
  const server = data.servers.find((s) => s.id === req.params.id);

  if (!server) {
    res.status(404).json({ error: 'Server not found.' });
    return;
  }

  if (server.userId !== user.id && role !== 'admin') {
    res.status(403).json({ error: 'Access denied. You do not own this server.' });
    return;
  }

  res.json({ server });
});

apiRouter.post('/servers/:id/action', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const role = (req as any).role as string;
  const { action } = req.body; // 'start' | 'stop' | 'restart' | 'kill'
  const data = db.getData();
  const server = data.servers.find((s) => s.id === req.params.id);

  if (!server) {
    res.status(404).json({ error: 'Server not found.' });
    return;
  }

  if (server.userId !== user.id && role !== 'admin') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (server.status === 'suspended' || server.status === 'terminated') {
    res.status(400).json({ error: 'Cannot perform action on suspended server.' });
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  if (!server.consoleLogs) server.consoleLogs = [];

  switch (action) {
    case 'start':
      server.status = 'running';
      server.cpuUsage = Math.floor(Math.random() * 25) + 10;
      server.ramUsage = Math.floor(server.ram * 0.45 * 10) / 10;
      server.tps = 20.0;
      server.uptime = 'Just started';
      server.consoleLogs.push(`[${timestamp} INFO]: [DevilCloud Node Engine] Starting server container...`);
      server.consoleLogs.push(`[${timestamp} INFO]: Loading properties from server.properties`);
      server.consoleLogs.push(`[${timestamp} INFO]: Default game type: SURVIVAL`);
      server.consoleLogs.push(`[${timestamp} INFO]: Starting Minecraft server on ${server.ip}:${server.port}`);
      server.consoleLogs.push(`[${timestamp} INFO]: [Paper] Loaded 0 world datapacks`);
      server.consoleLogs.push(`[${timestamp} INFO]: Done (4.218s)! For help, type "help"`);
      break;

    case 'stop':
      server.status = 'stopped';
      server.cpuUsage = 0;
      server.ramUsage = 0;
      server.onlinePlayers = 0;
      server.consoleLogs.push(`[${timestamp} INFO]: Stopping server...`);
      server.consoleLogs.push(`[${timestamp} INFO]: Saving players & world data`);
      server.consoleLogs.push(`[${timestamp} INFO]: Closing thread pools... Done.`);
      server.consoleLogs.push(`[${timestamp} INFO]: Server stopped gracefully.`);
      break;

    case 'restart':
      server.status = 'restarting';
      server.consoleLogs.push(`[${timestamp} INFO]: Server restart signal received.`);
      server.consoleLogs.push(`[${timestamp} INFO]: Stopping instance...`);
      setTimeout(() => {
        const s = db.getData().servers.find((srv) => srv.id === server.id);
        if (s) {
          s.status = 'running';
          s.cpuUsage = 18;
          s.ramUsage = Math.floor(s.ram * 0.5 * 10) / 10;
          s.tps = 20.0;
          s.consoleLogs?.push(`[${new Date().toLocaleTimeString()} INFO]: Server restarted successfully.`);
          db.save();
        }
      }, 1500);
      break;

    case 'kill':
      server.status = 'stopped';
      server.cpuUsage = 0;
      server.ramUsage = 0;
      server.onlinePlayers = 0;
      server.consoleLogs.push(`[${timestamp} WARN]: [DevilCloud Hypervisor] Process killed forcefully (SIGKILL).`);
      break;

    default:
      res.status(400).json({ error: 'Unknown server action.' });
      return;
  }

  db.save();
  res.json({ success: true, server });
});

apiRouter.post('/servers/:id/command', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const role = (req as any).role as string;
  const { command } = req.body;
  const data = db.getData();
  const server = data.servers.find((s) => s.id === req.params.id);

  if (!server) {
    res.status(404).json({ error: 'Server not found.' });
    return;
  }

  if (server.userId !== user.id && role !== 'admin') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (server.status !== 'running') {
    res.status(400).json({ error: 'Server is currently offline. Start the server to send commands.' });
    return;
  }

  if (!command) {
    res.status(400).json({ error: 'Command cannot be empty.' });
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  if (!server.consoleLogs) server.consoleLogs = [];

  server.consoleLogs.push(`> ${command}`);

  const lowerCmd = command.trim().toLowerCase();
  if (lowerCmd === 'list') {
    server.consoleLogs.push(`[${timestamp} INFO]: There are ${server.onlinePlayers} of a max of ${server.maxPlayers} players online.`);
  } else if (lowerCmd === 'tps') {
    server.consoleLogs.push(`[${timestamp} INFO]: TPS from last 1m, 5m, 15m: 20.00, 20.00, 19.98`);
  } else if (lowerCmd.startsWith('say ')) {
    const text = command.substring(4);
    server.consoleLogs.push(`[${timestamp} INFO]: [Server] ${text}`);
  } else if (lowerCmd.startsWith('op ')) {
    const target = command.substring(3);
    server.consoleLogs.push(`[${timestamp} INFO]: Made ${target} a server operator.`);
  } else if (lowerCmd === 'help') {
    server.consoleLogs.push(`[${timestamp} INFO]: Available commands: help, list, tps, say <msg>, op <player>, deop <player>, time set <day|night>, weather <clear|rain>, save-all, reload`);
  } else if (lowerCmd === 'save-all') {
    server.consoleLogs.push(`[${timestamp} INFO]: Saving the game (all chunks & level.dat)... Done.`);
  } else {
    server.consoleLogs.push(`[${timestamp} INFO]: Command "${command}" executed.`);
  }

  // Keep last 300 lines
  if (server.consoleLogs.length > 300) {
    server.consoleLogs = server.consoleLogs.slice(server.consoleLogs.length - 300);
  }

  db.save();
  res.json({ success: true, logs: server.consoleLogs });
});

apiRouter.post('/servers/:id/properties', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const role = (req as any).role as string;
  const { properties } = req.body;
  const data = db.getData();
  const server = data.servers.find((s) => s.id === req.params.id);

  if (!server || (server.userId !== user.id && role !== 'admin')) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  server.serverProperties = { ...(server.serverProperties || {}), ...properties };
  db.save();

  res.json({ success: true, properties: server.serverProperties });
});

// ==========================================
// 5. SUPPORT TICKETING & LIVE CHAT (/api/support)
// ==========================================

apiRouter.get('/support/my', (req: Request, res: Response) => {
  const token = req.cookies?.dc_token || req.headers.authorization?.replace('Bearer ', '');
  const data = db.getData();
  if (token && data.sessions[token]) {
    const session = data.sessions[token];
    const tickets = data.supportTickets.filter((t) => t.userId === session.userId);
    res.json({ tickets });
    return;
  }
  res.json({ tickets: [] });
});

apiRouter.post('/support/create', (req: Request, res: Response) => {
  const token = req.cookies?.dc_token || req.headers.authorization?.replace('Bearer ', '');
  const data = db.getData();
  const sessionUser = token ? data.sessions[token] : null;

  const { category, priority, subject, message, name, email, imageUrl } = req.body;

  if (!subject || !message) {
    res.status(400).json({ error: 'Subject and message are required.' });
    return;
  }

  const userId = sessionUser ? sessionUser.userId : `guest_${Date.now()}`;
  const registeredUser = sessionUser ? data.users[sessionUser.userId] : null;
  const userName = registeredUser ? registeredUser.name : (name?.trim() || 'Customer');
  const userEmail = registeredUser ? registeredUser.email : (email?.trim() || 'customer@devilcloud.fun');
  const ticketId = `TCK-${Date.now().toString().slice(-6)}`;

  const newTicket: SupportTicket = {
    id: ticketId,
    userId,
    userName,
    userEmail,
    category: category || 'general',
    priority: priority || 'medium',
    subject: subject.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg_${Date.now()}`,
        ticketId,
        senderId: userId,
        senderName: userName,
        senderRole: 'customer',
        message: message.trim(),
        imageUrl: imageUrl || undefined,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  data.supportTickets.unshift(newTicket);

  if (sessionUser) {
    db.sendNotification(
      sessionUser.userId,
      `Support Ticket Created: #${ticketId}`,
      `Your request regarding "${subject}" has been received by our technical desk.`,
      'info',
      `/support`
    );
  }

  db.save();

  res.json({ success: true, ticket: newTicket });
});

apiRouter.get('/support/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  res.json({ ticket });
});

apiRouter.post('/support/:id/message', (req: Request, res: Response) => {
  const token = req.cookies?.dc_token || req.headers.authorization?.replace('Bearer ', '');
  const data = db.getData();
  const sessionUser = token ? data.sessions[token] : null;
  const role = sessionUser?.role;

  const { message, senderName, imageUrl } = req.body;

  if ((!message || !message.trim()) && !imageUrl) {
    res.status(400).json({ error: 'Message or image cannot be empty.' });
    return;
  }

  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const isAdmin = role === 'admin';
  const newMsg: SupportMessage = {
    id: `msg_${Date.now()}`,
    ticketId: ticket.id,
    senderId: sessionUser ? sessionUser.userId : 'customer',
    senderName: isAdmin ? 'DevilCloud Staff' : (senderName || ticket.userName || 'Customer'),
    senderRole: isAdmin ? 'admin' : 'customer',
    message: (message || '').trim(),
    imageUrl: imageUrl || undefined,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(newMsg);
  ticket.updatedAt = new Date().toISOString();

  if (isAdmin) {
    ticket.status = 'in_progress';
    if (ticket.userId && !ticket.userId.startsWith('guest_')) {
      db.sendNotification(
        ticket.userId,
        `Staff Reply on Ticket #${ticket.id}`,
        `Support engineer replied to "${ticket.subject}": ${message?.slice(0, 80)}...`,
        'info',
        `/support`
      );
    }
  } else {
    ticket.status = 'waiting';
  }

  db.save();

  res.json({ success: true, ticket });
});

apiRouter.post('/support/:id/close', (req: Request, res: Response) => {
  const data = db.getData();
  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  ticket.status = 'closed';
  ticket.updatedAt = new Date().toISOString();
  db.save();

  res.json({ success: true, message: 'Ticket closed.', ticket });
});

// ==========================================
// 6. NOTIFICATIONS (/api/notifications)
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  const list = data.notifications.filter((n) => n.userId === user.id);
  res.json({ notifications: list });
});

apiRouter.post('/notifications/mark-read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = db.getData();
  data.notifications.forEach((n) => {
    if (n.userId === user.id) n.read = true;
  });
  db.save();
  res.json({ success: true });
});

// ==========================================
// 7. ADMIN OPERATIONS CENTER (/api/admin)
// ==========================================

apiRouter.get('/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();

  const totalUsers = data.users.length;
  const activeServers = data.servers.filter((s) => s.status === 'running' || s.status === 'ready').length;
  const pendingOrders = data.orders.filter((o) => o.status === 'pending_payment' || o.status === 'payment_verification').length;
  const paidOrders = data.orders.filter((o) => o.status === 'paid' || o.status === 'ready').length;
  const provisioningOrders = data.orders.filter((o) => o.status === 'provisioning').length;

  const totalRevenue = data.orders
    .filter((o) => o.status === 'paid' || o.status === 'ready' || o.status === 'provisioning')
    .reduce((acc, o) => acc + o.finalAmount, 0);

  const openTickets = data.supportTickets.filter((t) => t.status === 'open' || t.status === 'waiting').length;

  res.json({
    totalUsers,
    activeServers,
    totalServers: data.servers.length,
    pendingOrders,
    paidOrders,
    provisioningOrders,
    totalRevenue,
    openTickets,
    couponsCount: data.coupons.length,
    locationsCount: data.locations.length,
  });
});

apiRouter.get('/admin/users', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ users: data.users });
});

apiRouter.post('/admin/users/:id/suspend', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { suspend } = req.body;
  const data = db.getData();
  const target = data.users.find((u) => u.id === req.params.id);

  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (target.role === 'admin') {
    res.status(400).json({ error: 'Cannot suspend an administrator account.' });
    return;
  }

  target.isSuspended = !!suspend;
  db.logAudit(admin.email, 'USER_SUSPEND_TOGGLE', `User ${target.email} set suspended=${!!suspend}`, req.ip);
  db.save();

  res.json({ success: true, user: target });
});

apiRouter.post('/admin/users/:id/reset-password', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { newPassword } = req.body;
  const data = db.getData();
  const target = data.users.find((u) => u.id === req.params.id);

  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  data.userPasswords[target.id] = { hash, salt };
  target.mustChangePassword = true;

  db.logAudit(admin.email, 'USER_PASSWORD_RESET', `Admin reset password for ${target.email}`, req.ip);
  db.save();

  res.json({ success: true, message: `Password reset for ${target.username}.` });
});

apiRouter.get('/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ orders: data.orders });
});

// Admin approves UPI Payment & initiates provisioning
apiRouter.post('/admin/orders/:id/verify-payment', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  order.status = 'paid';
  order.paidAt = new Date().toISOString();

  // Find payment record and update
  const payment = data.payments.find((p) => p.orderId === order.id);
  if (payment) {
    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    payment.verifierAdmin = admin.email;
  }

  db.logAudit(admin.email, 'PAYMENT_VERIFIED', `Verified ₹${order.finalAmount} for order ${order.id} (UTR: ${order.utrNumber || 'MANUAL'})`, req.ip);

  db.sendNotification(
    order.userId,
    `Payment Approved: ${order.id}`,
    `Your payment of ₹${order.finalAmount} has been verified. Server provisioning is now queued.`,
    'success',
    `/dashboard/orders`
  );

  db.save();

  res.json({ success: true, order });
});

apiRouter.post('/admin/orders/:id/reject-payment', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { reason } = req.body;
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  order.status = 'failed';
  const payment = data.payments.find((p) => p.orderId === order.id);
  if (payment) {
    payment.status = 'rejected';
    payment.notes = reason || 'Payment rejected by administrator during bank verification.';
  }

  db.logAudit(admin.email, 'PAYMENT_REJECTED', `Rejected payment for order ${order.id}. Reason: ${reason}`, req.ip);

  db.sendNotification(
    order.userId,
    `Payment Verification Issue: ${order.id}`,
    `We could not verify your payment: ${reason || 'UTR could not be matched with bank ledger'}. Please contact support with proof.`,
    'error',
    `/dashboard/support`
  );

  db.save();

  res.json({ success: true, order });
});

apiRouter.post('/admin/orders/:id/complete', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  order.status = 'ready';
  order.provisionedAt = new Date().toISOString();

  db.logAudit(admin.email, 'ORDER_COMPLETED', `Admin completed order ${order.id}`, req.ip);
  db.save();

  res.json({ success: true, order });
});

apiRouter.post('/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { status } = req.body;
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  order.status = status;
  db.logAudit(admin.email, 'ORDER_STATUS_CHANGED', `Changed order ${order.id} status to ${status}`, req.ip);
  db.save();

  res.json({ success: true, order });
});

apiRouter.delete('/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const index = data.orders.findIndex((o) => o.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  const [removed] = data.orders.splice(index, 1);
  db.logAudit(admin.email, 'ORDER_DELETED', `Deleted order ${removed.id}`, req.ip);
  db.save();

  res.json({ success: true, message: 'Order deleted successfully.' });
});

// Admin / Automatic Server Provisioning Pipeline
apiRouter.post('/admin/orders/:id/provision', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const order = data.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if (order.status !== 'paid' && order.status !== 'provisioning') {
    res.status(400).json({ error: 'Only PAID orders can be provisioned.' });
    return;
  }

  order.status = 'provisioning';

  // Server port assigner (start from 25565 + index)
  const port = 25565 + data.servers.length;
  const serverId = `srv_${Date.now().toString().slice(-6)}`;
  const nodeSubdomain = order.specs.location === 'loc_in_mum' ? 'in-mum.devilcloud.fun' : 'sg-sin.devilcloud.fun';

  const defaultProps: Record<string, string> = {
    'server-port': String(port),
    'motd': `§6§l${order.serverName} §7- §bPowered by DEVILCLOUD`,
    'max-players': '20',
    'online-mode': 'true',
    'pvp': 'true',
    'difficulty': 'normal',
    'gamemode': 'survival',
    'view-distance': '10',
    'allow-flight': 'false',
    'enable-command-block': 'true',
  };

  const defaultLogs = [
    `[${new Date().toLocaleTimeString()} INFO]: [DevilCloud Node Orchestrator] Provisioning container for ${order.serverName}`,
    `[${new Date().toLocaleTimeString()} INFO]: Allocated ${order.specs.ram}GB RAM / ${order.specs.cpu} vCPUs on Node ${nodeSubdomain}`,
    `[${new Date().toLocaleTimeString()} INFO]: Installing ${order.specs.software} (${order.specs.version})...`,
    `[${new Date().toLocaleTimeString()} INFO]: EULA accepted automatically.`,
    `[${new Date().toLocaleTimeString()} INFO]: Generating server.properties and world chunks...`,
    `[${new Date().toLocaleTimeString()} INFO]: Minecraft Server ready on ${nodeSubdomain}:${port}`,
  ];

  const defaultFiles = [
    { name: 'server.properties', size: '1.2 KB', type: 'file' as const, updatedAt: 'Just now' },
    { name: 'eula.txt', size: '180 B', type: 'file' as const, updatedAt: 'Just now' },
    { name: 'world', size: '4.8 MB', type: 'directory' as const, updatedAt: 'Just now' },
    { name: 'plugins', size: '0 B', type: 'directory' as const, updatedAt: 'Just now' },
    { name: 'logs', size: '12 KB', type: 'directory' as const, updatedAt: 'Just now' },
    { name: 'paper.yml', size: '3.4 KB', type: 'file' as const, updatedAt: 'Just now' },
  ];

  const now = new Date();
  const expiry = new Date(now);
  if (order.billingPeriod === 'annually') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else if (order.billingPeriod === 'quarterly') {
    expiry.setMonth(expiry.getMonth() + 3);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  const newServer: Server = {
    id: serverId,
    orderId: order.id,
    userId: order.userId,
    name: order.serverName,
    planName: order.planName,
    ram: order.specs.ram,
    cpu: order.specs.cpu,
    storage: order.specs.storage,
    backups: order.specs.backups,
    location: order.specs.location,
    version: order.specs.version,
    software: order.specs.software,
    status: 'ready',
    ip: nodeSubdomain,
    port,
    maxPlayers: 20,
    onlinePlayers: 0,
    tps: 20.0,
    cpuUsage: 12,
    ramUsage: Math.floor(order.specs.ram * 0.4 * 10) / 10,
    diskUsage: 0.6,
    uptime: '1m',
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    serverProperties: defaultProps,
    consoleLogs: defaultLogs,
    files: defaultFiles,
  };

  data.servers.unshift(newServer);

  order.status = 'ready';
  order.serverId = serverId;
  order.provisionedAt = new Date().toISOString();

  db.logAudit(admin.email, 'SERVER_PROVISIONED', `Provisioned server "${order.serverName}" (${serverId}) on port ${port}`, req.ip);

  db.sendNotification(
    order.userId,
    `🔥 Server Ready: ${order.serverName}`,
    `Your Minecraft server has been deployed! Connect at ${nodeSubdomain}:${port}. Manage console, files and players in your dashboard.`,
    'success',
    `/dashboard/servers/${serverId}`
  );

  db.save();

  res.json({
    success: true,
    message: 'Server provisioned and delivered to customer dashboard.',
    server: newServer,
    order,
  });
});

apiRouter.get('/admin/servers', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ servers: data.servers });
});

apiRouter.post('/admin/servers/:id/suspend', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { suspend } = req.body;
  const data = db.getData();
  const server = data.servers.find((s) => s.id === req.params.id);

  if (!server) {
    res.status(404).json({ error: 'Server not found.' });
    return;
  }

  server.status = suspend ? 'suspended' : 'stopped';
  db.logAudit(admin.email, 'SERVER_SUSPENSION', `Server ${server.id} suspended=${!!suspend}`, req.ip);
  db.save();

  res.json({ success: true, server });
});

apiRouter.delete('/admin/servers/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const index = data.servers.findIndex((s) => s.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Server not found.' });
    return;
  }

  const [removed] = data.servers.splice(index, 1);
  db.logAudit(admin.email, 'SERVER_DELETED', `Deleted server ${removed.name} (${removed.id})`, req.ip);
  db.save();

  res.json({ success: true });
});

// Admin Plans Management
apiRouter.get('/admin/plans', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ plans: data.plans });
});

apiRouter.post('/admin/plans', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const planData = req.body as Plan;
  const data = db.getData();

  if (!planData.name || !planData.priceMonth) {
    res.status(400).json({ error: 'Plan name and price are required.' });
    return;
  }

  const existingIdx = data.plans.findIndex((p) => p.id === planData.id);
  if (existingIdx !== -1) {
    data.plans[existingIdx] = { ...data.plans[existingIdx], ...planData };
    db.logAudit(admin.email, 'PLAN_UPDATED', `Updated hosting plan ${planData.name}`, req.ip);
  } else {
    const newPlan: Plan = {
      ...planData,
      id: planData.id || `plan_${Date.now()}`,
      sortOrder: data.plans.length + 1,
    };
    data.plans.push(newPlan);
    db.logAudit(admin.email, 'PLAN_CREATED', `Created new hosting plan ${newPlan.name}`, req.ip);
  }

  db.save();
  res.json({ success: true, plans: data.plans });
});

apiRouter.delete('/admin/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const idx = data.plans.findIndex((p) => p.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }

  const [removed] = data.plans.splice(idx, 1);
  db.logAudit(admin.email, 'PLAN_DELETED', `Deleted plan ${removed.name}`, req.ip);
  db.save();

  res.json({ success: true, plans: data.plans });
});

// Admin Custom Plan Settings
apiRouter.post('/admin/custom-plan-config', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  data.customPlanConfig = { ...data.customPlanConfig, ...req.body };
  db.logAudit(admin.email, 'CUSTOM_PLAN_CONFIG_UPDATED', 'Updated custom server pricing parameters', req.ip);
  db.save();
  res.json({ success: true, config: data.customPlanConfig });
});

// Admin Coupons Management
apiRouter.get('/admin/coupons', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ coupons: data.coupons });
});

apiRouter.post('/admin/coupons', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const couponData = req.body as Coupon;
  const data = db.getData();

  if (!couponData.code || !couponData.discountValue) {
    res.status(400).json({ error: 'Coupon code and discount value are required.' });
    return;
  }

  const cleanCode = couponData.code.trim().toUpperCase();
  const existingIdx = data.coupons.findIndex((c) => c.id === couponData.id || c.code === cleanCode);

  if (existingIdx !== -1) {
    data.coupons[existingIdx] = { ...data.coupons[existingIdx], ...couponData, code: cleanCode };
    db.logAudit(admin.email, 'COUPON_UPDATED', `Updated coupon ${cleanCode}`, req.ip);
  } else {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn_${Date.now()}`,
      code: cleanCode,
      usedCount: 0,
      isActive: couponData.isActive !== false,
    };
    data.coupons.push(newCoupon);
    db.logAudit(admin.email, 'COUPON_CREATED', `Created coupon ${cleanCode}`, req.ip);
  }

  db.save();
  res.json({ success: true, coupons: data.coupons });
});

apiRouter.delete('/admin/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const idx = data.coupons.findIndex((c) => c.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'Coupon not found.' });
    return;
  }

  const [removed] = data.coupons.splice(idx, 1);
  db.logAudit(admin.email, 'COUPON_DELETED', `Deleted coupon ${removed.code}`, req.ip);
  db.save();

  res.json({ success: true, coupons: data.coupons });
});

// Admin Support Desk
apiRouter.get('/admin/tickets', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ tickets: data.supportTickets });
});

apiRouter.post('/admin/tickets/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, priority } = req.body;
  const data = db.getData();
  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  ticket.updatedAt = new Date().toISOString();

  db.save();
  res.json({ success: true, ticket });
});

apiRouter.post('/admin/tickets/:id/rename', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { subject } = req.body;

  if (!subject || !subject.trim()) {
    res.status(400).json({ error: 'Subject cannot be empty.' });
    return;
  }

  const data = db.getData();
  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  ticket.subject = subject.trim();
  ticket.updatedAt = new Date().toISOString();

  db.logAudit(admin.email, 'TICKET_RENAMED', `Renamed ticket #${ticket.id} to "${ticket.subject}"`, req.ip);
  db.save();

  res.json({ success: true, ticket });
});

apiRouter.post(['/admin/tickets/:id/message', '/admin/tickets/:id/reply'], requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { message, imageUrl, status } = req.body;

  if ((!message || !message.trim()) && !imageUrl) {
    res.status(400).json({ error: 'Message or image cannot be empty.' });
    return;
  }

  const data = db.getData();
  const ticket = data.supportTickets.find((t) => t.id === req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const newMsg: SupportMessage = {
    id: `msg_${Date.now()}`,
    ticketId: ticket.id,
    senderId: admin.id,
    senderName: admin.name || 'DevilCloud Admin',
    senderRole: 'admin',
    message: (message || '').trim(),
    imageUrl: imageUrl || undefined,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(newMsg);
  ticket.status = status || 'in_progress';
  ticket.updatedAt = new Date().toISOString();

  if (ticket.userId && !ticket.userId.startsWith('guest_')) {
    db.sendNotification(
      ticket.userId,
      `Staff Reply on Ticket #${ticket.id}`,
      `Support responded: ${(message || 'Attached screenshot').slice(0, 80)}`,
      'info',
      `/support`
    );
  }

  db.logAudit(admin.email, 'TICKET_REPLIED', `Replied to ticket #${ticket.id}`, req.ip);
  db.save();

  res.json({ success: true, ticket });
});

apiRouter.delete('/admin/tickets/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  const index = data.supportTickets.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const [removed] = data.supportTickets.splice(index, 1);
  db.logAudit(admin.email, 'TICKET_DELETED', `Deleted support ticket #${removed.id} ("${removed.subject}")`, req.ip);
  db.save();

  res.json({ success: true, message: 'Ticket deleted successfully.' });
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ logs: data.auditLogs });
});

// Admin Settings
apiRouter.get('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const data = db.getData();
  res.json({ settings: data.settings });
});

apiRouter.post('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const data = db.getData();
  data.settings = { ...data.settings, ...req.body };

  db.logAudit(admin.email, 'SETTINGS_UPDATED', 'Updated global platform configuration and payment gateways', req.ip);
  db.save();

  res.json({ success: true, settings: data.settings });
});
