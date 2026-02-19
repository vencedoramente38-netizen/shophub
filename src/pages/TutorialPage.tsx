import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const tutorialItems = [
  {
    title: "Dashboard",
    content: `O Dashboard e a sua central de comando. Aqui voce ve:

- Faturamento total: soma de todas as suas vendas
- Pedidos: quantidade de pedidos realizados
- Comissao total: quanto voce ganhou em comissoes
- Produtos ativos: quantos produtos voce esta promovendo

O grafico de Evolucao de Vendas mostra sua performance ao longo do tempo.`,
  },
  {
    title: "Produtos",
    content: `A Central de Mineracao e onde voce encontra produtos para promover:

- Use o filtro de categorias para encontrar produtos do seu nicho
- Clique no coracao para favoritar produtos
- Clique no icone de download para baixar a imagem do produto
- Clique em "Ver detalhes" para mais informacoes
- Use o botao "Afiliar-se" para ir direto ao TikTok Shop

Produtos favoritos aparecem em um carrossel no topo para acesso rapido.`,
  },
  {
    title: "Criar Video",
    content: `O wizard de criacao de video tem 4 etapas:

1. Selecao: Escolha o produto e o avatar que aparecera no video
2. Configuracao: Defina objetivo, duracao, publico-alvo, tom de voz e mais
3. Roteiro: Escolha a estrutura do roteiro e adicione detalhes
4. Revisao & Prompt: Revise suas escolhas e gere o prompt completo

O prompt gerado pode ser copiado, salvo ou usado diretamente no V03 (Google Labs).`,
  },
  {
    title: "Editar Videos",
    content: `O editor de videos tem 4 etapas:

1. Video & Formato: Faca upload do video e escolha o formato (9:16, 1:1, 16:9)
2. Texto & Legendas: Adicione textos com posicao, estilo e timing
3. Audio & Velocidade: Ajuste velocidade de reproducao e volume
4. Filtros, Capa & Exportar: Aplique filtros, gere capa e exporte

Use a preview ao lado para ver as mudancas em tempo real.`,
  },
  {
    title: "Criar Perfil",
    content: `Aqui voce pode gerar elementos para seu perfil TikTok:

- Nomes sugeridos: Clique em Gerar para ver sugestoes de nomes
- Bio sugerida: Preencha nicho, estilo e descricao, depois gere
- Foto de perfil: Faca upload ou cole uma URL

Clique no nome para seleciona-lo. Copie e salve a bio gerada.`,
  },
  {
    title: "Meus Prompts",
    content: `Todos os prompts salvos ficam aqui:

- Use a busca para encontrar prompts especificos
- Filtre por origem (Criar Video, Criar Perfil, Outro)
- Copie qualquer prompt com um clique
- Exclua prompts que nao precisa mais

Os prompts sao salvos localmente no navegador.`,
  },
  {
    title: "Calendario",
    content: `Organize suas publicacoes e lembretes:

- Clique em um dia para ver/adicionar notas
- O heatmap mostra dias com mais atividade
- Adicione notas com horario especifico
- Use para planejar seu calendario de conteudo

As notas sao salvas localmente no navegador.`,
  },
  {
    title: "Configuracoes",
    content: `Personalize sua experiencia:

- Perfil: Altere nome, email e avatar
- Notificacoes: Ative/desative notificacoes do sistema
- Painel de Admin: Disponivel apenas para administradores, permite editar metricas do dashboard e produtos`,
  },
];

export default function TutorialPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Tutorial</h2>
        <p className="text-sm text-muted-foreground">
          Aprenda a usar todas as funcionalidades do TikTok Sync
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <Accordion type="single" collapsible className="space-y-2">
          {tutorialItems.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-2xl border border-white/10 bg-secondary/30 px-4"
            >
              <AccordionTrigger className="text-white hover:text-primary hover:no-underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground whitespace-pre-line">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
