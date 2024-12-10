export async function POST(req: Request) {
  const body = await req.json();
  const response = await fetch(body.input, body.options);
  return new Response(response.body);
}
