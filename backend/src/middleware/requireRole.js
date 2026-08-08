/**
 * Middleware factory: gate access by role.
 *
 * Usage:
 *   router.get("/admin-only", requireAuth, requireRole(["COMPANY_ADMIN"]), handler);
 *
 * @param {string[]} allowedRoles - Array of roles that may access the route
 * @returns {import("express").RequestHandler}
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Authentication required before role check" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions for this action" });
    }

    next();
  };
}

module.exports = requireRole;
