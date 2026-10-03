# Cabaña-01 · Cabañas del Bosque

Plantilla HTML/CSS/JS lista para personalizar de un sitio de reservas de cabañas
con flujo completo de catálogo, autenticación, reserva y pago simulado en el
navegador (sin backend).

## Stack

- **HTML5** estático, una página por vista.
- **Tailwind CSS** cargado por CDN (`cdn.tailwindcss.com` con plugins `forms` y `container-queries`).
- **CSS propio** en `css/styles.css` (paleta cálida, fuentes, hero, tarjetas,
  timeline de reserva, etc.).
- **JavaScript vanilla** en `main.js` como núcleo compartido por todas las
  páginas (datos, storage, auth, reservas, pago y layout).
- **Google Fonts**: `Playfair Display` (display) + `Inter` (sans).
- **Imágenes** servidas desde Unsplash mediante helper `unsplash(id, w)`.

No requiere build, ni dependencias de npm, ni servidor. Basta con abrir los
`.html` en un navegador o servirlos con cualquier static server.

## Estructura

```
cabaña-01/
├── index.html                  Inicio (hero + secciones)
├── galeria.html                Galería filtrable
├── precios.html                Planes y tarifas
├── servicios.html              Servicios adicionales
├── contacto.html               Formulario + horarios
├── reserva.html                Wizard de reserva (4 pasos)
├── detalle-reserva.html        Timeline de una reserva
├── pago.html                   Checkout (anticipo o total)
├── pago-confirmado.html        Confirmación de pago
├── confirmacion.html           Resumen final
├── perfil.html                 Panel del usuario con sus reservas
├── registro.html               Alta de cuenta
├── inicio-sesion.html          Login
├── recuperar-password.html     Recuperación con código
├── terminos.html
├── privacidad.html
├── css/styles.css              Estilos propios + configuración de tema
└── main.js                     Lógica compartida
```

## Páginas y flujo

```
Inicio → Catálogo (galería / precios / servicios)
       → Contacto
       → Registro / Login / Recuperar contraseña
       → Reserva (4 pasos) → Pago (anticipo 50% o total)
                       → Pago confirmado → Confirmación
       → Perfil (filtro por estado) → Detalle de reserva
```

Estados de reserva: `pending → confirmada → pagada → completada` (o
`cancelada` en cualquier momento previo al check-in).

## Lógica principal (`main.js`)

| Sección | Descripción |
| --- | --- |
| `STORAGE_KEYS` | Claves de `localStorage` (prefijo `cdb_`). |
| Catálogo | `CABAÑAS`, `SERVICIOS`, `GALERIA`, `PLANES`. |
| `Auth` | `register`, `login`, `logout`, `requestRecoveryCode`, `resetPassword`, `updateProfile`. |
| `Reservas` | `getById`, `getByUser`, `create`, `update`, `cancel` y totales. |
| `Pago` | Validación Luhn de tarjeta y armado del payload de pago. |
| `UI` | Helpers de formato (fechas, moneda) y modales. |
| `Layout` | Render de `appHeader` y `appFooter` con la navegación y estado de sesión. |

Cada página expone `pageInit()`; `main.js` lo ejecuta tras montar el layout.

### Storage

```
cdb_users              Usuarios registrados
cdb_session            Sesión activa
cdb_reservas           Reservas creadas
cdb_reserva_draft      Borrador del wizard de reserva
cdb_pago_draft         Borrador de pago
cdb_contact_messages   Mensajes del formulario de contacto
cdb_recovery_codes     Códigos temporales de recuperación
```

Al primer arranque se siembran dos usuarios demo (`u1`, `u2`) y reservas de
ejemplo para que las pantallas nunca aparezcan vacías. Para reiniciar el
estado basta con limpiar el `localStorage` del origen.

## Personalización rápida

- **Colores y fuentes**: ver la configuración de `tailwind.config` al inicio de
  `index.html` (cualquier `.html` la repite). Tokens clave: `primary`,
  `secondary`, `accent`, `background-light`, `background-cream`,
  `background-soft`, `background-dark`.
- **Datos del catálogo**: editar los arreglos `CABAÑAS`, `SERVICIOS`,
  `GALERIA`, `PLANES` en `main.js`.
- **Imágenes**: reemplazar URLs de Unsplash por assets propios manteniendo
  mismo tamaño o actualizar el helper `unsplash()`.
- **Textos legales**: `terminos.html` y `privacidad.html`.
- **Imágenes rotas**: hay un handler global que añade `.img-broken` para que
  el `background` del contenedor actúe como fallback.

## Cómo ejecutar

Opción más simple: doble clic en `index.html`.

Servidor local recomendado (evita restricciones de `file://` con algunos
navegadores):

```bash
# Python 3
python -m http.server 8080

# o con Node
npx serve .
```

Luego abrir <http://localhost:8080>.

## Compatibilidad

Navegadores modernos (últimas dos versiones de Chrome, Edge, Firefox y
Safari). Usa `localStorage`, `Intl`, `crypto` ligero y APIs DOM estándar; no
incorpora polyfills.