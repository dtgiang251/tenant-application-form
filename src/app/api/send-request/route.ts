import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { IncomingMessage } from 'http';


interface ProfessionalDetail {
  status: string;
  statusOther?: string;
  currentProfession: string;
  employerName: string;
  employmentStartDate: string;
  seniorityInPosition: string;
}

export async function POST(request: Request) {

  const form = new IncomingForm(); 

  // Chuyển request thành Promise để xử lý dữ liệu
  const formData = await new Promise<any>((resolve, reject) => {
    form.parse(request as unknown as IncomingMessage, (err: Error | null, fields: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(fields);
      }
    });
  });

  try {
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

    // HTML cho email người dùng
const userEmailHtml = `
<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px;">
  <div style="display: inline-block;">
    <img src="${process.env.NEXT_PUBLIC_BASEURL}/email-logo.png" alt="Logo" style="width: 200px;" />
  </div>
  <h2 style="color: #B38E41;">Confirmation de votre demande de location</h2>
  <p>Bonjour ${formData.full_name},</p>
  <p>Nous avons bien reçu votre formulaire de demande de location. Voici un résumé de vos informations :</p>
  
  <h3>Informations personnelles :</h3>
  <ul>
    <li><strong>Nom :</strong> ${formData.full_name}</li>
    <li><strong>Date de naissance :</strong> ${formData.birth_date}</li>
    <li><strong>Nationalité :</strong> ${formData.nationality}</li>
    <li><strong>Adresse :</strong> ${formData.current_address}</li>
    <li><strong>Adresse depuis :</strong> ${formData.address_since}</li>
    <li><strong>Email :</strong> ${formData.email}</li>
    <li><strong>Téléphone :</strong> ${formData.mobile_phone}</li>
  </ul>

  ${formData.co_applicant_name ? `
  <h3>Informations du co-demandeur :</h3>
  <ul>
    <li><strong>Nom :</strong> ${formData.co_applicant_name}</li>
    <li><strong>Date de naissance :</strong> ${formData.co_applicant_birth_date}</li>
    <li><strong>Nationalité :</strong> ${formData.co_applicant_nationality}</li>
    <li><strong>Email :</strong> ${formData.co_applicant_email}</li>
    <li><strong>Téléphone :</strong> ${formData.co_applicant_mobile}</li>
  </ul>
  ` : ''}

  <h3>Situation résidentielle :</h3>
  <ul>
    <li><strong>Situation actuelle :</strong> ${formData.current_housing_situation}</li>
    <li><strong>Nombre total de personnes :</strong> ${formData.total_people}</li>
    <li><strong>Nombre d'adultes :</strong> ${formData.adults_count}</li>
    <li><strong>Nombre d'enfants :</strong> ${formData.children_count}</li>
  </ul>

  <h3>Situation professionnelle :</h3>
  ${formData.professionalDetails.map((detail: ProfessionalDetail, index: number) => `
  <h4>Personne ${index + 1}</h4>
  <ul>
    <li><strong>Statut :</strong> ${detail.status}</li>
    ${detail.statusOther ? `<li><strong>Autre statut :</strong> ${detail.statusOther}</li>` : ''}
    <li><strong>Profession :</strong> ${detail.currentProfession}</li>
    <li><strong>Employeur :</strong> ${detail.employerName}</li>
    <li><strong>Date de début :</strong> ${detail.employmentStartDate}</li>
    <li><strong>Ancienneté :</strong> ${detail.seniorityInPosition}</li>
  </ul>
  `).join('')}

  <h3>Détails de la demande :</h3>
  <ul>
    <li><strong>Date d'entrée souhaitée :</strong> ${formData.desired_move_in_date}</li>
    <li><strong>Animaux :</strong> ${formData.pets}</li>
    <li><strong>Fumeurs :</strong> ${formData.smokers}</li>
  </ul>

  <p>Notre équipe va examiner votre dossier et vous recontactera dans les meilleurs délais.</p>
  
  <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
  <p style="color: #999;">© ${currentYear} NextImmo. Tous droits réservés.</p>
</div>
`;

// HTML cho email quản trị viên
const adminEmailHtml = `
<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px;">
  <div style="display: inline-block;">
    <img src="${process.env.NEXT_PUBLIC_BASEURL}/email-logo.png" alt="Logo" style="width: 200px;" />
  </div>
  <h2 style="color: #B38E41;">Nouvelle demande de location</h2>
  
  <h3>Informations du candidat principal :</h3>
  <ul>
    <li><strong>Nom :</strong> ${formData.full_name}</li>
    <li><strong>Date de naissance :</strong> ${formData.birth_date}</li>
    <li><strong>Nationalité :</strong> ${formData.nationality}</li>
    <li><strong>Adresse :</strong> ${formData.current_address}</li>
    <li><strong>Adresse depuis :</strong> ${formData.address_since}</li>
    <li><strong>Email :</strong> ${formData.email}</li>
    <li><strong>Téléphone :</strong> ${formData.mobile_phone}</li>
  </ul>

  ${formData.co_applicant_name ? `
  <h3>Informations du co-demandeur :</h3>
  <ul>
    <li><strong>Nom :</strong> ${formData.co_applicant_name}</li>
    <li><strong>Date de naissance :</strong> ${formData.co_applicant_birth_date}</li>
    <li><strong>Nationalité :</strong> ${formData.co_applicant_nationality}</li>
    <li><strong>Email :</strong> ${formData.co_applicant_email}</li>
    <li><strong>Téléphone :</strong> ${formData.co_applicant_mobile}</li>
  </ul>
  ` : ''}

  <h3>Situation résidentielle :</h3>
  <ul>
    <li><strong>Situation actuelle :</strong> ${formData.current_housing_situation}</li>
    <li><strong>Détails supplémentaires :</strong> ${formData.current_housing_other || 'N/A'}</li>
    <li><strong>Nombre total de personnes :</strong> ${formData.total_people}</li>
    <li><strong>Nombre d'adultes :</strong> ${formData.adults_count}</li>
    <li><strong>Nombre d'enfants :</strong> ${formData.children_count}</li>
    <li><strong>Détails du ménage :</strong> ${formData.household_details || 'N/A'}</li>
  </ul>

  <h3>Situation professionnelle :</h3>
  ${formData.professionalDetails.map((detail: ProfessionalDetail, index: number) => `
  <h4>Personne ${index + 1}</h4>
  <ul>
    <li><strong>Statut :</strong> ${detail.status}</li>
    ${detail.statusOther ? `<li><strong>Autre statut :</strong> ${detail.statusOther}</li>` : ''}
    <li><strong>Profession :</strong> ${detail.currentProfession}</li>
    <li><strong>Employeur :</strong> ${detail.employerName}</li>
    <li><strong>Date de début :</strong> ${detail.employmentStartDate}</li>
    <li><strong>Ancienneté :</strong> ${detail.seniorityInPosition}</li>
  </ul>
  `).join('')}

  <h3>Revenus et stabilité financière :</h3>
  <ul>
    <li><strong>Revenu mensuel du ménage :</strong> ${formData.monthly_household_income}</li>
    <li><strong>Source de revenus :</strong> ${formData.income_source}</li>
    ${formData.income_source_other ? `<li><strong>Autre source de revenus :</strong> ${formData.income_source_other}</li>` : ''}
    <li><strong>Garantie locative :</strong> ${formData.rental_guarantee}</li>
  </ul>

  <h3>Informations pratiques :</h3>
  <ul>
    <li><strong>Date d'entrée souhaitée :</strong> ${formData.desired_move_in_date}</li>
    <li><strong>Durée de bail souhaitée :</strong> ${formData.desired_lease_duration}</li>
    <li><strong>Animaux :</strong> ${formData.pets} ${formData.pets === 'oui' ? `(${formData.pets_details})` : ''}</li>
    <li><strong>Fumeurs :</strong> ${formData.smokers}</li>
  </ul>

  <h3>Historique locatif :</h3>
  <ul>
    <li><strong>Dernier propriétaire :</strong> ${formData.last_landlord_name || 'N/A'}</li>
    <li><strong>Contact du dernier propriétaire :</strong> ${formData.last_landlord_contact || 'N/A'}</li>
    <li><strong>Durée du dernier bail :</strong> ${formData.last_lease_duration || 'N/A'}</li>
    <li><strong>Raison du départ :</strong> ${formData.departure_reason || 'N/A'}</li>
  </ul>

  <h3>Contact en cas d'urgence :</h3>
  <ul>
    <li><strong>Nom :</strong> ${formData.emergency_contact_name}</li>
    <li><strong>Relation :</strong> ${formData.emergency_contact_relation}</li>
    <li><strong>Téléphone :</strong> ${formData.emergency_contact_phone}</li>
  </ul>

  <h3>Consentement :</h3>
  <ul>
    <li><strong>Consentement au traitement des données :</strong> ${formData.data_consent ? 'Oui' : 'Non'}</li>
    <li><strong>Consentement à la durée de conservation :</strong> ${formData.data_consent_duration ? 'Oui' : 'Non'}</li>
  </ul>

  <p>Un nouveau dossier de location a été soumis et nécessite votre attention.</p>
  
  <hr style="border-top: 1px solid #ddd; margin: 20px 0;" />
  <p style="color: #999;">© ${currentYear} NextImmo. Tous droits réservés.</p>
</div>
`;


// Tùy chọn gửi email cho người dùng
const userMailOptions = {
  from: '"NextImmo" <noreply@nextimmo.lu>',
  to: formData.email,
  subject: 'Confirmation de votre demande de location',
  html: userEmailHtml,
};

// Tùy chọn gửi email cho quản trị viên
const adminMailOptions = {
  from: '"NextImmo" <noreply@nextimmo.lu>',
  to: process.env.ADMIN_EMAIL,
  subject: 'Nouvelle demande de location',
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
