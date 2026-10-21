# GDD: Fazenda Sim (Nome Provisório)

## 1. Visão Geral
* **Gênero:** Simulação e estratégia de fazenda em tempo real, com exploração e gerenciamento de recursos.
* **Plataforma Target:** PC / Web / Mobile.
* **Estilo Visual Atual:** Ilustração 2D isométrica com aparência de diorama 3D, textura pictórica e sombras suaves; a interface usa madeira envelhecida e detalhes de pergaminho.
* **Direção Pretendida:** Mundo 3D estilizado de estratégia rural em tempo real, com escala, leitura espacial, relevo, iluminação e acabamento de RTS moderno, mantendo uma identidade de fazenda autoral. Age of Empires IV é referência de ambição, não de conteúdo a reproduzir. Engine, câmera final, plataformas e estilo de assets ainda precisam ser validados em protótipo.
* **Objetivo do Jogador:** Explorar um mundo procedural coberto pela neblina, reunir recursos e expandir a fazenda ou construir livremente no modo Criativo.

## Modos de Jogo
* **Aventura:** Mundo gerado por semente; a exploração revela o mapa progressivamente, e madeira, pedra e água são coletadas no cenário.
* **Criativo:** Mesmo mundo procedural, com recursos livres e ferramentas para posicionar e remover animais, canteiros, construções, pedras e cercas.

## 2. Loop Principal de Gameplay (Core Loop)
1. **Manejo:** Alimentar animais com trigo ou milho (F), dar água (G) e plantar sementes em canteiros vazios (F).
2. **Coleta/Processamento:** Coletar leite/ovos, madeira de árvores, pedra de rochas e água de poços ou lagoas.
3. **Construção:** Dimensionar currais por arrasto e construir celeiros, poços, silos, casas e estruturas de produção com recursos.
4. **Trabalho delegado (primeira fatia):** Dois trabalhadores gratuitos podem receber uma ordem de mover, coletar madeira/pedra ou colher um cultivo pronto; navegam por rotas em torno dos obstáculos e executam cada ordem uma vez.
5. **Economia:** Vender os produtos na feira/mercado local para obter moedas.
6. **Progressão:** Reinvestir moedas para expandir o terreno e desbloquear novos animais.

## 3. Sistemas Principais (MVP)
* **Sistema de Animação e Movimentação:** Jogador interage com objetos e animais do cenário.
* **Sistema de Animais:**
  * **Vacas:** Alimentar -> Ordenhar -> Obter Leite.
  * **Galinhas:** Alimentar -> Esperar ciclo -> Coletar Ovos.
  * **Comportamento autônomo:** Cada espécie tem velocidade, área de passeio, necessidade de água, recuperação ao pastar e descanso próprios; galinhas ciscam perto do ninho, ovelhas mantêm distância de grupo, cavalos acompanham o jogador próximo e herbívoros procuram vegetação quando estão com fome.
* **Movimentação do Jogador:** Aceleração e desaceleração graduais, câmera que acompanha a exploração, corrida com Shift e colisão com rios, árvores, pedras, construções e encostas íngremes.
* **Sistema de Processamento:**
  * **Prensa de Queijo:** Leite -> Queijo.
* **Sistema de Construção (Grid System):** Currais rápidos retangulares ou cercas independentes em duas orientações para criar formatos personalizados, porteiras interativas, demolição por trecho ou por curral com reembolso parcial de materiais e construções como celeiro, poço, silo, galinheiro, estábulo e queijaria.
* **Fog of War:** Área ao redor do jogador fica visível; as áreas visitadas permanecem reveladas no mapa e as demais ficam ocultas.
* **Mundo:** Território continental procedural de 64 × 64 tiles com neblina de guerra, colinas em diferentes níveis, cursos d'água e limites naturais de montanhas, rochas e floresta, complementados por serras distantes em camadas para suavizar o horizonte.
* **Sistema de Economia:** Inventário do jogador, loja/mercado e controle de moedas.

## Diretrizes e Migração 3D

Os pilares, restrições de escopo e portões de decisão estão em [DESIGN-PILLARS.md](./DESIGN-PILLARS.md). A migração deve começar com a separação da simulação e do renderer, seguida por um protótipo vertical representativo e avaliação em hardware-alvo; não é uma reescrita integral de uma vez.

**Controle aprovado para o protótipo:** modelo híbrido, com movimento direto do fazendeiro e ordens estratégicas a trabalhadores. A primeira fatia usa dois trabalhadores sem salários, painel explícito de Mover/Coletar/Colher, uma ordem por vez e nenhum encadeamento automático. Seleção múltipla, pausa/velocidade do tempo ainda serão validados.

**Ordens de trabalho aprovadas para a primeira fatia:** selecionar trabalhador, escolher uma ação no painel e clicar no terreno ou alvo apropriado; ordens concluídas deixam o trabalhador ocioso.