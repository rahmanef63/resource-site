import { internalMutation } from "../../_generated/server";

// Feature module type matching the schema
type FeatureModule = "pos" | "inventory" | "crm" | "marketing" | "hr" | "accounting" | "projects" | "support" | "bi" | "forms" | "workflows" | "docs" | "chat" | "calendar" | "bookings" | "cms" | "analytics" | "integrations" | "notifications" | "tasks";

// Industry category type matching the schema
type IndustryCategory = "restaurant" | "retail" | "healthcare" | "education" | "professional_services" | "manufacturing" | "hospitality" | "real_estate" | "fitness" | "salon_spa" | "automotive" | "construction" | "nonprofit" | "technology" | "creative_agency" | "logistics" | "custom";

// Visibility type matching the schema
type TemplateVisibility = "public" | "private" | "organization";

// Template type for the seed data
interface SeedTemplate {
  name: string;
  description: string;
  category: IndustryCategory;
  subcategory?: string;
  features: FeatureModule[];
  featureConfigs?: Record<string, unknown>;
  defaultRoles: Array<{
    name: string;
    description: string;
    permissions: string[];
    isDefault?: boolean;
  }>;
  sampleData?: {
    products?: number;
    customers?: number;
    documents?: number;
    workflows?: number;
  };
  dashboardWidgets?: Array<{
    type: string;
    title: string;
    config: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }>;
  recommendedIntegrations?: string[];
  visibility: TemplateVisibility;
  version: string;
  isOfficial: boolean;
  usageCount: number;
  tags: string[];
  isPremium: boolean;
}

/**
 * Seed Official Industry Templates
 * Run this once to populate the database with official templates
 */
export const seedOfficialTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if templates already exist
    const existingTemplates = await ctx.db
      .query("industryTemplates")
      .withIndex("by_is_official", (q) => q.eq("isOfficial", true))
      .first();

    if (existingTemplates) {
      return { seeded: false, message: "Templates already exist" };
    }

    const officialTemplates: SeedTemplate[] = [
      // Restaurant Template
      {
        name: "Restaurant Pro",
        description: "Complete restaurant management solution with POS, inventory tracking, table management, and customer loyalty. Perfect for full-service restaurants, cafes, and bars.",
        category: "restaurant",
        subcategory: "full_service",
        features: ["pos", "inventory", "crm", "marketing", "analytics", "bookings"],
        featureConfigs: {
          pos: {
            enableTips: true,
            enableSplitBills: true,
            enableTableManagement: true,
            defaultTaxRate: 0.08,
          },
          inventory: {
            enableLowStockAlerts: true,
            lowStockThreshold: 10,
            enableExpiryTracking: true,
          },
        },
        defaultRoles: [
          {
            name: "Owner",
            description: "Full access to all features and settings",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Manager",
            description: "Manage staff, inventory, and daily operations",
            permissions: ["pos.*", "inventory.*", "reports.view", "staff.manage"],
            isDefault: false,
          },
          {
            name: "Server",
            description: "Process orders and manage tables",
            permissions: ["pos.create", "pos.view", "tables.manage"],
            isDefault: true,
          },
          {
            name: "Kitchen Staff",
            description: "View and manage orders",
            permissions: ["orders.view", "orders.update"],
            isDefault: false,
          },
        ],
        sampleData: {
          products: 50,
          customers: 100,
          documents: 5,
        },
        dashboardWidgets: [
          { type: "sales_today", title: "Today's Sales", config: {}, position: { x: 0, y: 0, w: 3, h: 2 } },
          { type: "popular_items", title: "Popular Items", config: { limit: 5 }, position: { x: 3, y: 0, w: 3, h: 2 } },
          { type: "active_orders", title: "Active Orders", config: {}, position: { x: 0, y: 2, w: 6, h: 3 } },
        ],
        recommendedIntegrations: ["doordash", "ubereats", "grubhub", "square"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["restaurant", "food-service", "pos", "hospitality"],
        isPremium: false,
      },

      // --- KA IRUL GROUP BUSINESS ENGINES ---

      // 1. YAYASAN & SDIT (Education & Non-Profit)
      {
        name: "Education & Foundation Engine",
        description: "Sistem manajemen terpadu untuk Sekolah (SDIT) dan Yayasan. Mengelola data siswa, SPP, donasi, aset wakaf, dan program kegiatan dalam satu dashboard.",
        category: "education",
        subcategory: "school",
        features: ["crm", "accounting", "hr", "projects", "inventory", "calendar", "forms", "docs"],
        featureConfigs: {
          crm: { 
            label: "Siswa & Wali Murid",
            customFields: ["NIS", "Kelas", "Nama Wali", "Golongan Darah"]
          },
          projects: { 
            label: "Program Yayasan",
            view: "kanban"
          },
          accounting: { 
            enableTuition: true,
            enableDonations: true,
            currency: "IDR"
          },
          calendar: {
            mode: "academic",
            features: ["class_schedule", "events"]
          }
        },
        defaultRoles: [
          { name: "Kepala Sekolah", description: "Akses penuh operasional sekolah", permissions: ["*"], isDefault: false },
          { name: "Admin TU", description: "Kelola pembayaran SPP dan data siswa", permissions: ["crm.*", "accounting.*", "forms.*"], isDefault: true },
          { name: "Guru", description: "Akses jadwal dan data siswa terbatas", permissions: ["calendar.view", "crm.view", "docs.view"], isDefault: false },
          { name: "Pengurus Yayasan", description: "Monitor laporan dan program", permissions: ["reports.view", "projects.view", "accounting.view"], isDefault: false },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["sekolah", "yayasan", "pesantren", "sdit", "education"],
        isPremium: false,
      },

      // 2. RETAIL FRANCHISE (Alfa, Apotik)
      {
        name: "Retail Franchise Engine",
        description: "Engine ritel untuk minimarket atau apotik. Dilengkapi POS Cepat, manajemen stok dengan expiry date (FEFO), dan laporan penjualan real-time.",
        category: "retail",
        subcategory: "franchise",
        features: ["pos", "inventory", "accounting", "hr", "analytics", "crm"],
        featureConfigs: {
          pos: { 
            enableBarcode: true, 
            fastCheckout: true,
            receiptFormat: "thermal_80mm"
          },
          inventory: { 
            enableExpiryTracking: true, // Critical for Apotik
            enableBatchTracking: true,
            valuationMethod: "FIFO"
          },
          analytics: {
            dashboards: ["sales_daily", "stock_turnover"]
          }
        },
        defaultRoles: [
          { name: "Store Manager", description: "Kelola toko harian", permissions: ["*"], isDefault: false },
          { name: "Kasir", description: "Akses POS dan Buka/Tutup Kasir", permissions: ["pos.sell", "pos.view", "crm.create"], isDefault: true },
          { name: "Apoteker", description: "Validasi resep dan stok obat", permissions: ["inventory.*", "pos.view"], isDefault: false },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["retail", "minimarket", "apotik", "franchise", "pos"],
        isPremium: false,
      },

      // 3. SERVICE BUSINESS (Laundry)
      {
        name: "Service & Laundry Engine",
        description: "Sistem manajemen jasa laundry dengan pelacakan status cucian per item, notifikasi WA otomatis, dan kasir layanan.",
        category: "custom",
        subcategory: "laundry",
        features: ["pos", "crm", "inventory", "accounting", "notifications", "tasks"],
        featureConfigs: {
          pos: { 
            serviceMode: true, // Mode jasa
            printJobSheet: true
          },
          notifications: { 
            enableWhatsApp: true,
            triggers: ["order_received", "order_ready", "order_completed"]
          },
          inventory: {
            label: "Supplies (Deterjen/Parfum)"
          }
        },
        defaultRoles: [
          { name: "Owner", description: "Pemilik", permissions: ["*"], isDefault: false },
          { name: "Front Desk", description: "Terima order dan kasir", permissions: ["pos.*", "crm.*", "notifications.send"], isDefault: true },
          { name: "Bagian Cuci/Setrika", description: "Update status pengerjaan", permissions: ["tasks.update", "pos.view"], isDefault: false },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["laundry", "jasa", "service", "umkm"],
        isPremium: false,
      },

      // 4. HOSPITALITY (Zian Inn)
      {
        name: "Hospitality Booking Engine",
        description: "Engine manajemen penginapan (Guest House/Kost). Mengubah Kalender menjadi Booking System, manajemen check-in/out, dan housekeeping.",
        category: "real_estate",
        subcategory: "hospitality",
        features: ["calendar", "bookings", "crm", "accounting", "inventory", "docs", "marketing"],
        featureConfigs: {
          calendar: { 
            mode: "booking_timeline", // Special mode
            resourceLabel: "Kamar"
          },
          bookings: {
            enableOnlineBooking: true,
            checkInTime: "14:00",
            checkOutTime: "12:00"
          },
          crm: { label: "Tamu & Tenant" },
          inventory: { label: "Amenities & Linen" }
        },
        defaultRoles: [
          { name: "Property Manager", description: "Pengelola properti", permissions: ["*"], isDefault: false },
          { name: "Resepsionis", description: "Check-in tamu dan terima booking", permissions: ["bookings.*", "calendar.*", "crm.*", "accounting.create"], isDefault: true },
          { name: "Housekeeping", description: "Lihat jadwal bersih kamar", permissions: ["calendar.view", "tasks.view"], isDefault: false },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["hotel", "kost", "property", "guesthouse", "booking"],
        isPremium: false,
      },

      // 5. F&B FRANCHISE (Rocket Chicken)
      {
        name: "QSR (Quick Service Resto) Engine",
        description: "Engine spesialis Fast Food. POS Grid super cepat, manajemen resep (potong stok otomatis), dan Kitchen Display System.",
        category: "restaurant",
        subcategory: "fast_food",
        features: ["pos", "inventory", "accounting", "hr", "analytics"],
        featureConfigs: {
          pos: { 
            layout: "grid", 
            enableModifiers: true, // Paha/Dada, Pedas/Original
            kitchenDisplay: true
          },
          inventory: { 
            enableRecipe: true, // Potong stok ayam saat terjual
            autoRestock: true
          }
        },
        defaultRoles: [
          { name: "Outlet Manager", description: "Kepala Cabang", permissions: ["*"], isDefault: false },
          { name: "Crew", description: "Kasir dan Dapur", permissions: ["pos.sell", "pos.view_orders"], isDefault: true },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["resto", "fried chicken", "f&b", "franchise"],
        isPremium: false,
      },

      // 6. PROPERTY & REAL ESTATE
      {
        name: "Real Estate & Property Engine",
        description: "Manajemen jual beli dan sewa properti. CRM untuk leads, manajemen kontrak dokumen, dan listing properti.",
        category: "real_estate",
        subcategory: "agency",
        features: ["crm", "docs", "accounting", "projects", "marketing", "calendar"],
        featureConfigs: {
          crm: { 
            label: "Leads & Clients",
            pipeline: ["New Lead", "Viewing", "Negotiation", "Contract", "Closed"]
          },
          docs: { label: "Contracts & Deeds" },
          projects: { label: "Renovations & Maintenance" }
        },
        defaultRoles: [
          { name: "Agency Owner", description: "Pemilik Agensi", permissions: ["*"], isDefault: false },
          { name: "Agent", description: "Sales properti", permissions: ["crm.*", "calendar.*", "docs.view"], isDefault: true },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["property", "real estate", "agent", "housing"],
        isPremium: false,
      },

      // 7. MONEY CHANGER & TRADING (Tukar Real)
      {
        name: "Money Changer & Trading Engine",
        description: "Sistem keuangan dengan dukungan Multi-Currency, manajemen kurs real-time, dan pencatatan transaksi valas.",
        category: "professional_services",
        subcategory: "finance",
        features: ["accounting", "crm", "analytics", "forms"],
        featureConfigs: {
          accounting: { 
            multiCurrency: true,
            baseCurrency: "IDR",
            supportedCurrencies: ["SAR", "USD", "EUR", "MYR"]
          },
          analytics: { label: "Kurs Trends" }
        },
        defaultRoles: [
          { name: "Manager", description: "Kelola rate dan cash flow", permissions: ["*"], isDefault: false },
          { name: "Teller", description: "Transaksi penukaran", permissions: ["accounting.create", "crm.view"], isDefault: true },
        ],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["finance", "money changer", "forex", "trading"],
        isPremium: false,
      },

      // Retail Template
      {
        name: "Retail Store",
        description: "All-in-one retail management with POS, inventory, customer management, and e-commerce integration. Ideal for boutiques, stores, and specialty shops.",
        category: "retail",
        subcategory: "general",
        features: ["pos", "inventory", "crm", "marketing", "analytics", "cms"],
        featureConfigs: {
          pos: {
            enableReturns: true,
            enableLayaway: true,
            enableGiftCards: true,
          },
          inventory: {
            enableBarcodes: true,
            enableMultipleLocations: false,
          },
        },
        defaultRoles: [
          {
            name: "Store Owner",
            description: "Full control over the store",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Store Manager",
            description: "Manage daily operations and staff",
            permissions: ["pos.*", "inventory.*", "reports.*", "staff.manage"],
            isDefault: false,
          },
          {
            name: "Sales Associate",
            description: "Process sales and assist customers",
            permissions: ["pos.create", "pos.view", "inventory.view"],
            isDefault: true,
          },
        ],
        sampleData: {
          products: 100,
          customers: 200,
        },
        dashboardWidgets: [
          { type: "revenue_chart", title: "Revenue", config: { period: "week" }, position: { x: 0, y: 0, w: 6, h: 3 } },
          { type: "inventory_status", title: "Stock Levels", config: {}, position: { x: 0, y: 3, w: 3, h: 2 } },
          { type: "top_customers", title: "Top Customers", config: { limit: 5 }, position: { x: 3, y: 3, w: 3, h: 2 } },
        ],
        recommendedIntegrations: ["shopify", "woocommerce", "stripe", "quickbooks"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["retail", "store", "ecommerce", "inventory"],
        isPremium: false,
      },
      // Healthcare Template
      {
        name: "Medical Practice",
        description: "Comprehensive healthcare management with patient records, appointment scheduling, billing, and compliance tools. HIPAA-ready for clinics and practices.",
        category: "healthcare",
        subcategory: "clinic",
        features: ["crm", "bookings", "forms", "docs", "bi", "workflows"],
        featureConfigs: {
          crm: {
            enablePatientPortal: true,
            enableMedicalHistory: true,
          },
          forms: {
            enableDigitalSignatures: true,
            enableConsentForms: true,
          },
        },
        defaultRoles: [
          {
            name: "Practice Owner",
            description: "Full administrative access",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Physician",
            description: "Access patient records and appointments",
            permissions: ["patients.*", "appointments.*", "notes.*"],
            isDefault: false,
          },
          {
            name: "Nurse",
            description: "View and update patient information",
            permissions: ["patients.view", "patients.update", "appointments.view"],
            isDefault: false,
          },
          {
            name: "Receptionist",
            description: "Manage appointments and front desk",
            permissions: ["appointments.*", "patients.view"],
            isDefault: true,
          },
        ],
        sampleData: {
          customers: 50,
          documents: 10,
          workflows: 3,
        },
        dashboardWidgets: [
          { type: "appointments_today", title: "Today's Appointments", config: {}, position: { x: 0, y: 0, w: 6, h: 3 } },
          { type: "patient_stats", title: "Patient Statistics", config: {}, position: { x: 0, y: 3, w: 3, h: 2 } },
        ],
        recommendedIntegrations: ["zoom", "stripe", "google-calendar"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["healthcare", "medical", "clinic", "appointments", "hipaa"],
        isPremium: false,
      },
      // Professional Services Template
      {
        name: "Professional Services",
        description: "Project management, time tracking, client management, and invoicing for consultants, agencies, and professional service firms.",
        category: "professional_services",
        subcategory: "consulting",
        features: ["projects", "crm", "docs", "forms", "accounting", "analytics"],
        featureConfigs: {
          projects: {
            enableTimeTracking: true,
            enableMilestones: true,
            enableBudgetTracking: true,
          },
          accounting: {
            enableInvoicing: true,
            enableExpenseTracking: true,
          },
        },
        defaultRoles: [
          {
            name: "Partner",
            description: "Full access to firm operations",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Senior Consultant",
            description: "Manage projects and client relationships",
            permissions: ["projects.*", "clients.*", "reports.view"],
            isDefault: false,
          },
          {
            name: "Consultant",
            description: "Work on assigned projects",
            permissions: ["projects.view", "projects.update", "time.create"],
            isDefault: true,
          },
          {
            name: "Admin",
            description: "Handle administrative tasks",
            permissions: ["invoices.*", "scheduling.*", "clients.view"],
            isDefault: false,
          },
        ],
        sampleData: {
          customers: 20,
          documents: 15,
          workflows: 5,
        },
        dashboardWidgets: [
          { type: "project_status", title: "Project Overview", config: {}, position: { x: 0, y: 0, w: 4, h: 3 } },
          { type: "billable_hours", title: "Billable Hours", config: { period: "month" }, position: { x: 4, y: 0, w: 2, h: 3 } },
          { type: "revenue_pipeline", title: "Revenue Pipeline", config: {}, position: { x: 0, y: 3, w: 6, h: 2 } },
        ],
        recommendedIntegrations: ["slack", "zoom", "quickbooks", "google-drive"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["consulting", "agency", "professional-services", "projects"],
        isPremium: false,
      },
      // Fitness Template
      {
        name: "Fitness Studio",
        description: "Member management, class scheduling, payment processing, and progress tracking for gyms, yoga studios, and fitness centers.",
        category: "fitness",
        subcategory: "studio",
        features: ["crm", "bookings", "pos", "marketing", "forms", "analytics"],
        featureConfigs: {
          crm: {
            enableMemberships: true,
            enableProgressTracking: true,
          },
          bookings: {
            enableClassScheduling: true,
            enableWaitlist: true,
            maxClassSize: 20,
          },
        },
        defaultRoles: [
          {
            name: "Owner",
            description: "Full studio management",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Manager",
            description: "Daily operations and staff management",
            permissions: ["members.*", "classes.*", "staff.view", "reports.*"],
            isDefault: false,
          },
          {
            name: "Instructor",
            description: "Teach classes and view member info",
            permissions: ["classes.view", "classes.update", "members.view"],
            isDefault: true,
          },
          {
            name: "Front Desk",
            description: "Check-ins and member service",
            permissions: ["checkin.*", "members.view", "bookings.*"],
            isDefault: false,
          },
        ],
        sampleData: {
          customers: 100,
        },
        dashboardWidgets: [
          { type: "member_checkins", title: "Today's Check-ins", config: {}, position: { x: 0, y: 0, w: 3, h: 2 } },
          { type: "class_schedule", title: "Class Schedule", config: {}, position: { x: 3, y: 0, w: 3, h: 3 } },
          { type: "membership_stats", title: "Membership Stats", config: {}, position: { x: 0, y: 2, w: 3, h: 2 } },
        ],
        recommendedIntegrations: ["stripe", "mindbody", "zoom"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["fitness", "gym", "yoga", "studio", "memberships"],
        isPremium: false,
      },
      // Salon & Spa Template
      {
        name: "Salon & Spa",
        description: "Appointment booking, client management, service menu, and retail sales for hair salons, nail bars, and day spas.",
        category: "salon_spa",
        subcategory: "full_service",
        features: ["bookings", "crm", "pos", "marketing", "inventory", "analytics"],
        featureConfigs: {
          bookings: {
            enableOnlineBooking: true,
            enableServiceProviderSelection: true,
            bufferTime: 15,
          },
          crm: {
            enableServiceHistory: true,
            enablePreferences: true,
          },
        },
        defaultRoles: [
          {
            name: "Owner",
            description: "Full salon management",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Manager",
            description: "Staff and operations management",
            permissions: ["staff.*", "bookings.*", "reports.*", "inventory.*"],
            isDefault: false,
          },
          {
            name: "Stylist",
            description: "View schedule and client info",
            permissions: ["bookings.view", "clients.view", "services.view"],
            isDefault: true,
          },
          {
            name: "Receptionist",
            description: "Book appointments and checkout",
            permissions: ["bookings.*", "pos.*", "clients.view"],
            isDefault: false,
          },
        ],
        sampleData: {
          customers: 75,
          products: 30,
        },
        dashboardWidgets: [
          { type: "appointments_today", title: "Today's Appointments", config: {}, position: { x: 0, y: 0, w: 4, h: 3 } },
          { type: "stylist_schedule", title: "Stylist Availability", config: {}, position: { x: 4, y: 0, w: 2, h: 3 } },
          { type: "retail_sales", title: "Product Sales", config: {}, position: { x: 0, y: 3, w: 3, h: 2 } },
        ],
        recommendedIntegrations: ["square", "instagram", "google-calendar"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["salon", "spa", "beauty", "appointments", "wellness"],
        isPremium: false,
      },
      // Real Estate Template
      {
        name: "Real Estate Agency",
        description: "Property listings, lead management, showing scheduling, and transaction tracking for real estate agents and brokerages.",
        category: "real_estate",
        subcategory: "brokerage",
        features: ["crm", "docs", "marketing", "calendar", "forms", "analytics"],
        featureConfigs: {
          crm: {
            enableLeadScoring: true,
            enablePropertyMatching: true,
          },
          marketing: {
            enablePropertyMarketing: true,
            enableDripCampaigns: true,
          },
        },
        defaultRoles: [
          {
            name: "Broker",
            description: "Full brokerage access",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Agent",
            description: "Manage own listings and clients",
            permissions: ["listings.own", "clients.own", "showings.*"],
            isDefault: true,
          },
          {
            name: "Transaction Coordinator",
            description: "Handle paperwork and closings",
            permissions: ["transactions.*", "docs.*", "clients.view"],
            isDefault: false,
          },
        ],
        sampleData: {
          customers: 50,
          documents: 20,
        },
        dashboardWidgets: [
          { type: "active_listings", title: "Active Listings", config: {}, position: { x: 0, y: 0, w: 3, h: 3 } },
          { type: "lead_pipeline", title: "Lead Pipeline", config: {}, position: { x: 3, y: 0, w: 3, h: 3 } },
          { type: "upcoming_showings", title: "Upcoming Showings", config: {}, position: { x: 0, y: 3, w: 6, h: 2 } },
        ],
        recommendedIntegrations: ["zillow", "docusign", "google-calendar", "mailchimp"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["real-estate", "property", "agent", "listings"],
        isPremium: false,
      },
      // Creative Agency Template
      {
        name: "Creative Agency",
        description: "Project management, client collaboration, asset management, and time tracking for design, marketing, and creative agencies.",
        category: "creative_agency",
        subcategory: "full_service",
        features: ["projects", "crm", "docs", "accounting", "workflows", "chat"],
        featureConfigs: {
          projects: {
            enableKanban: true,
            enableTimeline: true,
            enableFileVersioning: true,
          },
          workflows: {
            enableApprovals: true,
            enableReviewCycles: true,
          },
        },
        defaultRoles: [
          {
            name: "Agency Owner",
            description: "Full agency control",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Creative Director",
            description: "Lead creative projects",
            permissions: ["projects.*", "team.manage", "clients.*"],
            isDefault: false,
          },
          {
            name: "Designer",
            description: "Work on creative projects",
            permissions: ["projects.view", "projects.update", "assets.*"],
            isDefault: true,
          },
          {
            name: "Account Manager",
            description: "Client relationships and project oversight",
            permissions: ["clients.*", "projects.view", "reports.*"],
            isDefault: false,
          },
        ],
        sampleData: {
          customers: 15,
          documents: 25,
          workflows: 4,
        },
        dashboardWidgets: [
          { type: "project_board", title: "Active Projects", config: {}, position: { x: 0, y: 0, w: 4, h: 4 } },
          { type: "team_workload", title: "Team Workload", config: {}, position: { x: 4, y: 0, w: 2, h: 2 } },
          { type: "deadlines", title: "Upcoming Deadlines", config: {}, position: { x: 4, y: 2, w: 2, h: 2 } },
        ],
        recommendedIntegrations: ["figma", "slack", "dropbox", "asana"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["creative", "agency", "design", "marketing", "projects"],
        isPremium: false,
      },
      // Technology Startup Template
      {
        name: "Tech Startup",
        description: "Agile project management, customer feedback, product roadmap, and team collaboration for software companies and startups.",
        category: "technology",
        subcategory: "startup",
        features: ["projects", "support", "docs", "chat", "bi", "integrations"],
        featureConfigs: {
          projects: {
            enableSprints: true,
            enableBacklog: true,
            enableVelocityTracking: true,
          },
          support: {
            enableFeatureRequests: true,
            enablePublicRoadmap: true,
          },
        },
        defaultRoles: [
          {
            name: "Founder",
            description: "Full company access",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Product Manager",
            description: "Manage product and roadmap",
            permissions: ["roadmap.*", "feedback.*", "projects.*"],
            isDefault: false,
          },
          {
            name: "Developer",
            description: "Development tasks and code",
            permissions: ["projects.view", "projects.update", "bugs.*"],
            isDefault: true,
          },
          {
            name: "Designer",
            description: "Design and UX work",
            permissions: ["projects.view", "projects.update", "designs.*"],
            isDefault: false,
          },
        ],
        sampleData: {
          documents: 20,
          workflows: 3,
        },
        dashboardWidgets: [
          { type: "sprint_board", title: "Current Sprint", config: {}, position: { x: 0, y: 0, w: 4, h: 4 } },
          { type: "velocity_chart", title: "Team Velocity", config: {}, position: { x: 4, y: 0, w: 2, h: 2 } },
          { type: "bugs_chart", title: "Bug Tracker", config: {}, position: { x: 4, y: 2, w: 2, h: 2 } },
        ],
        recommendedIntegrations: ["github", "slack", "jira", "linear"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["tech", "startup", "saas", "agile", "software"],
        isPremium: false,
      },
      // Nonprofit Template
      {
        name: "Nonprofit Organization",
        description: "Donor management, volunteer coordination, fundraising campaigns, and grant tracking for charities and nonprofit organizations.",
        category: "nonprofit",
        subcategory: "charity",
        features: ["crm", "marketing", "forms", "docs", "analytics", "projects"],
        featureConfigs: {
          crm: {
            enableDonorTracking: true,
            enableVolunteerManagement: true,
            enableGrantTracking: true,
          },
          marketing: {
            enableFundraisingCampaigns: true,
            enableDonorCommunication: true,
          },
        },
        defaultRoles: [
          {
            name: "Executive Director",
            description: "Full organizational access",
            permissions: ["*"],
            isDefault: false,
          },
          {
            name: "Development Director",
            description: "Manage fundraising and donors",
            permissions: ["donors.*", "campaigns.*", "grants.*"],
            isDefault: false,
          },
          {
            name: "Program Manager",
            description: "Manage programs and volunteers",
            permissions: ["programs.*", "volunteers.*", "events.*"],
            isDefault: false,
          },
          {
            name: "Staff",
            description: "Day-to-day operations",
            permissions: ["contacts.view", "events.view", "volunteers.view"],
            isDefault: true,
          },
        ],
        sampleData: {
          customers: 100,
          documents: 15,
        },
        dashboardWidgets: [
          { type: "donation_tracker", title: "Fundraising Progress", config: {}, position: { x: 0, y: 0, w: 3, h: 2 } },
          { type: "donor_list", title: "Recent Donors", config: { limit: 10 }, position: { x: 3, y: 0, w: 3, h: 2 } },
          { type: "campaign_status", title: "Active Campaigns", config: {}, position: { x: 0, y: 2, w: 6, h: 2 } },
        ],
        recommendedIntegrations: ["stripe", "mailchimp", "eventbrite"],
        visibility: "public",
        version: "1.0.0",
        isOfficial: true,
        usageCount: 0,
        tags: ["nonprofit", "charity", "fundraising", "donors", "volunteers"],
        isPremium: false,
      },
    ];

    // Insert all templates
    const templateIds = [];
    for (const template of officialTemplates) {
      const id = await ctx.db.insert("industryTemplates", template);
      templateIds.push(id);
    }

    // Create getting started guides for each template
    for (const templateId of templateIds) {
      await ctx.db.insert("industryGuides", {
        templateId,
        title: "Getting Started",
        content: `# Welcome to Your New Workspace

This guide will help you get up and running with your new workspace configuration.

## Step 1: Review Your Features
Take a look at the features that have been enabled for your workspace. You can access them from the sidebar.

## Step 2: Configure Your Settings
Navigate to Settings to customize your workspace to match your business needs.

## Step 3: Invite Your Team
Go to Team Settings to invite team members and assign them appropriate roles.

## Step 4: Import Your Data
If you have existing data, you can import it using our import tools.

## Need Help?
Check out our documentation or contact support for assistance.`,
        order: 1,
        type: "getting_started" as const,
        createdAt: Date.now(),
      });
    }

    return { seeded: true, count: templateIds.length };
  },
});
