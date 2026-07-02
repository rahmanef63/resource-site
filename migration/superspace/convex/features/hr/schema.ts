/**
 * ERP HR Module Schema
 * Complete human resources management with attendance, leave, payroll, and performance
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Shared address shape
const addressValidator = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  country: v.string(),
  postalCode: v.string(),
});

export const hrTables = {
  // ============================================
  // EMPLOYEES
  // ============================================
  employees: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    employeeCode: v.string(),
    
    // Personal Information
    firstName: v.string(),
    lastName: v.string(),
    middleName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    mobile: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("other"),
      v.literal("prefer_not_to_say")
    )),
    maritalStatus: v.optional(v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("widowed")
    )),
    nationality: v.optional(v.string()),
    
    // Address
    address: v.optional(addressValidator),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      relationship: v.string(),
      phone: v.string(),
      email: v.optional(v.string()),
    })),
    
    // Employment Details
    department: v.optional(v.id("departments")),
    designation: v.optional(v.id("designations")),
    reportsTo: v.optional(v.id("employees")),
    employmentType: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract"),
      v.literal("intern"),
      v.literal("probation")
    ),
    joiningDate: v.number(),
    confirmationDate: v.optional(v.number()),
    terminationDate: v.optional(v.number()),
    
    // Work Location
    workLocation: v.optional(v.string()),
    workShift: v.optional(v.id("shifts")),
    
    // Compensation
    salary: v.optional(v.object({
      amount: v.number(),
      currency: v.string(),
      frequency: v.union(
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("annually")
      ),
    })),
    bankAccount: v.optional(v.object({
      bankName: v.string(),
      accountNumber: v.string(),
      routingNumber: v.optional(v.string()),
      accountType: v.string(),
    })),
    
    // Documents
    documents: v.array(v.object({
      name: v.string(),
      type: v.string(),
      fileId: v.id("_storage"),
      uploadedAt: v.number(),
    })),
    
    // Status
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("on_leave"),
      v.literal("terminated"),
      v.literal("resigned")
    ),
    
    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_department", ["department"])
    .index("by_status", ["status"])
    .index("by_code", ["employeeCode"])
    .searchIndex("search_text", {
      searchField: "firstName",
      filterFields: ["workspaceId", "status", "department"],
    }),

  // ============================================
  // DEPARTMENTS
  // ============================================
  departments: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    parentDepartment: v.optional(v.id("departments")),
    head: v.optional(v.id("employees")),
    costCenter: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentDepartment"])
    .index("by_code", ["code"]),

  // ============================================
  // DESIGNATIONS (Job Titles)
  // ============================================
  designations: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    department: v.optional(v.id("departments")),
    level: v.number(), // Seniority level
    salaryRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_department", ["department"]),

  // ============================================
  // SHIFTS
  // ============================================
  shifts: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    startTime: v.string(), // "09:00"
    endTime: v.string(), // "18:00"
    breakDuration: v.number(), // minutes
    workingDays: v.array(v.number()), // 0-6 for Sun-Sat
    isFlexible: v.boolean(),
    flexibleWindow: v.optional(v.number()), // minutes
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // ============================================
  // ATTENDANCE
  // ============================================
  attendance: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    date: v.number(),
    
    // Clock In/Out
    clockIn: v.optional(v.number()),
    clockOut: v.optional(v.number()),
    
    // Location tracking
    clockInLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    clockOutLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    
    // Work hours
    workHours: v.optional(v.number()), // minutes
    overtimeHours: v.optional(v.number()), // minutes
    breakDuration: v.optional(v.number()), // minutes
    
    // Status
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("half_day"),
      v.literal("late"),
      v.literal("on_leave"),
      v.literal("holiday"),
      v.literal("weekend")
    ),
    
    // Notes
    notes: v.optional(v.string()),
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "date"])
    .index("by_employee", ["employeeId", "date"])
    .index("by_status", ["status", "date"]),

  // ============================================
  // LEAVE TYPES
  // ============================================
  leaveTypes: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    
    // Allocation
    annualAllocation: v.number(), // days
    carryOverLimit: v.optional(v.number()),
    maxConsecutiveDays: v.optional(v.number()),
    
    // Rules
    isPaid: v.boolean(),
    requiresApproval: v.boolean(),
    requiresDocument: v.boolean(),
    canBeHalfDay: v.boolean(),
    
    // Eligibility
    applicableEmploymentTypes: v.array(v.string()),
    minServiceMonths: v.optional(v.number()),
    
    // Accrual
    accrualType: v.union(
      v.literal("annual"),
      v.literal("monthly"),
      v.literal("no_accrual")
    ),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_code", ["code"]),

  // ============================================
  // LEAVE REQUESTS
  // ============================================
  leaveRequests: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    leaveTypeId: v.id("leaveTypes"),
    
    // Duration
    startDate: v.number(),
    endDate: v.number(),
    isHalfDay: v.boolean(),
    halfDayType: v.optional(v.union(
      v.literal("first_half"),
      v.literal("second_half")
    )),
    totalDays: v.number(),
    
    // Request details
    reason: v.string(),
    documents: v.array(v.id("_storage")),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("withdrawn")
    ),
    
    // Approval workflow
    approvalChain: v.array(v.object({
      approverId: v.id("users"),
      status: v.string(),
      comments: v.optional(v.string()),
      actionAt: v.optional(v.number()),
    })),
    
    // Cancellation
    cancellationReason: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_employee", ["employeeId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_dates", ["startDate", "endDate"]),

  // ============================================
  // LEAVE BALANCES
  // ============================================
  leaveBalances: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    leaveTypeId: v.id("leaveTypes"),
    year: v.number(),
    
    // Balance
    allocated: v.number(),
    used: v.number(),
    pending: v.number(),
    carryForward: v.number(),
    balance: v.number(),
    
    updatedAt: v.number(),
  })
    .index("by_employee_year", ["employeeId", "year"])
    .index("by_workspace_year", ["workspaceId", "year"]),

  // ============================================
  // PAYROLL PERIODS
  // ============================================
  payrollPeriods: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    payDate: v.number(),
    
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("approved"),
      v.literal("paid"),
      v.literal("closed")
    ),
    
    totalGross: v.number(),
    totalDeductions: v.number(),
    totalNet: v.number(),
    employeeCount: v.number(),
    
    processedBy: v.optional(v.id("users")),
    processedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "startDate"])
    .index("by_status", ["status"]),

  // ============================================
  // PAYSLIPS
  // ============================================
  payslips: defineTable({
    workspaceId: v.id("workspaces"),
    payrollPeriodId: v.id("payrollPeriods"),
    employeeId: v.id("employees"),
    
    // Earnings
    basicSalary: v.number(),
    earnings: v.array(v.object({
      name: v.string(),
      type: v.string(),
      amount: v.number(),
    })),
    grossPay: v.number(),
    
    // Deductions
    deductions: v.array(v.object({
      name: v.string(),
      type: v.string(),
      amount: v.number(),
    })),
    totalDeductions: v.number(),
    
    // Net
    netPay: v.number(),
    
    // Tax
    taxableIncome: v.number(),
    taxAmount: v.number(),
    
    // Work details
    workingDays: v.number(),
    presentDays: v.number(),
    leaveDays: v.number(),
    overtimeHours: v.number(),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("paid")
    ),
    
    // Payment
    paymentMethod: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_payroll", ["payrollPeriodId"])
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ============================================
  // SALARY COMPONENTS
  // ============================================
  salaryComponents: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("earning"),
      v.literal("deduction")
    ),
    
    // Calculation
    calculationType: v.union(
      v.literal("fixed"),
      v.literal("percentage"),
      v.literal("formula")
    ),
    value: v.optional(v.number()),
    formula: v.optional(v.string()),
    basedOn: v.optional(v.string()), // "basic", "gross", etc.
    
    // Tax
    isTaxable: v.boolean(),
    isStatutory: v.boolean(),
    
    // Applicability
    isDefault: v.boolean(),
    applicableDesignations: v.optional(v.array(v.id("designations"))),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["type"]),

  // ============================================
  // PERFORMANCE REVIEWS
  // ============================================
  performanceReviews: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    reviewCycleId: v.id("reviewCycles"),
    
    // Review period
    periodStart: v.number(),
    periodEnd: v.number(),
    
    // Goals
    goals: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      weight: v.number(),
      targetValue: v.optional(v.number()),
      achievedValue: v.optional(v.number()),
      status: v.string(),
      selfRating: v.optional(v.number()),
      managerRating: v.optional(v.number()),
    })),
    
    // Ratings
    selfRating: v.optional(v.number()),
    managerRating: v.optional(v.number()),
    finalRating: v.optional(v.number()),
    
    // Feedback
    selfAssessment: v.optional(v.string()),
    managerFeedback: v.optional(v.string()),
    peerFeedback: v.optional(v.array(v.object({
      fromId: v.id("users"),
      feedback: v.string(),
      rating: v.optional(v.number()),
      submittedAt: v.number(),
    }))),
    
    // Development
    strengths: v.optional(v.array(v.string())),
    areasForImprovement: v.optional(v.array(v.string())),
    developmentPlan: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("self_assessment"),
      v.literal("peer_review"),
      v.literal("manager_review"),
      v.literal("calibration"),
      v.literal("completed")
    ),
    
    // Sign-off
    employeeSignOff: v.optional(v.number()),
    managerSignOff: v.optional(v.number()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_employee", ["employeeId"])
    .index("by_cycle", ["reviewCycleId"])
    .index("by_status", ["status"]),

  // ============================================
  // REVIEW CYCLES
  // ============================================
  reviewCycles: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    
    // Period
    periodStart: v.number(),
    periodEnd: v.number(),
    
    // Timeline
    selfAssessmentDeadline: v.number(),
    peerReviewDeadline: v.number(),
    managerReviewDeadline: v.number(),
    calibrationDeadline: v.number(),
    
    // Configuration
    ratingScale: v.number(), // 5 or 10
    includePeerReview: v.boolean(),
    peerReviewCount: v.optional(v.number()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"]),

  // ============================================
  // JOB POSTINGS
  // ============================================
  jobPostings: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    department: v.optional(v.id("departments")),
    designation: v.optional(v.id("designations")),
    
    // Details
    description: v.string(),
    requirements: v.array(v.string()),
    responsibilities: v.array(v.string()),
    skills: v.array(v.string()),
    
    // Location
    location: v.string(),
    isRemote: v.boolean(),
    
    // Employment
    employmentType: v.string(),
    experienceLevel: v.string(),
    salaryRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
      showOnPosting: v.boolean(),
    })),
    
    // Positions
    numberOfPositions: v.number(),
    filledPositions: v.number(),
    
    // Timeline
    openDate: v.number(),
    closeDate: v.optional(v.number()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("paused"),
      v.literal("closed"),
      v.literal("filled")
    ),
    
    // Hiring
    hiringManagerId: v.optional(v.id("users")),
    recruiterId: v.optional(v.id("users")),
    
    // Stats
    viewCount: v.number(),
    applicationCount: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_department", ["department"]),

  // ============================================
  // APPLICANTS
  // ============================================
  applicants: defineTable({
    workspaceId: v.id("workspaces"),
    jobPostingId: v.id("jobPostings"),
    
    // Personal Info
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    
    // Application
    resumeFileId: v.optional(v.id("_storage")),
    coverLetter: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    
    // Experience
    currentCompany: v.optional(v.string()),
    currentTitle: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    expectedSalary: v.optional(v.number()),
    noticePeriod: v.optional(v.string()),
    
    // Source
    source: v.optional(v.string()), // linkedin, referral, website, etc.
    referredBy: v.optional(v.id("employees")),
    
    // Status
    stage: v.union(
      v.literal("new"),
      v.literal("screening"),
      v.literal("interview"),
      v.literal("assessment"),
      v.literal("offer"),
      v.literal("hired"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    
    // Rating
    rating: v.optional(v.number()),
    
    // Notes
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_job", ["jobPostingId", "createdAt"])
    .index("by_stage", ["stage", "createdAt"])
    .index("by_email", ["email"]),

  // ============================================
  // INTERVIEWS
  // ============================================
  interviews: defineTable({
    workspaceId: v.id("workspaces"),
    applicantId: v.id("applicants"),
    
    // Schedule
    scheduledAt: v.number(),
    duration: v.number(), // minutes
    timezone: v.string(),
    
    // Type
    interviewType: v.union(
      v.literal("phone"),
      v.literal("video"),
      v.literal("in_person"),
      v.literal("panel")
    ),
    
    // Location
    location: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    
    // Interviewers
    interviewers: v.array(v.id("users")),
    
    // Feedback
    feedback: v.optional(v.array(v.object({
      interviewerId: v.id("users"),
      rating: v.number(),
      strengths: v.optional(v.string()),
      weaknesses: v.optional(v.string()),
      recommendation: v.string(),
      submittedAt: v.number(),
    }))),
    
    // Status
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("rescheduled")
    ),
    
    // Notes
    notes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "scheduledAt"])
    .index("by_applicant", ["applicantId"])
    .index("by_status", ["status"]),

  // ============================================
  // ONBOARDING TASKS
  // ============================================
  onboardingTasks: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    
    // Task details
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "documents", "it", "training", etc.
    
    // Assignment
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("skipped")
    ),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id("users")),
    
    // Order
    order: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ============================================
  // EXPENSE CLAIMS
  // ============================================
  expenseClaims: defineTable({
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    
    // Claim details
    claimNumber: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    
    // Items
    items: v.array(v.object({
      id: v.string(),
      date: v.number(),
      category: v.string(),
      description: v.string(),
      amount: v.number(),
      currency: v.string(),
      receipt: v.optional(v.id("_storage")),
    })),
    
    // Total
    totalAmount: v.number(),
    currency: v.string(),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("paid")
    ),
    
    // Approval
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    approvalComments: v.optional(v.string()),
    
    // Payment
    paidAt: v.optional(v.number()),
    paymentReference: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_employee", ["employeeId", "createdAt"])
    .index("by_status", ["status"]),

  // ============================================
  // TRAINING COURSES
  // ============================================
  trainingCourses: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    
    // Details
    category: v.string(),
    duration: v.number(), // hours
    instructor: v.optional(v.string()),
    
    // Type
    type: v.union(
      v.literal("online"),
      v.literal("classroom"),
      v.literal("blended"),
      v.literal("self_paced")
    ),
    
    // Content
    materials: v.array(v.object({
      name: v.string(),
      fileId: v.id("_storage"),
      type: v.string(),
    })),
    
    // Certification
    hasCertification: v.boolean(),
    certificationValidityMonths: v.optional(v.number()),
    
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_category", ["category"]),

  // ============================================
  // TRAINING ENROLLMENTS
  // ============================================
  trainingEnrollments: defineTable({
    workspaceId: v.id("workspaces"),
    courseId: v.id("trainingCourses"),
    employeeId: v.id("employees"),
    
    // Enrollment
    enrolledAt: v.number(),
    enrolledBy: v.id("users"),
    dueDate: v.optional(v.number()),
    
    // Progress
    progress: v.number(), // percentage
    completedAt: v.optional(v.number()),
    
    // Assessment
    score: v.optional(v.number()),
    passed: v.optional(v.boolean()),
    
    // Certificate
    certificateIssued: v.boolean(),
    certificateFileId: v.optional(v.id("_storage")),
    certificateExpiryDate: v.optional(v.number()),
    
    // Status
    status: v.union(
      v.literal("enrolled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_course", ["courseId"])
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ============================================
  // HOLIDAYS
  // ============================================
  holidays: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    date: v.number(),
    type: v.union(
      v.literal("public"),
      v.literal("company"),
      v.literal("optional")
    ),
    description: v.optional(v.string()),
    applicableDepartments: v.optional(v.array(v.id("departments"))),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "date"])
    .index("by_type", ["type"]),
};

export default defineSchema(hrTables);
