import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  ShoppingBag,
  Percent,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardMetrics {
  faturamento: number;
  pedidos: number;
  comissao: number;
  cliques: number;
  produtosAtivos: number;
}

interface SalesEvolution {
  name: string;
  value: number;
}

const defaultMetrics: DashboardMetrics = {
  faturamento: 0,
  pedidos: 0,
  comissao: 0,
  cliques: 0,
  produtosAtivos: 0,
};

const defaultSalesEvolution: SalesEvolution[] = [
  { name: "Jan", value: 0 },
  { name: "Fev", value: 0 },
  { name: "Mar", value: 0 },
  { name: "Abr", value: 0 },
  { name: "Mai", value: 0 },
  { name: "Jun", value: 0 },
];

const frequenciaVendas = [
  { data: "02/02/2026", valor: 450.0 },
  { data: "01/02/2026", valor: 320.0 },
  { data: "31/01/2026", valor: 580.0 },
  { data: "30/01/2026", valor: 290.0 },
  { data: "29/01/2026", valor: 410.0 },
];

const alertas = [
  { id: 1, message: "Novo produto em alta no TikTok Shop", type: "info" },
  { id: 2, message: "Comissoes pendentes para revisao", type: "warning" },
  { id: 3, message: "Atualizacao de termos disponivel", type: "info" },
];



export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [salesEvolution, setSalesEvolution] = useState<SalesEvolution[]>(defaultSalesEvolution);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch Metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from("dashboard_metrics")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (metricsError) throw metricsError;
        if (metricsData) {
          setMetrics({
            faturamento: metricsData.faturamento || 0,
            pedidos: metricsData.pedidos || 0,
            comissao: metricsData.comissao || 0,
            cliques: metricsData.cliques || 0,
            produtosAtivos: metricsData.produtos_ativos || 0,
          });
        }

        // Fetch Sales Evolution from LocalStorage (managed by Admin)
        const savedSales = localStorage.getItem("salesEvolution");
        if (savedSales) {
          try {
            setSalesEvolution(JSON.parse(savedSales));
          } catch (e) {
            console.error("Error parsing sales evolution:", e);
            setSalesEvolution(defaultSalesEvolution);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metricCards = [
    {
      label: "Faturamento total",
      value: `R$ ${metrics.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-primary",
    },
    {
      label: "Pedidos",
      value: metrics.pedidos.toLocaleString("pt-BR"),
      icon: ShoppingBag,
      color: "bg-primary",
    },
    {
      label: "Comissao total",
      value: `R$ ${metrics.comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: Percent,
      color: "bg-primary",
    },
    {
      label: "Cliques",
      value: (metrics.cliques || 0).toLocaleString("pt-BR"),
      icon: TrendingUp, // Or MousePointer2 if I had it, but TrendingUp works
      color: "bg-primary",
    },
  ];

  if (!metrics) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Resumo da Operacao</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe faturamento e comissoes do seu ecossistema TikTok Shop.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/10 bg-card px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color} text-white`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-bold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales evolution chart */}
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Evolucao de Vendas</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050505",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#E92045"
                  strokeWidth={2}
                  dot={{ fill: "#E92045" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequencia de vendas */}
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Frequencia de vendas</h3>
          </div>
          <div className="space-y-3">
            {frequenciaVendas.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
              >
                <span className="text-sm text-muted-foreground">{item.data}</span>
                <span className="font-semibold text-white">
                  R$ {item.valor.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-white">Alertas de sistema</h3>
        </div>
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3"
            >
              <span
                className={`h-2 w-2 rounded-full ${alerta.type === "warning" ? "bg-warning" : "bg-info"
                  }`}
              />
              <span className="text-sm text-white">{alerta.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
