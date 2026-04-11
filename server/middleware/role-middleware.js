

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roleNames) {
      if (process.env.NODE_ENV !== "production") console.log("RBAC Debug: No user or roleNames in req.user", req.user);
      return res.status(403).json({ success: false, message: 'Forbidden: No user roles found' });
    }
    // user.roleNames is an array of strings (e.g., ["learner", "instructor"])
    const userRoleNames = Array.isArray(req.user.roleNames) ? req.user.roleNames : [req.user.roleNames];
    
    // Convert both to strings and lowercase for safe comparison
    const allowedRolesLower = allowedRoles.map(r => String(r).toLowerCase());
    const userRolesLower = userRoleNames.map(r => String(r).toLowerCase());

    if (process.env.NODE_ENV !== "production") console.log(`RBAC Debug: Checking userRoles [${userRolesLower}] against allowed [${allowedRolesLower}]`);

    const hasRole = allowedRolesLower.some(role => userRolesLower.includes(role));
    if (!hasRole) {
      if (process.env.NODE_ENV !== "production") console.log(`RBAC Debug: Access Denied for roles [${userRolesLower}]`);
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

module.exports = authorizeRoles;
