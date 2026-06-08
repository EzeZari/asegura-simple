// Plantilla para Correo de Bienvenida
export const templateBienvenida = (nombre: string, apellido: string, dni: string, telefono: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #15803d; margin: 0;">AseguraSimple</h1>
      <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tu tranquilidad, en buenas manos</p>
    </div>
    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 20px;" />
    <p style="color: #374151; font-size: 16px;">Hola <strong>${nombre} ${apellido || ''}</strong>,</p>
    <p style="color: #374151; font-size: 16px;">Queremos darte la bienvenida formal a nuestra agencia. Ya te encontrás registrado en nuestra plataforma de gestión de seguros.</p>
    
    <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #111827; font-size: 14px; text-transform: uppercase;">Tus datos registrados:</h3>
      <p style="margin: 4px 0; font-size: 14px; color: #4b5563;"><strong>Documento / CUIT:</strong> ${dni}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #4b5563;"><strong>Teléfono de contacto:</strong> ${telefono || '-'}</p>
    </div>

    <p style="color: #374151; font-size: 16px;">Próximamente vas a recibir las copias digitales de tus pólizas vigentes y avisos de vencimiento directamente en esta casilla.</p>
    <p style="color: #374151; font-size: 16px; margin-top: 30px;">Ante cualquier consulta, no dudes en responder a este correo.</p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; text-align: center;">Este es un correo automático enviado por el sistema de gestión de AseguraSimple.</p>
  </div>
`;

// Plantilla para Aviso de Vencimiento
export const templateVencimiento = (
  nombre: string, nroPoliza: string, compania: string, tipoPoliza: string, 
  cobertura: string, fechaVencimiento: string, patente?: string | null, 
  marca?: string | null, modelo?: string | null, ubicacionRiesgo?: string | null, 
  cantidadEmpleados?: string | null
) => {
  let filaDetalleExtra = '';
  
  if ((tipoPoliza === "Automotor" || tipoPoliza === "Motovehículo") && (patente || marca || modelo)) {
    filaDetalleExtra = `
      <tr>
        <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Vehículo:</td>
        <td style="padding: 6px 0; color: #1f2937;">${marca || ''} ${modelo || ''} <span style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: bold; font-size: 12px; margin-left: 5px;">${patente ? patente.toUpperCase() : 'S/P'}</span></td>
      </tr>
    `;
  } else if ((tipoPoliza === "Combinado Familiar" || tipoPoliza === "Integral de Comercio") && ubicacionRiesgo) {
    filaDetalleExtra = `
      <tr>
        <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Ubicación:</td>
        <td style="padding: 6px 0; color: #1f2937;">${ubicacionRiesgo}</td>
      </tr>
    `;
  } else if (tipoPoliza === "ART" && cantidadEmpleados) {
    filaDetalleExtra = `
      <tr>
        <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Personal:</td>
        <td style="padding: 6px 0; color: #1f2937;">${cantidadEmpleados} Empleados declarados</td>
      </tr>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; border-top: 6px solid #ea580c;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #ea580c; margin: 0; font-size: 22px;">Recordatorio de Vencimiento</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Evitá quedarte sin cobertura en tus bienes</p>
      </div>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Te contactamos desde nuestra agencia para informarte que tu póliza de seguro está próxima a finalizar su vigencia de cobertura. A continuación, te detallamos los datos técnicos del riesgo:</p>
      
      <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #9a3412; width: 35%;">Póliza Nro:</td>
            <td style="padding: 6px 0; color: #1f2937; font-family: monospace; font-size: 15px;">#${nroPoliza}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Compañía:</td>
            <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${compania}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Ramo / Riesgo:</td>
            <td style="padding: 6px 0; color: #1f2937;">${tipoPoliza}</td>
          </tr>
          
          ${filaDetalleExtra}
          
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Plan / Cobertura:</td>
            <td style="padding: 6px 0; color: #1f2937;">${cobertura || 'Detalle según condiciones generales'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #c2410c; font-size: 15px; border-top: 1px dashed #fed7aa;">FECHA FIN:</td>
            <td style="padding: 8px 0; color: #9a3412; font-size: 16px; font-weight: bold; border-top: 1px dashed #fed7aa;">${fechaVencimiento} a las 12:00 hs</td>
          </tr>
        </table>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;"><strong>¿Cómo proceder?</strong><br>Para coordinar la renovación del riesgo o evaluar mejoras en los costos y planes vigentes, simplemente podés responder a este correo electrónico o comunicarte directamente a nuestras vías de contacto habituales.</p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Este es un aviso informativo automatizado enviado por el asesor de seguros a través de AseguraSimple.</p>
    </div>
  `;
};

// Plantilla para Notificación de Siniestro
export const templateSiniestro = (
  nombre: string, nroSiniestro: string, nroPoliza: string, compania: string, 
  tipoPoliza: string, patente: string | null, descripcionNovedad: string, urlSeguimiento: string
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; border-top: 6px solid #ea580c;">
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="color: #ea580c; margin: 0; font-size: 22px;">Seguimiento de Siniestro</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tu reclamo se encuentra activo y en gestión</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Te notificamos que se ha registrado una novedad importante en el expediente de tu siniestro administrado por nuestra agencia:</p>
    
    <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; margin: 24px 0;">
      <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #9a3412; width: 35%;">Expediente Nro:</td>
          <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-family: monospace;">#${nroSiniestro}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Póliza Afectada:</td>
          <td style="padding: 6px 0; color: #1f2937; font-family: monospace;">#${nroPoliza}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Compañía:</td>
          <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${compania}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Riesgo / Objeto:</td>
          <td style="padding: 6px 0; color: #1f2937;">${tipoPoliza} ${patente ? `[${patente.toUpperCase()}]` : ''}</td>
        </tr>
      </table>
      
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #fed7aa; color: #1f2937; font-size: 14px; line-height: 1.5;">
        <strong>Detalle de la actualización registrada:</strong>
        <p style="margin: 6px 0 0 0; color: #4b5563; font-style: italic; padding: 10px; border-radius: 6px; border: 1px solid #ffedd5;">"${descripcionNovedad}"</p>
      </div>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;"><strong>¿Cómo seguir el avance en vivo?</strong><br>No necesitás recordar usuarios ni claves. Haciendo clic en el botón de abajo podés entrar de forma directa y segura a tu portal de asegurado para ver el historial cronológico completo de gestiones:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${urlSeguimiento}" target="_blank" style="background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px;">Ver el Estado de mi Trámite</a>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
    <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Este es un aviso automático de cortesía enviado a través de AseguraSimple.</p>
  </div>
`;
// Plantilla para Confirmación de Cuenta (Registro)
export const templateConfirmacionCuenta = (nombre: string, verifyUrl: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; border-top: 6px solid #15803d; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="color: #15803d; margin: 0; font-size: 24px; letter-spacing: -0.5px;">¡Bienvenido a AseguraSimple!</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tu plataforma de gestión inteligente de seguros</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Estamos muy contentos de que te sumes. Para garantizar la seguridad de tu cuenta y habilitar tu acceso al panel, necesitamos verificar tu dirección de correo electrónico.</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 25px; border-radius: 12px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 20px 0; color: #166534; font-size: 15px; font-weight: 500;">Hacé clic en el siguiente botón para activar tu cuenta:</p>
      <a href="${verifyUrl}" style="background-color: #15803d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(21, 128, 61, 0.2);">Confirmar mi correo</a>
    </div>
    
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Una vez confirmado, vas a poder ingresar inmediatamente con la contraseña que creaste.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
      <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">¿El botón no funciona? Copiá y pegá este enlace de forma segura en tu navegador:</p>
      <p style="color: #15803d; font-size: 12px; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">${verifyUrl}</p>
    </div>
    
    <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 30px;">Si no creaste esta cuenta, podés desestimar este mensaje con total tranquilidad.</p>
  </div>
`;

// Plantilla para Código 2FA
export const template2FA = (nombre: string, codigo2fa: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
    <h2 style="color: #15803d; text-align: center;">Código de Acceso</h2>
    <p style="color: #374151; font-size: 16px;">Hola ${nombre},</p>
    <p style="color: #374151; font-size: 16px;">Tu código de seguridad para iniciar sesión es:</p>
    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${codigo2fa}</span>
    </div>
    <p style="color: #6b7280; font-size: 14px; text-align: center;">Si no intentaste iniciar sesión, cambiá tu contraseña de inmediato.</p>
  </div>
`;

// Plantilla para Recuperación de Contraseña
export const templateRecuperarPassword = (nombre: string, resetUrl: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #15803d;">AseguraSimple</h2>
    <p>Hola ${nombre},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #15803d; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
    <p>Este enlace es válido por 1 hora.</p>
    <p style="font-size: 12px; color: #666;">Si no solicitaste este cambio, podés ignorar este correo tranquilamente.</p>
  </div>
`;