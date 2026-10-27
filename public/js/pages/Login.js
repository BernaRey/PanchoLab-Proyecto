import { auth } from '../services/api.js';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function Login({ usuario, navegar, onAuth }) {
  const React = window.React;
  const h = React.createElement;
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [mensaje, setMensaje] = React.useState(null);
  const [tipoMensaje, setTipoMensaje] = React.useState('error');
  const [enviando, setEnviando] = React.useState(false);

  if (usuario) {
    navegar('/');
    return h('div', { className: 'pagina', style: { textAlign: 'center', padding: '3rem' } },
      h('p', null, 'Redirigiendo al catálogo...')
    );
  }

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setEnviando(true);
    try {
      await auth.login(username, password);
      setMensaje('Sesión iniciada correctamente');
      setTipoMensaje('exito');
      if (onAuth) await onAuth();
    } catch (e) {
      setMensaje(e.message || 'Ocurrió un error');
      setTipoMensaje('error');
    } finally {
      setEnviando(false);
    }
  };

  return h('div', { className: 'pagina' },
    h(Navbar, { usuario, navegar }),
    h('main', null,
      h('div', { className: 'loginPanel' },
        h('div', { className: 'loginTarjeta' },
          h('h2', null, 'Acceso de administración'),
          h('form', { onSubmit: manejarEnvio },
            h('div', { className: 'campo' },
              h('label', { htmlFor: 'usuario-admin' }, 'Usuario'),
              h('input', {
                id: 'usuario-admin',
                type: 'text',
                required: true,
                maxLength: 30,
                autoComplete: 'username',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                placeholder: 'Usuario administrador',
              })
            ),
            h('div', { className: 'campo' },
              h('label', { htmlFor: 'contrasena-admin' }, 'Contraseña'),
              h('input', {
                id: 'contrasena-admin',
                type: 'password',
                required: true,
                maxLength: 128,
                autoComplete: 'current-password',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: 'Contraseña de administrador',
              })
            ),
            mensaje && h('div', { className: `mensaje mensaje${tipoMensaje === 'exito' ? 'Exito' : 'Error'}` }, mensaje),
            h('button', {
              type: 'submit',
              className: 'boton boton-primario',
              disabled: enviando,
            }, enviando ? 'Ingresando...' : 'Iniciar sesión')
          )
        )
      )
    ),
    h(Footer, null)
  );
}
