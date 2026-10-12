/**
 * Hronika Plus <-> AppFlowy Workspace Communication Bridge
 * 
 * 1. Automatically initializes an offline local session in localStorage so that
 *    the workspace runs completely locally without external AppFlowy Cloud login.
 * 2. Bridges events between Hronika Plus (parent) and AppFlowy (iframe)
 *    via postMessage and BroadcastChannel.
 */

const LOCAL_TOKEN_KEY = 'token';
const CHANNEL_NAME = 'hronika_appflowy_channel';

// 1. Ensure local offline session exists
export function initLocalOfflineSession() {
  if (typeof window === 'undefined') return;

  try {
    const existing = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (!existing) {
      const localToken = {
        access_token: 'hronika-offline-token',
        refresh_token: 'hronika-offline-refresh',
        expires_at: 253402300799,
        user: {
          id: 'hronika-local-user',
          email: 'korisnik@hronika.plus'
        }
      };
      window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(localToken));
      console.log('[HronikaBridge] Initialized offline local user session.');
    }
  } catch (err) {
    console.warn('[HronikaBridge] Could not access localStorage:', err);
  }
}

// Run immediately on module import
initLocalOfflineSession();

// 2. Set up BroadcastChannel & Message Bridge
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (_) {}
}

export function notifyParentOfChange(action: string, payload?: unknown) {
  if (typeof window === 'undefined') return;

  const message = {
    source: 'appflowy-workspace',
    type: 'HRONIKA_APPFLOWY_SYNC',
    action,
    payload,
    timestamp: Date.now()
  };

  // 1. postMessage to parent window
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  } catch (e) {
    console.error('[HronikaBridge] Error posting to parent:', e);
  }

  // 2. BroadcastChannel
  try {
    broadcastChannel?.postMessage(message);
  } catch (_) {}
}

// 3. Listen for requests from Hronika Plus
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.source === 'hronika-plus' || data.type === 'HRONIKA_PING') {
      if (data.type === 'HRONIKA_PING') {
        try {
          event.source?.postMessage({
            source: 'appflowy-workspace',
            type: 'HRONIKA_PONG',
            status: 'online',
            timestamp: Date.now()
          }, { targetOrigin: '*' } as WindowPostMessageOptions);
        } catch (_) {
          window.parent?.postMessage({
            source: 'appflowy-workspace',
            type: 'HRONIKA_PONG',
            status: 'online',
            timestamp: Date.now()
          }, '*');
        }
      }

      if (data.type === 'HRONIKA_OPEN_ROW' && data.rowId) {
        console.log('[HronikaBridge] Received open row request:', data.rowId);
        window.dispatchEvent(new CustomEvent('hronika:open-row', { detail: data }));
      }
    }
  });

  // Announce ready after mount
  window.addEventListener('load', () => {
    notifyParentOfChange('WORKSPACE_READY', { status: 'ready' });
  });
}
