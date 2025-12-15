
import { User, AuthResponse, Conversation, Message, LLMKey, UserApiToken } from '../types';

export const getBaseUrl = () => {
  return "/api/v1";
};

export const setApiUrl = (url: string) => {
  localStorage.setItem('nexus_api_url', url);
};

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(JSON.stringify(errorData));
  }
  return response.json();
};

export const api = {
  // --- Auth ---
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // NOTE: We do NOT set Content-Type header explicitly here.
      // fetch with URLSearchParams automatically sets 'application/x-www-form-urlencoded;charset=UTF-8'
      // This is often safer for CORS and boundary handling.
      const response = await fetch(`${getBaseUrl()}/login/access-token`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(response);
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
         throw new Error("网络错误：无法连接后端，请检查 CORS 设置与服务器地址。");
      }
      throw error;
    }
  },

  register: async (email: string, password: string, fullName?: string): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    return handleResponse(response);
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updateMe: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // --- User Management (Admin) ---
  getUsers: async (skip = 0, limit = 100): Promise<User[]> => {
    const response = await fetch(`${getBaseUrl()}/users/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createUser: async (user: Partial<User> & { password: string }): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  updateUser: async (id: number, data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ detail: response.statusText }));
       throw new Error(JSON.stringify(errorData));
    }
  },

  // --- User Access Tokens (Developer API) ---
  getUserTokens: async (): Promise<UserApiToken[]> => {
    const response = await fetch(`${getBaseUrl()}/users/me/tokens`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createUserToken: async (name: string): Promise<UserApiToken> => {
    const response = await fetch(`${getBaseUrl()}/users/me/tokens`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  deleteUserToken: async (id: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/users/me/tokens/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ detail: response.statusText }));
       throw new Error(JSON.stringify(errorData));
    }
  },

  // --- Conversations ---
  getConversations: async (skip = 0, limit = 100): Promise<Conversation[]> => {
    const response = await fetch(`${getBaseUrl()}/conversations/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createConversation: async (title: string): Promise<Conversation> => {
    const response = await fetch(`${getBaseUrl()}/conversations/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    return handleResponse(response);
  },

  getMessages: async (conversationId: number, skip = 0, limit = 100): Promise<Message[]> => {
    const response = await fetch(`${getBaseUrl()}/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  deleteConversation: async (conversationId: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(JSON.stringify(errorData));
    }
  },

  // --- Streaming Chat ---
  streamChat: async function* (conversationId: number, message: string, modelName: string) {
    const response = await fetch(`${getBaseUrl()}/conversations/${conversationId}/chat`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Accept': 'text/event-stream', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ message, model_name: modelName }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to connect to chat stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastPayload = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let eventSep = buffer.indexOf('\n\n');
        let altSep = buffer.indexOf('\r\n\r\n');
        if (eventSep === -1 && altSep !== -1) eventSep = altSep;
        while (eventSep !== -1) {
          const rawEvent = buffer.slice(0, eventSep);
          buffer = buffer.slice(eventSep + (eventSep === altSep ? 4 : 2));

          const lines = rawEvent.split(/\r?\n/);
          for (const ln of lines) {
            if (!ln.startsWith('data:')) continue;
            const payload = ln.slice(5);
            if (payload.length === 0) continue;
            if (payload === '[DONE]') return;
            if (payload === lastPayload) continue;
            lastPayload = payload;
            try {
              yield JSON.parse(payload);
            } catch {
              yield payload;
            }
          }

          eventSep = buffer.indexOf('\n\n');
          altSep = buffer.indexOf('\r\n\r\n');
          if (eventSep === -1 && altSep !== -1) eventSep = altSep;
        }
      }

      const tail = buffer.trim();
      if (tail) {
        const lines = tail.split(/\r?\n/);
        for (const ln of lines) {
          if (!ln.startsWith('data:')) continue;
          const payload = ln.slice(5);
          if (payload.length === 0) continue;
          if (payload === '[DONE]') return;
          if (payload === lastPayload) continue;
          lastPayload = payload;
          try {
            yield JSON.parse(payload);
          } catch {
            yield payload;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // --- LLM Keys ---
  getMyKeys: async (): Promise<LLMKey[]> => {
    const response = await fetch(`${getBaseUrl()}/llm/my-keys`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  addKey: async (modelName: string, apiKey: string, baseUrl?: string): Promise<LLMKey> => {
    const response = await fetch(`${getBaseUrl()}/llm/my-keys`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        model_name: modelName, 
        api_key: apiKey, 
        base_url: baseUrl, 
        is_active: true 
      }),
    });
    return handleResponse(response);
  },

  validateKey: async (id: number): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/llm/my-keys/${id}/validate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};
