import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const now = new Date()
  const semaine = getISOWeek(now)
  const annee = now.getFullYear()

  const [{ data: indicateurs }, { data: signaux }, { data: profil }] = await Promise.all([
    admin.from('indicateurs').select('nom, valeur, unite, variation_pct, source').eq('semaine', semaine).eq('annee', annee).order('variation_pct', { ascending: false }).limit(5),
    admin.from('signaux_geopolitiques').select('titre, description, zone, impact, horizon').order('fetched_at', { ascending: false }).limit(3),
    admin.from('etablissements').select('vol_cafe, vol_viandes, vol_laitiers, vol_farine, vol_huiles, vol_energie').eq('user_id', user.id).limit(1),
  ])

  const profilRow = (profil as Record<string, number>[] | null)?.[0] ?? null

  const mapping: Record<string, number> = {
    'Café arabica':     profilRow?.vol_cafe     || 0,
    'Bœuf haché 15%':  profilRow?.vol_viandes  || 0,
    'Lait entier':      profilRow?.vol_laitiers || 0,
    'Farine T55':       profilRow?.vol_farine   || 0,
    'Huile tournesol':  profilRow?.vol_huiles   || 0,
    'Électricité spot': profilRow?.vol_energie  || 0,
  }

  const total = (indicateurs || []).reduce((sum, ind) => {
    const vol = mapping[ind.nom] || 0
    return sum + Math.round(vol * ind.variation_pct / 100)
  }, 0)

  const impactBlock = total !== 0 ? `<p style="background:#EEEDFE;padding:12px;border-radius:8px;margin-top:16px;font-size:13px;color:#26215C;">
    <strong>Impact estimé sur votre établissement cette semaine :</strong>
    <span style="color:${total > 0 ? '#A32D2D' : '#3B6D11'};font-weight:600;"> ${total > 0 ? '+' : ''}${total} €</span>
  </p>` : ''

  const rows = (indicateurs || []).map(i => {
    const up = i.variation_pct > 0
    const color = up ? '#A32D2D' : i.variation_pct < 0 ? '#3B6D11' : '#534AB7'
    const arrow = up ? '↑' : i.variation_pct < 0 ? '↓' : '='
    return `<tr>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:13px;color:#26215C;">${i.nom}</td>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:13px;color:#26215C;font-weight:500;">${Number(i.valeur).toLocaleString('fr-FR')} ${i.unite}</td>
      <td style="padding:8px 0;border-bottom:0.5px solid #EEEDFE;font-size:12px;color:${color};text-align:right;">${arrow} ${i.variation_pct > 0 ? '+' : ''}${Number(i.variation_pct).toFixed(1)}%</td>
    </tr>`
  }).join('')

  const signalItems = (signaux || []).map(s =>
    `<div style="background:#F0EFF9;border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="font-size:13px;font-weight:500;color:#26215C;">${s.titre}</div>
      <div style="font-size:12px;color:#534AB7;margin-top:4px;line-height:1.5;">${s.description}</div>
      ${s.zone ? `<div style="font-size:11px;color:#888780;margin-top:6px;">Zone : ${s.zone} · ${s.horizon}</div>` : ''}
    </div>`
  ).join('')

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Prévisualisation newsletter — Semaine ${semaine}</title></head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8F8FC;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#FFD700;border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:12px;color:#333;">
      ⚠️ Prévisualisation — cet email sera envoyé demain à tous les abonnés
    </div>
    <div style="background:#26215C;border-radius:12px;padding:24px;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:500;color:#fff;">HoReCa<span style="color:#AFA9EC">.</span>Watch</div>
      <div style="font-size:12px;color:#AFA9EC;margin-top:4px;">Veille marché CHR · Semaine ${semaine}, ${annee}</div>
    </div>
    <div style="background:#fff;border:0.5px solid #CECBF6;border-radius:12px;padding:20px;margin-bottom:12px;">
      <div style="font-size:14px;font-weight:500;color:#26215C;margin-bottom:12px;">5 indicateurs clés de la semaine</div>
      ${rows ? `<table style="width:100%;border-collapse:collapse;">${rows}</table>` : '<p style="font-size:13px;color:#888780;">Données en cours de collecte pour cette semaine.</p>'}
      ${impactBlock}
    </div>
    ${signalItems ? `<div style="background:#fff;border:0.5px solid #CECBF6;border-radius:12px;padding:20px;margin-bottom:12px;">
      <div style="font-size:14px;font-weight:500;color:#26215C;margin-bottom:12px;">Signaux géopolitiques</div>
      ${signalItems}
    </div>` : ''}
    <div style="text-align:center;padding:16px;font-size:11px;color:#888780;">
      <a href="https://horeca.watch/dashboard" style="color:#534AB7;">Voir le dashboard complet</a> ·
      <a href="#" style="color:#888780;">Se désabonner</a>
    </div>
  </div></body></html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
