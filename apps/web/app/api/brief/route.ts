import { getBrief } from '../../../server/brief';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyOrEvent = searchParams.get('companyOrEvent') ?? undefined;
  const result = await getBrief({ companyOrEvent });
  return Response.json(result);
}
