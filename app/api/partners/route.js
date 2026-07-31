// app/api/partners/route.js — the saved-partner rolodex.
import { auth } from "@/lib/auth";
import { upsertPartner, removePartner } from "@/lib/store";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email)
    return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const { name, birth, lastScore } = await req.json();
    if (!name || !birth?.date)
      return Response.json({ error: "Partner name and birth details required." }, { status: 400 });
    const partners = await upsertPartner(session.user.email, { name, birth, lastScore });
    return Response.json({ partners });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.email)
    return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const { id } = await req.json();
    const partners = await removePartner(session.user.email, id);
    return Response.json({ partners });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
