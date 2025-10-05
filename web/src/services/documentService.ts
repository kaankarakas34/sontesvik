import { apiMethods } from './api';

export interface MyDocument {
  id: number;
  fileName: string;
  fileType: string;
  status: string;
  uploadedAt: string;
  type: {
    name: string;
    description: string;
  };
}

export const getMyDocumentsForIncentive = async (incentiveId: string): Promise<MyDocument[]> => {
  const response = await apiMethods.get(`/documents/my-documents/incentive/${incentiveId}`);
  return response.data.data;
};