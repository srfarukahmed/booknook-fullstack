import { getAuth } from "../../../../../packages/auth/dist/index.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return (await getAuth()).handler(request);
}
export async function POST(request: Request) {
  return (await getAuth()).handler(request);
}
