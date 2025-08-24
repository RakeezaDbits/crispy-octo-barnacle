interface SquareWindow extends Window {
  Square?: any;
}

declare const window: SquareWindow;

export async function initializeSquare() {
  // Mock Square payment form for development
  console.log('Initializing mock Square payment form...');
  
  return {
    card: () => ({
      attach: async (selector: string) => {
        const container = document.querySelector(selector);
        if (container) {
          container.innerHTML = `
            <div style="padding: 20px; border: 2px dashed #e5e7eb; border-radius: 8px; text-align: center; color: #6b7280;">
              <div style="margin-bottom: 16px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto;">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <h4 style="margin: 0 0 8px 0; font-weight: 500;">Mock Payment Form</h4>
              <p style="margin: 0; font-size: 14px;">Demo mode - click Complete Booking to continue</p>
            </div>
          `;
        }
      },
      tokenize: async () => {
        return {
          status: 'OK',
          token: `sq_mock_token_${Date.now()}`,
        };
      }
    })
  };
}