import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
// import { getTranslations } from '@/utils/getTranslations';

export async function POST(request: Request) {
  try {
    // Lấy dữ liệu từ request
    const formData = await request.json();
    const currentYear = new Date().getFullYear();

    // Lấy translations (bạn có thể điều chỉnh locale nếu cần)
    // const { t } = await getTranslations('fr', "email");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const recipientEmails = {
    secretimmo: process.env.SECRETIMMO_EMAIL,
    nextimmo: process.env.NEXTIMMO_EMAIL
    };

    // HTML cho email người dùng
    const userEmailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px;">
      <div style="display: inline-block;">
        <img src="${process.env.NEXT_PUBLIC_BASEURL}/${formData.emailType}-logo.png" alt="Logo" style="width: 200px;" />
      </div>
      <h2 style="color: #B38E41;">Demande de propriété</h2>
      <p>Bonjour ${formData.first_name} ${formData.last_name},</p>
      <p>Nous avons bien reçu votre demande d’estimation et nous vous en remercions. Un responsable vous contactera sous peu afin de vous proposer des créneaux disponibles pour la visite sur place. Voici le récapitulatif des informations concernant votre bien à estimer:</p>
      
      <h3>Informations personnelles :</h3>
      <ul>
        <li><strong>Nom :</strong> ${formData.first_name} ${formData.last_name}</li>
        <li><strong>Email :</strong> ${formData.email}</li>
        <li><strong>Téléphone :</strong> ${formData.phone}</li>
      </ul>

      <h3>Détails de la propriété :</h3>
      <ul>
        <li><strong>Localité :</strong> ${formData.locality}</li>
        <li><strong>Type de propriété :</strong> ${formData.propertyType}</li>
        <li><strong>Surface :</strong> ${formData.surfaceArea} m²</li>
        <li><strong>Nombre de chambres :</strong> ${formData.rooms}</li>
        <li><strong>Garages :</strong> ${formData.garages || 'Aucun'}</li>
        <li><strong>Parkings :</strong> ${formData.parkings}</li>
        <li><strong>Jardin :</strong> ${formData.garden ? `${formData.garden} m²` : 'Non'}</li>
        <li><strong>Terrasse :</strong> ${formData.terrace ? `${formData.terrace} m²` : 'Non'}</li>
        <li><strong>Équipements :</strong> ${formData.equipment || 'Aucun'}</li>
      </ul>

      <p>Nous vous contacterons très prochainement.</p>
      
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="color: #999;">© ${currentYear} NextImmo. Tous droits réservés.</p>
    </div>
    `;

    // HTML cho email quản trị viên
    const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px;">
      <div style="display: inline-block;">
        <img src="${process.env.NEXT_PUBLIC_BASEURL}/${formData.emailType}-logo.png" alt="Logo" style="width: 200px;" />
      </div>
      <h2 style="color: #B38E41;">Nouvelle demande de propriété</h2>
      
      <h3>Informations personnelles :</h3>
      <ul>
        <li><strong>Nom :</strong> ${formData.first_name} ${formData.last_name}</li>
        <li><strong>Email :</strong> ${formData.email}</li>
        <li><strong>Téléphone :</strong> ${formData.phone}</li>
      </ul>

      <h3>Détails de la propriété :</h3>
      <ul>
        <li><strong>Localité :</strong> ${formData.locality}</li>
        <li><strong>Type de propriété :</strong> ${formData.propertyType}</li>
        <li><strong>Surface :</strong> ${formData.surfaceArea} m²</li>
        <li><strong>Nombre de chambres :</strong> ${formData.rooms}</li>
        <li><strong>Garages :</strong> ${formData.garages || 'Aucun'}</li>
        <li><strong>Parkings :</strong> ${formData.parkings}</li>
        <li><strong>Jardin :</strong> ${formData.garden ? `${formData.garden} m²` : 'Non'}</li>
        <li><strong>Terrasse :</strong> ${formData.terrace ? `${formData.terrace} m²` : 'Non'}</li>
        <li><strong>Équipements :</strong> ${formData.equipment || 'Aucun'}</li>
      </ul>
      
      <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="color: #999;">© ${currentYear} NextImmo. Tous droits réservés.</p>
    </div>
    `;

    // Tùy chọn gửi email cho người dùng
    const userMailOptions = {
      from: '"NextImmo" <noreply@nextimmo.lu>',
      to: formData.email,
      subject: 'Votre demande de propriété a été reçue',
      html: userEmailHtml,
    };

    // Tùy chọn gửi email cho quản trị viên
    const adminMailOptions = {
      from: '"NextImmo" <noreply@nextimmo.lu>',
      to: (recipientEmails as any)[formData.emailType] || process.env.ADMIN_EMAIL,
      subject: 'Nouvelle demande de propriété',
      html: adminEmailHtml,
    };

    // Gửi email
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending emails' }, { status: 500 });
  }
}
