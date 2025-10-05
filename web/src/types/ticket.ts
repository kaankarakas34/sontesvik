export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'consultant';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'closed';
  userId: string;
  consultantId?: string;
  sectorId: string;
  createdAt: string;
  updatedAt: string;
}