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
- riesgo extremo de abandono

---

### Panel de seguimiento para tutores

Los tutores pueden:

- Ver la lista de estudiantes
- Visualizar el nivel de riesgo de cada estudiante
- Consultar historial de alertas e intervenciones
- Visualizar posibles seguimientos al estudiante

---

### Intervención automatizada

El sistema genera automáticamente:

- Alertas internas en el panel
- Sugerencias para cada tipo de nivel de seguimiento
- Notificaciones visuales en la plataforma

> Nota: en este prototipo es simulado mediante registros en localStorage.

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


Permisos
El tutor puede:

Ver todos los estudiantes guardados en localStorage

Consultar panel de analítica predictiva

Revisar alertas generadas automáticamente

Revisar sugerencias

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

