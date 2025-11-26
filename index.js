import { HumanMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import readline from 'node:readline/promises';
import { ChatGroq } from "@langchain/groq"
import dotenv from 'dotenv';

dotenv.config();
/**
 * initialise LLM
 */

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})

/**
 * function to call LLM
 */
async function callModel(state){
    
    const response = await llm.invoke(state.messages);

    return {messages:[response]}
}

/*
* Build the graph
*/
const workflow = new StateGraph(MessagesAnnotation).addNode("agent", callModel).addEdge("__start__","agent").addEdge("agent","__end__");

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