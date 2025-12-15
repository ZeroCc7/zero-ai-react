
import { User } from '../types';

export interface ApiToken {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
  scopes: string[];
}

// Simulating a PostgreSQL Database via LocalStorage
const STORAGE_KEYS = {
  USERS: 'nexus_users',
  TOKENS: 'nexus_tokens',
  CURRENT_USER: 'nexus_current_user',
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to generate Mock API Key
const generateApiKey = () => `nx_${Math.random().toString(36).substr(2)}${Math.random().toString(36).substr(2)}`;

export const MockBackend = {
  // --- Auth Services ---
  login: async (email: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: 1,
          email,
          full_name: email.split('@')[0],
          is_active: true,
          is_superuser: false
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        resolve(user);
      }, 800);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      resolve();
    });
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  // --- Token Services (Requirement 4) ---
  getTokens: async (): Promise<ApiToken[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
        if (!stored) {
          // Default mock data if empty
          const defaults: ApiToken[] = [
            { id: 't_1', name: 'Dev Environment', key: 'nx_dev_8f7s8d7f', createdAt: new Date().toISOString(), lastUsed: new Date().toISOString(), status: 'active', scopes: ['read', 'write'] },
            { id: 't_2', name: 'CI/CD Pipeline', key: 'nx_ci_9s8d7f6g', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastUsed: null, status: 'revoked', scopes: ['read'] }
          ];
          localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(defaults));
          resolve(defaults);
        } else {
          resolve(JSON.parse(stored));
        }
      }, 500);
    });
  },

  createToken: async (name: string, scopes: string[]): Promise<ApiToken> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
        const tokens: ApiToken[] = stored ? JSON.parse(stored) : [];
        
        const newToken: ApiToken = {
          id: generateId(),
          name,
          key: generateApiKey(),
          createdAt: new Date().toISOString(),
          lastUsed: null,
          status: 'active',
          scopes
        };

        const updatedTokens = [newToken, ...tokens];
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(updatedTokens));
        resolve(newToken);
      }, 600);
    });
  },

  revokeToken: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (stored) {
        const tokens: ApiToken[] = JSON.parse(stored);
        const updated = tokens.map(t => t.id === id ? { ...t, status: 'revoked' as const } : t);
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(updated));
      }
      resolve();
    });
  },
  
  deleteToken: async (id: string): Promise<void> => {
      return new Promise((resolve) => {
        const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
        if (stored) {
          const tokens: ApiToken[] = JSON.parse(stored);
          const updated = tokens.filter(t => t.id !== id);
          localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(updated));
        }
        resolve();
      });
  }
};
