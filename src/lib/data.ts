export const menus = [
  {
    id: 1,
    name: "Lomo al Champignon",
    category: "carne",
    description: "Medallón de lomo con salsa de champignons frescos, papas noisette y ensalada de hojas verdes.",
    price: 8200,
    calories: 620,
    tags: ["premium", "sin gluten"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
    available: true,
    featured: true,
  },
  {
    id: 2,
    name: "Salmón Grillado",
    category: "pescado",
    description: "Filete de salmón rosado con costra de hierbas, vegetales salteados y arroz integral.",
    price: 7800,
    calories: 520,
    tags: ["saludable", "sin gluten"],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    available: true,
    featured: true,
  },
  {
    id: 3,
    name: "Pollo al Limón",
    category: "pollo",
    description: "Pechuga de pollo confitada con reducción de limón y miel, puré de coliflor y brócoli.",
    price: 6500,
    calories: 490,
    tags: ["saludable"],
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80",
    available: true,
    featured: false,
  },
  {
    id: 4,
    name: "Bowl Veggie Mediterráneo",
    category: "veggie",
    description: "Quínoa, garbanzos, vegetales asados, feta griego, hummus y tahini. 100% vegano.",
    price: 5900,
    calories: 440,
    tags: ["vegano", "saludable", "sin gluten"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    available: true,
    featured: true,
  },
  {
    id: 5,
    name: "Risotto de Hongos",
    category: "veggie",
    description: "Risotto cremoso con mix de hongos silvestres, parmesano curado y aceite de trufa.",
    price: 6200,
    calories: 580,
    tags: ["vegetariano", "premium"],
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
    available: true,
    featured: false,
  },
  {
    id: 6,
    name: "Milanesa Ejecutiva",
    category: "carne",
    description: "Milanesa de ternera napolitana con papas fritas artesanales y ensalada mixta.",
    price: 6800,
    calories: 780,
    tags: ["clásico"],
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&q=80",
    available: true,
    featured: false,
  },
  {
    id: 7,
    name: "Wrap Pollo Grillado",
    category: "pollo",
    description: "Wrap integral con pollo grillado, palta, tomate cherry, rúcula y aderezo yogurt.",
    price: 5400,
    calories: 420,
    tags: ["saludable", "liviano"],
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
    available: true,
    featured: false,
  },
  {
    id: 8,
    name: "Trucha con Cítricos",
    category: "pescado",
    description: "Trucha patagónica con reducción cítrica, ensalada de hinojo y papa andina.",
    price: 7200,
    calories: 490,
    tags: ["premium", "sin gluten", "saludable"],
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
    available: true,
    featured: true,
  },
];

export const menuCategories = [
  { id: "todos", label: "Todos" },
  { id: "carne", label: "Carne" },
  { id: "pollo", label: "Pollo" },
  { id: "pescado", label: "Pescado" },
  { id: "veggie", label: "Veggie" },
  { id: "saludable", label: "Saludable" },
  { id: "premium", label: "Premium" },
];

export const services = [
  {
    id: "viandas",
    title: "Viandas Corporativas",
    description: "Almuerzos gourmet para tu equipo, cada día. Menú rotativo semanal con opciones variadas y personalizables.",
    icon: "🥩",
    href: "/viandas-corporativas",
    highlights: ["Menú semanal rotativo", "Opciones vegetarianas y sin TACC", "Entrega en horario pactado", "Packaging premium"],
  },
  {
    id: "eventos",
    title: "Eventos Corporativos",
    description: "Desayunos, coffee breaks, almuerzos ejecutivos y celebraciones. Presentación impecable.",
    icon: "🎂",
    href: "/eventos",
    highlights: ["Desayunos y coffee breaks", "Almuerzos ejecutivos", "Cenas y celebraciones", "Montaje y servicio"],
  },
  {
    id: "catering",
    title: "Catering de Reuniones",
    description: "Servicio express para reuniones, capacitaciones y presentaciones internas.",
    icon: "☕",
    href: "/eventos",
    highlights: ["Pedido con 24hs de anticipación", "Opciones frías y calientes", "Sin mínimo de personas", "Delivery incluido"],
  },
];

export const steps = [
  {
    number: "01",
    title: "Tu empresa se registra",
    description: "Completás un formulario simple o nos contactás por WhatsApp. En 24hs te enviamos una propuesta personalizada.",
  },
  {
    number: "02",
    title: "Configuramos tu cuenta",
    description: "Definimos modalidad, presupuesto por empleado, restricciones alimentarias y horario de entrega.",
  },
  {
    number: "03",
    title: "Tu equipo elige su menú",
    description: "Cada empleado ingresa al portal, ve el menú del día y elige en menos de 3 clics desde su celular.",
  },
  {
    number: "04",
    title: "Bengal entrega y administra",
    description: "Producimos, entregamos en tiempo y forma, y vos recibís el resumen de consumos mensual.",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Laura Fernández",
    role: "RRHH Manager",
    company: "TechCorp Argentina",
    text: "Desde que empezamos con Bengal, el nivel de satisfacción del equipo con el almuerzo subió notablemente. La variedad y calidad son otro nivel comparado con lo que teníamos antes.",
    rating: 5,
  },
  {
    id: 2,
    name: "Martín Gallardo",
    role: "Director de Operaciones",
    company: "Grupo Inversiones del Sur",
    text: "Lo que más valoro es la previsibilidad. Sé que el viernes a las 12:30 llega la comida, está caliente y es lo que eligió cada uno. Sin sorpresas, sin problemas.",
    rating: 5,
  },
  {
    id: 3,
    name: "Carolina Vega",
    role: "Office Manager",
    company: "Consultora MV",
    text: "El portal para hacer pedidos es súper simple. Los chicos del equipo lo aprendieron a usar solos, sin que yo tenga que explicar nada. Y la comida está muy buena.",
    rating: 5,
  },
];

export const companies = [
  "TechCorp", "Grupo Sur", "Consultora MV", "Finanzas Plus",
  "Studio Legal", "Arquitecta & Co", "Pharma Group", "InnovaBA",
];

export const faqItems = [
  {
    question: "¿Cuál es el mínimo de personas para contratar el servicio de viandas?",
    answer: "Trabajamos con empresas desde 5 empleados. No hay un mínimo estricto, pero para garantizar la calidad del servicio preferimos equipos de al menos 5 personas.",
  },
  {
    question: "¿Con cuánta anticipación hay que hacer el pedido?",
    answer: "Para viandas corporativas diarias, el corte de pedido es a las 10:00 hs del mismo día. Para eventos y servicios especiales, solicitamos un mínimo de 48hs de anticipación.",
  },
  {
    question: "¿Ofrecen opciones para personas con restricciones alimentarias?",
    answer: "Sí. Tenemos opciones vegetarianas, veganas, sin TACC (celíacos), sin lactosa y bajas en sodio. Cada empleado puede registrar sus restricciones en el portal.",
  },
  {
    question: "¿Cómo se factura el servicio?",
    answer: "Facturamos mensualmente con un resumen detallado de pedidos por empleado. Aceptamos transferencia bancaria y pago por plataformas B2B.",
  },
  {
    question: "¿Se puede cambiar o cancelar un pedido?",
    answer: "Los pedidos pueden modificarse hasta el corte del día (10:00 hs). Fuera de ese horario, el pedido entra en producción y no se puede modificar.",
  },
  {
    question: "¿Tienen servicio de degustación para empresas nuevas?",
    answer: "Sí. Ofrecemos una degustación gratuita para equipos de más de 10 personas. Es la mejor forma de que tu equipo conozca la propuesta antes de decidir.",
  },
  {
    question: "¿En qué zonas entregan?",
    answer: "Actualmente entregamos en CABA y el corredor norte del GBA. Si tu empresa está en otra zona, consultanos — podemos evaluar la cobertura.",
  },
  {
    question: "¿Qué incluye el packaging?",
    answer: "Todas las viandas vienen en packaging premium con temperatura controlada, identificadas con el nombre del empleado y los ingredientes principales.",
  },
];

export const mockOrders = [
  {
    id: "ORD-2401",
    date: "2024-01-15",
    menu: "Lomo al Champignon",
    status: "entregado",
    total: 8200,
  },
  {
    id: "ORD-2402",
    date: "2024-01-16",
    menu: "Bowl Veggie Mediterráneo",
    status: "entregado",
    total: 5900,
  },
  {
    id: "ORD-2403",
    date: "2024-01-17",
    menu: "Salmón Grillado",
    status: "entregado",
    total: 7800,
  },
  {
    id: "ORD-2404",
    date: "2024-01-18",
    menu: "Pollo al Limón",
    status: "en camino",
    total: 6500,
  },
  {
    id: "ORD-2405",
    date: "2024-01-19",
    menu: "Trucha con Cítricos",
    status: "pendiente",
    total: 7200,
  },
];

export const companyUsers = [
  { id: 1, name: "Ana García", email: "ana@empresa.com", orders: 18, active: true },
  { id: 2, name: "Carlos López", email: "carlos@empresa.com", orders: 22, active: true },
  { id: 3, name: "María Pérez", email: "maria@empresa.com", orders: 15, active: true },
  { id: 4, name: "Diego Martínez", email: "diego@empresa.com", orders: 20, active: true },
  { id: 5, name: "Sofía Ruiz", email: "sofia@empresa.com", orders: 8, active: false },
];

export const adminMenus = [
  { id: 1, name: "Lomo al Champignon", date: "2024-01-22", orders: 34, stock: 40, active: true },
  { id: 2, name: "Salmón Grillado", date: "2024-01-22", orders: 28, stock: 35, active: true },
  { id: 3, name: "Bowl Veggie", date: "2024-01-22", orders: 19, stock: 25, active: true },
  { id: 4, name: "Pollo al Limón", date: "2024-01-22", orders: 41, stock: 45, active: true },
];
