# Diretrizes de Design — Fazenda-Sim

## Norte do projeto

Fazenda-Sim é uma experiência de estratégia e simulação rural em tempo real. Queremos a escala, a leitura espacial, a profundidade do terreno e a sensação de mundo vivo de um RTS moderno, com uma identidade visual própria de fazenda. Age of Empires IV é uma referência de ambição e qualidade, não um molde para copiar.

## Pilares inegociáveis

1. **A fazenda é a fantasia central.** Toda mecânica deve aprofundar exploração rural, cultivo, criação de animais, construção, produção ou comércio.
2. **Um mundo amplo que convida à exploração.** O território procedural, o fog of war, os limites naturais e a expansão da propriedade dão sentido à jornada.
3. **Sistemas legíveis e interligados.** Terreno, recursos, trabalhadores, animais e construções precisam comunicar claramente o que está acontecendo e por quê.
4. **Uma fazenda viva, não um tabuleiro estático.** O mundo responde ao clima, às estações, às tarefas e à presença do jogador; animais e trabalhadores têm comportamentos compreensíveis.
5. **Liberdade com consequências justas.** Construção, gestão e progressão oferecem escolhas; custos, riscos e resultados são previsíveis antes de confirmar uma ação.
6. **Beleza que serve à leitura.** A composição pode ser rica e cinematográfica, mas silhuetas, caminhos, elevação, áreas construíveis, interações e estados nunca podem ficar escondidos pela decoração.
7. **Progressão acolhedora.** Aventura recompensa planejamento e exploração; Criativo permite criar sem pressão de recursos. Nenhum modo deve exigir combate para ser completo.

## Traduzindo a referência de RTS para a fazenda

| Qualidade procurada | Tradução para Fazenda-Sim |
| --- | --- |
| Escala de mundo e enquadramento estratégico | Câmera que oferece visão ampla da propriedade e detalhe suficiente para interagir, com zoom e orientação testados por legibilidade. |
| Terreno com volume e leitura de altura | Colinas, encostas, água, caminhos e vegetação com alturas coerentes, sombras e silhuetas claras. |
| Atividade visível no mundo | Trabalhadores com tarefas compreensíveis, animais com rotinas por espécie e sinais visuais de progresso. |
| Planejamento de economia e expansão | Ciclos de recursos rurais, produção, armazenamento, comércio, mão de obra e expansão do território. |
| Apresentação audiovisual de alto acabamento | Iluminação, materiais, animação, som ambiente e efeitos próprios para a identidade rural do jogo. |

Não adicionar combate, facções, unidades militares, progressão de eras ou uma estética medieval apenas por existirem na referência. Uma nova mecânica só entra se fortalecer um pilar e couber no loop rural.

### Hipóteses de gameplay a validar

- O loop estratégico deve permitir planejar e delegar atividades rurais, em vez de exigir que cada tarefa repetitiva seja executada manualmente.
- Trabalhadores, caso aprovados, devem receber papéis e ordens de cultivo, colheita, coleta, cuidado animal ou transporte que o jogador consiga inspecionar e corrigir.
- Exploração regional deve revelar oportunidades e restrições concretas — água, solo, recursos, caminhos e locais para expandir — e não apenas remover neblina do mapa.
- Produção e armazenamento devem formar ciclos rurais compreensíveis, com distância e capacidade como decisões legíveis, sem microgerenciamento opaco.
- **Decisão aprovada:** o controle será híbrido. O jogador poderá controlar diretamente o fazendeiro e também selecionar trabalhadores para emitir ordens estratégicas. A primeira fatia tem dois trabalhadores gratuitos, com uma ordem explícita por vez: mover, coletar madeira/pedra ou colher uma plantação pronta. Ao terminar, ficam ociosos. Sem salários, contratação, filas ou automação nesta fatia.
- Os comandos aprovados para o protótipo são selecionar trabalhador, escolher Mover/Coletar/Colher no painel e clicar no terreno ou alvo correspondente.
- Seleção de várias unidades, pausa/velocidade do tempo e controles exatos dos comandos continuam decisões em aberto e devem ser avaliados no protótipo.

## Direção visual e técnica

- Buscar um mundo 3D estilizado, naturalista e acolhedor, com materiais táteis, iluminação ambiental, vegetação rica e arquitetura rural autoral.
- Preferir câmera estratégica de RTS como hipótese inicial; validar ângulo, rotação, zoom e escala num protótipo antes de fixá-los como requisito.
- Tratar terreno, entidades, interface e simulação como domínios separados. Renderização não deve ser dona das regras do jogo nem dos dados persistidos.
- Manter coordenadas do mundo independentes da projeção e do renderer; saves armazenam estado de jogo, não objetos ou materiais gráficos.
- Usar física para sustentar terreno, locomoção, colisão e interação. Evitar simulação física global quando uma regra determinística e legível resolve melhor.
- Escolher engine, biblioteca WebGL, formato de assets e orçamento de desempenho depois de comparar um protótipo representativo e as plataformas-alvo.
- Manter UI artesanal rural, mas reduzir obstrução do mapa; oferecer hierarquia visual, estados acessíveis e controles adequados a cada plataforma aprovada.
- A inspiração deve resultar em decisões originais. Não reproduzir mapas, modelos, texturas, sons, animações, ícones, layouts ou elementos distintivos de Age of Empires IV.

## Princípios de simulação

- Preferir atualização previsível da simulação, com aleatoriedade controlada para resultados reproduzíveis e depuração.
- Navegação de animais e trabalhadores deve levar em conta terreno transitável, edifícios, cercas e portões, comunicar bloqueios e escalar de modo medido.
- Exibir necessidades, tarefas pendentes, filas e gargalos com sinais úteis; não exigir que o jogador adivinhe por que uma entidade parou de trabalhar.
- Compatibilidade de saves abrange estado relevante de movimento e tarefa, além da posição básica; mudanças de formato exigem migração explícita.
- Custos de simulação e desenho precisam ser medidos separadamente ao aumentar população, área explorável ou quantidade de objetos.

## Regras para avaliar propostas

Antes de aprovar uma nova mecânica, conteúdo ou refatoração, responda:

1. Qual pilar ela fortalece e para quem?
2. Como o jogador entende o estado, o custo e o resultado?
3. Ela preserva os modos Aventura e Criativo e o tema rural?
4. Depende da tecnologia de renderização atual ou pode permanecer independente?
5. Como será validada, incluindo desempenho e acessibilidade visual quando pertinente?

Se não houver resposta clara para as três primeiras perguntas, a proposta precisa ser reduzida ou adiada. Se a resposta da quarta for “depende”, reavalie a separação de responsabilidades.

## Portões de decisão para a migração 3D

1. **Direção aprovada:** confirmar câmera, estilo de arte, escopo da simulação, plataformas e orçamento visual.
2. **Base independente de renderer:** definir coordenadas, atualização da simulação, seleção/interação, construção e formato de save sem depender do desenho 2D.
3. **Protótipo vertical:** validar uma pequena área com relevo, água, vegetação, personagem, animal, construção, iluminação, fog of war e colocação por clique.
4. **Avaliação objetiva:** medir leitura visual, controles, compatibilidade, carregamento e desempenho em hardware representativo.
5. **Migração incremental:** mover sistemas para o novo renderer em etapas, mantendo saves e gameplay válidos e um caminho de comparação com a versão atual até a aceitação do protótipo.

Nenhum portão é aprovado só porque a cena renderiza: o protótipo precisa provar que a experiência rural é clara, jogável e sustentável para o projeto.
