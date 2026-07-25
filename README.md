# NitroStack Starter Template

Minimal template for learning NitroStack fundamentals with a calculator-focused
MCP server and basic widgets.

## What This Template Includes

- `calculator` module with tools, resources, and prompts
- TypeScript + Zod validation setup
- Widget-ready project structure
- Production-friendly npm scripts

## Quick Start

```bash
npx @nitrostack/cli init my-server --template typescript-starter
cd my-server
npm run dev
```

## Common Commands

```bash
npm run dev
npm run build
npm start
```

## NitroStudio

NitroStudio is the recommended way to test and debug this template during
development.

- Download: <https://nitrostack.ai/studio>
- Studio: <https://nitrostack.ai/studio>

## Links

- Docs: <https://docs.nitrostack.ai>
- Templates docs: <https://docs.nitrostack.ai/templates/01-starter-template>
- Main repository: <https://github.com/nitrocloudofficial/nitrostack>

## Community

- Discord: <https://discord.gg/uVWey6UhuD>
- X: <https://x.com/nitrostackai>
- YouTube: <https://www.youtube.com/@nitrostackai>
- LinkedIn: <https://linkedin.com/company/nitrostack-ai/>
- GitHub: <https://github.com/nitrostackai>

## Simulation Twin Capability

The Simulation Twin module supports AI-assisted generation of a simulation model from a plain-language requirement, followed by safe, deterministic execution of that model.

### Configuration

Add `GEMINI_API_KEY` to your `.env` file:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
```

### Model Lifecycle
1. **Draft:** When generated via `generate_simulation_model`, models start in `draft` status.
2. **Reviewed/Trusted:** Models requiring expert review (`requiresExpertReview: true`) must be reviewed and approved via `approve_simulation_model` before they can run.
3. **Approved:** Approved models can be safely executed.

### Tools

#### 1. `generate_simulation_model`
Uses AI to draft a simulation model (equations/rates/rules) from a plain-language requirement.
- **Inputs:**
  - `requirement` (string): Description of simulation behavior.
  - `domain` (string, optional): Contextual domain hint.

#### 2. `run_simulation`
Runs a previously generated simulation model and returns the time-series result.
- **Inputs:**
  - `modelId` (string): UUID of the model to run.
  - `steps` (number, default: 24): Number of steps.
  - `dt` (number, default: 1): Step size.
  - `paramOverrides` (object, optional): Overrides for model params.

#### 3. `approve_simulation_model`
Marks a simulation model as reviewed/trusted, optionally correcting its equations.
- **Inputs:**
  - `modelId` (string): UUID of the model.
  - `reviewedBy` (string): Reviewer name.
  - `equationOverrides` (object, optional): Formula overrides to fix model rates/equations.

