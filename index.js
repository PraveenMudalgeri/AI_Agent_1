const { OpenAI } = require("openai");
import readline from "readline-sync";

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

//tools
function getWeatherDetails(city = "") {
  if (city.toLowerCase() === "patiyala") return "100C";
  if (city.toLowerCase() === "chandigarh") return "140C";
  if (city.toLowerCase() === "bangalore") return "200C";
  if (city.toLowerCase() === "delhi") return "120C";
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};

const SYSTEM_PROMPT = `
You are an AI assistant with START, PLAN, ACTION, observation and output state.
Wait for the user prompt and first plan using available tools.
After planning, take the action with proper tools and wait for obervation based on action.
once you get the observation, return the AI response based on START prompt and observations.

Strictly follow the json format mentioned below.

Available tools:
- function getWeatherDetails(city: string): string
getWeatherDetails tool accepts city name as string returns the weather details of the city.

Example:
START
{"type": "user", "user": "What is the sum of weather in patiyala and chandigarh?"}
{"type": "plan", "plan": "I will call the getWeatherDetails tool for patiyala."}
{"type": "action", "function": "getWeatherDetails", "input": "patiyala" }
{"type": "observation", "observation": "100C"}
{"type": "plan", "plan": "I will call the getWeatherDetails tool for chandigarh."}
{"type": "action", "function": "getWeatherDetails", "input": "chandigarh" }
{"type": "observation", "observation": "140C"}
{"type": "output", "output": "The sum of weather in patiyala and chandigarh is 240C."}

`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

while (true) {
  const query = readline.question(">> ");
  const q = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const result = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: result });

    console.log(`\n\n------------------START AI---------------`);
    console.log(result);
    console.log(`------------------END AI---------------\n\n`);

    const call = JSON.parse(result);

    if (call.type === "output") {
      console.log("AI:", call.output);
      break;
    } else if (call.type === "action") {
      const fn = tools[call.function];
      const output = fn(call.input);
      const obs = {
        type: "observation",
        observation: observation,
      };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
