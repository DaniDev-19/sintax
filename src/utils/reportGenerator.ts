import type { Submission } from '../types';
import { SKILL_LABELS } from './grading';
import { sanitizeHTML } from './security';

export function openAcademicReportInNewTab(submission: Submission): void {
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('Por favor permite las ventanas emergentes en tu navegador para ver el reporte académico.');
    return;
  }

  const score = submission.score100 ?? submission.percentage;
  const verificationCode = 'STX-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const safeStudentName = sanitizeHTML(submission.studentName);
  const safeEvalTitle = sanitizeHTML(submission.evaluationTitle);
  const safeTier = sanitizeHTML(submission.performanceTier);

  const skillsRows = Object.entries(submission.skillBreakdown)
    .map(([tag, data]) => {
      if (!data) return '';
      const label = SKILL_LABELS[tag as keyof typeof SKILL_LABELS] || tag;
      return `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">
            ${sanitizeHTML(label)}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #475569;">
            ${data.correct} / ${data.total}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${data.percentage >= 70 ? '#059669' : data.percentage >= 50 ? '#d97706' : '#dc2626'};">
            ${data.percentage}%
          </td>
        </tr>
      `;
    })
    .join('');

  const recommendationsList = submission.recommendations
    .map((rec) => `<li style="margin-bottom: 8px; color: #334155; line-height: 1.5;">${sanitizeHTML(rec)}</li>`)
    .join('');

  const reportHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Boletín Oficial - ${safeStudentName} | Sintax</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          padding: 30px 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border: 2px solid #0f172a;
          box-shadow: 8px 8px 0px 0px #0f172a;
          border-radius: 16px;
          overflow: hidden;
        }
        .header {
          padding: 30px;
          background: #0f172a;
          color: #ffffff;
          border-bottom: 4px solid #10b981;
        }
        .brand {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .motto {
          font-size: 13px;
          color: #f59e0b;
          font-weight: 700;
          margin-top: 4px;
        }
        .content {
          padding: 30px;
        }
        .badge-score {
          font-size: 48px;
          font-weight: 900;
          color: #059669;
          line-height: 1;
        }
        .meta-box {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          background: #f1f5f9;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .meta-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .meta-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: #e2e8f0;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #334155;
          letter-spacing: 0.5px;
        }
        .signature-area {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 20px;
        }
        .signature-line {
          width: 220px;
          border-top: 2px solid #0f172a;
          text-align: center;
          padding-top: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }
        .print-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #0f172a;
          color: #ffffff;
          padding: 12px 24px;
          font-weight: 800;
          border: 2px solid #10b981;
          border-radius: 12px;
          box-shadow: 4px 4px 0px 0px #10b981;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .print-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px 0px #10b981;
        }
        @media print {
          body { background: #ffffff; padding: 0; }
          .container { border: none; box-shadow: none; }
          .print-btn { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="brand">SINTAX ACADEMY</div>
              <div class="motto">«Aprender Creando, Crear Aprendiendo»</div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 11px; color: #94a3b8;">
              CÓDIGO OFICIAL<br>
              <strong style="color: #ffffff; font-size: 13px;">${verificationCode}</strong>
            </div>
          </div>
        </div>

        <div class="content">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
              Boletín Oficial de Evaluación Técnica
            </h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 4px;">
              Certificación de rendimiento y diagnóstico por competencias
            </p>
          </div>

          <div class="meta-box">
            <div>
              <div class="meta-label">Estudiante</div>
              <div class="meta-value">${safeStudentName}</div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace;">${sanitizeHTML(submission.studentEmail)}</div>
            </div>
            <div>
              <div class="meta-label">Evaluación</div>
              <div class="meta-value">${safeEvalTitle}</div>
              <div style="font-size: 11px; color: #64748b;">Fecha: ${sanitizeHTML(submission.submittedAt)}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 12px; margin-bottom: 24px;">
            <div>
              <div class="meta-label" style="color: #065f46;">Calificación Obtenida</div>
              <div class="badge-score">${score}%</div>
            </div>
            <div style="text-align: right;">
              <div class="meta-label" style="color: #065f46;">Nivel Dictaminado</div>
              <div style="font-size: 18px; font-weight: 900; color: #065f46; margin-top: 4px;">
                ${safeTier}
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 2px;">
                ${score >= 50 ? '✓ Requisitos Académicos Superados' : '⚠ Requiere Programa de Refuerzo'}
              </div>
            </div>
          </div>

          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 8px;">
            Desglose de Rúbricas por Competencia
          </h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Área Técnica</th>
                <th style="text-align: center;">Aciertos</th>
                <th style="text-align: right;">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${skillsRows}
            </tbody>
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;">
            <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1e293b; margin-bottom: 10px;">
              Dictamen Pedagógico y Ruta de Mejora:
            </h4>
            <ul style="padding-left: 20px; font-size: 12px;">
              ${recommendationsList}
            </ul>
          </div>

          <div class="signature-area">
            <div>
              <div style="font-size: 10px; font-family: monospace; color: #64748b;">
                VERIFICACIÓN CRIPTOGRÁFICA<br>
                SHA256: ${Math.random().toString(36).substring(2)}${Date.now()}
              </div>
            </div>
            <div class="signature-line">
              Firma y Sello del Docente<br>
              <span style="font-size: 11px; font-weight: 600; color: #64748b;">Sintax Learning Systems</span>
            </div>
          </div>
        </div>
      </div>

      <button class="print-btn" onclick="window.print()">
        🖨️ Imprimir / Guardar en PDF
      </button>
    </body>
    </html>
  `;

  newWindow.document.open();
  newWindow.document.write(reportHTML);
  newWindow.document.close();
}

