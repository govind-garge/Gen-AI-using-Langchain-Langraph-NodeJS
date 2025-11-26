import { HumanMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import readline from 'node:readline/promises';
import { ChatGroq } from "@langchain/groq"
import dotenv from 'dotenv';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from "@langchain/tavily";

dotenv.config();
/**
 * initialise LLM
 */

// Initialize tavily tool 
const tool = new TavilySearch({
  maxResults: 3,
  topic: "general",
  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});

// Add tavily tool in our tools array, you can add other tools in this array
const tools = [tool];
const toolNode = new ToolNode(tools);

// Initialize LLM
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
}).bindTools(tools);

/**
 * function to call LLM
 */
async function callModel(state){
    
    console.log("console.log: LLM function called");

    const response = await llm.invoke(state.messages);

    return {messages:[response]}
}

// function for conditional edges (tool call or not)
function shouldContinue(state){

    console.log("console.log:should continue function called");
    
    // Get last message length, last massage is ai message
    const last_message = state.messages[state.messages.length -1];

    // if tool_calls length is greater than 0 it means LLM suggest us to call the tool
    if(last_message.tool_calls.length > 0){
        // return tools means call the tools node (.addNode("tools", toolNode))
        return "tools";
    }
    // return __end__ means exit from the current session
    return "__end__";
}

/*
* Build the graph
*/
const workflow = new StateGraph(MessagesAnnotation)
                // added function to call LLM
                .addNode("agent", callModel)
                // Tool given for web search
                .addNode("tools", toolNode)
                // given starting point
                .addEdge("__start__","agent")
                // calling agent after tool result come
                .addEdge("tools","agent")
                // call tools if the function return tools as a response or __end__
                .addConditionalEdges("agent", shouldContinue);

/**
 * compile and invoke the graph
 */

const app = workflow.compile();

async function main() {

    const rl = readline.createInterface({input:process.stdin, output:process.stdout});

    while(true){
        
        const user_input = await rl.question('You:');

        if(user_input == 'bye')
            break;

        const final_state = await app.invoke({
            messages:[{role:'user', content:user_input}],
        })

        /* Get last message as the last massage is from ai */
        const last_message = final_state.messages[final_state.messages.length -1];

        console.log("AI Response: ", last_message.content);
    }

    rl.close();
}

main();