import { z } from 'zod';
import { runRefresh } from '../../../server/refresh';

export async function POST(req: Request) {
  const bodyText = await req.text();
  const body = bodyText ? JSON.parse(bodyText) : {};
  const parsed = z.object({ companyOrEvent: z.string().optional() }).parse(body);
  const result = await runRefresh(parsed.companyOrEvent);
  return Response.json(result);
}
