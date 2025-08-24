interface SquareWindow extends Window {
  Square?: any;
}

declare const window: SquareWindow;

// Load Square Web Payments SDK
function loadSquareScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
}

export async function initializeSquare() {
  try {
    await loadSquareScript();
    
    if (!window.Square) {
      throw new Error('Square SDK failed to initialize');
    }

    const payments = window.Square.payments(
      import.meta.env.VITE_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-your-app-id',
      import.meta.env.VITE_SQUARE_LOCATION_ID || 'sandbox-location'
    );

    return payments;
  } catch (error) {
    console.error('Square initialization error:', error);
    // Fallback to mock for development
    return createMockSquarePayments();
  }
}

function createMockSquarePayments() {
  return {
    card: async () => {
      return {
        attach: async (selector: string) => {
          const container = document.querySelector(selector);
          if (container) {
            container.innerHTML = `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: white;">
                <div style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Card Number</label>
                  <input type="text" placeholder="1234 1234 1234 1234" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px;" />
                </div>
                <div style="display: flex; gap: 16px;">
                  <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Expiry</label>
                    <input type="text" placeholder="MM/YY" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px;" />
                  </div>
                  <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">CVV</label>
                    <input type="text" placeholder="123" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 16px;" />
                  </div>
                </div>
                <div style="margin-top: 12px; padding: 12px; background: #f3f4f6; border-radius: 6px; font-size: 14px; color: #6b7280;">
                  <strong>Demo Mode:</strong> Use any card details for testing
                </div>
              </div>
            `;
          }
        },
        tokenize: async () => {
          return {
            status: 'OK',
            token: `sq_demo_token_${Date.now()}`,
          };
        },
        destroy: () => {},
      };
    }
  };
}