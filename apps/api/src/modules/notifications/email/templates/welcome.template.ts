export interface WelcomeData {
  fullName: string;
  role: string;
}

export function welcomeTemplate(data: WelcomeData) {
  return {
    subject: 'Bienvenido al Sistema de Solicitudes Académicas',
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #1a2340; padding: 24px; text-align: center;">
      <h1 style="color: #E8A820; margin: 0; font-size: 20px;">Solicitudes Académicas</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1a2340; margin: 0 0 16px;">¡Bienvenido, ${data.fullName}!</h2>
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 12px;">
        Tu cuenta ha sido creada exitosamente en el sistema de Solicitudes Académicas.
      </p>
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 12px;">
        <strong>Rol asignado:</strong> ${data.role}
      </p>
      <p style="color: #4a5568; line-height: 1.6; margin: 0;">
        Ingresa al portal con tu correo institucional y la contraseña proporcionada por el administrador.
      </p>
    </div>
    <div style="background: #f4f6f9; padding: 16px 24px; text-align: center;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">Este es un mensaje automático. Por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
