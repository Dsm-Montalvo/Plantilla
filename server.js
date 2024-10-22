const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware para manejar sesiones
app.use(session({
  secret: 'tu_secreto_aqui', // Cambia esto a un secreto más seguro
  resave: false,
  saveUninitialized: true,
}));

// Middleware para parsear formularios
app.use(express.urlencoded({ extended: true }));

// Almacenamiento de usuarios (en un entorno real, usarías una base de datos)
let users = [];

// Crear un usuario maestro
(async () => {
  const masterUsername = 'admin@admin.com';
  const masterPassword = 'admin123';
  const hashedMasterPassword = await bcrypt.hash(masterPassword, 10);
  
  // Agregar el usuario maestro al arreglo de usuarios
  users.push({ username: masterUsername, password: hashedMasterPassword });
})();

// Middleware de autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/sistema.html'); // Redirige a la página de login si no está autenticado
}

// Ruta para la página principal
app.use(express.static('public'));

// Página de registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Verificar si el usuario ya existe
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.redirect('/sistema.html'); // Redirige si el usuario ya existe
  }
  
  users.push({ username, password: hashedPassword });
  res.redirect('/sistema.html'); // Redirige a la página de inicio de sesión
});

// Página de inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    return res.redirect('/sitio.html'); // Redirige a la página de inicio del sistema
  }
  res.redirect('/sistema.html'); // Redirige si la autenticación falla
});

// Página de cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/sistema.html'); // Redirige si hay un error
    }
    res.redirect('/sistema.html'); // Redirige a la página de login
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}/sistema.html`);
});