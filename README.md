# Beta Version Supabase React Test FE

## 📌 Descripción

Este proyecto es una aplicación web basada en React y Supabase, que implementa autenticación, restricción de rutas según roles de usuario y almacenamiento de sesiones mediante Context Provider.

## 🛠️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de contar con lo siguiente:

- Node.js (versión 20 o superior)
- NPM o Yarn (gestor de paquetes)
- Cuenta en Supabase

## 📥 Pasos para Configurar el Proyecto

### 🔹 1. Clonar el Repositorio

```sh
git clone https://github.com/EdgarJr30/beta_version_supabase_test_fe_react.git
cd supabase-react-test
```

### 🔹 2. Instalar Dependencias

```sh
npm install
```

### 🔹 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🔹 4. Ejecutar Supabase Localmente (Opcional)

Si deseas ejecutar Supabase en tu entorno local, usa:

```sh
docker-compose up -d
```

### 🔹 5. Ejecutar el Proyecto

```sh
npm run dev
```

## 🚀 Comandos de Ejecución

### 🔹 Ejecutar en Desarrollo

```sh
npm run dev
```

### 🔹 Crear el Build para Producción

```sh
npm run build
```

### 🔹 Ejecutar Tests

```sh
npm test
```

## 📌 Funcionalidades del Proyecto

✅ Autenticación con Supabase Auth  
✅ Manejo de roles y permisos  
✅ UI moderna con Tailwind CSS  
✅ Manejo de sesión con Context Provider  
✅ Implementación modular y escalable  

## 📂 Estructura del Código

```plaintext
.
├── src
│   ├── assets      # Files
│   ├── components  # Componentes reutilizables
│   ├── context     # Manejo de sesiones con Context Provider
│   ├── hooks       # Hooks personalizados
│   ├── lib         # Configuracion de librerias (Supabase)
│   ├── pages       # Páginas de la aplicación
│   ├── routes      # Definición de rutas protegidas
│   ├── services    # Servicios para comunicación con Supabase
│   ├── utils       # Utilidades de implementacion
│   ├── App.tsx     # Punto de entrada de la aplicación
│   └── main.tsx    # Renderizado principal de React
├── public          # Archivos estáticos
├── .env            # Variables de entorno
├── .gitignore      # Archivos a ignorar por Git
├── package.json    # Dependencias y scripts
├── tailwind.config.js # Configuración de Tailwind CSS
└── README.md       # Documentación del proyecto
```

## 🔐 Manejo de Roles y Restricciones de Rutas

- **Admin**: Acceso total a todas las rutas.
- **User**: Solo puede acceder a `/user`, no puede acceder a `/admin` ni `/testing`.
- **Testing**: Solo puede acceder a `/testing`, no puede acceder a `/admin` ni `/user`.

## 🎯 Notas Adicionales

📌 Mantén actualizada la URL de Supabase en caso de cambios.  
📌 Considera implementar manejo de estado global si la aplicación crece.  
📌 Verifica regularmente las configuraciones de seguridad en Supabase.  

## 🌐 Link de la Demo

[Acceder a la demo](https://betafereact.netlify.app/login)

## 👤 Usuarios de Prueba Según Roles

- **Admin**  
  - Usuario: `admin@demo.com`  
  - Contraseña: `admin`  

- **User**  
  - Usuario: `user@demo.com`  
  - Contraseña: `user`  

- **Testing**  
  - Usuario: `testing@demo.com`  
  - Contraseña: `testing` 

## 📜 Aviso de Copyright y Confidencialidad

© 2025, MoonCode. Todos los derechos reservados.

Este proyecto y todo su contenido son propiedad exclusiva del equipo de desarrollo. Está estrictamente prohibido copiar, reproducir, distribuir, modificar o divulgar este proyecto sin autorización previa.

Para consultas o autorizaciones, comunícate con:
📧 edgarjoel9912@gmail.com 
📞 +1 829-906-9969 
