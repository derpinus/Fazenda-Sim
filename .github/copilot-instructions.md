# Diretrizes para agentes — Fazenda-Sim

- Antes de propor mecânicas, arte ou arquitetura, leia [docs/DESIGN-PILLARS.md](../docs/DESIGN-PILLARS.md) e consulte os documentos diretamente relacionados à tarefa.
- Preserve a fazenda como fantasia central: exploração procedural com fog of war, manejo de animais, cultivo, recursos, produção, comércio, construção e os modos Aventura e Criativo.
- Use Age of Empires IV como referência ampla de escala, legibilidade, terreno e qualidade de apresentação; não reproduza conteúdo, assets, layouts, marcas ou elementos distintivos do jogo.
- Não introduza combate ou sistemas de RTS que não reforcem os pilares rurais. Prefira propostas pequenas com valor demonstrável.
- Mantenha simulação, dados de save, coordenadas do mundo, entrada do jogador, interface e renderização desacoplados. Não mova regras de gameplay para o renderer.
- Não escolha engine, biblioteca WebGL, formato de assets ou plataformas sem evidência de protótipo e sem registrar trade-offs.
- Preserve compatibilidade de saves e comportamento existente; documente migrações de dados e mudanças intencionais de UX.
- Atualize documentação relacionada e valide a mudança com a menor verificação disponível. O projeto não tem uma cadeia de testes automatizados estabelecida; não invente resultados de testes.
- Na dúvida entre detalhe visual e clareza de gameplay, mantenha clara a leitura de terreno, personagens, animais, recursos, interações e construção.
