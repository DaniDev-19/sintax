# Guía de Conexión a Supabase para Sintax

Sintax está diseñado con un modo **Híbrido Inteligente**:
- Funciona **inmediatamente** con datos locales y `localStorage`.
- Cuando desees persistencia en la nube en tiempo real, solo sigue estos sencillos pasos.

---

### Paso 1: Crear tu Proyecto en Supabase (Gratis)
1. Entra a [https://supabase.com](https://supabase.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"New project"**.
3. Asigna un nombre a tu proyecto (ej: `sintax-app`) y define una contraseña para la base de datos.
4. Selecciona la región más cercana a ti y haz clic en **"Create new project"**.

---

### Paso 2: Ejecutar el Script SQL
1. En el menú lateral izquierdo de Supabase, ve a **SQL Editor** (icono con `>_`).
2. Haz clic en **"New query"**.
3. Abre el archivo [schema.sql](./schema.sql) ubicado en esta carpeta, copia todo su contenido y pégalo en el editor de Supabase.
4. Haz clic en el botón verde **"Run"** (o presiona `Ctrl + Enter`).
   - ¡Listo! Se habrán creado todas las tablas con sus llaves foráneas y tipos de datos.

---

### Paso 3: Conectar las Credenciales a tu Aplicación
1. En el panel de Supabase, ve a **Project Settings** (icono de engranaje) -> **API**.
2. Copia:
   - **Project URL**
   - **anon public Key**
3. Abre el archivo `.env` en la raíz de tu proyecto `d:\proyectos\exam-challenguer` y reemplaza los valores:

```env
VITE_SUPABASE_URL=https://tu-id-de-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

4. Reinicia tu servidor de desarrollo con `npm run dev`. ¡Tu aplicación ya estará sincronizada con la nube!

