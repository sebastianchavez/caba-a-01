/* ============================================================
   Cabañas del Bosque - Sistema de Reservas
   Lógica principal: datos, storage, autenticación,
   reservas, pago simulado, layout (header/footer)
   ============================================================ */

// Handler global: oculta imágenes rotas y deja visible el fondo del contenedor
document.addEventListener('error', function (e) {
  if (e.target && e.target.tagName === 'IMG') {
    e.target.classList.add('img-broken');
    if (e.target.parentElement) e.target.parentElement.classList.add('img-fallback');
  }
}, true);

const STORAGE_KEYS = {
  USERS: 'cdb_users',
  SESSION: 'cdb_session',
  RESERVAS: 'cdb_reservas',
  RESERVA_DRAFT: 'cdb_reserva_draft',
  PAGO_DRAFT: 'cdb_pago_draft',
  CONTACT_MSGS: 'cdb_contact_messages',
  RECOVERY: 'cdb_recovery_codes'
};

/* ============================================================
   DATOS DEL CATÁLOGO
   ============================================================ */

// Helper para generar URLs de Unsplash con tamaño consistente
const unsplash = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const CABAÑAS = [
  {
    id: 'cab1',
    nombre: 'Cabaña El Pino',
    eslogan: 'Acogedora cabaña para familias pequeñas',
    capacidad: 4,
    habitaciones: 2,
    baños: 1,
    precioNoche: 180,
    precioTemporadaAlta: 220,
    imagenes: [
      unsplash('1449158743715-0a90ebb6d2d8', 1200),
      unsplash('1542718610-a1d656d1884c', 800),
      unsplash('1480796927426-f609979314bd', 800)
    ],
    amenidades: ['Chimenea', 'WiFi', 'Cocina equipada', 'Vista al bosque', 'Estacionamiento', 'Calefacción'],
    descripcion: 'Una cabaña cálida y acogedora rodeada de pinos centenarios. Ideal para parejas o familias pequeñas que buscan tranquilidad y conexión con la naturaleza. Dispone de chimenea, cocina totalmente equipada y una vista inigualable al bosque.'
  },
  {
    id: 'cab2',
    nombre: 'Cabaña El Roble',
    eslogan: 'Amplia y lujosa con jacuzzi privado',
    capacidad: 6,
    habitaciones: 3,
    baños: 2,
    precioNoche: 280,
    precioTemporadaAlta: 340,
    imagenes: [
      unsplash('1502784444187-359ac186c5fa', 1200),
      unsplash('1480796927426-f609979314bd', 800),
      unsplash('1518780664697-55e3ad937233', 800)
    ],
    amenidades: ['Jacuzzi privado', 'WiFi', 'Cocina gourmet', 'Terraza', 'Chimenea', 'Estacionamiento', 'Calefacción', 'Smart TV'],
    descripcion: 'Nuestra cabaña premium con jacuzzi privado en la terraza. Perfecta para grupos y familias que buscan una experiencia de lujo en medio del bosque. Tres habitaciones, dos baños y una cocina gourmet totalmente equipada.'
  },
  {
    id: 'cab3',
    nombre: 'Cabaña El Cedro',
    eslogan: 'El refugio romántico perfecto',
    capacidad: 2,
    habitaciones: 1,
    baños: 1,
    precioNoche: 150,
    precioTemporadaAlta: 185,
    imagenes: [
      unsplash('1518780664697-55e3ad937233', 1200),
      unsplash('1542718610-a1d656d1884c', 800),
      unsplash('1449158743715-0a90ebb6d2d8', 800)
    ],
    amenidades: ['Chimenea', 'Vista al lago', 'Cama king', 'Cocina', 'WiFi', 'Bañera hidromasaje'],
    descripcion: 'Un refugio íntimo y romántico frente a un pequeño lago. Diseñada especialmente para parejas que buscan una escapada inolvidable con vistas privilegiadas y todas las comodidades para una estadía perfecta.'
  },
  {
    id: 'cab4',
    nombre: 'Cabaña El Álamo',
    eslogan: 'Espacio amplio para familias y grupos',
    capacidad: 8,
    habitaciones: 4,
    baños: 3,
    precioNoche: 360,
    precioTemporadaAlta: 440,
    imagenes: [
      unsplash('1480796927426-f609979314bd', 1200),
      unsplash('1502784444187-359ac186c5fa', 800),
      unsplash('1518780664697-55e3ad937233', 800)
    ],
    amenidades: ['Parrilla/BBQ', 'Sala de juegos', 'WiFi', 'Cocina grande', 'Estacionamiento (3 autos)', 'Calefacción', 'Lavandería', '2 Chimeneas'],
    descripcion: 'La cabaña más espaciosa del complejo. Cuatro habitaciones, tres baños, sala de juegos con mesa de pool y una enorme parrilla para reuniones familiares. Ideal para grupos grandes y celebraciones especiales.'
  }
];

const SERVICIOS = [
  {
    id: 's1',
    nombre: 'Desayuno campestre',
    descripcion: 'Desayuno con productos locales entregado en tu cabaña: panes artesanales, mermeladas caseras, frutas frescas, café de altura y huevos de campo.',
    precio: 25,
    icono: 'utensils'
  },
  {
    id: 's2',
    nombre: 'Cena romántica',
    descripcion: 'Cena privada para dos con velas, vino de la región y un menú de tres tiempos preparado por nuestro chef.',
    precio: 65,
    icono: 'wine'
  },
  {
    id: 's3',
    nombre: 'Tour guiado por el bosque',
    descripcion: 'Recorrido de 3 horas por senderos naturales con guía experto. Aprende sobre la flora y fauna local.',
    precio: 40,
    icono: 'tree'
  },
  {
    id: 's4',
    nombre: 'Spa en la cabaña',
    descripcion: 'Sesión de masajes relajantes (60 min) dentro de tu cabaña con aceites esenciales aromáticos.',
    precio: 90,
    icono: 'spa'
  },
  {
    id: 's5',
    nombre: 'Kit de fogata y s\'mores',
    descripcion: 'Leña, encendedor, malvaviscos, galletas y chocolate para una noche mágica alrededor del fuego.',
    precio: 35,
    icono: 'fire'
  },
  {
    id: 's6',
    nombre: 'Senderismo guiado',
    descripcion: 'Excursión de día completo a miradores naturales con almuerzo tipo picnic incluido.',
    precio: 55,
    icono: 'mountain'
  }
];

const PAQUETES = [
  {
    id: 'p1',
    nombre: 'Escapada Romántica',
    descripcion: '2 noches en Cabaña El Cedro con cena romántica y spa incluido',
    incluye: ['cab3', 's2', 's4'],
    precioTotal: 450,
    precioRegular: 545,
    descuento: 17
  },
  {
    id: 'p2',
    nombre: 'Aventura Familiar',
    descripcion: '3 noches en Cabaña El Álamo con tour guiado y kit fogata',
    incluye: ['cab4', 's3', 's5'],
    precioTotal: 1180,
    precioRegular: 1295,
    descuento: 9
  },
  {
    id: 'p3',
    nombre: 'Relax Total',
    descripcion: '2 noches en Cabaña El Roble con spa y desayuno campestre',
    incluye: ['cab2', 's1', 's4'],
    precioTotal: 720,
    precioRegular: 855,
    descuento: 16
  }
];

const HORARIOS = {
  lunes:    { abierto: true,  desde: '08:00', hasta: '22:00' },
  martes:   { abierto: true,  desde: '08:00', hasta: '22:00' },
  miercoles:{ abierto: true,  desde: '08:00', hasta: '22:00' },
  jueves:   { abierto: true,  desde: '08:00', hasta: '22:00' },
  viernes:  { abierto: true,  desde: '08:00', hasta: '23:00' },
  sabado:   { abierto: true,  desde: '08:00', hasta: '23:00' },
  domingo:  { abierto: true,  desde: '09:00', hasta: '21:00' }
};

const TESTIMONIOS = [
  {
    id: 't1',
    nombre: 'Carolina M.',
    lugar: 'Lima, Perú',
    avatar: unsplash('1494790108377-be9c29b29330', 200),
    texto: 'Una experiencia absolutamente mágica. La cabaña El Roble superó todas nuestras expectativas. El jacuzzi bajo las estrellas fue el toque perfecto para nuestra luna de miel.',
    rating: 5
  },
  {
    id: 't2',
    nombre: 'Andrés R.',
    lugar: 'Bogotá, Colombia',
    avatar: unsplash('1633332755192-727a05c16031', 200),
    texto: 'Fuimos con toda la familia a la cabaña El Álamo. Los niños disfrutaron la sala de juegos y nosotros la paz del bosque. La atención del personal fue excepcional.',
    rating: 5
  },
  {
    id: 't3',
    nombre: 'María José P.',
    lugar: 'Santiago, Chile',
    avatar: unsplash('1438761681033-6461ffad8d80', 200),
    texto: 'El tour guiado fue espectacular, aprendimos muchísimo sobre la flora local. Volveremos sin duda, esta vez en temporada de invierno para ver la cabaña con chimenea encendida.',
    rating: 5
  }
];

const INFO_CONTACTO = {
  nombre: 'Cabañas del Bosque',
  direccion: 'Km 12 Carretera al Valle Sagrado, Cusco 08000, Perú',
  telefono: '+51 984 555 123',
  whatsapp: '+51 984 555 123',
  email: 'reservas@cabanasdelbosque.com',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.3!2d-71.97!3d-13.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDMxJzEyLjAiUyA3McKwNTgnMTIuMCJX!5e0!3m2!1ses!2spe!4v1700000000000'
};

/* ============================================================
   STORAGE
   ============================================================ */

const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error('Storage error', e); }
  },
  remove(key) { localStorage.removeItem(key); }
};

/* ============================================================
   AUTENTICACIÓN
   ============================================================ */

const Auth = {
  init() {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    if (users.length === 0) {
      Storage.set(STORAGE_KEYS.USERS, [
        {
          id: 'u1',
          nombre: 'Sebastián Castro',
          email: 'seba@test.com',
          telefono: '+51 984 555 111',
          dni: '45678901',
          password: '123456',
          foto: unsplash('1535713875002-d1d0cf377fde', 200),
          creado: Date.now() - 86400000 * 60
        },
        {
          id: 'u2',
          nombre: 'Camila Vargas',
          email: 'camila@test.com',
          telefono: '+51 984 555 222',
          dni: '47890123',
          password: '123456',
          foto: unsplash('1544005313-94ddf0286df2', 200),
          creado: Date.now() - 86400000 * 30
        }
      ]);
    }

    // Reservas de ejemplo para los usuarios demo
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    if (reservas.length === 0) {
      const hoy = new Date();
      const futuras = [];
      for (let i = 0; i < 5; i++) {
        const entrada = new Date(hoy);
        entrada.setDate(entrada.getDate() + 15 + (i * 25));
        const salida = new Date(entrada);
        salida.setDate(salida.getDate() + 3);
        futuras.push({
          id: 'r_demo_' + (i + 1),
          codigo: 'CAB-2026-' + String(1000 + i).padStart(4, '0'),
          userId: i % 2 === 0 ? 'u1' : 'u2',
          cabanaId: ['cab1','cab2','cab3','cab4','cab2'][i],
          fechaEntrada: entrada.toISOString().split('T')[0],
          fechaSalida: salida.toISOString().split('T')[0],
          huespedes: 2 + (i % 3),
          adultos: 2,
          niños: i % 3,
          servicios: i % 2 === 0 ? ['s1'] : [],
          total: 180 * 3 + (i % 2 === 0 ? 25 : 0),
          estado: ['confirmada','pagada','pendiente','pagada','confirmada'][i],
          pago: i % 2 === 0 ? null : {
            transaccionId: 'TXN-' + Date.now() + '-' + i,
            tarjeta: '**** **** **** 4242',
            titular: i % 2 === 0 ? 'Sebastián Castro' : 'Camila Vargas',
            fechaPago: Date.now() - 86400000 * (i + 1)
          },
          creado: Date.now() - 86400000 * (i + 2),
          motivo: ''
        });
      }
      Storage.set(STORAGE_KEYS.RESERVAS, futuras);
    }
  },

  current() {
    const s = Storage.get(STORAGE_KEYS.SESSION);
    if (!s) return null;
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    return users.find(u => u.id === s.userId) || null;
  },

  isLogged() { return !!this.current(); },

  login(email, password) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Email o contraseña incorrectos.' };
    Storage.set(STORAGE_KEYS.SESSION, { userId: user.id, token: 'tkn_' + Date.now(), expires: Date.now() + 86400000 * 7 });
    return { ok: true, user };
  },

  register(data) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Ya existe una cuenta con este email.' };
    }
    const nuevo = {
      id: 'u_' + Date.now(),
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono || '',
      dni: data.dni || '',
      password: data.password,
      foto: unsplash('1633332755192-727a05c16031', 200),
      creado: Date.now()
    };
    users.push(nuevo);
    Storage.set(STORAGE_KEYS.USERS, users);
    Storage.set(STORAGE_KEYS.SESSION, { userId: nuevo.id, token: 'tkn_' + Date.now(), expires: Date.now() + 86400000 * 7 });
    return { ok: true, user: nuevo };
  },

  recoverPasswordStep1(email) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No encontramos una cuenta con ese email.' };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = Storage.get(STORAGE_KEYS.RECOVERY, {});
    codes[email.toLowerCase()] = { code, expires: Date.now() + 600000 };
    Storage.set(STORAGE_KEYS.RECOVERY, codes);
    return { ok: true, code, user };
  },

  recoverPasswordStep2(email, code) {
    const codes = Storage.get(STORAGE_KEYS.RECOVERY, {});
    const stored = codes[email.toLowerCase()];
    if (!stored) return { ok: false, error: 'Solicita primero un código de recuperación.' };
    if (Date.now() > stored.expires) return { ok: false, error: 'El código ha expirado.' };
    if (stored.code !== code) return { ok: false, error: 'Código incorrecto.' };
    return { ok: true };
  },

  recoverPasswordStep3(email, newPassword) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { ok: false, error: 'Cuenta no encontrada.' };
    users[idx].password = newPassword;
    Storage.set(STORAGE_KEYS.USERS, users);
    const codes = Storage.get(STORAGE_KEYS.RECOVERY, {});
    delete codes[email.toLowerCase()];
    Storage.set(STORAGE_KEYS.RECOVERY, codes);
    return { ok: true };
  },

  updateProfile(userId, data) {
    const users = Storage.get(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };
    users[idx] = { ...users[idx], ...data };
    Storage.set(STORAGE_KEYS.USERS, users);
    return { ok: true, user: users[idx] };
  },

  logout() {
    Storage.remove(STORAGE_KEYS.SESSION);
  }
};

/* ============================================================
   CABAÑAS Y DISPONIBILIDAD
   ============================================================ */

const Cabanas = {
  all() { return CABAÑAS; },

  getById(id) { return CABAÑAS.find(c => c.id === id); },

  precioNoche(cabana, fecha) {
    if (!cabana) return 0;
    const d = new Date(fecha);
    const mes = d.getMonth();
    // Temporada alta: junio(5), julio(6), agosto(7), diciembre(11), enero(0), febrero(1), semana santa (variable, simplificado)
    const temporadaAlta = [5, 6, 7, 11, 0, 1];
    return temporadaAlta.includes(mes) ? cabana.precioTemporadaAlta : cabana.precioNoche;
  },

  diasOcupados(cabanaId, desde, hasta) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    const inicio = desde ? new Date(desde) : new Date();
    const fin = hasta ? new Date(hasta) : new Date(inicio.getFullYear(), inicio.getMonth() + 6, 0);
    const dias = new Set();
    reservas.forEach(r => {
      if (r.cabanaId !== cabanaId) return;
      if (['cancelada'].includes(r.estado)) return;
      const e = new Date(r.fechaEntrada);
      const s = new Date(r.fechaSalida);
      const d = new Date(e);
      while (d < s) {
        if (d >= inicio && d <= fin) {
          dias.add(d.toISOString().split('T')[0]);
        }
        d.setDate(d.getDate() + 1);
      }
    });
    return Array.from(dias);
  }
};

/* ============================================================
   RESERVAS
   ============================================================ */

const Reservas = {
  init() {},

  generarCodigo() {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `CAB-${year}-${num}`;
  },

  create(data) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    const nueva = {
      id: 'r_' + Date.now(),
      codigo: this.generarCodigo(),
      userId: data.userId,
      cabanaId: data.cabanaId,
      fechaEntrada: data.fechaEntrada,
      fechaSalida: data.fechaSalida,
      huespedes: data.huespedes,
      adultos: data.adultos || data.huespedes,
      niños: data.niños || 0,
      servicios: data.servicios || [],
      total: data.total,
      estado: 'confirmada',
      pago: null,
      creado: Date.now(),
      motivo: ''
    };
    reservas.push(nueva);
    Storage.set(STORAGE_KEYS.RESERVAS, reservas);
    return nueva;
  },

  getById(id) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    return reservas.find(r => r.id === id || r.codigo === id);
  },

  listByUser(userId) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    return reservas
      .filter(r => r.userId === userId)
      .sort((a, b) => b.creado - a.creado);
  },

  cancelar(reservaId, motivo) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    const idx = reservas.findIndex(r => r.id === reservaId);
    if (idx === -1) return { ok: false, error: 'Reserva no encontrada.' };
    if (['cancelada', 'completada'].includes(reservas[idx].estado)) {
      return { ok: false, error: 'Esta reserva no puede ser cancelada.' };
    }
    reservas[idx].estado = 'cancelada';
    reservas[idx].motivo = motivo || 'Cancelada por el usuario';
    reservas[idx].canceladaEn = Date.now();
    Storage.set(STORAGE_KEYS.RESERVAS, reservas);
    return { ok: true, reserva: reservas[idx] };
  },

  registrarPago(reservaId, pago) {
    const reservas = Storage.get(STORAGE_KEYS.RESERVAS, []);
    const idx = reservas.findIndex(r => r.id === reservaId);
    if (idx === -1) return { ok: false, error: 'Reserva no encontrada.' };
    reservas[idx].pago = pago;
    reservas[idx].estado = 'pagada';
    Storage.set(STORAGE_KEYS.RESERVAS, reservas);
    return { ok: true, reserva: reservas[idx] };
  },

  calcularTotal(cabanaId, entrada, salida, serviciosIds) {
    const cabana = Cabanas.getById(cabanaId);
    if (!cabana || !entrada || !salida) return 0;
    const e = new Date(entrada);
    const s = new Date(salida);
    const noches = Math.max(1, Math.round((s - e) / 86400000));
    let total = 0;
    const d = new Date(e);
    for (let i = 0; i < noches; i++) {
      total += Cabanas.precioNoche(cabana, d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    const serviciosAdicionales = (serviciosIds || [])
      .map(id => SERVICIOS.find(sv => sv.id === id))
      .filter(Boolean)
      .reduce((acc, sv) => acc + sv.precio, 0);
    return total + serviciosAdicionales;
  }
};

/* ============================================================
   PAGO SIMULADO
   ============================================================ */

const Pago = {
  validarTarjeta(numero) {
    const limpio = numero.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(limpio)) return false;
    let sum = 0, alt = false;
    for (let i = limpio.length - 1; i >= 0; i--) {
      let n = parseInt(limpio[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  },

  procesar(reserva, datosTarjeta) {
    // Simulación - cualquier tarjeta con formato válido pasa (Luhn)
    if (!this.validarTarjeta(datosTarjeta.numero)) {
      return { ok: false, error: 'Número de tarjeta inválido.' };
    }
    if (!datosTarjeta.nombre || datosTarjeta.nombre.trim().length < 3) {
      return { ok: false, error: 'Nombre del titular requerido.' };
    }
    if (!/^\d{2}\/\d{2}$/.test(datosTarjeta.expiracion)) {
      return { ok: false, error: 'Fecha de expiración inválida (MM/AA).' };
    }
    if (!/^\d{3,4}$/.test(datosTarjeta.cvv)) {
      return { ok: false, error: 'CVV inválido.' };
    }

    const pago = {
      transaccionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      tarjeta: '**** **** **** ' + datosTarjeta.numero.replace(/\s/g, '').slice(-4),
      titular: datosTarjeta.nombre,
      expiracion: datosTarjeta.expiracion,
      monto: reserva.total,
      fechaPago: Date.now(),
      tipo: 'completo'
    };
    return { ok: true, pago };
  }
};

/* ============================================================
   UI HELPERS
   ============================================================ */

const UI = {
  formatMoneda(n) {
    return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  },

  formatFecha(s) {
    if (!s) return '';
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const d = new Date(s + (s.length === 10 ? 'T00:00:00' : ''));
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatFechaLarga(s) {
    if (!s) return '';
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const d = new Date(s + (s.length === 10 ? 'T00:00:00' : ''));
    return d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
  },

  diffDias(entrada, salida) {
    const e = new Date(entrada + 'T00:00:00');
    const s = new Date(salida + 'T00:00:00');
    return Math.max(1, Math.round((s - e) / 86400000));
  },

  toast(msg, tipo = 'success') {
    const existentes = document.querySelectorAll('.toast');
    existentes.forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast ' + tipo;
    const iconos = {
      success: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
      error: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
      info: '<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    t.innerHTML = iconos[tipo] + '<span>' + msg + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 3500);
  },

  modal(opts) {
    const existentes = document.querySelectorAll('.modal-backdrop');
    existentes.forEach(m => m.remove());
    const m = document.createElement('div');
    m.className = 'modal-backdrop';
    m.innerHTML = `
      <div class="modal-content p-6">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-12 h-12 rounded-full ${opts.iconBg || 'bg-red-100'} flex items-center justify-center shrink-0">
            ${opts.icon || '<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold font-display text-gray-900 mb-1">${opts.titulo}</h3>
            <p class="text-sm text-gray-600">${opts.mensaje}</p>
          </div>
        </div>
        ${opts.body ? '<div class="mb-4">' + opts.body + '</div>' : ''}
        <div class="flex gap-3 justify-end mt-6">
          ${opts.cancelLabel !== null ? `<button data-action="cancel" class="btn-ghost">${opts.cancelLabel || 'Cancelar'}</button>` : ''}
          <button data-action="confirm" class="${opts.confirmClass || 'btn-primary'}">${opts.confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    const cerrarModal = () => {
      m.classList.remove('show');
      setTimeout(() => m.remove(), 200);
    };
    m.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      cerrarModal();
      opts.onCancel && opts.onCancel();
    });
    m.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
      cerrarModal();
      opts.onConfirm && opts.onConfirm();
    });
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        cerrarModal();
        opts.onCancel && opts.onCancel();
      }
    });
    return { cerrar: cerrarModal };
  }
};

/* ============================================================
   LAYOUT: HEADER Y FOOTER
   ============================================================ */

function buildHeader(active) {
  const user = Auth.current();
  const isLogged = !!user;

  const links = [
    { id: 'inicio', href: 'index.html', label: 'Inicio' },
    { id: 'servicios', href: 'servicios.html', label: 'Servicios' },
    { id: 'galeria', href: 'galeria.html', label: 'Galería' },
    { id: 'precios', href: 'precios.html', label: 'Precios' },
    { id: 'contacto', href: 'contacto.html', label: 'Contacto' }
  ];

  const navLinks = links.map(l => `
    <a href="${l.href}" class="relative px-3 py-2 text-sm font-medium transition-colors ${active === l.id ? 'text-primary' : 'text-gray-700'} hover:text-primary">
      ${l.label}
      ${active === l.id ? '<span class="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full"></span>' : ''}
    </a>
  `).join('');

  const userMenu = isLogged ? `
    <div class="relative group">
      <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-cream transition">
        <span class="img-fallback w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 inline-block" style="background-color:#ede0ce;">
          <img src="${user.foto}" alt="${user.nombre}" class="w-full h-full object-cover relative z-10" loading="lazy"/>
        </span>
        <span class="hidden md:inline text-sm font-medium text-gray-800">${user.nombre.split(' ')[0]}</span>
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div class="p-3 border-b border-border">
          <p class="text-sm font-semibold text-gray-900">${user.nombre}</p>
          <p class="text-xs text-muted truncate">${user.email}</p>
        </div>
        <a href="perfil.html" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-background-cream">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Mi perfil
        </a>
        <a href="perfil.html#reservas" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-background-cream">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Mis reservas
        </a>
        <button id="btnLogout" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-border">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  ` : `
    <a href="inicio-sesion.html" class="hidden sm:inline-flex btn-ghost text-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
      Iniciar sesión
    </a>
    <a href="registro.html" class="btn-primary text-sm">Crear cuenta</a>
  `;

  return `
    <header class="sticky top-0 z-50 backdrop-blur-md bg-background-light/85 border-b border-border shadow-sm" id="siteHeader">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <a href="index.html" class="flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-lg gradient-wood flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <div class="hidden sm:block">
              <p class="font-display text-lg font-bold leading-none text-gray-900">Cabañas del Bosque</p>
              <p class="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Escapadas únicas</p>
            </div>
          </a>

          <nav class="hidden lg:flex items-center gap-1">${navLinks}</nav>

          <div class="flex items-center gap-2">
            ${userMenu}
            <a href="reserva.html" class="hidden md:inline-flex btn-primary text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Reservar
            </a>
            <button id="btnMenu" class="lg:hidden p-2 rounded-lg hover:bg-background-cream" aria-label="Menú">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        <nav id="navMobile" class="hidden lg:hidden flex-col pb-4 gap-1 border-t border-border">
          ${links.map(l => `<a href="${l.href}" class="px-3 py-2.5 rounded-lg text-sm font-medium ${active === l.id ? 'bg-background-cream text-primary' : 'text-gray-700 hover:bg-background-cream'}">${l.label}</a>`).join('')}
          <a href="reserva.html" class="btn-primary text-sm mt-2">Reservar ahora</a>
          ${!isLogged ? `
            <div class="flex gap-2 mt-2 pt-3 border-t border-border">
              <a href="inicio-sesion.html" class="btn-outline flex-1 text-sm">Iniciar sesión</a>
              <a href="registro.html" class="btn-primary flex-1 text-sm">Registrarse</a>
            </div>
          ` : `
            <button id="btnLogoutMobile" class="text-left text-red-600 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 border-t border-border mt-2">Cerrar sesión</button>
          `}
        </nav>
      </div>
    </header>
  `;
}

function buildFooter() {
  return `
    <footer class="wood-pattern text-gray-300 mt-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-lg gradient-wood flex items-center justify-center text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              </div>
              <p class="font-display text-lg font-bold text-white">Cabañas del Bosque</p>
            </div>
            <p class="text-sm leading-relaxed text-gray-400">Tu refugio natural donde el bosque abraza cada momento. Escapadas únicas en cabañas de montaña con todas las comodidades.</p>
          </div>

          <div>
            <h4 class="font-display font-bold text-white mb-4 text-base">Explora</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="index.html" class="hover:text-primary-light transition">Inicio</a></li>
              <li><a href="servicios.html" class="hover:text-primary-light transition">Servicios</a></li>
              <li><a href="galeria.html" class="hover:text-primary-light transition">Galería</a></li>
              <li><a href="precios.html" class="hover:text-primary-light transition">Precios</a></li>
              <li><a href="reserva.html" class="hover:text-primary-light transition">Reservar</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-display font-bold text-white mb-4 text-base">Mi cuenta</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="inicio-sesion.html" class="hover:text-primary-light transition">Iniciar sesión</a></li>
              <li><a href="registro.html" class="hover:text-primary-light transition">Crear cuenta</a></li>
              <li><a href="perfil.html" class="hover:text-primary-light transition">Mis reservas</a></li>
              <li><a href="contacto.html" class="hover:text-primary-light transition">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-display font-bold text-white mb-4 text-base">Contacto</h4>
            <ul class="space-y-3 text-sm">
              <li class="flex gap-2 items-start">
                <svg class="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span class="text-gray-400">${INFO_CONTACTO.direccion}</span>
              </li>
              <li class="flex gap-2 items-center">
                <svg class="w-4 h-4 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span class="text-gray-400">${INFO_CONTACTO.telefono}</span>
              </li>
              <li class="flex gap-2 items-center">
                <svg class="w-4 h-4 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span class="text-gray-400">${INFO_CONTACTO.email}</span>
              </li>
            </ul>
            <div class="flex gap-3 mt-5">
              <a href="#" class="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition" aria-label="Facebook">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.313h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition" aria-label="Instagram">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a6 6 0 0112 0v6a6 6 0 01-6 6 6 6 0 01-6-6V9z"/><circle cx="15" cy="9" r="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary flex items-center justify-center transition" aria-label="WhatsApp">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-primary/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p class="text-gray-500">© ${new Date().getFullYear()} Cabañas del Bosque. Todos los derechos reservados.</p>
          <div class="flex flex-wrap gap-4 text-xs text-gray-500">
            <a href="terminos.html" class="hover:text-primary-light transition">Términos y condiciones</a>
            <a href="privacidad.html" class="hover:text-primary-light transition">Política de privacidad</a>
            <span>· Hecho con cuidado en el bosque</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function initLayout(active) {
  Auth.init();
  Reservas.init();

  const headerHost = document.getElementById('appHeader');
  const footerHost = document.getElementById('appFooter');
  if (headerHost) headerHost.innerHTML = buildHeader(active);
  if (footerHost) footerHost.innerHTML = buildFooter();

  const btnMenu = document.getElementById('btnMenu');
  const navMobile = document.getElementById('navMobile');
  if (btnMenu && navMobile) {
    btnMenu.addEventListener('click', () => {
      navMobile.classList.toggle('hidden');
      navMobile.classList.toggle('flex');
    });
  }

  const bindLogout = (sel) => {
    const el = document.querySelector(sel);
    if (el) el.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      UI.toast('Sesión cerrada correctamente', 'success');
      setTimeout(() => window.location.href = 'index.html', 600);
    });
  };
  bindLogout('#btnLogout');
  bindLogout('#btnLogoutMobile');

  // Header con efecto al hacer scroll
  const header = document.getElementById('siteHeader');
  if (header) {
    const update = () => {
      if (window.scrollY > 30) {
        header.classList.add('shadow-md');
      } else {
        header.classList.remove('shadow-md');
      }
    };
    window.addEventListener('scroll', update);
    update();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page') || '';
  initLayout(page);
  if (typeof pageInit === 'function') pageInit();
});

/* ============================================================
   EXPORTAR a window para acceso desde pageInit
   ============================================================ */
window.Auth = Auth;
window.Cabanas = Cabanas;
window.Reservas = Reservas;
window.Pago = Pago;
window.UI = UI;
window.Storage = Storage;
window.SERVICIOS = SERVICIOS;
window.CABAÑAS = CABAÑAS;
window.PAQUETES = PAQUETES;
window.HORARIOS = HORARIOS;
window.TESTIMONIOS = TESTIMONIOS;
window.INFO_CONTACTO = INFO_CONTACTO;