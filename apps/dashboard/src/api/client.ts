import axios from 'axios';
import { demoApi } from './demo';

type ApiResponse<T> = Promise<{ data: T }>;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  timeout: 2500,
});

const demoFallbackEnabled = import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true';
const forceLocalDemo = import.meta.env.VITE_USE_LOCAL_DEMO === 'true' || import.meta.env.VITE_API_BASE_URL === 'demo';

function shouldUseDemoFallback(err: unknown) {
  return (
    demoFallbackEnabled
    && axios.isAxiosError(err)
    && (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')
  );
}

async function withDemoFallback<T>(
  request: () => Promise<{ data: T }>,
  fallback: () => T | Promise<T>,
): ApiResponse<T> {
  if (forceLocalDemo) {
    const data = await fallback();
    return { data };
  }

  try {
    return await request();
  } catch (err) {
    if (!shouldUseDemoFallback(err)) throw err;
    const data = await fallback();
    return { data };
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const requestUrl = err.config?.url ?? '';
    const isLoginRequest = requestUrl.endsWith('/auth/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('dw_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    withDemoFallback(() => api.post<{ accessToken: string }>('/auth/login', { email, password }), () =>
      demoApi.login(email, password)),
  register: (name: string, email: string, password: string) =>
    withDemoFallback(() => api.post<{ accessToken: string }>('/auth/register', { name, email, password }), () =>
      demoApi.register(name, email)),
  me: () => withDemoFallback(() => api.get('/auth/me'), () => demoApi.me()),
};

export const adminApi = {
  stats: () => withDemoFallback(() => api.get('/admin/stats'), () => demoApi.stats()),
  users: () => withDemoFallback(() => api.get('/admin/users'), () => demoApi.users()),
  trips: () => withDemoFallback(() => api.get('/admin/trips'), () => demoApi.trips()),
  events: () => withDemoFallback(() => api.get('/admin/events'), () => demoApi.events()),
  heatmap: () => withDemoFallback(() => api.get('/admin/heatmap'), () => demoApi.heatmap()),
  roadIntelligence: () => withDemoFallback(() => api.get('/admin/road-intelligence'), () => demoApi.roadIntelligence()),
  dataSources: () => withDemoFallback(() => api.get('/admin/data-sources'), () => demoApi.dataSources()),
};

export const simulationApi = {
  scenarios: () => withDemoFallback(() => api.get('/simulation/scenarios'), () => demoApi.scenarios()),
  generate: (scenarioId: string) =>
    withDemoFallback(() => api.post('/simulation/trips/generate', { scenarioId }), () => demoApi.generate(scenarioId)),
};

export const ingestionApi = {
  importOsm: () => withDemoFallback(() => api.post('/ingestion/osm/import'), () => demoApi.importOsm()),
  importTraffic: () => withDemoFallback(() => api.post('/ingestion/traffic/import'), () => demoApi.importTraffic()),
  logs: () => withDemoFallback(() => api.get('/ingestion/logs'), () => demoApi.logs()),
  providerStatus: () => withDemoFallback(() => api.get('/ingestion/provider-status'), () => demoApi.providerStatus()),
  trafficEvents: () => withDemoFallback(() => api.get('/traffic-events'), () => demoApi.trafficEvents()),
};

export const tripsApi = {
  list: () => withDemoFallback(() => api.get('/trips'), () => demoApi.tripList()),
  get: (id: string) => withDemoFallback(() => api.get(`/trips/${id}`), () => demoApi.trip(id)),
  points: (id: string) => withDemoFallback(() => api.get(`/trips/${id}/points`), () => demoApi.points(id)),
  events: (id: string) => withDemoFallback(() => api.get(`/trips/${id}/events`), () => demoApi.tripEvents(id)),
  scoreBreakdown: (id: string) =>
    withDemoFallback(() => api.get(`/trips/${id}/score-breakdown`), () => demoApi.scoreBreakdown(id)),
};

export const scoresApi = {
  summary: () => withDemoFallback(() => api.get('/scores/me/summary'), () => demoApi.scoreSummary()),
  monthly: () => withDemoFallback(() => api.get('/scores/me/monthly'), () => demoApi.monthly()),
  achievements: () => withDemoFallback(() => api.get('/scores/me/achievements'), () => demoApi.achievements()),
  weeklyReport: () => withDemoFallback(() => api.get('/scores/me/weekly-report'), () => demoApi.weeklyReport()),
};
