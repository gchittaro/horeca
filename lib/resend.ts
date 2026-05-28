import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendInviteEmail({
  to,
  orgName,
  inviteLink,
}: {
  to: string
  orgName: string
  inviteLink: string
}) {
  return resend.emails.send({
    from: 'HoReCa.Watch <support@horeca.watch>',
    to,
    subject: `Invitation à rejoindre ${orgName} sur HoReCa.Watch`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F8FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;padding:0 16px;">

    <!-- Header -->
    <div style="background:#26215C;border-radius:12px;padding:24px;margin-bottom:12px;">
      <div style="font-size:18px;font-weight:500;color:#fff;letter-spacing:-0.02em;">
        HoReCa<span style="color:#AFA9EC">.</span>Watch
      </div>
      <div style="font-size:12px;color:#AFA9EC;margin-top:4px;">Invitation à rejoindre une équipe</div>
    </div>

    <!-- Corps -->
    <div style="background:#fff;border:0.5px solid #CECBF6;border-radius:12px;padding:28px;">
      <p style="font-size:14px;color:#26215C;margin:0 0 18px;">
        Vous avez été invité à rejoindre une équipe sur HoReCa.Watch.
      </p>

      <!-- Bloc org -->
      <div style="background:#EEEDFE;border-radius:8px;padding:14px;margin-bottom:18px;">
        <div style="font-size:11px;color:#534AB7;font-weight:500;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em;">Organisation</div>
        <div style="font-size:16px;font-weight:500;color:#26215C;">${orgName}</div>
      </div>

      <p style="font-size:13px;color:#5F5E5A;line-height:1.7;margin:0 0 20px;">
        Pour rejoindre l'organisation, créez votre compte HoReCa.Watch avec l'adresse email sur laquelle vous avez reçu ce message (<strong style="color:#26215C;">${to}</strong>).
      </p>

      <!-- CTA -->
      <a href="${inviteLink}" style="display:inline-block;background:#26215C;color:#fff;font-size:13px;font-weight:500;padding:13px 24px;border-radius:10px;text-decoration:none;">
        Créer mon compte →
      </a>

      <p style="font-size:11px;color:#888780;margin:18px 0 0;line-height:1.6;">
        Si vous avez déjà un compte, connectez-vous — l'accès à l'organisation sera automatique.
      </p>
    </div>

    <!-- Footer -->
    <p style="font-size:11px;color:#888780;text-align:center;margin:16px 0 0;line-height:1.6;">
      <a href="https://horeca.watch" style="color:#534AB7;text-decoration:none;">HoReCa.Watch</a>
      &nbsp;·&nbsp; Vous recevez cet email car vous avez été invité par un membre de ${orgName}.
    </p>
  </div>
</body>
</html>`,
  })
}
