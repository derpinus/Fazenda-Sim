# Arquitetura Técnica do Projeto

## 1. Arquitetura Atual e Alvo
* **Arquitetura Atual:** Módulos ES com sistemas de jogo, entidades de domínio e estado global `GameState`. O loop de apresentação usa `requestAnimationFrame` e avança os sistemas com passo fixo de 1/60 s; sistemas e UI ainda se conectam diretamente. O desenho dos animais já está em um módulo de apresentação separado; jogador, trabalhadores e construções ainda desenham a si próprios.
* **Mundo Atual:** Grade de 64 × 64 tiles com elevação, mundo procedural por semente, entidades e decorações em coordenadas fracionárias.
* **Renderização Atual:** Módulos ES no navegador; o mundo é desenhado em Canvas 2D com projeção isométrica e câmera acopladas ao renderer.
* **Navegação Atual:** Ordens de trabalhadores usam busca A* em grade de oito direções, considerando terreno, elevação, colisões e neblina; a rota é reconstruída ao carregar um save e recalculada após bloqueios dinâmicos.
* **IA Animal Atual:** `AnimalSystem` recebe uma referência explícita ao estado, e as regras de colisão aceitam esse estado; necessidades, decisões e perfis por espécie permanecem separados da apresentação, embora os módulos ainda compartilhem entidades serializáveis.
* **Direção Pretendida:** Renderer 3D/WebGL por selecionar após protótipo comparativo. Preservar a grade/estado do domínio sem impor a projeção 2D atual como representação persistida. Ver [DESIGN-PILLARS.md](./DESIGN-PILLARS.md).

## 2. Modelagem de Dados Principais
* **`ItemData`:** ID, nome, preço de venda e ícone visual.
* **`AnimalState`:** Nível de Fome, Felicidade, Tempo para Próxima Produção (Leite/Ovo), Tipo de Animal.
* **`BuildingData`:** Custo de Construção, Área Ocupada no Grid, Tipo de Processamento.

## 3. Padrão de Comunicação de Scripts
* **Estado atual:** O código usa acesso direto a `GameState` e chamadas entre sistemas; a arquitetura não deve pressupor que exista um barramento de eventos central.
* **Alvo:** Definir comandos/eventos de domínio explícitos quando reduzirem acoplamento real e permitirem validar regras sem Canvas ou DOM. Não adicionar infraestrutura de eventos por convenção.

## 4. Fronteiras Arquiteturais para a Migração

- **Domínio/simulação:** regras de cultivo, animais, recursos, economia, construção, exploração e progressão; não conhece APIs gráficas.
- **Ordens de trabalho:** comandos explícitos e estado da tarefa pertencem à simulação e ao save; a seleção por tela e o painel emitem comandos de domínio, não alteram diretamente posição ou inventário.
- **Estado e persistência:** coordenadas do mundo e estado serializável; saves não contêm cenas, meshes, materiais, texturas ou referências de engine.
- **Persistência de IA e tarefas:** saves preservam o estado das rotinas animais e as ordens dos trabalhadores; a versão atual é 6, com migração dos formatos anteriores.
- **Entrada e interação:** converte comandos do jogador em ações de domínio. Seleção por tela é adaptada pelo renderer/câmera, sem transferir regras de validação para ele.
- **Renderers:** consomem snapshots ou interfaces de leitura do estado. A implementação Canvas atual e um protótipo 3D devem poder ser comparados sem duplicar a simulação.
- **Conteúdo visual:** modelos, materiais, animações e áudio carregam através de um pipeline explícito com escala, convenções e fallbacks documentados.

Estas são metas arquiteturais para a evolução; não descrevem fronteiras já implementadas. A separação deve ocorrer incrementalmente e preservar comportamento e saves.

O motor atual limita a acumulação a 0,1 s por frame e a seis atualizações por frame. Isso reduz a variação por taxa de quadros e grandes saltos ao retornar de uma aba suspensa, mas **não** garante determinismo total: entrada, uso de `GameState`, relógios de UI e geradores aleatórios ainda não estão isolados.

## 5. Sequência de Decisões

1. Confirmar plataformas, câmera, escala, direção de arte e metas de desempenho.
2. Especificar coordenadas/seleção, atualização da simulação, snapshots e compatibilidade de saves.
3. Comparar opções de renderer em uma cena vertical representativa.
4. Escolher engine, formatos de assets e estratégia de desempenho com base nos resultados.

## 6. Questões de gameplay que impactam arquitetura

Antes de escolher abstrações para input, seleção e simulação, decidir:

- Como o controle híbrido integra movimento direto do fazendeiro e ordens estratégicas sem competir por input ou sobrecarregar a interface.
- Se o tempo pode ser pausado ou acelerado e qual cadência previsível a simulação deve usar.
- Qual é a escala pretendida de população, objetos ativos e área do mundo.
- Quais plataformas e hardware são alvos obrigatórios.

Estas decisões afetam pathfinding, movimentação, seleção por tela, atualização da IA, carregamento de chunks e orçamento de desempenho; não devem ser codificadas implicitamente pelo renderer.

**Decisão aprovada para o protótipo:** controle híbrido, com movimento direto do fazendeiro e ordens estratégicas a trabalhadores. Seleção múltipla, ritmo/pausa e comandos além da primeira fatia permanecem em aberto.

**Ordens da primeira fatia aprovadas:** dois trabalhadores gratuitos; painel explícito de Mover/Coletar/Colher; execução de uma única ordem. A arquitetura deve manter esses comandos e estado de trabalho independentes da representação gráfica.