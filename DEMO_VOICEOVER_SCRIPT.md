# x402mesh Demo Video - Voiceover Script
## For ElevenLabs Text-to-Speech
**Duration: ~2:45 (under 3 min limit)**

---

## 🎙️ SCRIPT (Copy this to ElevenLabs)

---

### [0:00-0:20] HOOK - The Problem

Hi, I'm Yordan, and I solved a critical problem in AI agent marketplaces: agent composability.

Here's the issue. When different developers build agents independently, they use different output formats. So even though you have a translator agent and a sentiment analyzer, you can't chain them together because the translator outputs "translated text" but the analyzer expects "text." The field names don't match, and the chain breaks.

This isn't a small problem. It makes decentralized agent marketplaces fundamentally broken.

---

### [0:20-0:50] SOLUTION - Hybrid Chain Execution

So I built x402mesh with a breakthrough feature called hybrid chain execution.

It works three ways. First, auto-chaining. Agents declare standard schemas like "text processing version one," and the router automatically maps fields between compatible agents. No manual work needed.

Second, template variables. When schemas don't match, you use syntax like "step zero dot text" to extract specific fields. It's like bash templating but for agent chains.

Third, validation before execution. The system checks your chain before any payments happen, catching errors like invalid template references or missing agents.

---

### [0:50-1:30] LIVE DEMO - Show It Works

Let me show you this working. I'm running a test suite that validates all three approaches.

Test one: auto-chaining. A translator agent outputs Spanish text, and a summarizer automatically receives it without any input mapping. The router detects both agents use the text processing schema and handles the mapping.

Test two: template variables. Here I'm explicitly extracting the translated text field using the template syntax and passing it to the analyzer.

Test three: validation. The system correctly rejects a chain that tries to reference a future step, which would be impossible.

All five tests pass. And look at this: these are real Solana transactions on devnet. Every payment is verifiable on Solana Explorer.

---

### [1:30-2:15] WEB INTERFACE

Now let me show you the web interface. This is x402mesh running on localhost three thousand.

You've got three tabs. Discovery shows all available agents with their capabilities and pricing. Five agents total, all using standard schemas.

The chain tab lets you execute agent workflows visually. And the builder tab uses OpenAI to generate chains from natural language prompts.

Watch this. I'll type "translate to Spanish and analyze sentiment." The AI generates the complete chain code, selecting the right agents and mapping the fields. This code is production-ready. You can copy it and use it immediately.

The system is fully integrated with Phantom wallet for real Solana payments.

---

### [2:15-2:50] TECHNICAL VALUE

Why does this matter? Because x402mesh is published infrastructure anyone can use right now.

The SDK is on NPM. Install it with "npm install x402mesh-sdk." The CLI is published too. "npm install global x402mesh-cli."

The hybrid chain execution is the key innovation. It's the first solution that makes agents truly composable in a decentralized marketplace. Without this, every agent needs custom integration code. With this, agents just work together.

It's built on Solana for fast, cheap transactions. The entire system is open source, well-documented, and production-ready.

---

### [2:50-3:00] CLOSING

This is x402mesh: solving composability so the agent economy can actually work.

Check out the code on GitHub, or install it from NPM and try it yourself.

Thank you.

---

## 🎬 VISUAL SYNC GUIDE

### What to show on screen during each section:

**[0:00-0:20] - The Problem**
- Show code example of incompatible schemas
- Highlight field name mismatch

**[0:20-0:50] - The Solution**
- Show auto-chaining code example
- Show template variable syntax: `{{step0.text}}`
- Show validation error example

**[0:50-1:30] - Live Demo**
- Screen record: `node test-hybrid-chain.js` running
- Show all 5 tests passing in real-time
- Highlight Solana Explorer links at the end

**[1:30-2:15] - Web Interface**
- Open http://localhost:3000
- Click through: Discover → Chain → Builder tabs
- In Builder: type prompt, show generated code
- Show Phantom wallet button

**[2:15-2:50] - Technical Value**
- Show NPM package pages:
  - https://www.npmjs.com/package/x402mesh-sdk
  - https://www.npmjs.com/package/x402mesh-cli
- Show GitHub repo: https://github.com/EchoWebLV/x402mesh
- Show GUIDE.md documentation

**[2:50-3:00] - Closing**
- Show project logo/name
- Display GitHub link on screen
- End with clean title card: "x402mesh - Agent Payment Infrastructure"

---

## 🎙️ ElevenLabs Settings

**Recommended Voice:** Professional, clear, medium pace  
**Stability:** 75%  
**Clarity:** 85%  
**Style:** Professional but approachable

**Good voices for this:**
- Adam (Conversational)
- Antoni (Well-rounded)
- Josh (Professional)

---

## 📝 Word Count: ~430 words
**Estimated duration:** 2:45 (perfect for 3-min limit)

---

## 💡 Production Tips

1. **Record screen first** - Get all the visuals
2. **Generate voice in ElevenLabs** - Use this script
3. **Combine in video editor** - iMovie, DaVinci Resolve, or Descript
4. **Add timestamps** - Sync voice to screen actions
5. **Export at 1080p** - Clear video quality

**You're ready to create a professional demo video!** 🎬

