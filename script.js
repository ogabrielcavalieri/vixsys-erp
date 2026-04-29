const { useState, useEffect, useReducer, createContext, useContext, useCallback, useMemo } = React;
const { 
    LayoutDashboard, Users, ShoppingCart, Package, 
    Hammer, Calendar, BarChart3, ClipboardList,
    Box, Repeat, Truck, Map, Car, UserCircle, 
    Navigation, DollarSign, Wallet, CreditCard,
    Settings, Layers, Bell, Search, Plus, X, 
    ChevronRight, AlertTriangle, Info, CheckCircle2,
    Trash2, Edit, MoreVertical, Menu, Filter, ArrowUpRight,
    ArrowDownLeft, History, TrendingUp, TrendingDown
} = LucideReact;

// --- CONTEXTO E ESTADO GLOBAL ---
const AppContext = createContext();

const STORAGE_KEY = 'vixsys_data_cavalieri_final';

const initialState = {
    activePage: 'dashboard',
    clientes: [
        { id: 1, nome: "Indústrias Alpha", documento: "12.345.678/0001-90", tipo: "PJ", email: "contato@alpha.com", cidade: "Vitória" },
        { id: 2, nome: "Construtora Sigma", documento: "98.765.432/0001-10", tipo: "PJ", email: "suporte@sigma.com", cidade: "Vila Velha" }
    ],
    produtos: [
        { id: 1, sku: "PRD-001", nome: "Eixo de Aço 10mm", categoria: "Mecânica", preco: 150.00, custo: 85.00, estoque: 45 },
        { id: 2, sku: "PRD-002", nome: "Mancal Blindado", categoria: "Mecânica", preco: 220.00, custo: 110.00, estoque: 12 }
    ],
    pedidos: [
        { id: 1, clienteId: 1, data: "2024-04-28", status: "concluido", total: 1250.00, itens: [] },
        { id: 2, clienteId: 2, data: "2024-04-29", status: "pendente", total: 840.00, itens: [] }
    ],
    boms: [
        { id: 1, produtoId: 1, componentes: [{ nome: "Barra de Aço 10mm", qtd: 1.2, unidade: "M" }, { nome: "Graxa Industrial", qtd: 0.05, unidade: "KG" }] }
    ],
    pmp: [],
    ordens_producao: [],
    movimentacoes: [],
    
    // FASE 4: LOGÍSTICA
    rotas: [{ id: 1, nome: "Vix-SP Express", origem: "Vitória, ES", destino: "São Paulo, SP", km: 950 }],
    veiculos: [{ id: 1, placa: "VIX-2026", modelo: "Caminhão Baú", status: "disponivel" }],
    entregas: [],

    // FASE 4: FINANCEIRO
    contas_receber: [],
    contas_pagar: [],
    
    toasts: []
};

function reducer(state, action) {
    let newState;
    switch (action.type) {
        case 'SET_PAGE': newState = { ...state, activePage: action.payload }; break;
        case 'ADD_TOAST': newState = { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] }; break;
        case 'REMOVE_TOAST': newState = { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }; break;
        
        // CRUD BÁSICO
        case 'ADD_CLIENTE': newState = { ...state, clientes: [...state.clientes, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_PRODUTO': newState = { ...state, produtos: [...state.produtos, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_PEDIDO': newState = { ...state, pedidos: [...state.pedidos, { id: Date.now(), ...action.payload }] }; break;

        // FASE 3: PRODUÇÃO E ESTOQUE
        case 'ADD_BOM': newState = { ...state, boms: [...state.boms, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_PMP': newState = { ...state, pmp: [...state.pmp, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_OP': newState = { ...state, ordens_producao: [...state.ordens_producao, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_MOVIMENTACAO': {
            const prod = state.produtos.find(p => p.id === parseInt(action.payload.produtoId));
            const novosProdutos = state.produtos.map(p => p.id === prod?.id ? { ...p, estoque: p.estoque + (action.payload.tipo === 'entrada' ? action.payload.qtd : -action.payload.qtd) } : p);
            newState = { ...state, produtos: novosProdutos, movimentacoes: [{ id: Date.now(), ...action.payload }, ...state.movimentacoes] };
            break;
        }

        // FASE 4: LOGÍSTICA
        case 'ADD_ROTA': newState = { ...state, rotas: [...state.rotas, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_VEICULO': newState = { ...state, veiculos: [...state.veiculos, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_ENTREGA': newState = { ...state, entregas: [...state.entregas, { id: Date.now(), ...action.payload }] }; break;

        // FASE 4: FINANCEIRO
        case 'ADD_RECEBER': newState = { ...state, contas_receber: [...state.contas_receber, { id: Date.now(), ...action.payload }] }; break;
        case 'ADD_PAGAR': newState = { ...state, contas_pagar: [...state.contas_pagar, { id: Date.now(), ...action.payload }] }; break;
        case 'LIQUIDAR_CONTA': {
            const lista = action.payload.tipo === 'receber' ? 'contas_receber' : 'contas_pagar';
            newState = { ...state, [lista]: state[lista].map(c => c.id === action.payload.id ? { ...c, status: 'pago' } : c) };
            break;
        }

        case 'HYDRATE': newState = { ...state, ...action.payload }; break;
        default: newState = state;
    }
    
    if (action.type !== 'ADD_TOAST' && action.type !== 'REMOVE_TOAST' && action.type !== 'SET_PAGE') {
        const { toasts, activePage, ...persistentData } = newState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentData));
    }
    return newState;
}

// --- COMPONENTES PRIMITIVOS ---

const Icon = ({ icon: IconComp, size = 20, className = "" }) => (
    <IconComp size={size} className={className} strokeWidth={2} />
);

const KPI = ({ label, value, unit, icon, color = "accent", sub }) => (
    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm hover-lift flex flex-col justify-between relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-textSec mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-text flex items-baseline gap-1">{value}{unit && <span className="text-sm font-normal text-textTer">{unit}</span>}</h3>
            </div>
            <div className={`p-2.5 rounded-lg border border-${color}/20 text-${color} bg-${color}/5`}>
                <Icon icon={icon} size={22} />
            </div>
        </div>
        {sub && <p className="mt-3 text-xs text-textTer font-medium">{sub}</p>}
    </div>
);

const Badge = ({ children, color = "gray" }) => {
    const themes = {
        gray: "bg-slate-100 text-slate-600 border-slate-200",
        green: "bg-successBg text-success border-successBd",
        red: "bg-dangerBg text-danger border-dangerBd",
        blue: "bg-infoBg text-info border-infoBd",
        yellow: "bg-warnBg text-warn border-warnBd",
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${themes[color] || themes.gray}`}>{children}</span>;
};

const PrimaryBtn = ({ onClick, children, icon, color = "accent", className = "" }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md bg-${color} text-white hover:brightness-110 ${className}`}>
        {icon && <Icon icon={icon} size={18} />}{children}
    </button>
);

const GhostBtn = ({ onClick, children, icon, className = "" }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-textSec border border-border bg-white hover:bg-slate-50 transition-all ${className}`}>
        {icon && <Icon icon={icon} size={18} />}{children}
    </button>
);

const SectionCard = ({ title, children, actions }) => (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-xs font-bold text-textSec uppercase tracking-widest">{title}</h4>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const Modal = ({ title, children, onClose, width = "max-w-md" }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-sidebar/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className={`bg-surface w-full ${width} rounded-2xl shadow-2xl relative z-10 page-anim overflow-hidden flex flex-col max-h-[90vh]`}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-bold text-text">{title}</h3>
                <button onClick={onClose} className="text-textTer"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        </div>
    </div>
);

const DataTable = ({ columns, data, onAction, actionLabel = "Ações" }) => (
    <div className="w-full overflow-hidden border border-border rounded-xl bg-surface overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/80 border-b border-border">
                    {columns.map((col, idx) => <th key={idx} className="px-6 py-3 text-[11px] font-bold text-textTer uppercase tracking-widest">{col.header}</th>)}
                    {onAction && <th className="px-6 py-3 text-[11px] font-bold text-textTer uppercase tracking-widest text-right">{actionLabel}</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {data.length === 0 ? <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-sm text-textTer italic">Nenhum registro encontrado</td></tr> :
                data.map((item, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                        {columns.map((col, colIdx) => <td key={colIdx} className="px-6 py-4 text-sm text-text">{col.render ? col.render(item) : item[col.key]}</td>)}
                        {onAction && <td className="px-6 py-4 text-right">{onAction(item)}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- ESTRUTURA ---

const Sidebar = () => {
    const { state, dispatch } = useContext(AppContext);
    const groups = [
        { label: "Principal", items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
        { label: "Comercial", items: [{ id: 'clientes', label: 'Clientes', icon: Users }, { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart }] },
        { label: "Produção", items: [{ id: 'bom', label: 'Engenharia', icon: Layers }, { id: 'ordens', label: 'Ordens Prod.', icon: Hammer }] },
        { label: "Estoque", items: [{ id: 'movimentacoes', label: 'Movimentações', icon: History }] },
        { label: "Logística", items: [{ id: 'rotas', label: 'Rotas', icon: Map }, { id: 'entregas', label: 'Entregas', icon: Truck }] },
        { label: "Financeiro", items: [{ id: 'financeiro', label: 'Dashboard Fin.', icon: BarChart3 }, { id: 'contas', label: 'Fluxo de Caixa', icon: DollarSign }] }
    ];

    return (
        <aside className="w-[240px] bg-sidebar h-full flex flex-col border-r border-white/5 flex-shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/40"><Box className="text-white" size={22} /></div>
                <div><h1 className="text-white font-bold text-lg leading-none tracking-tight">VixSys</h1><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cavalieri Edition</span></div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 custom-scrollbar">
                {groups.map(group => (
                    <div key={group.label} className="mb-6">
                        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">{group.label}</p>
                        {group.items.map(item => (
                            <button key={item.id} onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all ${state.activePage === item.id ? 'bg-accent/20 text-blue-400 border border-accent/20' : 'text-slate-400 hover:bg-sidebarHov hover:text-white'}`}>
                                <Icon icon={item.icon} size={18} /><span className="text-[13px] font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

const Header = () => {
    const { state } = useContext(AppContext);
    return (
        <header className="h-[64px] bg-surface border-b border-border flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
            <div><h2 className="text-base font-bold text-text leading-none uppercase tracking-wide">{state.activePage}</h2><p className="text-xs text-textTer mt-1 font-medium">VixSys ERP • Gabriel Cavalieri</p></div>
            <div className="flex items-center gap-4">
                <div className="bg-success/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">Sistema Online</span>
                </div>
            </div>
        </header>
    );
};

// --- PÁGINAS FASE 4 ---

const DashboardPage = () => {
    const { state } = useContext(AppContext);
    const totReceber = state.contas_receber.filter(c => c.status === 'pendente').reduce((a, b) => a + parseFloat(b.valor), 0);
    const totPagar = state.contas_pagar.filter(c => c.status === 'pendente').reduce((a, b) => a + parseFloat(b.valor), 0);
    
    return (
        <div className="page-anim">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPI label="Saldo em Aberto" value={`R$ ${(totReceber - totPagar).toLocaleString('pt-BR')}`} icon={BarChart3} color="accent" sub="Receber vs Pagar" />
                <KPI label="A Receber" value={`R$ ${totReceber.toLocaleString('pt-BR')}`} icon={TrendingUp} color="success" sub="Entradas pendentes" />
                <KPI label="A Pagar" value={`R$ ${totPagar.toLocaleString('pt-BR')}`} icon={TrendingDown} color="danger" sub="Saídas pendentes" />
                <KPI label="Entregas Ativas" value={state.entregas.filter(e => e.status !== 'entregue').length} icon={Truck} color="purple" sub="Em trânsito" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Últimas Entregas">
                    <DataTable columns={[
                        { header: "ID", render: r => `#${r.id.toString().slice(-4)}` },
                        { header: "Rota", render: r => state.rotas.find(rt => rt.id == r.rotaId)?.nome || "Geral" },
                        { header: "Status", render: r => <Badge color={r.status === 'entregue' ? 'green' : 'blue'}>{r.status.toUpperCase()}</Badge> }
                    ]} data={state.entregas.slice(0, 5)} />
                </SectionCard>
                <SectionCard title="Fluxo de Caixa Recente">
                    <DataTable columns={[
                        { header: "Vencimento", key: "vencimento" },
                        { header: "Descrição", key: "descricao" },
                        { header: "Valor", render: r => `R$ ${parseFloat(r.valor).toFixed(2)}` },
                        { header: "Status", render: r => <Badge color={r.status === 'pago' ? 'green' : 'yellow'}>{r.status.toUpperCase()}</Badge> }
                    ]} data={[...state.contas_receber, ...state.contas_pagar].sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento)).slice(0, 5)} />
                </SectionCard>
            </div>
        </div>
    );
};

const RotasPage = () => {
    const { state, dispatch, addToast } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({ nome: "", origem: "", destino: "", km: "" });

    const save = () => {
        dispatch({ type: 'ADD_ROTA', payload: form });
        addToast("Rota cadastrada!");
        setShow(false);
    };

    return (
        <div className="page-anim">
            <SectionCard title="Rotas Logísticas" actions={<PrimaryBtn onClick={() => setShow(true)} icon={Plus}>Nova Rota</PrimaryBtn>}>
                <DataTable columns={[{ header: "Nome", key: "nome" }, { header: "Origem", key: "origem" }, { header: "Destino", key: "destino" }, { header: "KM", render: r => `${r.km} KM` }]} data={state.rotas} />
            </SectionCard>
            {show && <Modal title="Nova Rota" onClose={() => setShow(false)}>
                <input className="input-base mb-3" placeholder="Nome da Rota" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                <input className="input-base mb-3" placeholder="Origem" value={form.origem} onChange={e => setForm({...form, origem: e.target.value})} />
                <input className="input-base mb-3" placeholder="Destino" value={form.destino} onChange={e => setForm({...form, destino: e.target.value})} />
                <input className="input-base mb-3" placeholder="KM" type="number" value={form.km} onChange={e => setForm({...form, km: e.target.value})} />
                <PrimaryBtn className="w-full" onClick={save}>Salvar Rota</PrimaryBtn>
            </Modal>}
        </div>
    );
};

const EntregasPage = () => {
    const { state, dispatch, addToast } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({ rotaId: "", veiculoId: "", status: "em transito" });

    const save = () => {
        dispatch({ type: 'ADD_ENTREGA', payload: form });
        addToast("Entrega despachada!");
        setShow(false);
    };

    return (
        <div className="page-anim">
            <SectionCard title="Gestão de Entregas" actions={<PrimaryBtn onClick={() => setShow(true)} icon={Truck}>Nova Entrega</PrimaryBtn>}>
                <DataTable columns={[
                    { header: "ID", render: r => `#${r.id.toString().slice(-4)}` },
                    { header: "Rota", render: r => state.rotas.find(rt => rt.id == r.rotaId)?.nome },
                    { header: "Status", render: r => <Badge color={r.status === 'entregue' ? 'green' : 'blue'}>{r.status.toUpperCase()}</Badge> }
                ]} data={state.entregas} />
            </SectionCard>
            {show && <Modal title="Despachar Entrega" onClose={() => setShow(false)}>
                <select className="input-base mb-3" onChange={e => setForm({...form, rotaId: e.target.value})}>
                    <option>Selecione a Rota</option>
                    {state.rotas.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
                <select className="input-base mb-3" onChange={e => setForm({...form, veiculoId: e.target.value})}>
                    <option>Selecione o Veículo</option>
                    {state.veiculos.map(v => <option key={v.id} value={v.id}>{v.placa} ({v.modelo})</option>)}
                </select>
                <PrimaryBtn className="w-full" onClick={save}>Confirmar Despacho</PrimaryBtn>
            </Modal>}
        </div>
    );
};

const ContasPage = () => {
    const { state, dispatch, addToast } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({ tipo: "receber", descricao: "", valor: "", vencimento: "", status: "pendente" });

    const save = () => {
        dispatch({ type: form.tipo === 'receber' ? 'ADD_RECEBER' : 'ADD_PAGAR', payload: form });
        addToast("Lançamento financeiro concluído!");
        setShow(false);
    };

    const liquidar = (id, tipo) => {
        dispatch({ type: 'LIQUIDAR_CONTA', payload: { id, tipo } });
        addToast("Conta liquidada!");
    };

    return (
        <div className="page-anim">
            <SectionCard title="Fluxo de Caixa (Pagar/Receber)" actions={<PrimaryBtn onClick={() => setShow(true)} icon={Plus}>Novo Lançamento</PrimaryBtn>}>
                <DataTable columns={[
                    { header: "Tipo", render: r => <Badge color={state.contas_receber.includes(r) ? 'green' : 'red'}>{state.contas_receber.includes(r) ? 'RECEBER' : 'PAGAR'}</Badge> },
                    { header: "Descrição", key: "descricao" },
                    { header: "Valor", render: r => `R$ ${parseFloat(r.valor).toFixed(2)}` },
                    { header: "Vencimento", key: "vencimento" },
                    { header: "Status", render: r => <Badge color={r.status === 'pago' ? 'green' : 'yellow'}>{r.status.toUpperCase()}</Badge> }
                ]} data={[...state.contas_receber, ...state.contas_pagar]} 
                   onAction={(r) => r.status === 'pendente' && <button onClick={() => liquidar(r.id, state.contas_receber.includes(r) ? 'receber' : 'pagar')} className="text-xs font-bold text-success hover:underline">BAIXAR</button>} />
            </SectionCard>
            {show && <Modal title="Novo Lançamento" onClose={() => setShow(false)}>
                <select className="input-base mb-3" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                    <option value="receber">Conta a Receber</option>
                    <option value="pagar">Conta a Pagar</option>
                </select>
                <input className="input-base mb-3" placeholder="Descrição" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                <input className="input-base mb-3" type="number" placeholder="Valor R$" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
                <input className="input-base mb-3" type="date" value={form.vencimento} onChange={e => setForm({...form, vencimento: e.target.value})} />
                <PrimaryBtn className="w-full" onClick={save}>Salvar Lançamento</PrimaryBtn>
            </Modal>}
        </div>
    );
};

// --- APP ---

const App = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
    }, []);
    const addToast = (text, type = 'success') => {
        const id = Date.now();
        dispatch({ type: 'ADD_TOAST', payload: { text, type, id } });
        setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000);
    };
    const contextValue = useMemo(() => ({ state, dispatch, addToast }), [state]);

    const render = () => {
        switch(state.activePage) {
            case 'dashboard': return <DashboardPage />;
            case 'clientes': return <div className="p-8 text-center text-textTer">Módulo de Clientes (Fase 2)</div>;
            case 'pedidos': return <div className="p-8 text-center text-textTer">Módulo de Pedidos (Fase 2)</div>;
            case 'bom': return <div className="p-8 text-center text-textTer">Módulo de Engenharia (Fase 3)</div>;
            case 'ordens': return <div className="p-8 text-center text-textTer">Módulo de Produção (Fase 3)</div>;
            case 'movimentacoes': return <div className="p-8 text-center text-textTer">Módulo de Estoque (Fase 3)</div>;
            case 'rotas': return <RotasPage />;
            case 'entregas': return <EntregasPage />;
            case 'contas': return <ContasPage />;
            case 'financeiro': return <div className="p-12 text-center text-accent font-bold">Resumo Financeiro Consolidado em Construção</div>;
            default: return <div className="p-12 text-center">Página em Construção</div>;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="flex h-screen overflow-hidden"><Sidebar />
                <div className="flex-1 flex flex-col min-w-0 bg-bg"><Header />
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-[1400px] mx-auto">{render()}</div>
                    </main>
                </div>
            </div>
        </AppContext.Provider>
    );
};
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
