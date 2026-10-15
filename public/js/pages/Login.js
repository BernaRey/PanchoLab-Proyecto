import { auth } from '../services/api.js';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function Login({ usuario, navegar, onAuth }) {
  const React = window.React;
  const h = React.createElement;
  const [modo, setModo] = React.useState('login'); // 'login' | 'registro'
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
      if (modo === 'login') {
        await auth.login(username, password);
        setMensaje('Sesión iniciada correctamente');
        setTipoMensaje('exito');
        if (onAuth) onAuth();
      } else {
        await auth.registro(username, password);
        setMensaje('Usuario registrado. Ya podés iniciar sesión.');
        setTipoMensaje('exito');
        setModo('login');
      }
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
          h('h2', null, modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'),
          h('form', { onSubmit: manejarEnvio },
            h('div', { className: 'campo' },
              h('label', null, 'Usuario'),
              h('input', {
                type: 'text',
                required: true,
                value: username,
                onChange: (e) => setUsername(e.target.value),
                placeholder: 'Tu nombre de usuario',
              })
            ),
            h('div', { className: 'campo' },
              h('label', null, 'Contraseña'),
              h('input', {
                type: 'password',
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: 'Mínimo 6 caracteres',
              })
            ),
            mensaje && h('div', { className: `mensaje mensaje${tipoMensaje === 'exito' ? 'Exito' : 'Error'}` }, mensaje),
            h('button', {
              type: 'submit',
              className: 'boton boton-primario',
              disabled: enviando,
            }, enviando ? 'Procesando...' : (modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'))
          ),
          h('p', { className: 'cambioRol' },
            modo === 'login'
              ? '¿No tenés cuenta? '
              : '¿Ya tenés cuenta? ',
            h('a', {
              href: '#',
              onClick: (e) => { e.preventDefault(); setModo(modo === 'login' ? 'registro' : 'login'); },
            }, modo === 'login' ? 'Regístrate' : 'Iniciá sesión')
          )
        )
      )
    ),
    h(Footer, null)
  );
}
