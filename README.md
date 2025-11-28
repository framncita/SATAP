# Sistema de Alerta Temprana - Prototipo (Flask + localStorage)

## Descripción

Prototipo funcional de un **Sistema de Alerta Temprana con Analítica Predictiva** para entornos educativos.

Este prototipo permite:

- Predicción de riesgo de abandono académico
- Panel de seguimiento para tutores
- Envío de alertas automatizadas
- Registro de intervenciones preventivas

No utiliza base de datos real:

- Los datos se almacenan en **localStorage** del navegador.
- El servidor **Flask** solo se encarga de servir las páginas HTML, CSS y JavaScript.

---

## Funcionalidades principales

### Algoritmos de predicción de abandono

El sistema incluye un algoritmo básico de predicción que analiza variables como:

- Inasistencias
- Bajo rendimiento en evaluaciones
- Poca participación en actividades

Con estos datos, el sistema clasifica a los estudiantes en:

- Riesgo bajo
- Riesgo medio
- Riesgo alto de abandono

---

### Panel de seguimiento para tutores

Los tutores pueden:

- Ver la lista de estudiantes
- Visualizar el nivel de riesgo de cada estudiante
- Consultar historial de alertas e intervenciones
- Registrar acciones de acompañamiento

---

### Intervención automatizada

El sistema genera automáticamente:

- Alertas internas en el panel
- Simulación de envío de correos electrónicos
- Notificaciones visuales en la plataforma

> Nota: en este prototipo el envío de correos es simulado mediante registros en localStorage.

---

## Tecnologías utilizadas

- Python
- Flask
- HTML
- CSS
- JavaScript
- localStorage

---

## Cómo ejecutar

1. Instalar dependencias

python -m venv venv
source venv/bin/activate   # o venv\Scripts\activate en Windows

pip install -r requirements.txt

2. Ejecutar la aplicación
python app.py

3. Abrir en el navegador
http://127.0.0.1:5000


Notas
Usuarios por defecto

Tutor (administrador):

Usuario: admin

Clave: 1234

Usuario de prueba (estudiante):

Usuario: camila

Clave: 1234

Permisos
El tutor puede:

Ver todos los estudiantes guardados en localStorage

Consultar panel de analítica predictiva

Revisar alertas generadas automáticamente

Registrar intervenciones manuales

Los estudiantes pueden:

Ver su propio nivel de riesgo

Recibir notificaciones simuladas

Consultar su historial académico

Almacenamiento de datos

Todos los datos se guardan en el navegador mediante localStorage:

usuarios

alertas

predicciones

intervenciones

Resetear los datos

Para limpiar los datos del prototipo:

Abre las DevTools del navegador (F12)

Ve a Application > LocalStorage

Selecciona http://127.0.0.1:5000

Borra las claves manualmente

Notas finales

Este proyecto es solo un prototipo académico.
No usa inteligencia artificial real ni envíos de correo reales.

