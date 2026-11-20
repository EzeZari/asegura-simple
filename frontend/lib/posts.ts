export type PostIcon = 'BookOpen' | 'TrendingUp' | 'ShieldCheck';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  bgColor: string;
  iconColor: string;
  icon: PostIcon;
  published: boolean;
}

export const posts: BlogPost[] = [
  {
    slug: 'como-cargar-polizas-anuales-con-refacturacion-trimestral',
    title: 'Cómo cargar pólizas anuales con refacturación trimestral (y pagos mensuales o bimestrales)',
    description: 'Guía paso a paso para cargar pólizas anuales con refacturaciones trimestrales y cuotas mensuales o bimestrales en AseguraSimple sin perder continuidad ni duplicar registros.',
    excerpt: 'Aprendé a configurar vigencia anual, refacturaciones trimestrales y cuotas mensuales o bimestrales en una sola ficha, sin duplicar pólizas ni perder el historial de pagos.',
    content: `
      <p>En el mercado asegurador argentino es moneda corriente trabajar con <strong>pólizas de vigencia anual</strong> que las compañías <strong>refacturan cada 3 meses</strong> (para actualizar suma asegurada y premio) y que el cliente abona en <strong>cuotas mensuales o bimestrales</strong>. La duda más frecuente al digitalizar la cartera es cómo cargar estos tres plazos sin duplicar pólizas ni perder la continuidad del historial.</p>

      <h2>Regla de oro: una sola ficha por todo el año de vigencia</h2>
      <p>El error más común es crear una póliza nueva cada vez que llega una refacturación trimestral. Eso ensucia la cartera, multiplica registros del mismo vehículo o riesgo y corta la trazabilidad. En <strong>AseguraSimple</strong>, una póliza anual vive en <strong>un único registro durante los 12 meses</strong>.</p>

      <h2>Paso 1: Cargá la vigencia anual completa</h2>
      <p>Dentro del formulario de <strong>Nueva Póliza</strong>, en la sección <strong>A. Vigencia de la póliza</strong>:</p>
      <ul>
        <li><strong>Fecha Desde:</strong> colocá el inicio real del contrato anual.</li>
        <li><strong>Fecha Hasta (Renovación):</strong> colocá la fecha de finalización del año completo.</li>
      </ul>
      <p>De esta forma, el sistema reserva las alertas de renovación anual para cuando realmente corresponde emitir una póliza nueva, y el botón <strong>Renovar</strong> lo usás recién al cierre del año.</p>

      <h2>Paso 2: Configurá la refacturación según lo que necesitás controlar</h2>
      <p>En la sección <strong>B. Configuración de refacturación</strong>, activá la casilla <em>¿Tiene refacturación?</em>. Como el sistema arma una única grilla de seguimiento por póliza, elegí la frecuencia según qué te resulte más útil controlar mes a mes:</p>
      <ul>
        <li><strong>Para controlar pagos mensuales o bimestrales (recomendado):</strong> elegí frecuencia <strong>Mensual</strong> o <strong>Bimestral</strong>, cargá la <strong>Próxima Fecha</strong> (el primer vencimiento a seguir) y el <strong>Día Habitual</strong> (ej: 10 o 16) para que el día no se corra en meses de 30 o 31 días.</li>
        <li><strong>Para marcar solo los hitos de refacturación cada 3 meses:</strong> elegí frecuencia <strong>Trimestral</strong>. El sistema te va a generar los 4 cortes del año para revisar premio, suma asegurada y documentación en cada trimestre.</li>
      </ul>

      <figure>
        <div style="overflow: hidden; border-radius: 0.75rem;">
          <img
            src="/blog/refacturacion-carga.png"
            alt="Configuración de vigencia anual y refacturación mensual en Nueva Póliza de AseguraSimple"
            loading="lazy"
            style="width: 105.5%; max-width: none; height: auto; margin: -1.5% 0 -1.8% -1.3%; display: block;"
          />
        </div>
        <figcaption>Ejemplo de carga: vigencia anual de 12 meses en la sección A y seguimiento mensual fijo los días 10 en la sección B.</figcaption>
      </figure>

      <h3>Tip si usás Lectura IA de PDF</h3>
      <p>Si subís el frente de póliza con el escáner automático, verificá siempre que <strong>Fecha Hasta</strong> tome el vencimiento anual del contrato y que en <strong>B. Configuración de refacturación</strong> quede seleccionada la frecuencia de pago real del cliente (Mensual o Bimestral) antes de guardar.</p>

      <p>Al guardar, dentro de la ficha de la póliza vas a ver el panel de <strong>Seguimiento de Refacturación</strong> con todos los períodos del año listos para tildar a medida que el cliente paga y con barra de progreso automática:</p>

      <figure>
        <img src="/blog/refacturacion-cuotas.png" alt="Panel de Seguimiento de Refacturación con 12 cuotas mensuales y progreso de pagos en AseguraSimple" loading="lazy" />
        <figcaption>Seguimiento de Refacturación: los 12 períodos del año unificados en la misma ficha, con el primer trimestre ya marcado como pago.</figcaption>
      </figure>

      <h2>Paso 3: Qué hacer cuando llega la refacturación trimestral</h2>
      <p>Cuando pasan los 3 meses y la compañía emite el endoso o refacturación del nuevo trimestre, <strong>no crees una póliza nueva ni uses el botón Renovar</strong>. Actualizá la misma ficha en segundos:</p>
      <ul>
        <li>Entrá a la póliza y hacé clic en <strong>Editar</strong>.</li>
        <li>Actualizá la <strong>Suma Asegurada</strong>, la <strong>Cobertura</strong> o el <strong>Número de Póliza</strong> si cambió el endoso.</li>
        <li><strong>Importante:</strong> dejá intacta la <strong>Próxima Fecha</strong> original para que el sistema conserve visibles todos los meses anteriores que ya tildaste como pagados.</li>
        <li>En <strong>Documentación Digital</strong>, subí el nuevo PDF de la póliza y/o la <strong>Cuponera de Pago</strong> vigente (el sistema reemplaza el archivo anterior por el actual y deja el movimiento registrado en el <strong>Registro de Actividad</strong>).</li>
      </ul>

      <h2>Paso 4: Renovación al finalizar el año</h2>
      <p>Recién cuando termina la vigencia anual (a los 12 meses), usás el botón verde <strong>Renovar</strong> dentro del detalle de la póliza. AseguraSimple marca automáticamente el ciclo anterior como <em>Renovada</em> (conservando todo su historial, cuotas y PDFs) y te precarga la nueva ficha. Verificá que <strong>Fecha Hasta</strong> quede seteada a 12 meses para el nuevo año y guardá.</p>

      <p>Con este flujo mantenés tu cartera limpia, sin pólizas duplicadas y con el control de cobranzas al día durante todo el año. <strong><a href="/registro" class="cta-link">Probá AseguraSimple gratis por 14 días</a> y ordená tus refacturaciones sin planillas.</strong></p>
    `,
    date: '2026-11-19',
    readTime: '4 min',
    category: 'Organización',
    bgColor: 'bg-blue-50 border border-blue-100',
    iconColor: 'text-blue-700',
    icon: 'BookOpen',
    published: true,
  },
  {
    slug: 'como-organizar-cartera-seguros-sin-excel',
    title: 'Cómo gestionar una cartera de seguros sin Excel (y dejar de perder comisiones)',
    description: 'Descubrí por qué usar planillas de cálculo para gestionar pólizas te hace perder dinero. Conocé el software para PAS que automatiza tus vencimientos.',
    excerpt: 'Si gestionás tus pólizas con planillas de cálculo, estás perdiendo tiempo y dinero. Descubrí cómo migrar tu cartera de seguros de forma segura y automatizada.',
    content: `
      <p>Colegas, hablemos con la verdad. Todos los que arrancamos en este rubro lo hicimos igual: gestionando nuestros primeros clientes con una planilla de cálculo. Al principio es fácil, pero cuando la cartera empieza a crecer, buscar entre cuarenta y siete pestañas quién vencía cuándo se vuelve un verdadero dolor de cabeza.</p>

      <h2>Los riesgos de usar Excel para tu cartera de seguros</h2>
      <p>El mayor problema de la gestión manual no es la incomodidad de la interfaz, es que <strong>el Excel no te avisa de nada</strong>. Si un día estás tapado de urgencias o siniestros y te olvidás de cruzar los datos a mano, corrés el riesgo directo de perder comisiones por una póliza vencida que nadie le avisó al cliente para renovar a tiempo.</p>

      <h3>El problema de la movilidad frente a un siniestro</h3>
      <p>Imaginate esta situación: es fin de semana, estás lejos de la compu y te entra un mensaje de un cliente al que lo acaban de parar en un control de tránsito. Necesita su certificado de cobertura ya mismo. Ese "microinfarto" cuando te das cuenta que no podés abrir ni filtrar tu Excel desordenado desde el celular, te saca años de vida y daña la confianza de tu asegurado.</p>

      <h2>AseguraSimple: Software de gestión para el PAS moderno</h2>
      <p>Como productor, me cansé de renegar con programas lentos y caros. Por eso desarrollamos <strong>AseguraSimple</strong>, un sistema web de gestión de seguros diseñado para centralizar toda tu cartera de clientes, pólizas y siniestros en un solo lugar, accesible desde cualquier dispositivo.</p>

      <p>Es el verdadero "viaje de ida" para jubilar a las planillas gracias a estas funciones de automatización:</p>
      <ul>
        <li><strong>Semáforo de vencimientos:</strong> Un calendario inteligente que te marca al instante qué póliza está vencida (rojo), cuál es crítica (naranja) y qué está próximo a renovar (verde).</li>
        <li><strong>WhatsApp en 1 clic:</strong> Desde la ficha del cliente, el sistema genera un mensaje pre-armado con la compañía y la fecha exacta para enviar recordatorios sin tener que tipear nada.</li>
        <li><strong>Robot de Correos automatizado:</strong> Detecta los vencimientos diarios y manda avisos preventivos a tu cartera de forma 100% automática, asegurando tu retención de clientes.</li>
      </ul>

      <h2>Da el salto en la gestión de tus pólizas</h2>
      <p>No dejes que una herramienta obsoleta ponga un techo al crecimiento de tu producción. Es momento de profesionalizar la administración de tu negocio.</p>
      
      <p><strong><a href="/registro" class="cta-link">Creá tu cuenta gratis en AseguraSimple</a> y empezá a gestionar tu cartera como un verdadero profesional.</strong></p>
    `,
    date: '2026-09-15',
    readTime: '4 min',
    category: 'Organización',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-700',
    icon: 'BookOpen',
    published: true,
  },
  {
    slug: 'evitar-perder-comisiones-polizas-vencidas',
    title: 'Cómo Evitar Perder Comisiones por Pólizas Vencidas',
    description: 'Descubrí cómo automatizar tus avisos de vencimiento de pólizas, retener clientes y blindar las comisiones de tu cartera de seguros.',
    excerpt: 'El método definitivo para automatizar tus avisos de vencimiento y asegurarte de que ningún cliente se quede sin cobertura (ni vos sin tu comisión).',
    content: `
      <p>Para un Productor Asesor de Seguros (PAS), no hay nada más frustrante que revisar las liquidaciones a fin de mes y notar que falta una comisión clave. ¿El motivo? Una póliza que no se renovó porque el cliente nunca recibió el aviso de vencimiento. En un mercado tan competitivo, perder clientes por falta de seguimiento administrativo es un lujo que no te podés dar.</p>

      <h2>El costo oculto de la gestión manual en seguros</h2>
      <p>Cuando tu cartera de seguros es pequeña, llevar el control de las renovaciones en una planilla de Excel o en una agenda de papel parece suficiente. Sin embargo, a medida que crecés, este método se vuelve tu mayor techo de cristal. Una tarde complicada con siniestros o un día de reuniones pueden hacer que se te pase la fecha límite de tres clientes diferentes.</p>
      <p>El verdadero problema no es solo la comisión perdida de este mes, sino el <strong>valor de vida del cliente (Lifetime Value)</strong> que se fuga hacia otro colega o venta directa de la compañía.</p>

      <h2>3 estrategias clave para garantizar la renovación de pólizas</h2>
      <p>Para dejar de perder plata por errores humanos, necesitás implementar un sistema a prueba de olvidos. Acá te compartimos tres prácticas de retención que usan las agencias más rentables:</p>
      <ul>
        <li><strong>Anticipación de 30 a 60 días:</strong> No esperes a la semana de vencimiento. Contactá a tu asegurado con anticipación para revisar si sus necesidades de cobertura cambiaron. Esto demuestra profesionalismo y bloquea a la competencia.</li>
        <li><strong>Estandarizar WhatsApp como canal:</strong> Enviar recordatorios por WhatsApp tiene una tasa de apertura superior al 90%. Tener mensajes pre-armados te ahorra horas de tipeo y asegura que la comunicación sea impecable.</li>
        <li><strong>Clasificación visual por criticidad:</strong> No todas las pólizas requieren la misma atención inmediata. Un buen sistema de gestión debe mostrarte de un vistazo qué es urgente (vence esta semana) y qué está en la zona segura.</li>
      </ul>

      <h2>Automatizá tus avisos y blindá tus comisiones con AseguraSimple</h2>
      <p>La tecnología es el mejor aliado del productor moderno. En lugar de ser un esclavo de tu calendario para ver quién vence mañana, tu software debería hacer ese trabajo pesado por vos.</p>
      <p>Por eso creamos <strong>AseguraSimple</strong>. Nuestro sistema cuenta con un Semáforo de Alertas y un <strong>Robot de Correos</strong> que detecta automáticamente los vencimientos diarios, avisándote a vos y enviando recordatorios preventivos a tu cartera de forma 100% automática.</p>

      <p>Dejá de perder dinero por olvidos. <strong><a href="/registro" class="cta-link">Iniciá tu prueba gratis de 14 días en AseguraSimple</a> y empezá a gestionar tus renovaciones en piloto automático.</strong></p>
    `,
    date: '2026-09-10',
    readTime: '5 min',
    category: 'Ventas y Retención',
    bgColor: 'bg-emerald-50 border border-emerald-100',
    iconColor: 'text-emerald-600',
    icon: 'TrendingUp',
    published: true,
  },
  {
    slug: 'gestion-siniestros-tranquilidad-cliente',
    title: 'Gestión de Siniestros: Cómo Darle Tranquilidad a tu Cliente',
    description: 'El siniestro es el momento de la verdad en seguros. Aprendé a gestionar reclamos de manera profesional sin perder el control de tus mensajes.',
    excerpt: 'El momento de la verdad para un productor. Cómo manejar los siniestros de manera profesional sin volverte loco con los mensajes de WhatsApp.',
    content: `
      <p>Vendiste la póliza, cobraste la comisión y el cliente está contento. Pero tu verdadero examen final como Productor Asesor de Seguros (PAS) llega el día que suena el teléfono y del otro lado hay un asegurado nervioso porque acaba de chocar. <strong>El siniestro es el momento de la verdad</strong>, y la forma en que lo gestiones definirá si ese cliente se queda con vos para siempre o si busca otra opción en la próxima renovación.</p>

      <h2>Por qué la gestión de siniestros define tu rentabilidad</h2>
      <p>Un cliente bien atendido durante un siniestro no solo renueva sin mirar el precio, sino que te recomienda. El problema es que, cuando tenés varios siniestros abiertos en simultáneo, el seguimiento se vuelve un caos. Fotos por WhatsApp, denuncias en PDF perdidas en el mail y clientes preguntando "qué novedades hay" conforman la receta perfecta para el estrés profesional.</p>

      <h2>3 pilares para una atención de siniestros impecable</h2>
      <p>Para darle tranquilidad al asegurado sin volverte loco en el proceso, necesitás estructurar tu atención basándote en estos tres pilares:</p>
      <ul>
        <li><strong>Contención y respuesta inmediata:</strong> El cliente en shock no necesita burocracia, necesita saber que estás ahí. Un mensaje claro indicando los tres primeros pasos a seguir (tomar datos del tercero, sacar fotos, no asumir culpas) baja la ansiedad drásticamente.</li>
        <li><strong>Trazabilidad de la documentación:</strong> Perder la foto de la licencia de conducir del tercero entre los memes de WhatsApp no es una opción. Toda la documentación debe ir a un legajo digital único por cliente.</li>
        <li><strong>Seguimiento proactivo (no reactivo):</strong> El peor error es dejar que el cliente te pregunte cómo va el trámite. Si vos te adelantás y le informás el estado de la gestión antes de que él pregunte, tu valor percibido como asesor se multiplica.</li>
      </ul>

      <h2>Centralizá tus siniestros y olvidate del caos de WhatsApp</h2>
      <p>Hacer un seguimiento proactivo es imposible si tu única herramienta de gestión es el chat del celular. Necesitás un sistema que vincule cada siniestro directamente a la póliza y al perfil del cliente, manteniendo todo el historial ordenado.</p>
      <p>Con <strong>AseguraSimple</strong>, podés centralizar toda tu cartera y dejar un registro claro de cada reclamo, póliza y vencimiento en un solo lugar, accesible desde cualquier dispositivo.</p>
      
      <p>Profesionalizá la atención en tu agencia y dale a tus clientes el respaldo que esperan. <strong><a href="/registro" class="cta-link">Probá AseguraSimple gratis por 14 días</a> y llevá el control de tus siniestros al siguiente nivel.</strong></p>
    `,
    date: '2026-09-02',
    readTime: '6 min',
    category: 'Atención al Cliente',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    icon: 'ShieldCheck',
    published: true,
  },
  {
    slug: 'como-ser-productor-asesor-de-seguros-argentina',
    title: 'Cómo ser Productor Asesor de Seguros (PAS) en Argentina: guía paso a paso',
    description: 'Todo lo que necesitás para matricularte como Productor Asesor de Seguros ante la SSN: requisitos, curso de capacitación, examen y trámites.',
    excerpt: 'Requisitos, curso, examen y trámites ante la SSN explicados en criollo, para arrancar tu carrera como PAS sin perderte en la letra chica.',
    content: `
      <p>Si estás pensando en dedicarte a la venta y asesoramiento de seguros en Argentina, el primer paso no es conseguir tu primer cliente: es obtener la <strong>matrícula de Productor Asesor de Seguros (PAS)</strong> ante la Superintendencia de Seguros de la Nación (SSN). Sin ella, no podés operar legalmente. Acá te lo resumimos sin vueltas.</p>

      <h2>1. Curso PAS: La capacitación obligatoria</h2>
      <p>No hace falta tener estudios previos en seguros. Sí necesitás el <strong>secundario completo</strong> (o estar cursando los últimos años, según la institución). El curso lo dictan entidades habilitadas por el Ente Cooperador Ley 22.400, suele durar varios meses y cubre seguros patrimoniales y de personas, además del marco normativo del mercado asegurador argentino.</p>

      <h2>2. Rendir el examen de competencia</h2>
      <p>Al completar el curso con la asistencia mínima exigida, quedás habilitado para inscribirte al examen de competencia. Aprobarlo es lo que te da el certificado oficial que después vas a presentar ante la SSN para tramitar tu credencial.</p>

      <h2>3. Tramitar la matrícula SSN a distancia (TAD)</h2>
      <p>El trámite se hace 100% online, a través de la plataforma Trámites a Distancia (TAD), con tu clave fiscal. Vas a necesitar tener a mano:</p>
      <ul>
        <li>DNI (ambas caras).</li>
        <li>Foto tipo carnet 4x4.</li>
        <li>Título secundario o analítico.</li>
        <li>Certificado del Ente Cooperador que acredita haber aprobado el examen de competencia.</li>
        <li>Constancia de pago del derecho de inscripción a la matrícula SSN.</li>
      </ul>
      <p>Una vez cargada la documentación, el sistema te genera un número de expediente y la SSN evalúa tu solicitud.</p>

      <h2>4. Mantener la matrícula activa</h2>
      <p>La matrícula requiere el pago de una cuota anual fija. Si dejás de pagarla por 2 años se suspende, y si pasan 5 años sin pago, caduca. Además, la SSN exige capacitación continua a través del Programa de Capacitación Continuada (PCC): 4 cursos por año que tenés que acreditar.</p>

      <h2>Ya tenés la matrícula. ¿Y ahora cómo gestionás tus clientes?</h2>
      <p>Acá empieza la parte que no te enseña ningún curso: conseguir clientes, armar tu cartera y no perder ni una sola renovación en el camino. Desde el primer asegurado que cargues, vas a necesitar un software de gestión para PAS profesional; de lo contrario, empezarás a perder comisiones por falta de seguimiento.</p>
      
      <p>Adelantate a los problemas de organización desde tu primer día de matriculado. <strong><a href="/registro" class="cta-link">Creá tu cuenta gratis en AseguraSimple</a> y empezá tu carrera de Productor con la mejor tecnología a tu favor.</strong></p>
    `,
    date: '2026-09-15',
    readTime: '6 min',
    category: 'Primeros Pasos',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-700',
    icon: 'BookOpen',
    published: true,
  },
  {
    slug: 'por-que-perdes-clientes-y-renovaciones-de-seguros',
    title: 'Por qué perdés renovaciones (aunque tengas buenos clientes) y cómo evitarlo',
    description: 'La mayoría de los clientes que no renuevan su póliza no se van por precio: se van porque nadie los contactó a tiempo. Estrategias de retención para PAS.',
    excerpt: 'No es el precio de la competencia. Es la falta de seguimiento. Te contamos por qué se caen las renovaciones de seguros y cómo blindar tu cartera.',
    content: `
      <p>Si alguna vez te pasó que un cliente "de toda la vida" no renovó y te enteraste tarde, no sos el único. Es el dolor más silencioso —y más caro— del negocio de seguros: no se pierde de un día para el otro, se pierde de a poco, sin ruido, hasta que un día revisás la cartera y ese cliente ya no está.</p>

      <h2>El precio casi nunca es el verdadero motivo de fuga</h2>
      <p>La mayoría de los productores asume que pierde renovaciones de seguros porque la competencia ofrece un precio más bajo. La realidad, medida en estudios del sector, es otra: la gran mayoría de los clientes que no renuevan no lo hacen porque encontraron algo mejor, sino porque <strong>nadie los contactó a tiempo</strong> para ofrecerles alternativas o recordarles el pago. El vínculo no se rompe por precio, se rompe por silencio.</p>

      <h2>La ventana de los 60 días en la retención de clientes</h2>
      <p>El patrón se repite en la mayoría de las carteras que se manejan a mano: la renovación se gestiona en el último momento, cuando ya casi no queda margen de reacción. La mayoría de los clientes que finalmente se pierden no recibió ningún contacto proactivo en los dos meses previos al vencimiento. Sin un sistema de alertas que te lo recuerde, esa fecha clave se diluye entre las urgencias del día a día.</p>

      <h3>El impacto real en las comisiones de seguros</h3>
      <p>Captar un cliente nuevo siempre cuesta más que retener uno existente. En seguros el desbalance es mayor todavía, porque la comisión de renovación es tu ingreso más estable: el cliente ya te conoce, ya confía en vos, y solo necesita tu acompañamiento oportuno.</p>
      <p>Pensalo en números simples: una cartera de 200 asegurados con una tasa de renovación del 70% pierde 60 clientes al año. Subir esa tasa a 85% significa retener 30 clientes más, lo que representa miles de pesos anuales en comisiones que hoy se escapan por fallas administrativas.</p>

      <h2>Cómo blindar tu cartera de seguros de forma definitiva</h2>
      <p>La solución no es "acordarte más". Es no depender de tu memoria. Lo que funciona es tener un sistema CRM para productores de seguros que marque automáticamente qué pólizas entran en esa ventana crítica de 60 días, y que dispare el contacto preventivo por vos.</p>
      
      <p>Con <strong>AseguraSimple</strong>, cada póliza que se acerca a su vencimiento cambia de color en tu calendario automáticamente y el robot de avisos se encarga del seguimiento. El resultado no es "trabajar más", es trabajar de forma inteligente.</p>
      
      <p><strong><a href="/registro" class="cta-link">Activá tu prueba gratis de 14 días en AseguraSimple</a> y asegurate de que ninguna renovación se vuelva a caer por falta de seguimiento.</strong></p>
    `,
    date: '2026-09-18',
    readTime: '5 min',
    category: 'Ventas y Retención',
    bgColor: 'bg-emerald-50 border border-emerald-100',
    iconColor: 'text-emerald-600',
    icon: 'TrendingUp',
    published: true,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug && p.published);
}

export function getAllSlugs(): string[] {
  return posts.filter((p) => p.published).map((p) => p.slug);
}

// 🔥 Devuelve posts relacionados: prioriza misma categoría, completa con los más recientes.
// Se usa en la página de detalle para armar "Seguí leyendo" sin tocar el contenido de ningún post.
export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const current = posts.find((p) => p.slug === currentSlug);
  const others = getAllPosts().filter((p) => p.slug !== currentSlug);

  const sameCategory = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => p.category !== current?.category);

  return [...sameCategory, ...rest].slice(0, limit);
}