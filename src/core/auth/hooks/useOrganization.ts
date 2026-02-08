import { useAuthContext } from '../AuthContext';

/**
 * Hook for organization-related data and actions
 */
export function useOrganization() {
  const { currentOrg, memberships, setCurrentOrg, isKosmosMaster } = useAuthContext();

  return {
    currentOrg,
    memberships,
    setCurrentOrg,
    isKosmosMaster: isKosmosMaster(),
    organizationId: currentOrg?.organization_id ?? null,
    organizationName: currentOrg?.organization_name ?? null,
    organizationType: currentOrg?.organization_type ?? null,
    role: currentOrg?.role ?? null,
  };
}
