import { useRouter } from 'vue-router';
import { useUserStore } from '@js/s';
import { useNotification } from '@js/composables/useNotification';

/**
 * Composable para manejar la post-autenticación (login y registro)
 * Encapsula toda la lógica de guardar datos de autenticación, actualizar store y navegar
 */
export function useAuthHandler() {
  const router = useRouter();
  const store = useUserStore();
  const { notify } = useNotification();

  /**
   * Procesa la respuesta de autenticación y prepara la app
   * @param {Object} authResponse - Response data con { token, user, active_organization_id, organizations }
   * @param {string} authResponse.token - JWT token
   * @param {Object} authResponse.user - User object
   * @param {number} authResponse.active_organization_id - Active organization ID
   * @param {Array} authResponse.organizations - List of user's organizations
   * @throws {Error} Si faltan datos críticos en la respuesta
   */
  const handleAuthSuccess = (authResponse) => {
    try {
      // Validar datos críticos
      if (!authResponse.token) {
        throw new Error('Token no recibido del servidor');
      }
      if (!authResponse.user) {
        throw new Error('Datos de usuario no recibidos');
      }
      if (!authResponse.active_organization_id) {
        throw new Error('Organización no asignada');
      }

      const { token, user, active_organization_id, organizations = [] } = authResponse;

      // Guardar token
      localStorage.setItem('token', token);

      // Guardar información del usuario
      localStorage.setItem('authuser', JSON.stringify(user));
      store.authuser = user;

      // Guardar organización activa
      localStorage.setItem('active_organization_id', JSON.stringify(active_organization_id));
      store.activeOrganizationId = active_organization_id;

      // Guardar lista de organizaciones (usando splice para mantener reactividad)
      localStorage.setItem('organizations', JSON.stringify(organizations));
      store.organizations.splice(0, store.organizations.length, ...(organizations || []));

      // Establecer estado de autenticación
      store.isLoggedIn = true;
      localStorage.setItem('isLoggedIn', JSON.stringify(true));

      // Obtener roles del usuario
      store.setUserRoles();

      // Navegar a home
      router.push({ name: 'Home' });

      return true;
    } catch (error) {
      console.error('Error en handleAuthSuccess:', error);
      notify.error(error.message || 'Error al procesar autenticación');
      throw error;
    }
  };

  /**
   * Limpia la sesión (logout)
   */
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authuser');
    localStorage.removeItem('active_organization_id');
    localStorage.removeItem('organizations');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('roles');

    store.isLoggedIn = false;
    store.authuser = null;
    store.activeOrganizationId = null;
    store.organizations.splice(0, store.organizations.length);
  };

  return {
    handleAuthSuccess,
    clearAuth,
  };
}
