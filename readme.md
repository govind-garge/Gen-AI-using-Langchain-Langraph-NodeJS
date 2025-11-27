# Agentic chatbot using Langchain, Langgraph, NodeJS

## 1. Create Node Project

``` bash
npm init -y
```

Update `package.json` and set:

``` json
"type": "module"
```

------------------------------------------------------------------------

## 2. Basic Command Line Input Script

``` js
import readline from 'node:readline/promises';

async function main() {
    const rl = readline.createInterface({input:process.stdin, output:process.stdout});
    while(true){
        const user_input = await rl.question('You: ');
        if(user_input == 'bye') break;
        console.log("you said", user_input);
    }
    rl.close();
}
main();
```

------------------------------------------------------------------------

## 3. Install LangGraph

``` bash
npm install @langchain/langgraph @langchain/core
```

Docs: LangGraph Overview

------------------------------------------------------------------------

## 4. Install Groq LLM Client

``` bash
npm install @langchain/groq
```

Generate API key at Groq Console.

Add to `.env`:

    GROQ_API_KEY=your_api_key

Model used: `openai/gpt-oss-120b`.

------------------------------------------------------------------------

## 5. Tavily Web Search Tool

Signup at Tavily → generate API key\
Add to `.env`:

    TAVILY_API_KEY=your_key

Install:

``` bash
npm install @langchain/tavily
```

Install dotenv:

``` bash
npm install dotenv@16.4.5
```

------------------------------------------------------------------------

## 6. Full Working Code

``` js
import { HumanMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import readline from 'node:readline/promises';
import { ChatGroq } from "@langchain/groq"
import dotenv from 'dotenv';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from "@langchain/tavily";

dotenv.config();

const tool = new TavilySearch({ maxResults: 3, topic: "general" });
const tools = [tool];
const toolNode = new ToolNode(tools);

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
}).bindTools(tools);

async function callModel(state){
    console.log("LLM function called");
    const response = await llm.invoke(state.messages);
    return {messages:[response]};
}

function shouldContinue(state){
    console.log("shouldContinue called");
    const last_message = state.messages[state.messages.length -1];
    if(last_message.tool_calls.length > 0) return "tools";
    return "__end__";
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

const app = workflow.compile();

async function main() {
    const rl = readline.createInterface({input:process.stdin, output:process.stdout});
    while(true){
        const user_input = await rl.question('You: ');
        if(user_input == 'bye') break;

        const final_state = await app.invoke({
            messages:[{role:'user', content:user_input}],
        });

        const last_message = final_state.messages[final_state.messages.length -1];
        console.log("AI Response:", last_message.content);
    }
    rl.close();
}
main();
```

------------------------------------------------------------------------
👨‍💻 Author
Created with ❤️ by Govind Garge
Tech Stack: NodeJS, LangChain, Langgraph, Tavily, Groq