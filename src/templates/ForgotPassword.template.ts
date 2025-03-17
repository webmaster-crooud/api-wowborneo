import { env } from "../configs/env";

type PropsForgotPasswordTemplate = {
	firstName: string;
	lastName: string;
	resetUrl: string;
	subject: string;
};

export const ForgotPasswordTemplate = ({ firstName, lastName, resetUrl, subject }: PropsForgotPasswordTemplate) => {
	const company = {
		name: "Wow Borneo",
		url: env.BASE_URL,
		address: {
			street: "Jl Granit Nila 12D A14 Kota Baru Driyorejo, Kec. Driyorejo",
			city: "Kab. Gresik",
			province: "Jawa Timur",
			country: "Indonesia",
			postalCode: "61177",
		},
		socialMedia: {
			ig: "test",
			fb: "test",
			thread: "test",
			tiktok: "test",
			wa: "test",
		},
	};

	return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${company.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }
    body {
      background-color: #f7fafc;
      color: #4a5568;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .header img {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #2d3748;
    }
    .content {
      padding: 20px 0;
    }
    .content h2 {
      font-size: 20px;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .content p {
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      font-size: 16px;
      color: #ffffff;
      background-color: #000000;
      border-radius: 6px;
      border: solid 1px #000000;
      text-decoration: none;
      text-align: center;
    }
    .button:hover {
      background-color: #ffffff;
      border: solid 1px #000000;
      color: #000000;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #4299e1;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .social-links {
      margin-top: 10px;
    }
    .social-links a {
      margin: 0 10px;
      color: #4a5568;
      text-decoration: none;
    }
    .social-links a:hover {
      color: #4299e1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${env.BASE_URL}/public/logo/icon.svg" alt="Company Logo" />
      <h1>${company.name}</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <p>Halo ${firstName} ${lastName},</p>
      <p>Anda telah mengajukan permintaan untuk mengatur ulang kata sandi Anda.</p>
      <p>Silakan klik tombol di bawah ini untuk mereset kata sandi Anda:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Jika tombol di atas tidak berfungsi, silakan klik link berikut:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
    </div>
    <div class="footer">
      <p>${company.address.street}</p>
      <p>${company.address.city}, ${company.address.province}</p>
      <p>${company.address.country} - ${company.address.postalCode}</p>
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Tiktok</a>
        <a href="#">Instagram</a>
        <a href="#">Thread</a>
        <a href="#">Whatsapp</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
