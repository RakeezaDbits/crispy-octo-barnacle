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
      let isAttached = false;
      let container: Element | null = null;
      
      return {
        attach: async (selector: string) => {
          container = document.querySelector(selector);
          if (container && !isAttached) {
            // Clear any existing content
            container.innerHTML = '';
            
            // Create a simple placeholder that indicates Square is ready
            const placeholder = document.createElement('div');
            placeholder.className = 'square-mock-ready';
            placeholder.style.cssText = `
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 120px; 
              border: 2px dashed #d1d5db; 
              border-radius: 8px; 
              background: #f9fafb;
              color: #6b7280;
              font-size: 14px;
              font-family: system-ui, -apple-system, sans-serif;
            `;
            placeholder.textContent = '💳 Mock Payment Form Ready';
            
            container.appendChild(placeholder);
            isAttached = true;
          }
        },
        tokenize: async () => {
          // Simulate a small delay
          await new Promise(resolve => setTimeout(resolve, 500));
          return {
            status: 'OK',
            token: `sq_demo_token_${Date.now()}`,
          };
        },
        destroy: () => {
          try {
            // Check if container still exists in DOM
            if (container && document.body.contains(container)) {
              // Clear content safely
              container.innerHTML = '';
            }
          } catch (error) {
            // Silently ignore any DOM errors
          } finally {
            // Always reset state
            isAttached = false;
            container = null;
          }
        },
      };
    }
  };
}