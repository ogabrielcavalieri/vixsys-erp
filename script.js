// ====================== VIXSYS - script.js (COMPLETO + localStorage) ======================
const { useState, useReducer, useCallback, useMemo, useEffect } = React;

const STORAGE_KEY = "vixsys_mrp_v2_data";

/* ====================== TOKENS ====================== */
const T = {
  sidebar:"#07112A", sidebarHov:"#0E1E45", sidebarAct:"#152655",
  accent:"#C8D400",  accentDk:"#B0BB00",   accentLt:"#F4F6A0",
  success:"#22C55E", successBg:"rgba(34,197,94,0.10)",  successBd:"#86EFAC",
  danger:"#EF4444",  dangerBg:"rgba(239,68,68,0.10)",   dangerBd:"#FCA5A5",
  warn:"#F59E0B",    warnBg:"rgba(245,158,11,0.10)",    warnBd:"#FCD34D",
  info:"#3B82F6",    infoBg:"rgba(59,130,246,0.10)",    infoBd:"#93C5FD",
  purple:"#A855F7",  purpleBg:"rgba(168,85,247,0.10)",  purpleBd:"#D8B4FE",
  bg:"#F0F2F5", surface:"#FFFFFF", border:"#DDE1E9", borderDk:"#C3C9D5",
  text:"#0D1829", textSec:"#4A5568", textTer:"#8A97AA", textLight:"#BCC4D0",
};

/* ====================== NAV & META ====================== */
const NAV_GROUPS = [
  { label:"Planejamento", items:[
    { key:"dashboard", label:"Dashboard",       icon:"M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 3h2v-2h2v2h2v2h-2v2h-2v-2h-2z" },
    { key:"pmp",       label:"Plano Mestre",    icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key:"mrp",       label:"MRP",             icon:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { key:"crp",       label:"CRP",             icon:"M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key:"ordens",    label:"Ordens de Prod.", icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { key:"relatorios",label:"Relatórios",      icon:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ]},
  { label:"Cadastros", items:[
    { key:"produtos",  label:"Produtos",        icon:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 5h16v2H4z" },
    { key:"bom",       label:"BOM",             icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { key:"estoque",   label:"Estoque",         icon:"M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
    { key:"recursos",  label:"Recursos",        icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { key:"custos",    label:"Custos",          icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]},
];

const PAGE_META = {
  dashboard: { title:"Dashboard", desc:"Visão consolidada do planejamento e controle da produção" },
  pmp:       { title:"Plano Mestre de Produção", desc:"Ordens planejadas por produto, período e status" },
  mrp:       { title:"Cálculo MRP", desc:"Necessidade bruta → líquida com BOM, perda e estoque" },
  crp:       { title:"Planejamento de Capacidade", desc:"Carga de recursos, horas-extra, gargalo e orçamento" },
  ordens:    { title:"Ordens de Produção", desc:"Ordens abertas, em produção e concluídas" },
  relatorios:{ title:"Relatórios", desc:"Lista de compras, carga de máquinas e status do PMP" },
  produtos:  { title:"Produtos", desc:"Cadastro de produtos acabados e semiacabados" },
  bom:       { title:"Bill of Materials", desc:"Estrutura de materiais — componentes com perda %" },
  estoque:   { title:"Gestão de Estoque", desc:"Inventário com saldo atual, segurança e lead time" },
  recursos:  { title:"Recursos Produtivos", desc:"RH, maquinário, horas disponíveis e tempo por unidade" },
  custos:    { title:"Tabela de Custos", desc:"Custo de mão-de-obra e máquinas para orçamento" },
};

/* ====================== PERSISTÊNCIA ====================== */
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error("Erro ao carregar:", e); }
  return initialState;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.error("Erro ao salvar:", e); }
}

/* ====================== ICON ====================== */
function Icon({ d, size = 16, stroke = "currentColor", sw = 1.6 }) {
  return React.createElement("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round"
  },
    d.split(/(?=M)/).filter(Boolean).map((p, i) => React.createElement("path", { key: i, d: p.trim() }))
  );
}

/* ====================== CÁLCULOS ====================== */
function calcMRP(state) {
  const { pmps, boms, estoques, configuracoes } = state;
  const useInicial = configuracoes.mrpUseInicial;
  const useSeguranca = configuracoes.mrpUseSeguranca;
  const bruta = [];

  pmps.forEach(p =>
    boms.filter(b => b.produto_id === p.produto_id).forEach(b => {
      const fatorPerda = 1 + (b.perda || 0) / 100;
      const n = p.quantidade * b.quantidade * fatorPerda;
      const idx = bruta.findIndex(r => r.componente === b.componente);
      idx >= 0 ? bruta[idx].bruta += n : bruta.push({ componente: b.componente, bruta: n, perda: b.perda || 0 });
    })
  );

  return bruta.map(r => {
    const est = estoques.find(e => e.componente === r.componente);
    const inicial = est && useInicial ? (est.estoque_inicial || 0) : 0;
    const seguranca = est && useSeguranca ? (est.estoque_seguranca || 0) : 0;
    const disponivel = est ? est.quantidade : 0;
    const abate = disponivel + inicial;
    const liquida = Math.max(0, Math.ceil(r.bruta - abate + seguranca));
    const cobert = r.bruta > 0 ? Math.min(100, abate / r.bruta * 100) : 100;
    const leadTime = est ? (est.lead_time || 0) : 0;
    const status = liquida === 0 ? "ok" : liquida < r.bruta * 0.5 ? "alerta" : "critico";
    return { ...r, bruta: Math.ceil(r.bruta), disponivel, inicial, seguranca, liquida, cobert, leadTime, status };
  }).sort((a, b) => b.bruta - a.bruta);
}

function calcCRP(state) {
  const { pmps, recursos, custos } = state;
  const result = [];

  pmps.forEach(p => {
    recursos.forEach(r => {
      const ex = result.find(x => x.recurso_id === r.id);
      const carga = p.quantidade * (r.tempo_por_unidade || 0);
      if (ex) ex.carga += carga;
      else result.push({ recurso_id: r.id, recurso: r.nome, tipo: r.tipo, carga, cap: r.horas_disponiveis || 0, horas_extra: r.horas_extra || 0, cap_total: (r.horas_disponiveis || 0) + (r.horas_extra || 0) });
    });
  });

  return result.map(r => {
    const custo = custos.find(c => c.recurso_id === r.recurso_id);
    const custo_hora = custo ? custo.valor_hora : 0;
    const custo_extra = custo ? custo.valor_hora_extra : 0;
    const horas_reg = Math.min(r.carga, r.cap);
    const horas_ext = Math.max(0, Math.min(r.carga - r.cap, r.horas_extra));
    const custo_total = horas_reg * custo_hora + horas_ext * custo_extra;
    const pct = r.cap_total > 0 ? r.carga / r.cap_total * 100 : 0;
    const ok = r.carga <= r.cap_total;
    const status = r.carga <= r.cap ? "ok" : r.carga <= r.cap_total ? "extra" : "sobrecarga";
    return { ...r, horas_reg, horas_ext, custo_hora, custo_extra, custo_total, pct, ok, status };
  });
}

/* ====================== DEMO DATA ====================== */
function getDemoData() {
  const ts = Date.now();
  return {
    produtos: [
      { id: ts+1, nome: "Mesa de Escritório Premium", codigo: "MES-ESC-001", unidade: "UN", tipo: "produto_acabado" },
      { id: ts+2, nome: "Estrutura Metálica", codigo: "EST-MET-001", unidade: "UN", tipo: "semiacabado" },
    ],
    boms: [
      { id: ts+10, produto_id: ts+1, componente: "Estrutura Metálica", quantidade: 1, unidade: "UN", perda: 0 },
      { id: ts+11, produto_id: ts+1, componente: "Tampo de MDF", quantidade: 1, unidade: "UN", perda: 3 },
    ],
    pmps: [
      { id: ts+20, produto_id: ts+1, quantidade: 50, periodo: 1, status: "confirmado" },
      { id: ts+21, produto_id: ts+1, quantidade: 80, periodo: 2, status: "confirmado" },
    ],
    estoques: [
      { id: ts+30, componente: "Estrutura Metálica", quantidade: 10, unidade: "UN", estoque_inicial: 0, estoque_seguranca: 5, lead_time: 2 },
    ],
    recursos: [
      { id: ts+40, nome: "Operador de Montagem", tipo: "rh", horas_disponiveis: 160, horas_extra: 20, tempo_por_unidade: 0.5 },
    ],
    custos: [
      { id: ts+50, recurso_id: ts+40, valor_hora: 25, valor_hora_extra: 37.5 },
    ],
    ordens: []
  };
}

/* ====================== REDUCER ====================== */
function reducer(s, a) {
  let newState = s;

  switch (a.type) {
    case "ADD_PRODUTO":  newState = { ...s, produtos: [...s.produtos, a.p] }; break;
    case "ADD_BOM":      newState = { ...s, boms: [...s.boms, a.p] }; break;
    case "ADD_PMP":      newState = { ...s, pmps: [...s.pmps, a.p] }; break;
    case "ADD_RECURSO":  newState = { ...s, recursos: [...s.recursos, a.p] }; break;
    case "ADD_ORDEM":    newState = { ...s, ordens: [...s.ordens, a.p] }; break;
    case "ADD_CUSTO": {
      const idx = s.custos.findIndex(c => c.recurso_id === a.p.recurso_id);
      if (idx >= 0) { const c = [...s.custos]; c[idx] = {...c[idx], ...a.p}; newState = {...s, custos: c}; }
      else newState = { ...s, custos: [...s.custos, a.p] };
      break;
    }
    case "ADD_ESTOQUE": {
      const idx = s.estoques.findIndex(e => e.componente === a.p.componente);
      if (idx >= 0) { const e = [...s.estoques]; e[idx] = {...e[idx], ...a.p}; newState = {...s, estoques: e}; }
      else newState = { ...s, estoques: [...s.estoques, a.p] };
      break;
    }
    case "UPDATE_ORDEM": newState = { ...s, ordens: s.ordens.map(o => o.id === a.id ? {...o, ...a.changes} : o) }; break;
    case "DEL_PRODUTO": newState = { ...s, produtos: s.produtos.filter(x=>x.id!==a.id) }; break;
    case "DEL_BOM":     newState = { ...s, boms: s.boms.filter(x=>x.id!==a.id) }; break;
    case "DEL_PMP":     newState = { ...s, pmps: s.pmps.filter(x=>x.id!==a.id) }; break;
    case "DEL_RECURSO": newState = { ...s, recursos: s.recursos.filter(x=>x.id!==a.id) }; break;
    case "DEL_ESTOQUE": newState = { ...s, estoques: s.estoques.filter(x=>x.id!==a.id) }; break;
    case "DEL_CUSTO":   newState = { ...s, custos: s.custos.filter(x=>x.id!==a.id) }; break;
    case "DEL_ORDEM":   newState = { ...s, ordens: s.ordens.filter(x=>x.id!==a.id) }; break;
    case "SET_CONFIG":  newState = { ...s, configuracoes: {...s.configuracoes, ...a.cfg} }; break;
    case "LOAD_DEMO": {
      const d = getDemoData();
      newState = { ...s, ...d, ordens: [], configuracoes: s.configuracoes };
      break;
    }
    case "RESET": newState = initialState; break;
    default: return s;
  }

  saveState(newState);
  return newState;
}

const initialState = {
  produtos:[], boms:[], pmps:[], recursos:[], estoques:[], custos:[], ordens:[],
  configuracoes:{ mrpUseInicial:true, mrpUseSeguranca:false, periodoPMP:"semana" },
};

/* ====================== TOAST ====================== */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}

function Toast({ toasts }) {
  return React.createElement("div", {
    style: { position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }
  },
    toasts.map(t => React.createElement("div", {
      key: t.id,
      style: {
        padding: "10px 16px", borderRadius: 8,
        background: t.type === "success" ? T.success : t.type === "info" ? T.info : T.danger,
        color: "#fff", fontSize: 13, fontWeight: 500,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", gap: 8, minWidth: 220
      }
    },
      React.createElement("span", null, t.type === "success" ? "✓" : t.type === "info" ? "ℹ" : "✕"),
      t.msg
    ))
  );
}

/* ====================== APP ====================== */
function App() {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);
  const [active, setActive] = useState("dashboard");
  const { toasts, toast } = useToast();

  const Page = PAGES[active];
  const meta = PAGE_META[active];

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `vixsys_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    toast("Backup exportado com sucesso!");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        window.location.reload();
        toast("Dados importados com sucesso!", "success");
      } catch (err) {
        toast("Erro ao importar arquivo.", "error");
      }
    };
    reader.readAsText(file);
  };

  return React.createElement("div", { style: { display: "flex", minHeight: "100vh", background: T.bg } },
    /* Sidebar */
    React.createElement("aside", {
      style: { width: 240, background: T.sidebar, color: "#fff", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }
    },
      React.createElement("div", { style: { padding: "20px 18px 16px" } },
        React.createElement("p", { style: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "0.04em" } }, "VIXSYS")
      ),
      React.createElement("div", { style: { flex: 1, padding: "0 8px" } },
        NAV_GROUPS.map(g => React.createElement("div", { key: g.label, style: { marginBottom: 12 } },
          React.createElement("p", { style: { margin: "12px 12px 6px", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" } }, g.label),
          g.items.map(item => {
            const isActive = active === item.key;
            return React.createElement("button", {
              key: item.key,
              onClick: () => setActive(item.key),
              style: {
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 2,
                background: isActive ? T.sidebarAct : "transparent",
                border: "none", color: isActive ? T.accent : "#ccc", borderRadius: 6, cursor: "pointer", textAlign: "left"
              }
            }, React.createElement(Icon, { d: item.icon, size: 18 }), item.label);
          })
        ))
      )
    ),

    /* Main Area */
    React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column" } },
      React.createElement("header", {
        style: { background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }
      },
        React.createElement("div", null,
          React.createElement("p", { style: { margin: 0, fontSize: 15, fontWeight: 700, color: T.text } }, meta.title),
          React.createElement("p", { style: { margin: 0, fontSize: 12, color: T.textTer } }, meta.desc)
        )
      ),
      React.createElement("main", { className: "page-anim", style: { flex: 1, padding: "24px", overflowY: "auto" } },
        React.createElement(Page, { state, dispatch, toast })
      )
    ),

    React.createElement(Toast, { toasts })
  );
}

/* ====================== COMPONENTES DE INTERFACE ====================== */
const h = React.createElement;

function Card({ title, children, actions }) {
  return h("div", { style: { background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 24, overflow: "hidden" } },
    h("div", { style: { padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" } },
      h("h3", { style: { margin: 0, fontSize: 13, fontWeight: 700, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.5px" } }, title),
      actions
    ),
    h("div", { style: { padding: 20 } }, children)
  );
}

function Table({ cols, data, onDel }) {
  return h("div", { style: { overflowX: "auto" } },
    h("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 13 } },
      h("thead", null,
        h("tr", { style: { borderBottom: `2px solid ${T.border}` } },
          cols.map(c => h("th", { key: c.label, style: { textAlign: "left", padding: "10px 12px", color: T.textTer, fontWeight: 600 } }, c.label)),
          onDel && h("th", { style: { textAlign: "right", padding: "10px 12px" } }, "Ações")
        )
      ),
      h("tbody", null,
        data.length === 0 ? h("tr", null, h("td", { colSpan: cols.length + (onDel ? 1 : 0), style: { padding: 24, textAlign: "center", color: T.textLight } }, "Nenhum registro encontrado.")) :
        data.map((item, idx) => h("tr", { key: idx, style: { borderBottom: `1px solid ${T.border}` } },
          cols.map(c => h("td", { key: c.label, style: { padding: "12px", color: T.text } }, c.render ? c.render(item) : item[c.key])),
          onDel && h("td", { style: { padding: "12px", textAlign: "right" } },
            h("button", { onClick: () => onDel(item.id), style: { background: "none", border: "none", color: T.danger, cursor: "pointer", fontWeight: 600 } }, "Excluir")
          )
        ))
      )
    )
  );
}

function DashboardPage({ state, dispatch }) {
  const stats = [
    { label: "Produtos", val: state.produtos.length, color: T.info },
    { label: "Ordens PMP", val: state.pmps.length, color: T.purple },
    { label: "Itens em Estoque", val: state.estoques.length, color: T.success },
    { label: "Recursos", val: state.recursos.length, color: T.warn },
  ];

  return h("div", null,
    h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 } },
      stats.map(s => h("div", { key: s.label, style: { background: T.surface, padding: 20, borderRadius: 12, border: `1px solid ${T.border}`, borderLeft: `4px solid ${s.color}` } },
        h("p", { style: { margin: 0, fontSize: 12, color: T.textTer, fontWeight: 600, textTransform: "uppercase" } }, s.label),
        h("p", { style: { margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: T.text } }, s.val)
      ))
    ),
    h(Card, { title: "Bem-vindo ao VIXSYS MRP", actions: h("button", {
      onClick: () => { dispatch({ type: "LOAD_DEMO" }); },
      style: { background: T.accent, border: "none", padding: "6px 12px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }
    }, "Carregar Demo") },
      h("p", { style: { color: T.textSec, lineHeight: 1.6 } }, "Este sistema integra o Planejamento Mestre de Produção (PMP) com o Cálculo de Necessidades de Materiais (MRP) e de Capacidade (CRP). Comece cadastrando seus produtos e estruturas (BOM).")
    )
  );
}

function ProdutosPage({ state, dispatch }) {
  const [form, setForm] = useState({ nome: "", codigo: "", unidade: "UN", tipo: "produto_acabado" });
  const save = (e) => {
    e.preventDefault();
    if (!form.nome || !form.codigo) return;
    dispatch({ type: "ADD_PRODUTO", p: { ...form, id: Date.now() } });
    setForm({ nome: "", codigo: "", unidade: "UN", tipo: "produto_acabado" });
  };
  return h("div", null,
    h(Card, { title: "Novo Produto" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 } },
        h("input", { placeholder: "Nome", value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { placeholder: "Código/SKU", value: form.codigo, onChange: e => setForm({ ...form, codigo: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("select", { value: form.tipo, onChange: e => setForm({ ...form, tipo: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } },
          h("option", { value: "produto_acabado" }, "Acabado"),
          h("option", { value: "semiacabado" }, "Semiacabado"),
          h("option", { value: "materia_prima" }, "Matéria-Prima")
        ),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Adicionar")
      )
    ),
    h(Card, { title: "Lista de Produtos" },
      h(Table, {
        cols: [
          { label: "Código", key: "codigo" },
          { label: "Nome", key: "nome" },
          { label: "Tipo", render: r => r.tipo.replace("_", " ").toUpperCase() },
        ],
        data: state.produtos,
        onDel: (id) => dispatch({ type: "DEL_PRODUTO", id })
      })
    )
  );
}

function BOMPage({ state, dispatch }) {
  const [form, setForm] = useState({ produto_id: "", componente: "", quantidade: 1, perda: 0 });
  const save = (e) => {
    e.preventDefault();
    if (!form.produto_id || !form.componente) return;
    dispatch({ type: "ADD_BOM", p: { ...form, id: Date.now(), produto_id: Number(form.produto_id) } });
  };
  return h("div", null,
    h(Card, { title: "Estrutura (BOM)" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 } },
        h("select", { value: form.produto_id, onChange: e => setForm({ ...form, produto_id: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } },
          h("option", { value: "" }, "Produto Pai..."),
          state.produtos.map(p => h("option", { key: p.id, value: p.id }, p.nome))
        ),
        h("input", { placeholder: "Componente", value: form.componente, onChange: e => setForm({ ...form, componente: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "Qtd", value: form.quantidade, onChange: e => setForm({ ...form, quantidade: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Vincular")
      )
    ),
    h(Card, { title: "Componentes Vinculados" },
      h(Table, {
        cols: [
          { label: "Produto Pai", render: r => state.produtos.find(p => p.id === r.produto_id)?.nome || "???" },
          { label: "Componente", key: "componente" },
          { label: "Qtd", key: "quantidade" },
          { label: "Perda %", key: "perda" },
        ],
        data: state.boms,
        onDel: (id) => dispatch({ type: "DEL_BOM", id })
      })
    )
  );
}

function EstoquePage({ state, dispatch }) {
  const [form, setForm] = useState({ componente: "", quantidade: 0, estoque_inicial: 0, estoque_seguranca: 0, lead_time: 1 });
  const save = (e) => {
    e.preventDefault();
    if (!form.componente) return;
    dispatch({ type: "ADD_ESTOQUE", p: { ...form, id: Date.now() } });
  };
  return h("div", null,
    h(Card, { title: "Lançar Estoque / Parâmetros" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 } },
        h("input", { placeholder: "Componente/Item", value: form.componente, onChange: e => setForm({ ...form, componente: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "Saldo Atual", value: form.quantidade, onChange: e => setForm({ ...form, quantidade: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "Segurança", value: form.estoque_seguranca, onChange: e => setForm({ ...form, estoque_seguranca: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "Lead Time (d)", value: form.lead_time, onChange: e => setForm({ ...form, lead_time: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Salvar")
      )
    ),
    h(Card, { title: "Inventário" },
      h(Table, {
        cols: [
          { label: "Item", key: "componente" },
          { label: "Saldo", key: "quantidade" },
          { label: "Segurança", key: "estoque_seguranca" },
          { label: "Lead Time", render: r => `${r.lead_time}d` },
        ],
        data: state.estoques,
        onDel: (id) => dispatch({ type: "DEL_ESTOQUE", id })
      })
    )
  );
}

function PMPPage({ state, dispatch }) {
  const [form, setForm] = useState({ produto_id: "", quantidade: 0, periodo: 1, status: "planejado" });
  const save = (e) => {
    e.preventDefault();
    if (!form.produto_id) return;
    dispatch({ type: "ADD_PMP", p: { ...form, id: Date.now(), produto_id: Number(form.produto_id) } });
  };
  return h("div", null,
    h(Card, { title: "Planejar Produção (PMP)" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 } },
        h("select", { value: form.produto_id, onChange: e => setForm({ ...form, produto_id: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } },
          h("option", { value: "" }, "Produto..."),
          state.produtos.map(p => h("option", { key: p.id, value: p.id }, p.nome))
        ),
        h("input", { type: "number", placeholder: "Quantidade", value: form.quantidade, onChange: e => setForm({ ...form, quantidade: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "Período (Sem)", value: form.periodo, onChange: e => setForm({ ...form, periodo: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Agendar")
      )
    ),
    h(Card, { title: "Ordens Planejadas" },
      h(Table, {
        cols: [
          { label: "Produto", render: r => state.produtos.find(p => p.id === r.produto_id)?.nome || "???" },
          { label: "Qtd", key: "quantidade" },
          { label: "Período", render: r => `S${r.periodo}` },
          { label: "Status", render: r => h("span", { style: { color: r.status === "confirmado" ? T.success : T.info } }, r.status.toUpperCase()) },
        ],
        data: state.pmps,
        onDel: (id) => dispatch({ type: "DEL_PMP", id })
      })
    )
  );
}

function MRPPage({ state }) {
  const data = useMemo(() => calcMRP(state), [state]);
  return h("div", null,
    h(Card, { title: "Cálculo de Necessidades (MRP)" },
      h(Table, {
        cols: [
          { label: "Componente", key: "componente" },
          { label: "Bruta", key: "bruta" },
          { label: "Disponível", key: "disponivel" },
          { label: "Segurança", key: "seguranca" },
          { label: "Líquida", render: r => h("b", { style: { color: r.liquida > 0 ? T.danger : T.success } }, r.liquida) },
          { label: "Cobertura", render: r => `${r.cobert.toFixed(1)}%` },
          { label: "Ação", render: r => r.liquida > 0 ? "Comprar / Produzir" : "OK" },
        ],
        data: data
      })
    )
  );
}

function RecursosPage({ state, dispatch }) {
  const [form, setForm] = useState({ nome: "", tipo: "maquina", horas_disponiveis: 40, horas_extra: 0, tempo_por_unidade: 0.1 });
  const save = (e) => {
    e.preventDefault();
    if (!form.nome) return;
    dispatch({ type: "ADD_RECURSO", p: { ...form, id: Date.now() } });
  };
  return h("div", null,
    h(Card, { title: "Cadastrar Recurso" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 } },
        h("input", { placeholder: "Nome do Recurso", value: form.nome, onChange: e => setForm({ ...form, nome: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("select", { value: form.tipo, onChange: e => setForm({ ...form, tipo: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } },
          h("option", { value: "maquina" }, "Máquina"),
          h("option", { value: "rh" }, "Mão de Obra")
        ),
        h("input", { type: "number", placeholder: "Horas/Sem", value: form.horas_disponiveis, onChange: e => setForm({ ...form, horas_disponiveis: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Salvar")
      )
    ),
    h(Card, { title: "Centro de Trabalho / Recursos" },
      h(Table, {
        cols: [
          { label: "Nome", key: "nome" },
          { label: "Tipo", render: r => r.tipo.toUpperCase() },
          { label: "Capacidade", render: r => `${r.horas_disponiveis}h (+${r.horas_extra}h)` },
          { label: "Tempo/Un", render: r => `${r.tempo_por_unidade}h` },
        ],
        data: state.recursos,
        onDel: (id) => dispatch({ type: "DEL_RECURSO", id })
      })
    )
  );
}

function CustosPage({ state, dispatch }) {
  const [form, setForm] = useState({ recurso_id: "", valor_hora: 0, valor_hora_extra: 0 });
  const save = (e) => {
    e.preventDefault();
    if (!form.recurso_id) return;
    dispatch({ type: "ADD_CUSTO", p: { ...form, id: Date.now(), recurso_id: Number(form.recurso_id) } });
  };
  return h("div", null,
    h(Card, { title: "Definir Custos Operacionais" },
      h("form", { onSubmit: save, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 } },
        h("select", { value: form.recurso_id, onChange: e => setForm({ ...form, recurso_id: e.target.value }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } },
          h("option", { value: "" }, "Recurso..."),
          state.recursos.map(r => h("option", { key: r.id, value: r.id }, r.nome))
        ),
        h("input", { type: "number", placeholder: "R$ Hora", value: form.valor_hora, onChange: e => setForm({ ...form, valor_hora: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("input", { type: "number", placeholder: "R$ Extra", value: form.valor_hora_extra, onChange: e => setForm({ ...form, valor_hora_extra: Number(e.target.value) }), style: { padding: 8, borderRadius: 6, border: `1px solid ${T.border}` } }),
        h("button", { type: "submit", style: { background: T.accent, border: "none", borderRadius: 6, fontWeight: 600 } }, "Vincular")
      )
    ),
    h(Card, { title: "Tabela de Custos" },
      h(Table, {
        cols: [
          { label: "Recurso", render: r => state.recursos.find(x => x.id === r.recurso_id)?.nome || "???" },
          { label: "Valor/Hora", render: r => `R$ ${r.valor_hora.toFixed(2)}` },
          { label: "Hora Extra", render: r => `R$ ${r.valor_hora_extra.toFixed(2)}` },
        ],
        data: state.custos,
        onDel: (id) => dispatch({ type: "DEL_CUSTO", id })
      })
    )
  );
}

function CRPPage({ state }) {
  const data = useMemo(() => calcCRP(state), [state]);
  return h("div", null,
    h(Card, { title: "Planejamento de Capacidade (CRP)" },
      h(Table, {
        cols: [
          { label: "Recurso", key: "recurso" },
          { label: "Carga (h)", render: r => r.carga.toFixed(1) },
          { label: "Capacidade (h)", key: "cap_total" },
          { label: "Ocupação", render: r => h("div", { style: { width: "100%", background: T.border, height: 8, borderRadius: 4, overflow: "hidden" } },
              h("div", { style: { width: `${Math.min(100, r.pct)}%`, background: r.pct > 100 ? T.danger : r.pct > 80 ? T.warn : T.success, height: "100%" } })) },
          { label: "%", render: r => `${r.pct.toFixed(1)}%` },
          { label: "Status", render: r => h("span", { style: { color: r.status === "sobrecarga" ? T.danger : T.text } }, r.status.toUpperCase()) },
        ],
        data: data
      })
    )
  );
}

function OrdensPage({ state, dispatch }) {
  return h("div", null,
    h(Card, { title: "Ordens de Produção (Em execução)" },
      h(Table, {
        cols: [
          { label: "ID", render: r => `#${r.id.toString().slice(-4)}` },
          { label: "PMP Ref", key: "pmp_id" },
          { label: "Status", key: "status" },
        ],
        data: state.ordens,
        onDel: (id) => dispatch({ type: "DEL_ORDEM", id })
      })
    ),
    h("p", { style: { textAlign: "center", color: T.textTer, fontSize: 12 } }, "As ordens de produção são geradas a partir da confirmação do PMP.")
  );
}

function RelatoriosPage({ state }) {
  const mrp = calcMRP(state);
  const crp = calcCRP(state);
  return h("div", null,
    h(Card, { title: "Resumo Executivo" },
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } },
        h("div", null,
          h("h4", null, "Alertas de Materiais"),
          h("ul", null, mrp.filter(m => m.liquida > 0).map(m => h("li", { key: m.componente }, `${m.componente}: falta ${m.liquida} unid.`)))
        ),
        h("div", null,
          h("h4", null, "Gargalos de Capacidade"),
          h("ul", null, crp.filter(c => c.pct > 100).map(c => h("li", { key: c.recurso }, `${c.recurso}: ${c.pct.toFixed(1)}% de ocupação`)))
        )
      )
    )
  );
}

/* ====================== MAPEAMENTO DE PÁGINAS ====================== */
const PAGES = {
  dashboard: DashboardPage,
  produtos: ProdutosPage,
  bom: BOMPage,
  estoque: EstoquePage,
  pmp: PMPPage,
  mrp: MRPPage,
  crp: CRPPage,
  ordens: OrdensPage,
  relatorios: RelatoriosPage,
  recursos: RecursosPage,
  custos: CustosPage,
};

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));