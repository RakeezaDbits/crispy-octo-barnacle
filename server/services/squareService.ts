// Mock Square Service for development
class SquareService {
  async processPayment(sourceId: string, amount: number, appointment: any) {
    // Mock successful payment for development
    console.log(`Processing payment: $${amount} for appointment ${appointment.id}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `sq_payment_${Date.now()}`,
      status: "COMPLETED",
      amount: Math.round(amount * 100), // Convert to cents as regular number
      currency: "USD",
    };
  }
}

export const squareService = new SquareService();