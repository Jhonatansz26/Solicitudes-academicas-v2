export interface RequestApprovedData {
  studentName: string;
  trackingNumber: string;
  requestType: string;
}

export function requestApprovedTemplate(data: RequestApprovedData) {
  return {
    subject: `Solicitud ${data.trackingNumber} aprobada`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #16a34a; padding: 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">Solicitud Aprobada</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1a2340; margin: 0 0 16px;">¡Felicitaciones, ${data.studentName}!</h2>
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 12px;">
        Tu solicitud ha sido <strong>aprobada</strong>.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #718096; font-size: 14px;">Tracking</td><td style="padding: 8px 0; font-weight: 600; color: #1a2340;">${data.trackingNumber}</td></tr>
        <tr><td style="padding: 8px 0; color: #718096; font-size: 14px;">Tipo</td><td style="padding: 8px 0; font-weight: 600; color: #1a2340;">${data.requestType}</td></tr>
      </table>
      <p style="color: #4a5568; line-height: 1.6; margin: 0;">
        Ingresa al portal para ver los detalles de tu solicitud.
      </p>
    </div>
    <div style="background: #f4f6f9; padding: 16px 24px; text-align: center;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">Este es un mensaje automático.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
