/**
 * Unified role model: all role checks go through hasRole(user, role).
 * User objects are normalized in authSlice to always have roles: string[].
 */

export const ROLES = {
  LEARNER: 'learner',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

const ROLE_ID_MAP = {
  1: ROLES.LEARNER,
  2: ROLES.INSTRUCTOR,
  3: ROLES.ADMIN,
};

/**
 * Returns true if the user has the given role.
 * Works with normalized user (user.roles is array of strings).
 * @param {Object|null|undefined} user - User from auth state
 * @param {string} role - Role name: 'learner' | 'instructor' | 'admin'
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !role) return false;
  const roles = user.roles;
  if (!Array.isArray(roles)) return false;
  return roles.includes(role);
}

/**
 * Normalizes user so that user.roles is always an array of role strings.
 * Handles backend returning role (string), roles (string[]), or role IDs (number[]).
 * Does not mutate; returns a new user object.
 * @param {Object|null} user - Raw user from API or localStorage
 * @returns {Object|null} Normalized user with roles: string[]
 */
export function normalizeUser(user) {
  if (!user || typeof user !== 'object') return user;

  let roles = [];

  if (Array.isArray(user.roles)) {
    const first = user.roles[0];
    if (typeof first === 'string') {
      roles = [...user.roles];
    } else if (typeof first === 'number') {
      roles = user.roles.map((id) => ROLE_ID_MAP[id]).filter(Boolean);
    }
  } else if (typeof user.role === 'string') {
    roles = [user.role];
  }

  return {
    ...user,
    roles,
    // Keep .role as first role for any legacy/backend compatibility (single primary role)
    role: roles[0] ?? user.role,
  };
}
