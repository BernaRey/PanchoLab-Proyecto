import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function Terminos({
  usuario,
  navegar,
  cantidadCarrito,
  alAbrirCarrito,
  tiendaAbierta,
  cargandoTienda,
}) {
  return (
    <div className="pagina">
      <Navbar
        usuario={usuario}
        navegar={navegar}
        cantidadCarrito={cantidadCarrito}
        alAbrirCarrito={alAbrirCarrito}
        tiendaAbierta={tiendaAbierta}
        cargandoTienda={cargandoTienda}
      />

      <main className="terminos-pagina">
        <header className="terminos-portada">
          <p className="sobretitulo">PANCHO LAB · INFORMACIÓN LEGAL</p>
          <h1>Términos<br /><i>y condiciones.</i></h1>
          <p>Cómo funciona la tienda online, los pedidos a domicilio y el tratamiento de tus datos.</p>
        </header>

        <div className="terminos-contenido">
          <aside className="terminos-pendientes" aria-labelledby="titulo-datos-legales">
            <span className="terminos-numero">ANTES DE PUBLICAR</span>
            <h2 id="titulo-datos-legales">Faltan datos del titular del negocio</h2>
            <p>PanchoLab es el nombre comercial del proyecto. La normativa de comercio electrónico requiere identificar al proveedor con información completa y visible. El titular debe completar y verificar estos datos antes de ofrecer la web al público:</p>
            <ul>
              <li>Nombre o razón social del proveedor.</li>
              <li>RUT.</li>
              <li>Domicilio físico completo del establecimiento.</li>
              <li>Correo electrónico de atención al consumidor.</li>
              <li>Zona, horario y costo de envío.</li>
            </ul>
            <p>La información disponible por ahora ubica el proyecto en Colonia del Sacramento, Uruguay, pero no permite completar esos campos sin inventarlos.</p>
          </aside>

          <section className="terminos-bloque" aria-labelledby="terminos-ambito">
            <span className="terminos-numero">01 / ALCANCE</span>
            <h2 id="terminos-ambito">El sitio y su uso</h2>
            <p>Estos términos describen el uso del sitio PanchoLab, su catálogo de panchos culturales y la preparación de pedidos para entrega a domicilio en Colonia del Sacramento y zonas que el local confirme. Navegar el sitio no crea por sí solo una compra ni reemplaza la confirmación expresa del pedido.</p>
            <p>La persona usuaria se compromete a proporcionar datos correctos, usar el sitio de forma lícita y no intentar acceder sin autorización a cuentas, sistemas, datos o servicios, interferir en su funcionamiento, ni introducir código malicioso. La normativa penal uruguaya sobre ciberdelincuencia se aplica con independencia de esta cláusula.</p>
          </section>

          <section className="terminos-bloque" aria-labelledby="terminos-catalogo">
            <span className="terminos-numero">02 / CATÁLOGO</span>
            <h2 id="terminos-catalogo">Productos, ingredientes y disponibilidad</h2>
            <p>El catálogo se actualiza desde la base de datos del local. La disponibilidad y el stock pueden cambiar. Las fotos son ilustrativas; la descripción e ingredientes publicados identifican cada receta, y cualquier sustitución relevante debe confirmarse antes de aceptar el pedido.</p>
            <p>Si tenés una alergia, intolerancia o necesidad alimentaria, consultá al local antes de pedir. Las fichas actuales no detallan el riesgo de contacto cruzado, por lo que no se debe interpretar la ausencia de un ingrediente en la lista como garantía de que el producto sea apto.</p>
          </section>

          <section className="terminos-bloque" aria-labelledby="terminos-pedidos">
            <span className="terminos-numero">03 / PEDIDOS Y ENVÍOS</span>
            <h2 id="terminos-pedidos">Del carrito a tu puerta</h2>
            <ol>
              <li>El carrito permite revisar productos, cantidades y subtotal antes de iniciar el pedido.</li>
              <li>Al confirmar, el sitio vuelve a validar stock y prepara un mensaje con los datos de entrega para WhatsApp.</li>
              <li>El pedido queda pendiente hasta que el local confirme por WhatsApp la disponibilidad, el precio final, el costo y la zona de entrega y el plazo estimado.</li>
              <li>El checkout actual informa pago en efectivo. No se procesa un pago con tarjeta dentro del sitio.</li>
            </ol>
            <p>Los precios del catálogo y el subtotal se expresan en pesos uruguayos (UYU). El checkout todavía no calcula un costo de envío: el local debe informar zona, disponibilidad y costo final antes de aceptar el pedido.</p>
            <p>Si un artículo no está disponible, el local deberá informarte y coordinar cualquier cambio o devolución antes de continuar. Para errores, demoras o un producto distinto al solicitado, escribinos cuanto antes por el canal de contacto del sitio.</p>
          </section>

          <section className="terminos-bloque" aria-labelledby="terminos-arrepentimiento">
            <span className="terminos-numero">04 / DERECHOS DEL CONSUMIDOR</span>
            <h2 id="terminos-arrepentimiento">Cancelaciones y reclamos</h2>
            <p>Las compras realizadas a distancia se rigen por la Ley uruguaya N.º 17.250 y su reglamentación. Al 31 de octubre de 2026, el artículo 16 establece con carácter general un plazo de cinco días hábiles para comunicar la rescisión o resolución, sujeto a las excepciones legales. El artículo 16-BIS incluye, entre otras, productos que puedan deteriorarse rápidamente y determinados servicios de comida contratados para una fecha o período específico. La aplicación de una excepción depende del caso y no elimina los derechos por incumplimiento, faltantes o productos no conformes.</p>
            <p>La Ley N.º 20.531, publicada en octubre de 2026, sustituirá el artículo 16 desde el 1.º de enero de 2027: prevé un plazo general de diez días corridos y exige a los proveedores que venden por medios informáticos un enlace visible denominado «Botón de arrepentimiento», sin perjuicio de las excepciones legales. El titular deberá adaptar el sitio antes de esa fecha; este proyecto aún no tiene ese mecanismo implementado.</p>
            <p>Los reclamos también pueden presentarse ante la Unidad Defensa del Consumidor del Ministerio de Economía y Finanzas, sin perjuicio de otros derechos que correspondan.</p>
          </section>

          <section className="terminos-bloque" aria-labelledby="terminos-privacidad">
            <span className="terminos-numero">05 / PRIVACIDAD</span>
            <h2 id="terminos-privacidad">Qué datos se usan y para qué</h2>
            <p>En el formulario de contacto se ingresan nombre, correo y mensaje. Al preparar un pedido se ingresan nombre, dirección de entrega y notas. El servidor usa esos datos para preparar el mensaje de contacto o pedido; cuando la persona usuaria lo envía, WhatsApp y el local reciben su contenido. El sitio no ofrece cuentas de clientes ni guarda un historial de pedidos con esos datos personales.</p>
            <p>El asistente de sabores envía el mensaje escrito en el chat y el contexto del catálogo a la API de Gemini de Google para generar una respuesta. No ingreses allí datos de pago, documentos, información de salud ni otros datos sensibles.</p>
            <p>El inicio de sesión de administración usa una cookie de sesión estrictamente necesaria para autenticar al administrador. El carrito se mantiene en memoria durante la visita y no utiliza almacenamiento local persistente. No se identificó una herramienta de publicidad o analítica en esta versión.</p>
            <p>La Ley N.º 18.331 y el Decreto N.º 414/009 reconocen derechos de acceso, rectificación, actualización, inclusión y supresión de datos, con las limitaciones previstas por la ley. El responsable debe proporcionar un canal de atención y su domicilio: esos datos del titular siguen pendientes de completar en el aviso de identificación de esta página.</p>
          </section>

          <section className="terminos-bloque" aria-labelledby="terminos-seguridad">
            <span className="terminos-numero">06 / SEGURIDAD Y CAMBIOS</span>
            <h2 id="terminos-seguridad">Protección del sitio</h2>
            <p>PanchoLab aplica medidas técnicas para operar la tienda y proteger el acceso administrativo. Ningún servicio en internet puede garantizar disponibilidad ininterrumpida o ausencia absoluta de incidentes; ante una falla, el catálogo, la tienda o el envío de pedidos pueden quedar temporalmente fuera de servicio.</p>
            <p>Los cambios de estos términos se publicarán en esta página con una nueva fecha de actualización. Se aplicará la normativa uruguaya vigente y se mantendrán los derechos irrenunciables de las personas consumidoras.</p>
          </section>

          <section className="terminos-fuentes" aria-labelledby="terminos-fuentes-titulo">
            <span className="terminos-numero">FUENTES OFICIALES</span>
            <h2 id="terminos-fuentes-titulo">Normativa consultada</h2>
            <ul>
              <li><a href="https://www.impo.com.uy/bases/leyes/17250-2000" target="_blank" rel="noreferrer">Ley N.º 17.250 · Relaciones de consumo</a></li>
              <li><a href="https://www.impo.com.uy/bases/decretos/167-2021" target="_blank" rel="noreferrer">Decreto N.º 167/021 · Comercio electrónico</a></li>
              <li><a href="https://www.impo.com.uy/bases/leyes/20531-2026/2" target="_blank" rel="noreferrer">Ley N.º 20.531 · Vigencia general desde el 1.º de enero de 2027</a></li>
              <li><a href="https://www.impo.com.uy/bases/leyes-originales/20531-2026/108" target="_blank" rel="noreferrer">Ley N.º 20.531, artículo 108 · Cambios al derecho de arrepentimiento</a></li>
              <li><a href="https://www.impo.com.uy/bases/leyes/18331-2008" target="_blank" rel="noreferrer">Ley N.º 18.331 · Protección de datos personales</a></li>
              <li><a href="https://www.impo.com.uy/bases/decretos/414-2009" target="_blank" rel="noreferrer">Decreto N.º 414/009 · Reglamentación de datos personales</a></li>
              <li><a href="https://www.impo.com.uy/bases/leyes/20327-2024" target="_blank" rel="noreferrer">Ley N.º 20.327 · Prevención y represión de la ciberdelincuencia</a></li>
            </ul>
          </section>

          <p className="terminos-nota">Este texto se preparó para reflejar la versión actual del sitio y las normas identificadas. No reemplaza una revisión jurídica del negocio ni completa los datos comerciales que debe proporcionar su titular.</p>
        </div>
      </main>

      <Footer navegar={navegar} />
    </div>
  );
}
