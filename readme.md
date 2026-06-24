# 🛡️ AseguraSimple

**Sistema de Gestión Integral para Productores de Seguros** *Proyecto de Tesis - Ingeniería en Sistemas*

## 📝 Descripción
AseguraSimple es una plataforma web diseñada para optimizar el trabajo de los productores de seguros. Permite centralizar la información de los clientes, administrar las pólizas, recibir alertas de vencimiento y gestionar los siniestros de manera eficiente.

## 🏗️ Arquitectura y Tecnologías
El proyecto está construido bajo una arquitectura moderna de 3 capas (Cliente-Servidor Web), dividida en dos repositorios principales dentro de este proyecto:

### 1. Frontend (Carpeta `/frontend`)
Encargado de la interfaz de usuario, el consumo de la API y la experiencia visual del productor.
* **Framework:** Next.js (React).
* **Lenguaje:** TypeScript (`tsconfig.json`).
* **Estilos:** Tailwind CSS procesado con PostCSS (`postcss.config.mjs`).
* **Manejo de Estado:** Gestión global de sesión y autenticación (`authStore.ts`).
* **UX / Onboarding Contextual:** Sistema de tours interactivos para guiar a los usuarios nuevos (`TutorialTour.tsx`, `TutorialTourAsegurados.tsx`, etc.).
* **Componentes UI Reutilizables:** Tablas dinámicas y ordenables, modales de confirmación, sistema de alertas (Toasts) y menús de acciones (`Table.tsx`, `ConfirmModal.tsx`, `Toast.tsx`, `ActionMenu.tsx`).

### 2. Backend (Carpeta `/backend`)
Encargado de la lógica de negocio central, la seguridad, la exposición de la API REST y la comunicación con la base de datos.
* **Entorno:** Node.js con Express.
* **Lenguaje:** TypeScript (`tsconfig.json`).
* **ORM:** Prisma para el modelado y migraciones de la base de datos (`schema.prisma`, `prisma.config.ts`).
* **Almacenamiento de Archivos:** Integración con la nube mediante Supabase (`supabase.ts`) y middleware para la subida de documentos e imágenes (`upload.middleware.ts`).
* **Integración de Pagos:** Conexión con la pasarela de Mercado Pago (`mp.controller.ts`, `mp.routes.ts`).
* **Mailing y Notificaciones:** Servicio propio de envío de correos electrónicos utilizando plantillas HTML personalizadas (`email.service.ts`, `emailTemplates.ts`, `mailer.ts`).
* **Automatización:** Ejecución de tareas programadas (Cron Jobs) para revisión de vencimientos y alertas automáticas (`cron.service.ts`).
* **Seguridad y Permisos:** Middlewares robustos para validar la autenticación, los roles del equipo de trabajo y los límites o capacidades de cada plan de suscripción (`auth.middleware.ts`, `role.middleware.ts`, `suscripcion.middleware.ts`, `verificarLimites.ts`).

### 3. Base de Datos
* **Motor:** PostgreSQL.

---

## 🚀 Estado del Proyecto
El proyecto se encuentra en una fase de desarrollo avanzado y funcional. Cuenta con módulos integrales listos, incluyendo un Panel de Control (Dashboard), gestión de Clientes y Pólizas, administración de Siniestros (con enlaces públicos de seguimiento para el cliente final), reportes exportables a Excel y un completo apartado de Configuración de Agencia y Perfil.