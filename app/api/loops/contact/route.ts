import { NextResponse } from 'next/server'
import { createLoopsContact, deleteLoopsContact, updateLoopsContact } from '@/lib/loops'

// POST — créer ou mettre à jour un contact
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, plan, typeEtablissement, region, nomEtablissement } = body
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    const result = await createLoopsContact({ email, firstName, plan, typeEtablissement, region, nomEtablissement })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erreur Loops' }, { status: 500 })
  }
}

// PUT — mettre à jour les propriétés d'un contact
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, ...data } = body
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    const result = await updateLoopsContact(email, data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erreur Loops' }, { status: 500 })
  }
}

// DELETE — supprimer un contact
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    const result = await deleteLoopsContact(email)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erreur Loops' }, { status: 500 })
  }
}
