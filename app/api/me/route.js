// app/api/me/route.js — the signed-in user's saved profile + partner rolodex.
import { auth } from "@/lib/auth";
import { getUserProfile, saveUserProfile, getPartners } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const email = session.user.email;
    const [profile, partners] = await Promise.all([
      getUserProfile(email),
      getPartners(email),
    ]);
    return Response.json({ profile, partners });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email)
    return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const { name, birth, intent } = await req.json();
    if (!name || !birth?.date)
      return Response.json({ error: "Name and birth details required." }, { status: 400 });
    const profile = await saveUserProfile(session.user.email, { name, birth, intent });
    return Response.json({ profile });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
