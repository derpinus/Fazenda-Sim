# Roadmap do Projeto - Fazenda Sim

## Versões e Funcionalidades
- [x] **v0.1:** Protótipo base, movimentação e coleta de leite.
- [x] **v0.2:** Inclusão de galinheiro e ovos.
- [x] **v0.3:** Prensa de queijo e processamento.
- [x] **v0.4:** Horta de trigo, loja modal e suporte a múltiplos animais.
- [x] **v0.5:** Perspetiva isométrica 2.5D, Y-sorting e cadência de alimentação.

## Próximos Passos
- [ ] **Portão 0 — Direção:** Validar no protótipo a câmera-alvo, o controle híbrido aprovado, ritmo do tempo, plataformas e metas de qualidade/desempenho.
- [ ] **Portão 1 — Domínio independente:** Desacoplar simulação e saves da projeção e dos métodos de desenho; formalizar coordenadas, comandos, seleção e leitura do estado.
- [ ] **Portão 2 — Protótipo comparativo:** Avaliar a evolução 2.5D e pelo menos uma opção WebGL/3D numa cena representativa com terreno elevado, água, vegetação, personagem, animal, construção, fog of war e colocação por clique.
- [ ] **Portão 3 — Avaliação:** Validar controles, clareza de gameplay, arte, acessibilidade, carregamento e desempenho em hardware representativo antes de decidir tecnologia.
- [ ] **Portão 4 — Migração incremental:** Migrar terreno, câmera, entidades e interface em etapas, mantendo saves e simulação funcionando e comparando cada etapa com o jogo atual.
- [x] **Fatia híbrida de gameplay:** Disponibilizar dois trabalhadores gratuitos com comandos explícitos de mover, coletar madeira/pedra e colher; salvar ordens; manter o fazendeiro controlável diretamente.
- [ ] Evoluir IA de animais e trabalhadores por rotinas rurais e tarefas compreensíveis; ampliar navegação e rotinas dos animais conforme o protótipo e a escala justificarem.
- [x] Navegação A* dos trabalhadores em oito direções, respeitando terreno, elevação, obstáculos, fog of war e bloqueios dinâmicos.
- [x] Diferenciar parâmetros comportamentais dos animais por espécie e dar início à busca autônoma por pasto/água, descanso, ciscagem e coesão do rebanho.
- [ ] Tornar a progressão de Aventura explícita por marcos de exploração, produção e expansão, preservando o modo Criativo sem pressão econômica.
- [ ] Avaliar ordens de trabalho, necessidades e filas rurais sem exigir microgerenciamento de cada ação repetitiva.
- [ ] Garantir salvamento/migração do estado relevante de tarefas e rotinas de IA ao evoluir os sistemas.
- [ ] Consolidar direção de arte autoral para mundo, personagens, construções, animação, som e interface rural.
- [ ] Expandir regiões, missões, eventos e efeitos sonoros após validar o loop principal e a produção de conteúdo.

Consulte `docs/DESIGN-PILLARS.md` antes de ampliar o escopo. Portões representam critérios de decisão; a migração não começa como reescrita integral.

## Concluído
- [x] Efeito sonoro curto ao colher trigo ou coletar produtos de animais.
- [x] Geração procedural reproduzível por semente, com trilha, riacho, lago e vegetação.
- [x] Território continental isométrico de 64 × 64 tiles, com elevação, colinas, falésias, florestas e fronteiras naturais.
- [x] Modos Aventura e Criativo com posicionamento livre de objetos no mapa.
- [x] Fog of war com exploração persistente, coleta de madeira/pedra/água e sede animal.
- [x] Mundo procedural ampliado para 64 × 64 tiles com câmera acompanhando o jogador e migração de saves.
- [x] Construção e demolição com reembolso parcial, currais dimensionáveis com portões e edifícios isométricos.
- [x] Cercas modulares em duas orientações, porteiras compatíveis e demolição de segmentos independentes.
- [x] Fronteiras naturais com falésias, floresta densa e serras em camadas no horizonte.
- [x] HUD compacto recolhível e painel de construção contextual.
- [x] Movimento do jogador com aceleração, corrida, animação e colisões do cenário.
- [x] IA inicial por espécie para passeio, agrupamento, acompanhamento e pastagem.
