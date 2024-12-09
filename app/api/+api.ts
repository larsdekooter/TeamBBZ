export async function POST(req: Request) {
  const body = await req.json();
  console.log(body);
  return await fetch(body.input, body.options);
}

export async function GET(req: Request) {
  return Response.json({ text: "peter" });
}
