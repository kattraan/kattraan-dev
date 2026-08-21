/**
 * Instructor privileges are granted only after admin approval (status === 'approved').
 * Until then the instructor role must not appear in tokens, session profiles, or RBAC.
 */
function effectiveRoleNames(roleNames, status) {
  const names = (Array.isArray(roleNames) ? roleNames : [roleNames])
    .filter(Boolean)
    .map((name) => String(name));

  const isAdmin = names.some((name) => name.toLowerCase() === "admin");
  let effective = names;

  if (!isAdmin && status !== "approved") {
    effective = names.filter((name) => name.toLowerCase() !== "instructor");
  }

  if (effective.length === 0) {
    effective = ["learner"];
  }

  return effective;
}

function primaryRoleName(roleNames) {
  const names = Array.isArray(roleNames) ? roleNames : [];
  if (names.includes("admin")) return "admin";
  if (names.includes("instructor")) return "instructor";
  return names[0] || "learner";
}

module.exports = {
  effectiveRoleNames,
  primaryRoleName,
};
