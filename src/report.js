import { gs, currentProfile } from './state.js';

// ════════════════════════════════════════════════════════════════
// REPORTE DE DESEMPEÑO — descargable al final de la partida.
// ════════════════════════════════════════════════════════════════
// El brief no define todavía un destinatario externo (no hay
// integración a Excel/Power Automate en esta etapa). Se genera un
// archivo HTML autocontenido: legible/imprimible para el jugador o
// su líder, y con los datos crudos embebidos como JSON dentro del
// mismo archivo para que una futura integración pueda parsearlo sin
// tener que rediseñar el formato.

export function buildReportData() {
  const prof = currentProfile();
  const { rent, rel, rep } = gs.ind;
  const low = Math.min(rent, rel, rep);
  const rank = low > 72 ? 'COMERCIAL ÉLITE' : low > 50 ? 'COMERCIAL SÓLIDO' : 'COMERCIAL EN DESARROLLO';
  return {
    generadoEn: new Date().toISOString(),
    comercial: gs.name,
    perfil: { id: prof.id, nombre: prof.name },
    duracionSegundos: gs.elapsed,
    indicadoresFinales: { rentabilidad: Math.round(rent), relacion: Math.round(rel), reputacion: Math.round(rep) },
    rango: rank,
    clientes: gs.clientLog.map(c => ({
      cliente: c.name,
      tipo: c.type,
      rondas: c.exchanges.map(e => ({
        situacion: e.text,
        decision: e.choice,
        impacto: { rentabilidad: e.rent, relacion: e.rel, reputacion: e.rep },
      })),
      totalCliente: c.finalDeltas,
    })),
  };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderReportHtml(data) {
  const clientRows = data.clientes.map(c => `
    <section class="client">
      <h3>${escapeHtml(c.cliente)} <span class="tag">${escapeHtml(c.tipo)}</span></h3>
      <table>
        <thead><tr><th>Ronda</th><th>Decisión tomada</th><th>Rent.</th><th>Rel.</th><th>Rep.</th></tr></thead>
        <tbody>
          ${c.rondas.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${escapeHtml(r.decision)}</td>
              <td class="${r.impacto.rentabilidad >= 0 ? 'pos' : 'neg'}">${r.impacto.rentabilidad >= 0 ? '+' : ''}${r.impacto.rentabilidad}</td>
              <td class="${r.impacto.relacion >= 0 ? 'pos' : 'neg'}">${r.impacto.relacion >= 0 ? '+' : ''}${r.impacto.relacion}</td>
              <td class="${r.impacto.reputacion >= 0 ? 'pos' : 'neg'}">${r.impacto.reputacion >= 0 ? '+' : ''}${r.impacto.reputacion}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>`).join('');

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Reporte PrimaVendedor — ${escapeHtml(data.comercial)}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#1a0500;color:#fff8ee;margin:0;padding:32px;}
  .wrap{max-width:760px;margin:0 auto;}
  h1{color:#ff6b47;font-size:22px;margin-bottom:2px;}
  .sub{color:#a89070;font-size:13px;margin-bottom:24px;}
  .kpis{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
  .kpi{background:#240800;border:1px solid #3d0a00;border-radius:6px;padding:12px 18px;min-width:120px;}
  .kpi .v{font-size:22px;font-weight:800;color:#fff;}
  .kpi .l{font-size:11px;color:#a89070;text-transform:uppercase;letter-spacing:1px;}
  .rank{display:inline-block;background:#e8401c;color:#1a0500;font-weight:800;padding:6px 14px;border-radius:4px;margin-bottom:24px;}
  h3{color:#e8401c;border-bottom:1px solid #3d0a00;padding-bottom:6px;}
  .tag{font-size:11px;color:#a89070;font-weight:400;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;}
  th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #2a0d00;}
  th{color:#a89070;font-size:11px;text-transform:uppercase;}
  .pos{color:#27ae60;font-weight:700;}
  .neg{color:#e74c3c;font-weight:700;}
  @media print{body{background:#fff;color:#111;} .kpi,.tag{color:#111;}}
</style></head>
<body><div class="wrap">
  <h1>PrimaVendedor — Reporte de desempeño</h1>
  <div class="sub">${escapeHtml(data.comercial)} · ${escapeHtml(data.perfil.nombre)} · generado ${new Date(data.generadoEn).toLocaleString('es-CO')} · ${data.duracionSegundos}s</div>
  <div class="rank">${escapeHtml(data.rango)}</div>
  <div class="kpis">
    <div class="kpi"><div class="v">${data.indicadoresFinales.rentabilidad}</div><div class="l">Rentabilidad</div></div>
    <div class="kpi"><div class="v">${data.indicadoresFinales.relacion}</div><div class="l">Relación</div></div>
    <div class="kpi"><div class="v">${data.indicadoresFinales.reputacion}</div><div class="l">Reputación</div></div>
  </div>
  ${clientRows}
  <script type="application/json" id="report-data">${JSON.stringify(data)}</script>
</div></body></html>`;
}

export function downloadReport() {
  const data = buildReportData();
  const html = renderReportHtml(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (gs.name || 'comercial').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `primavendedor-reporte-${safeName}-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
