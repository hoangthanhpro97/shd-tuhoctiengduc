export interface DatabaseRoleConfig {
  roleName: string;
  canRunDdl: boolean;
}

export function getRoleDefinition(
  role: 'shd_migrator' | 'shd_app' | 'shd_grader' | 'shd_worker' | 'shd_readonly',
): DatabaseRoleConfig {
  return {
    roleName: role,
    canRunDdl: role === 'shd_migrator',
  };
}
