from flask import Flask, request, jsonify, render_template
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import datetime
import json

app = Flask(__name__)

# --- Entrenar modelo con datos sintéticos al iniciar ---
def generar_datos_sinteticos(n=1000, random_state=42):
    rng = np.random.RandomState(random_state)
    # Features de ejemplo: asistencia_pct, notas_promedio (0-100), interacciones_vista (conteo), semanas_desde_registro
    asistencia = rng.uniform(30, 100, size=n)
    notas = rng.uniform(30, 100, size=n)
    interacciones = rng.poisson(5, size=n) + rng.uniform(0,5,size=n)
    semanas = rng.randint(1, 40, size=n)

    # Regla simple para generar abandono (probabilístico)
    logits = (
        -0.05 * asistencia
        -0.04 * notas
        -0.15 * interacciones
        + 0.05 * semanas
        + rng.normal(0, 3, size=n)
    )
    prob = 1 / (1 + np.exp(-logits))
    abandono = (prob > 0.5).astype(int)
    df = pd.DataFrame({
        'asistencia_pct': asistencia,
        'notas_promedio': notas,
        'interacciones': interacciones,
        'semanas_registro': semanas,
        'abandono': abandono
    })
    return df

df = generar_datos_sinteticos(2000)
X = df[['asistencia_pct', 'notas_promedio', 'interacciones', 'semanas_registro']]
y = df['abandono']

# Pipeline: escalado + logística
model = make_pipeline(StandardScaler(), LogisticRegression(solver='lbfgs', max_iter=1000))
model.fit(X, y)

# Simular registro de intervenciones (persistente en memoria en este prototipo)
intervenciones_log = []

# Rutas frontend
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# API predict: espera JSON con los campos: asistencia_pct, notas_promedio, interacciones, semanas_registro
@app.route('/api/predict', methods=['POST'])
def api_predict():
    data = request.get_json()
    try:
        # Soporta una entrada o una lista
        if isinstance(data, list):
            X_new = pd.DataFrame(data)
        else:
            X_new = pd.DataFrame([data])
        X_new = X_new[['asistencia_pct', 'notas_promedio', 'interacciones', 'semanas_registro']]
        probs = model.predict_proba(X_new)[:, 1]  # probabilidad de abandono = clase 1
        results = [{'prob_abandono': float(p)} for p in probs]
        return jsonify({'status': 'ok', 'results': results})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Endpoint para registrar intervenciones (simulación de envío de correo / alerta)
@app.route('/api/intervene', methods=['POST'])
def intervene():
    payload = request.get_json()
    ts = datetime.datetime.utcnow().isoformat() + 'Z'
    entry = {
        'timestamp': ts,
        'student': payload.get('student'),
        'action': payload.get('action'),  # e.g., 'email', 'notificacion', 'sms'
        'message': payload.get('message'),
        'meta': payload.get('meta', {})
    }
    intervenciones_log.append(entry)
    # En un sistema real aquí enviarías correo (SMTP) o webhook a un sistema externo.
    print(f"[INTERVENCION] {entry}")  # para debug/log
    return jsonify({'status': 'ok', 'entry': entry})

# Endpoint para obtener log de intervenciones (solo lectura)
@app.route('/api/interventions', methods=['GET'])
def get_interventions():
    return jsonify({'status': 'ok', 'interventions': intervenciones_log})

if __name__ == '__main__':
    app.run(debug=True)
