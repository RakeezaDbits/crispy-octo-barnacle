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

    const script = document.createElement("script");
    script.src = "https://web.squarecdn.com/v1/square.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Square SDK"));
    document.head.appendChild(script);
  });
}

export async function initializeSquare() {
  try {
    await loadSquareScript();

    if (!window.Square) {
      throw new Error("Square SDK failed to initialize");
    }

    const payments = window.Square.payments(
      import.meta.env.VITE_SQUARE_APPLICATION_ID ||
        "sandbox-sq0idb-your-app-id",
      import.meta.env.VITE_SQUARE_LOCATION_ID || "sandbox-location",
    );

    return payments;
  } catch (error) {
    console.error("Square initialization error:", error);
    // Fallback to mock for development
    return createMockSquarePayments();
  }
}

function createMockSquarePayments() {
  return {
    card: async () => {
      let isAttached = false;
      let container: Element | null = null;
      let mockElement: Element | null = null;

      return {
        attach: async (selector: string) => {
          // Find the container
          container = document.querySelector(selector);
          if (!container || isAttached) {
            return;
          }

          try {
            // Clear any existing content safely
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }

            // Create a simple placeholder that indicates Square is ready
            mockElement = document.createElement("div");
            mockElement.className = "square-mock-ready";
            mockElement.setAttribute(
              "style",
              `
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
            `,
            );
            mockElement.textContent = "💳 Mock Payment Form Ready";

            container.appendChild(mockElement);
            isAttached = true;
          } catch (error) {
            console.warn("Error attaching mock payment form:", error);
          }
        },

        tokenize: async () => {
          // Simulate a small delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          return {
            status: "OK",
            token: `sq_demo_token_${Date.now()}`,
          };
        },

        destroy: () => {
          try {
            // Only attempt cleanup if we have references and they're still valid
            if (mockElement && container && container.contains(mockElement)) {
              container.removeChild(mockElement);
            } else if (container && document.body.contains(container)) {
              // Fallback: clear all content safely
              container.innerHTML = "";
            }
          } catch (error) {
            // Silently ignore DOM manipulation errors during cleanup
            console.warn("Error during Square cleanup:", error);
          } finally {
            // Always reset state
            isAttached = false;
            container = null;
            mockElement = null;
          }
        },
      };
    },
  };
}
