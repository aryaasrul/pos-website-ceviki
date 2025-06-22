import { supabase } from '../lib/supabaseClient';

/**
 * Check if current user has permission for specific action
 * @param {string} action - The action to check permission for
 * @param {string} resource - Optional resource context
 * @returns {Promise<boolean>} - Returns true if user has permission
 */
export const checkPermission = async (action, resource = null) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_user_permission', { 
        p_action: action,
        p_resource: resource 
      });
    
    if (error) {
      console.error('Permission check error:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * Get current user info from database
 * @returns {Promise<Object>} - Returns user info object
 */
export const getCurrentUserInfo = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_current_user_info');
    
    if (error) {
      console.error('Get user info error:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Get user info failed:', error);
    return null;
  }
};

/**
 * Log security event
 * @param {string} action - The action performed
 * @param {string} resource - The resource accessed
 * @param {boolean} allowed - Whether action was allowed
 * @param {Object} metadata - Additional metadata
 */
export const logSecurityEvent = async (action, resource, allowed, metadata = {}) => {
  try {
    await supabase.rpc('log_security_event', {
      p_action: action,
      p_resource: resource,
      p_allowed: allowed,
      p_metadata: metadata
    });
  } catch (error) {
    console.error('Security logging failed:', error);
  }
};

/**
 * Permission constants for consistency
 */
export const PERMISSIONS = {
  // Product Management
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_PRODUCTS: 'view_products',
  
  // Employee Management
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_EMPLOYEES: 'view_employees',
  
  // Transaction Management
  CREATE_ORDER: 'create_order',
  VIEW_ALL_TRANSACTIONS: 'view_all_transactions',
  VIEW_OWN_TRANSACTIONS: 'view_own_transactions',
  
  // Inventory Management
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // Reports & Analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Expense Management
  CREATE_EXPENSE: 'create_expense',
  VIEW_ALL_EXPENSES: 'view_all_expenses',
  VIEW_OWN_EXPENSES: 'view_own_expenses',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings'
};

/**
 * Role-based permission matrix
 */
export const ROLE_PERMISSIONS = {
  owner: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_ALL_TRANSACTIONS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.CREATE_EXPENSE,
    PERMISSIONS.VIEW_ALL_EXPENSES,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  kasir_senior: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_ALL_TRANSACTIONS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_EXPENSE,
    PERMISSIONS.VIEW_ALL_EXPENSES
  ],
  kasir: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_OWN_TRANSACTIONS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_EXPENSE,
    PERMISSIONS.VIEW_OWN_EXPENSES
  ]
};

/**
 * Check permission locally (faster, but less secure)
 * Use this for UI showing/hiding, but always validate on backend
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermissionLocal = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Higher-order component to protect components
 * @param {React.Component} Component - Component to protect
 * @param {string} requiredPermission - Required permission
 * @returns {React.Component}
 */
export const withPermission = (Component, requiredPermission) => {
  return (props) => {
    const [hasPermission, setHasPermission] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const check = async () => {
        const allowed = await checkPermission(requiredPermission);
        setHasPermission(allowed);
        setLoading(false);
        
        // Log unauthorized access attempts
        if (!allowed) {
          await logSecurityEvent(
            'unauthorized_access_attempt',
            Component.name,
            false,
            { requiredPermission }
          );
        }
      };
      
      check();
    }, []);

    if (loading) {
      return <div>Checking permissions...</div>;
    }

    if (!hasPermission) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this feature.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * React Hook for permission checking
 * @param {string} permission - Permission to check
 * @returns {Object} - { hasPermission, loading, error }
 */
export const usePermission = (permission) => {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const checkUserPermission = async () => {
      try {
        setLoading(true);
        const allowed = await checkPermission(permission);
        
        if (mounted) {
          setHasPermission(allowed);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setHasPermission(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkUserPermission();

    return () => {
      mounted = false;
    };
  }, [permission]);

  return { hasPermission, loading, error };
};

/**
 * Utility to check multiple permissions at once
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {Promise<Object>} - Object with permission results
 */
export const checkMultiplePermissions = async (permissions) => {
  const results = {};
  
  for (const permission of permissions) {
    results[permission] = await checkPermission(permission);
  }
  
  return results;
};

/**
 * Get user's maximum allowed discount
 * @returns {Promise<number>} - Maximum discount percentage
 */
export const getMaxDiscount = async () => {
  try {
    const userInfo = await getCurrentUserInfo();
    return userInfo?.max_discount || 0;
  } catch (error) {
    console.error('Get max discount failed:', error);
    return 0;
  }
};

// Export everything
export default {
  checkPermission,
  getCurrentUserInfo,
  logSecurityEvent,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermissionLocal,
  withPermission,
  usePermission,
  checkMultiplePermissions,
  getMaxDiscount
};