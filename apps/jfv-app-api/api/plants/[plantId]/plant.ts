import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePlantAction } from '../../../lib/handlers/plant-action';

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  return handlePlantAction(req, res, 'plant');
}
