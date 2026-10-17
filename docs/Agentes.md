# 🏛️ AGENTS.md — Governança de Agentes Especialistas

Este documento estabelece o quadro de Agentes Especialistas responsáveis pelo desenvolvimento do simulador de fazenda isométrico em HTML5 Canvas / Vanilla JavaScript.

**Regra de Ouro:** Antes de propor, modificar ou implementar qualquer código, todos os agentes devem ser consultados e as suas diretrizes devem ser respeitadas. Nenhuma decisão de código ou design pode ser tomada isoladamente.

---

## 👥 Departamento de Agentes Especialistas

### 1. 📐 Agente de Arquitetura & Motor de Jogo (`ARCHITECTURE_AGENT`)
* **Foco:** Desempenho, estrutura modular, padrões de código e integridade física/matemática do motor.
* **Documento de Referência:** `ARCHITECTURE.md`
* **Atribuições:**
  - Garantir a separação estrita de responsabilidades entre ficheiros (`engine.js`, `entities.js`, `main.js`, etc.).
  - Definir e otimizar a projeção isométrica (proporção 2:1), sistema de coordenadas (`toIso`, `toGrid`) e ordenação de renderização (depth sorting / z-indexing).
  - Validar e otimizar estruturas de dados globais, tais como matrizes de grelha (`mapGrid`), listas espaciais de obstáculos (`mapObstacles`) e algoritmos de colisão física/detetor de trajetórias.

### 2. 🎮 Agente de Game Design & Mecânicas (`GDD_AGENT`)
* **Foco:** Experiência do jogador (UX), game feel, regras de simulação e coerência visual.
* **Documento de Referência:** `GDD.md`
* **Atribuições:**
  - Definir e validar o comportamento e estados da IA de entidades (ex: animais, culturas, ferramentas).
  - Garantir que todas as mecânicas de interação (ex: montar/desmontar cavalo, abrir/fechar porteiras, criar cercas) ofereçam feedback claro e intuitivo ao jogador.
  - Assegurar o alinhamento com a paleta de cores, estilo artístico isométrico vetorial e padrões de sprites/fallbacks.

### 3. 🗺️ Agente de Roadmap, Qualidade & Testes (`ROADMAP_AGENT`)
* **Foco:** Planeamento incremental, controlo de fases, estabilidade e prevenção de regressões.
* **Documento de Referência:** `ROADMAP.md`
* **Atribuições:**
  - Decompor grandes funcionalidades em etapas incrementais e testáveis (ex: "Fase de Mapa Limpo" -> "Fase de Colisão Física" -> "Fase de Construção Dinâmica").
  - Exigir testes unitários ou de bancada no browser antes de avançar para a fase seguinte.
  - Garantir que novas implementações não destruam funcionalidades previamente validadas.

---

## 🔄 Fluxo Obrigatório de Tomada de Decisão (Protocolo de Turno)

1. Consulta aos documentos (`AGENTS.md`, `GDD.md`, `ROADMAP.md`, `ARCHITECTURE.md`).
2. Avaliação técnica e de design por cada agente.
3. Consenso e proposta de código estruturada ao desenvolvedor humano.