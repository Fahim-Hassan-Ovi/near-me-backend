import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { SuperAdminController } from "./superAdmin.controller";

const router = Router();

// ── All routes require SUPER_ADMIN auth ───────────────────────────────────────
router.use(checkAuth(Role.SUPER_ADMIN));

/* ================================================================== */
/*  DASHBOARD                                                           */
/* ================================================================== */

/**
 * GET /super-admin/dashboard
 *
 * Response:
 * {
 *   totalServiceProviders: number,
 *   totalUsers: number,
 *   onFreeTrial: number,
 *   totalRevenue: number,
 *   providerStatus: { paid: number, onFreeTrial: number },
 *   platformGrowth: [{ month, providers, revenue }]  // last 7 months
 * }
 */
router.get("/dashboard", SuperAdminController.getDashboard);

/* ================================================================== */
/*  SERVICE PROVIDERS                                                   */
/* ================================================================== */

/**
 * GET /super-admin/service-providers
 *
 * Query:
 *   status  : "all" | "pending" | "paid" | "on_free_trial" | "suspended"
 *   page    : number  (default: 1)
 *   limit   : number  (default: 10)
 *   search  : string  (optional — searches name, email, service_name)
 *
 * Response:
 * {
 *   data: IProviderListItem[],
 *   meta: { total, page, limit, totalPages },
 *   counts: { all, pending, paid, onFreeTrial, suspended }
 * }
 */
router.get("/service-providers", SuperAdminController.getServiceProviders);

/**
 * PATCH /super-admin/service-providers/:serviceId/suspend
 *
 * Suspends the provider:
 *  - Sets provider user isActive = "BLOCKED"
 *  - Sets service subscriptionStatus = "inactive"
 *
 * The provider will no longer appear in public-facing searches.
 */
router.patch(
  "/service-providers/:serviceId/suspend",
  SuperAdminController.suspendServiceProvider
);

/**
 * DELETE /super-admin/service-providers/:serviceId/withdraw
 *
 * Permanently withdraws the provider:
 *  - Hard-deletes the service document
 *  - Soft-deletes the provider user (isDeleted = true)
 *
 * Use with caution — service data cannot be recovered.
 */
router.delete(
  "/service-providers/:serviceId/withdraw",
  SuperAdminController.withdrawServiceProvider
);

/* ================================================================== */
/*  USERS                                                               */
/* ================================================================== */

/**
 * GET /super-admin/users
 *
 * Query:
 *   status : "all" | "active" | "blocked"
 *   page   : number  (default: 1)
 *   limit  : number  (default: 10)
 *   search : string  (optional)
 *
 * Response:
 * {
 *   data: IUserListItem[],
 *   meta: { total, page, limit, totalPages },
 *   counts: { total, active, blocked }
 * }
 */
router.get("/users", SuperAdminController.getUsers);

/**
 * PATCH /super-admin/users/:userId/block
 * Blocks the user (isActive = "BLOCKED").
 */
router.patch("/users/:userId/block", SuperAdminController.blockUser);

/**
 * PATCH /super-admin/users/:userId/unblock
 * Restores a blocked user (isActive = "ACTIVE").
 */
router.patch("/users/:userId/unblock", SuperAdminController.unblockUser);

/* ================================================================== */
/*  REVENUE                                                             */
/* ================================================================== */

/**
 * GET /super-admin/revenue
 *
 * Query:
 *   page  : number  (default: 1)  — paginates the payment log
 *   limit : number  (default: 10)
 *
 * Response:
 * {
 *   stats: { lifetimeRevenue, thisMonthRevenue, todayRevenue },
 *   monthlyRevenue: [{ month, revenue }],           // current year
 *   dailyRegistrations: [{ day, count }],           // last 7 days
 *   paymentLog: {
 *     data: [{ transaction_id, provider, amount, currency, payment_status, createdAt }],
 *     meta: { total, page, limit, totalPages }
 *   }
 * }
 */
router.get("/revenue", SuperAdminController.getRevenue);

export const SuperAdminRoutes = router;