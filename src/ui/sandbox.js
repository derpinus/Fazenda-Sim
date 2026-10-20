let currentTool = null;

export function setSandboxTool(tool) {

    currentTool = tool;

    const label =
        document.getElementById(
            "current-tool-label"
        );

    if (label) {

        label.textContent =
            `Ferramenta Ativa: ${tool}`;
    }

    console.log(
        "Sandbox:",
        tool
    );
}

window.setSandboxTool =
    setSandboxTool;