// Generate a unique session ID for guest users
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('guest_session_id');
  
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_session_id', sessionId);
  }
  
  return sessionId;
};

// Clear session ID when user logs in
export const clearGuestSession = (): void => {
  localStorage.removeItem('guest_session_id');
};
