# Node Project Setup with LangGraph and Groq LLM

## 1. Initialize Node Project
```bash
npm init -y
```

## 2. Convert Project to ES Modules
Open `package.json` and change:
```json
"type": "commonjs"
```
to:
```json
"type": "module"
```

---

## 3. Create Basic Command Line Input Script

```javascript
import readline from 'node:readline/promises';

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        const user_input = await rl.question('You: ');
        if (user_input === 'bye') break;

        console.log("you said", user_input);
    }

    rl.close();
}

main();
```

---

## 4. Install LangGraph
```bash
npm install @langchain/langgraph @langchain/core
```

Reference:
https://docs.langchain.com/oss/javascript/langgraph/overview

**LangGraph Flow Diagram (each node = function)**  
*(Add your diagram as needed)*

---

## 5. Install GroqChat for LLM Access
```bash
npm install @langchain/groq
```

Groq Chat Docs:  
https://docs.langchain.com/oss/javascript/integrations/chat/groq

---

## 6. Generate GROQ API Key  
Go to: https://console.groq.com/keys  
Login with Google → Generate API Key

---

## 7. Create `.env` File
```
GROQ_API_KEY=your_api_key
```

---

## 8. Choose Your LLM Model
Visit: https://console.groq.com/docs/models

Selected model:
```
openai/gpt-oss-120b
```
