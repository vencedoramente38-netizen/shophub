import avatarAna from "@/assets/avatars/avatar-ana.png";
import avatarBruna from "@/assets/avatars/avatar-bruna.jpeg";
import avatarRafael from "@/assets/avatars/avatar-rafael.png";
import avatarLucas from "@/assets/avatars/avatar-lucas.png";
import avatarMarina from "@/assets/avatars/avatar-marina.png";

export interface Product {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  avaliacao: number;
  vendas: number;
  comissao: number;
  concorrencia: "Baixa" | "Média" | "Alta";
  imageUrl: string;
  linkTiktok: string;
  scoreViral?: number;
  precoTexto?: string;
}

export const defaultProducts: Product[] = [
  {
    id: 1,
    nome: "Cinto com tachas pretas cinto de punk rock com rebites com piramide de metal brilhante para unissex",
    categoria: "Acessórios",
    preco: 32.98,
    avaliacao: 4.9,
    vendas: 5000,
    comissao: 15,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/3fbdd9e221ed4405a41bcdfe025b6344~tplv-aphluv4xwc-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1731420019843958035",
    scoreViral: 88,
    precoTexto: "R$ 32,98",
  },
  {
    id: 2,
    nome: "Barriguinha Cream 200g Creme para Hidratação Profunda",
    categoria: "Beleza",
    preco: 136.00,
    avaliacao: 4.8,
    vendas: 3200,
    comissao: 18,
    concorrencia: "Média",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/9014652732064d459b29f56ef1f89438~tplv-aphluv4xwc-resize-webp:800:800.webp?dr=15584&t=555f072d&ps=933b5bde&shp=6ce186a1&shcp=607f11de&idc=my2&from=1826719393",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1731351465671230649?source=ecommerce_mall&enter_method=feed_list_top_deals&first_entrance=ecommerce_mall&first_entrance_position=region_not_match&first_entrance_tt_scene=seo",
    scoreViral: 85,
    precoTexto: "R$ 136,00",
  },
  {
    id: 3,
    nome: "1Pc Descascador De Alho Silicone Rolo Moedor Chopper Máquina Acessórios Para Cozinhar Cozinha Mini Imprensa Ferramentas",
    categoria: "Casa & Cozinha",
    preco: 37.00,
    avaliacao: 4.8,
    vendas: 8500,
    comissao: 16,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/4e5ad1a12a9c46e397139643ca501ab0~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732147487806556159",
    scoreViral: 90,
    precoTexto: "R$ 37,00",
  },
  {
    id: 4,
    nome: "Conjunto Top Decotado Manga Cavada + Saia Longa Com Fenda Sereia Moda Feminina Confortável Elegante Festas Praia Natal",
    categoria: "Moda",
    preco: 62.71,
    avaliacao: 4.3,
    vendas: 6800,
    comissao: 17,
    concorrencia: "Média",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/ba79d680a3464e3e81261fbeae6d1610~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732767996168406714",
    scoreViral: 78,
    precoTexto: "R$ 62,71",
  },
  {
    id: 5,
    nome: "Kit 2 Bermudas Tactel Preta e Branca Bolsos Laterais Short Moda Praia Verão",
    categoria: "Moda",
    preco: 46.31,
    avaliacao: 4.4,
    vendas: 7200,
    comissao: 16,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/dd7fef17a8144beb860b2471376e7b75~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732706501926750064",
    scoreViral: 82,
    precoTexto: "R$ 46,31",
  },
  {
    id: 6,
    nome: "Kit 4 Toalha de Banho Grande e Grossa Premium Luxo Felpuda 100% Algodão Viena",
    categoria: "Casa & Cozinha",
    preco: 54.40,
    avaliacao: 5.0,
    vendas: 9500,
    comissao: 19,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/cd7420e061484c7198942872f8e33484~tplv-aphluv4xwc-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732917888887194947",
    scoreViral: 94,
    precoTexto: "R$ 54,40",
  },
  {
    id: 7,
    nome: "Mini Liquidificador Portátil Recarregável 450ml 8 Lâminas Espremedor USB Display Digital Multifuncional Suco Smoothie Prático e Saudável",
    categoria: "Eletrônicos",
    preco: 41.57,
    avaliacao: 4.0,
    vendas: 5600,
    comissao: 14,
    concorrencia: "Média",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/2ae85e37cfd14759887abc95f7395b6d~tplv-aphluv4xwc-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1731172576541443502",
    scoreViral: 75,
    precoTexto: "R$ 41,57",
  },
  {
    id: 8,
    nome: "Azeiteiro Vinagreiro Spray De Vidro Com Botao + Bico Dosador + Tampa E Alca De Plastico 470ml",
    categoria: "Casa & Cozinha",
    preco: 29.69,
    avaliacao: 4.3,
    vendas: 6400,
    comissao: 15,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/07fc9c6501d546dea59b9a832137f133~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1731518860899616510",
    scoreViral: 80,
    precoTexto: "R$ 29,69",
  },
  {
    id: 9,
    nome: "Saia para Box Cama Solteiro/Casal/Queen Micropercal - Com Elástico",
    categoria: "Casa & Cozinha",
    preco: 18.59,
    avaliacao: 4.6,
    vendas: 11200,
    comissao: 13,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/1204d72cee654efb98b21d265ea33c51~tplv-aphluv4xwc-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1733041675376232147",
    scoreViral: 86,
    precoTexto: "R$ 18,59",
  },
  {
    id: 10,
    nome: "Chinelo Nuvem Unissex Macio Antiderrapante",
    categoria: "Moda",
    preco: 10.90,
    avaliacao: 4.6,
    vendas: 15800,
    comissao: 12,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/9c3796ba1af3436b9b013805c16dd026~tplv-aphluv4xwc-crop-webp:300:291.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1733925089237698174",
    scoreViral: 92,
    precoTexto: "R$ 10,90",
  },
  {
    id: 11,
    nome: "Kit 3 Cuecas Boxer Algodão Masculina",
    categoria: "Moda",
    preco: 68.60,
    avaliacao: 4.5,
    vendas: 4800,
    comissao: 18,
    concorrencia: "Média",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/20fd8623c7b04eb2ba9348f0b8afa5ff~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1734135327597299060",
    scoreViral: 79,
    precoTexto: "R$ 68,60",
  },
  {
    id: 12,
    nome: "Vestido Curto Costa Nua Duna Leve, Soltinho e Super Elegante!",
    categoria: "Moda",
    preco: 26.34,
    avaliacao: 4.4,
    vendas: 7600,
    comissao: 16,
    concorrencia: "Baixa",
    imageUrl: "https://p19-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/ccf42dee8f824e7d8f9da3b812dc801a~tplv-aphluv4xwc-crop-webp:225:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1733085955087566347",
    scoreViral: 83,
    precoTexto: "R$ 26,34",
  },
  {
    id: 13,
    nome: "Escova Secadora 110V Alisador Elétrica Quente Cabelo Com 3 Em1",
    categoria: "Beleza",
    preco: 45.78,
    avaliacao: 5.0,
    vendas: 8900,
    comissao: 17,
    concorrencia: "Baixa",
    imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/0907de2563f44cebacc60eaa04fab2a6~tplv-o3syd03w52-crop-webp:300:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732967190579021721",
    scoreViral: 91,
    precoTexto: "R$ 45,78",
  },
  {
    id: 14,
    nome: "Conjunto Alfaiataria Social Femenino Calça e Blusa Regata Elegante Social Fashion",
    categoria: "Moda",
    preco: 71.76,
    avaliacao: 4.7,
    vendas: 5400,
    comissao: 19,
    concorrencia: "Média",
    imageUrl: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/f534867091ec4cb1a6eed90ae76e5e21~tplv-aphluv4xwc-crop-webp:225:300.webp?dr=15592&t=555f072d&ps=933b5bde&shp=8dbd94bf&shcp=d741f1be&idc=my2&from=2378011839",
    linkTiktok: "https://www.tiktok.com/shop/br/pdp/1732741875357549600",
    scoreViral: 84,
    precoTexto: "R$ 71,76",
  },
];

export const defaultAvatars = [
  {
    id: 1,
    name: "Ana",
    imageUrl: avatarAna
  },
  {
    id: 2,
    name: "Bruna",
    imageUrl: avatarBruna
  },
  {
    id: 3,
    name: "Rafael",
    imageUrl: avatarRafael
  },
  {
    id: 4,
    name: "Lucas",
    imageUrl: avatarLucas
  },
  {
    id: 5,
    name: "Marina",
    imageUrl: avatarMarina
  }
];
