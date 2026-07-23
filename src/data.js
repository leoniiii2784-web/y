// ════════════════════════════════════════════════════════════════
// DATA — lógica de negocio heredada de v1-v4, sin cambios de fondo.
// ════════════════════════════════════════════════════════════════

// ── SKINS ──
// v4 tenía 6 paletas de color dibujadas por código. Los sprites v5
// son arte final aprobado en pixel art: por ahora existe UN solo
// diseño de vendedor (4 poses). Dejamos la estructura de "skins"
// lista para crecer — cuando diseño entregue más variantes, se
// agregan aquí como entradas nuevas y el selector de la pantalla de
// personalización las mostrará automáticamente sin tocar el resto
// del código.
export const SKINS = [
  {
    id: 'vendedor_default',
    name: 'Comercial Primadera',
    sprites: {
      idle: 'vendedor_idle',
      moviendose: 'vendedor_moviendose',
      salto: 'vendedor_salto',
      golpeado: 'vendedor_golpeado',
    },
  },
];

export const PROFILES = [
  {
    id: 'hunter', ico: '🎯', name: 'CAZADOR',
    desc: 'Abre puertas fácil. Buenas relaciones naturales. Pero cuidado — el precio te puede costar el margen.',
    rent: 60, rel: 90, rep: 50,
    bars: [60, 90, 50],
  },
  {
    id: 'guardian', ico: '💰', name: 'GUARDIÁN',
    desc: 'Protege el margen sin dudar. Conoce los números. Pero la relación necesita más trabajo.',
    rent: 90, rel: 50, rep: 80,
    bars: [90, 50, 80],
  },
  {
    id: 'builder', ico: '🤝', name: 'CONSTRUCTOR',
    desc: 'Reputación impecable en el mercado. Confianza sólida. El margen es tu punto débil.',
    rent: 50, rel: 80, rep: 90,
    bars: [50, 80, 90],
  },
];

export const CLIENTS = [
  {
    id: 0, name: 'Maderas del Centro Ltda.', type: 'Distribuidor B2B', icon: '🏭', bgTheme: 'warehouse',
    accentColor: '#e67e22',
    cardDesc: 'Distribuidora regional con 12 años en el mercado. Compra ~180 m³/mes y revende a carpinterías y ferreterías. Lleva 3 años con Primadera pero en los últimos 6 meses cotiza con un importador chino.',
    hints: [
      { ico: '📦', t: 'Volumen: ~180 m³/mes. Cliente frecuente pero sensible al precio.' },
      { ico: '⚠️', t: 'Está cotizando importado. El precio por m³ es su métrica central.' },
      { ico: '💡', t: 'Depende de inventario continuo. El tiempo de entrega lo afecta directamente.' },
    ],
    exchanges: [
      {
        text: 'Necesito que me revise el precio por m³. El importador me ofrece lo mismo a un 18% menos. Si no me ajusta, me toca irme.',
        opts: [
          { t: 'Le bajo el 18% para no perder el pedido.', rent: -20, rel: +5, rep: -18,
            s: 'Cedió antes de mostrar una sola carta. El cliente tomó nota: con presión funciona.',
            l: 'Igualar el precio importado sin argumentar destruye la reputación de precio y no resuelve el problema de fondo.' },
          { t: '¿Qué tablero específicamente le están cotizando? Necesito saber si es producto equivalente en densidad y certificación.', rent: 0, rel: +8, rep: +5,
            l: 'Calificar la comparación es el primer paso. Tablero sin CARB2 y sin garantía local no es producto equivalente.' },
          { t: 'El Primacor tiene entrega en 48h y garantía local. ¿Cuánto le costaría a su negocio esperar 90 días por un contenedor si algo sale mal?', rent: 0, rel: +10, rep: +8,
            l: 'Trasladaste la conversación del precio al costo real del negocio: tiempo, riesgo y continuidad de inventario.' },
        ],
      },
      {
        text: 'El de China tiene certificación también. Y el precio es el precio — mis clientes no me pagan más por la marca.',
        opts: [
          { t: 'Entonces le hago un ajuste parcial, digamos un 10%.', rent: -12, rel: +3, rep: -12,
            s: 'Ceder sin nuevo argumento confirma que su presión funciona y que había margen escondido.',
            l: 'Cuando el cliente empuja y usted cede sin argumento nuevo, el precio pierde credibilidad definitivamente.' },
          { t: 'La certificación CARB2 es el estándar más exigente. ¿La tiene el importador por escrito? Muchos la anuncian pero no la acreditan.', rent: 0, rel: +6, rep: +10,
            l: 'Pedir evidencia de certificación expone muchas veces que la promesa importada no tiene respaldo real.' },
          { t: 'Sus clientes sí pagan más por un mueble que no se hincha ni se astilla. Ese es el argumento que usted les vende río abajo.', rent: +5, rel: +12, rep: +8,
            l: 'Le diste un argumento de venta para que ÉL cierre mejor con sus clientes. Eso es vender valor en el canal.' },
        ],
      },
      {
        text: 'Me convenció en lo técnico. Pero si me da crédito a 60 días en lugar de 30, cerramos el trimestre completo hoy.',
        opts: [
          { t: 'Listo, 60 días, cerramos.', rent: -8, rel: +10, rep: -5,
            s: 'Comprometió condiciones financieras que no son suyas para dar. Si no se aprueban, pierde credibilidad y el cliente.',
            l: 'Las condiciones de crédito tienen dueño en la empresa. El comercial gestiona, no decide unilateralmente.' },
          { t: 'El plazo estándar es 30 días. Con el volumen del trimestre puedo llevar la solicitud a dirección esta semana. ¿Me confirma el pedido condicionado?', rent: 0, rel: +15, rep: +5,
            l: 'No prometes lo que no puedes dar, pero demuestras gestión activa. El cliente siente que estás de su lado.' },
          { t: 'Eso no lo manejo yo, tiene que hablar con mi jefe.', rent: 0, rel: -10, rep: -5,
            s: 'Camilo estaba listo para cerrar el trimestre. Le dijiste que llamara a otro. Ya está buscando el número del importador.',
            l: 'El cierre es el momento más crítico. Nunca lo delegues sin un siguiente paso concreto que tú mismo actives.' },
        ],
      },
    ],
  },
  {
    id: 1, name: 'Muebles Modulares del Norte S.A.', type: 'Industrial Transformador', icon: '🏗️', bgTheme: 'factory',
    accentColor: '#27ae60',
    cardDesc: 'Empresa fabricante de cocinas modulares para proyectos de vivienda. Consume ~300 m³/mes. Cliente nuevo para Primadera. Su proveedor actual ha tenido problemas de calidad recurrentes en el último año.',
    hints: [
      { ico: '📐', t: 'Volumen potencial: ~300 m³/mes. Cliente nuevo, alto potencial de largo plazo.' },
      { ico: '🔧', t: 'Fabrica en serie. Una variación en densidad del tablero afecta toda su línea.' },
      { ico: '💡', t: 'Su proveedor actual ha fallado en calidad. Hay una herida abierta que puedes resolver.' },
    ],
    exchanges: [
      {
        text: 'Nos interesa el Primacor pero necesitamos precio de cliente grande desde el primer pedido. Si no nos dan ese precio, no vale la pena cambiar de proveedor.',
        opts: [
          { t: 'Le doy precio de cliente grande desde el primer pedido para traerlos.', rent: -15, rel: +8, rep: -10,
            s: 'Regalaste el margen de un cliente que todavía no te ha comprado ni un m³. Aprendió que la presión funciona antes de firmar.',
            l: 'El precio diferencial por volumen se gana con volumen real, no con promesas. Ofrecer el precio primero invierte el poder de negociación.' },
          { t: 'El precio evoluciona con el volumen acumulado. En el primer trimestre precio estándar, y si supera 250 m³/mes activamos condición preferencial automáticamente.', rent: +5, rel: +10, rep: +10,
            l: 'Estructura una propuesta creíble donde el precio premia el comportamiento real, no la promesa.' },
          { t: '¿Qué especificación de densidad necesita para sus cocinas? El Primacor 680-720 kg/m³ aguanta herraje pesado sin reventarse.', rent: +3, rel: +12, rep: +8,
            l: 'Antes de hablar precio, anclás el diálogo en la especificación técnica que resuelve su problema real de producción.' },
        ],
      },
      {
        text: 'Nuestro proveedor actual nos da descuento por pronto pago. ¿Ustedes también? En el flujo de caja nos ayuda mucho.',
        opts: [
          { t: 'Sí, le doy el mismo descuento que le da el otro.', rent: -10, rel: +5, rep: -8,
            s: 'Igualó sin saber qué descuento da el otro. Y el otro tiene problemas de calidad — usted tenía la ventaja y no la usó.',
            l: 'Nunca iguale condiciones de un proveedor con problemas sin usar primero su ventaja competitiva.' },
          { t: 'Manejamos descuento por pronto pago. Pero antes — usted mencionó problemas de calidad con su proveedor. ¿Qué tan seguido ocurren y qué le cuestan en reproceso?', rent: 0, rel: +15, rep: +5,
            l: 'Antes de hablar condiciones, abriste la herida del dolor real. Ese costo de reproceso es el argumento más poderoso que tienes.' },
          { t: 'Las condiciones de pago las define el área financiera, yo no puedo comprometerme.', rent: 0, rel: -8, rep: -3,
            s: 'Hay una empresa con 300 m³/mes potenciales preguntando por condiciones estándar y usted salió a consultar.',
            l: 'El comercial debe conocer las condiciones básicas. Responder no sé en el cierre es perder el momento.' },
        ],
      },
      {
        text: 'Listo, queremos hacer una prueba de 50 m³ antes de comprometer el volumen. Si sale bien, somos clientes.',
        opts: [
          { t: '50 m³ es poco para justificar la logística. No podemos hacer envíos menores a 120 m³.', rent: +5, rel: -20, rep: -5,
            s: 'Un cliente de 300 m³/mes potenciales te pidió una prueba razonable y le dijiste que no. Adiós.',
            l: 'La prueba piloto es una puerta, no un obstáculo. Aceptarla con condiciones claras es la única respuesta correcta aquí.' },
          { t: 'Perfecto. Los 50 m³ de prueba con precio estándar y despacho prioritario. Si en 60 días el volumen sube a 150+, entramos en condición preferencial. ¿Lo formalizamos esta semana?', rent: +3, rel: +18, rep: +8,
            l: 'Acepta la prueba, fijas el escalamiento y activás el cierre. Así se construye un cliente grande.' },
          { t: 'Para los 50 m³ le hago precio especial para que la prueba sea más fácil.', rent: -12, rel: +8, rep: -10,
            s: 'Subsidiaste la prueba sin necesidad. El cliente no te lo pidió. Bajaste el piso de precio para siempre.',
            l: 'No regales condiciones que no te pidieron. Un precio especial no solicitado enseña al cliente cuál es el precio real.' },
        ],
      },
    ],
  },
  {
    id: 2, name: 'HogarMax Región Andina', type: 'Grandes Superficies', icon: '🏬', bgTheme: 'retail',
    accentColor: '#8e44ad',
    cardDesc: 'Cadena de mejoramiento del hogar con 8 puntos en la región andina. Compra ~500 m³/mes. Lleva 2 años sin comprar a Primadera por una disputa de condiciones. Ahora reabrió el diálogo.',
    hints: [
      { ico: '💰', t: 'Volumen: ~500 m³/mes. El cliente más grande del portafolio, el más exigente.' },
      { ico: '🧠', t: 'Su comprador tiene métricas de ahorro anuales. Negocia con datos, no con emociones.' },
      { ico: '⚡', t: 'Llevan 2 años sin comprar. Hay desconfianza acumulada — hay que nombrarla.' },
    ],
    exchanges: [
      {
        text: 'Reabrimos el diálogo porque necesitamos diversificar. Pero tenemos benchmark de mercado y cualquier propuesta la comparamos contra 3 proveedores. ¿Con qué precio de m³ entra usted?',
        opts: [
          { t: 'Le digo el precio más bajo que puedo dar para entrar bien posicionado.', rent: -18, rel: +3, rep: -15,
            s: 'Abrió con su precio piso en la primera reunión. El comprador anotó y lo usará para presionar a los otros tres.',
            l: 'Nunca abra con su precio mínimo. El primer número ancla toda la negociación. Empiece con valor, no con precio.' },
          { t: 'Antes de hablar precio, necesito entender su mix de volumen por referencia y su estándar de densidad. El precio justo depende de la especificación correcta.', rent: +5, rel: +8, rep: +10,
            l: 'Calificar la necesidad antes de cotizar separa a un comercial de un tomador de pedidos.' },
          { t: 'HogarMax lleva 2 años sin trabajar con nosotros. ¿Qué pasó con la relación anterior y qué necesitarían diferente esta vez?', rent: 0, rel: +15, rep: +5,
            l: 'Nombrar el elefante en la sala demuestra madurez comercial. El comprador necesita ver que usted entiende el historial.' },
        ],
      },
      {
        text: 'Nuestro volumen es 500 m³ mensuales. Esperamos un precio que refleje ese tamaño. Y necesitamos exclusividad de dos referencias para nuestra marca propia.',
        opts: [
          { t: 'La exclusividad de referencias no está en nuestra política. No lo podemos dar.', rent: +5, rel: -15, rep: 0,
            s: 'Negó la exclusividad sin explorar qué significa realmente. A veces es solo prioridad de despacho.',
            l: 'Antes de decir no a una condición, entienda qué problema resuelve para el cliente. La solución puede ser diferente.' },
          { t: 'Con 500 m³ mensuales activamos condición preferencial. La exclusividad la evaluamos si el contrato anual tiene cláusula de volumen mínimo garantizado.', rent: +8, rel: +12, rep: +5,
            l: 'Vinculaste la exclusividad a un compromiso real de volumen. No regalas nada — cambias condiciones por condiciones.' },
          { t: '500 m³ es un volumen importante. Le consigo el mejor precio posible y confirmo en 48 horas.', rent: -5, rel: +5, rep: -8,
            s: 'Se fue a consultar sin comprometer nada. El comprador interpretó falta de autonomía y propuesta clara.',
            l: 'El comercial debe tener claro su rango de maniobra antes de sentarse. Salir a consultar en la reunión es señal de falta de preparación.' },
        ],
      },
      {
        text: 'Tenemos todo claro. Pero mi gerente pide que si cerramos, la primera entrega sea en 15 días hábiles. Si no cumplen ese plazo, hay penalización del 5% por semana.',
        opts: [
          { t: 'Aceptamos las condiciones incluyendo la penalización.', rent: -10, rel: +5, rep: -5,
            s: 'Aceptó una penalización sin verificar si la operación la puede cumplir. Una semana de retraso come toda la utilidad.',
            l: 'Nunca acepte penalizaciones sin verificar la capacidad operativa. Las condiciones contractuales se negocian, no se aceptan por miedo.' },
          { t: 'El plazo de 15 días hábiles lo comprometemos si el pedido se formaliza antes del miércoles. La penalización la revisamos con logística antes de firmar.', rent: +5, rel: +10, rep: +8,
            l: 'Comprometiste lo que puedes, condicionaste lo que necesita validación. Así se negocia un contrato grande.' },
          { t: '15 días hábiles no hay problema, eso es estándar nuestro.', rent: 0, rel: +8, rep: 0,
            l: 'Confirmaste el plazo con confianza. Está bien si realmente es estándar — la clave es que sea verdad, no una promesa vacía.' },
        ],
      },
    ],
  },
];

// ── FONDOS ──
// Único fondo aprobado hoy es el de fábrica (sin marca Primadera,
// pixel art de alto detalle). Por decisión de negocio, se reutiliza
// para los 3 escenarios (bodega/fábrica/retail) hasta que diseño
// entregue las otras dos ilustraciones en el mismo tratamiento.
// Para reemplazarlas: soltar bodega.png / retail.png en
// assets/backgrounds/ y actualizar este mapa — no se toca nada más.
export const BACKGROUNDS = {
  warehouse: 'fabrica',
  factory: 'fabrica',
  retail: 'fabrica',
};
