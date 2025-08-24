export function getAdminToken(): string | null {
  return localStorage.getItem('adminToken');
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  
  try {
    // Basic token validation - in production, you'd verify with server
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
}

export function generateToken(userId: number, username: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId,
    username,
    role: "admin",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple JWT-like token for demo purposes
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = btoa(`secret_${userId}_${payload.exp}`);
  
  return `${headerB64}.${payloadB64}.${signature}`;
}