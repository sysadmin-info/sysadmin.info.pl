---
title: Step-by-Step AI Agent Development - From Python to Ansible  
date: 2024-11-19T16:00:00+00:00  
description: Step-by-Step AI Agent Development - From Python to Ansible  
draft: false 
hideToc: false  
enableToc: true  
enableTocContent: false  
author: sysadmin  
authorEmoji: 🐧  
pinned: false  
asciinema: true  
series:  
- Ansible  
categories:  
- Ansible  
cover:
    image: images/2024-thumbs/aiagent01.webp  

---

#### Walkthrough video

{{<youtube 4y2H2qk8C2g>}}

### Part 1: Discussion of Steps  

1. Creating Documentation in Markdown  

Each of the main files (index.py, types.dt.py, files from the lib/ directory) should be described in the technical documentation. Below, I present Markdown files with full content.

README.md  

README.md contains general information about the project, its operation, dependencies, and startup instructions.

#### Description  

The AI Dev Agent project is an application that allows interaction with an AI model to perform specific tasks. It is configured to work with various text processing tools and integrate with the Anthropic Claude model.

#### Project Structure  

- index.py - the main application file that starts the Flask server and handles requests.  
- lib/ - folder containing all additional modules:  
  - ai.py - API handling for the Anthropic model.  
  - agent.py - decision-making logic and task execution by the agent.  
  - prompts.py - prompt definitions for the agent.  
  - tools.py - set of tools for content retrieval, file uploading, and other actions.  
- ssh_manager.py - managing SSH connections and executing commands  
- task_manager.py - managing tasks.  
- types.dt.py - definitions of data types and agent state structure.  
- config.py - environment variables  
- config.yml - environment variables  
- .env - API keys  

#### Installation  

1.Clone the repository.

```bash
git clone https://github.com/sysadmin-info/ai-agent.git
```

2.Install Ansible and run the playbook site.yml
3.Run a virtual environment
4.Start the server

```bash  
uvicorn index:app --host 0.0.0.0 --port 3000
```  

#### Usage  

Send POST requests to the main endpoint / with the appropriate message content.

##### File `log.md`  

`log.md` is used to record the agent’s actions in Markdown format.  

markdown  

##### Agent Operation Log  

Here, all operations performed by the agent will be logged in real time.  

##### Log Structure  

Each operation will be described along with its type, header, and content.  

##### Example  

[Operation Type] Header  

Operation content...  

### Part 2: Manually Creating the Project Structure and Configuring the Environment  

#### 1. Creating the project directory structure and files  

1. **Create the main project directory** and navigate to it:  

   ```bash  
   mkdir aidevs  
   cd aidevs  
   ```  

2. **Create the directory structure and files in lib**:  

   ```bash  
   mkdir -p lib  
   cd lib  
   touch agent.py ai.py prompts.py tools.py  
   ```  

3. **Create project files in the appropriate directories**:  

   ```bash  
   touch .env asgi_app.py config.py config.yml index.py requirements.txt ssh_manager.py task_manager.py types.dt.py  
   ```  

Files are created in the **main project directory** (`ai_dev_agent`), as they serve fundamental functions for the entire project and are not specific to any subdirectory.

##### 2. Configuring the virtual environment and requirements.txt file  

1. **Create and activate the virtual environment**:  

   ```bash  
   python3 -m venv venv  
   source venv/bin/activate  # Linux/macOS  
   ```  

Or add to `.bashrc` this:

```bash
alias activate-agent="source $HOME/agent/venv/bin/activate"
alias activate-aidevs="source $HOME/aidevs/agent/venv/bin/activate"
```

And then execute this:

```bash
source ~/.bashrc
```

2. **Add required packages to the `requirements.txt` file**:  

   ```plaintext  
    openai  
    asyncssh  
    markdown2  
    python-dotenv  
    ansible-lint  
    flask  
    anthropic  
    playwright  
    markdownify  
    httpx  
    quart  
    uvicorn  
   ```  

3. **Install the packages from `requirements.txt`**:  

   ```bash  
   pip install -r requirements.txt  
   ```  

##### 3. Configuring the `.env` file  

1. **Create the `.env` file** in the main project directory with API keys:  

   ```plaintext  
   OPENAI_API_KEY=your_openai_api_key  
   OPENROUTER_API_KEY=your_openrouter_api_key  
   ANTHROPIC_API_KEY=your_anthropic_api_key  
   LLAMA_PATH=path_to_your_local_llama_model  
   ```  

---  

#### Part 3: Creating the main logic of the agent and other files  

1. **File `index.py`** – serves as the main entry point for the Flask-based server and handles various HTTP requests related to the AI agent's functionality.

```python  
import logging
from quart import Quart, request, jsonify
from lib.prompts import Prompts
from lib.ai import AnthropicCompletion
from typing import Dict, Any
from dotenv import load_dotenv
import os
import json
import datetime

# Załaduj zmienne środowiskowe
load_dotenv()

# Inicjalizacja aplikacji Quart
app = Quart(__name__)

# Konfiguracja loggera
class SensitiveDataFilter(logging.Filter):
    """
    Filtr logowania do ukrywania danych wrażliwych, takich jak klucz API.
    """
    def filter(self, record):
        if record.msg and isinstance(record.msg, str):
            record.msg = record.msg.replace(os.getenv("ANTHROPIC_API_KEY", ""), "[REDACTED]")
        return True

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AIAgentLogger")
logger.addFilter(SensitiveDataFilter())


class AIAgent:
    def __init__(self, api_key: str):
        self.completion_client = AnthropicCompletion(api_key)
        self.state = {
            "currentStage": "init",
            "currentStep": 1,
            "maxSteps": 15,
            "messages": [],
            "systemPrompt": "",
            "plan": "",
            "actionsTaken": [],
            "activeTool": {},
            "api_key": api_key
        }

    def _sanitize_state(self) -> Dict[str, Any]:
        """
        Usuwa wrażliwe dane (np. klucz API) przed logowaniem.
        """
        return {k: v for k, v in self.state.items() if k != "api_key"}

    async def final_answer(self) -> str:
        self.state["systemPrompt"] = Prompts.final_answer_prompt(self.state)
        messages = [{"role": "user", "content": self.state["systemPrompt"]}]
        logger.debug(f"Sending final_answer request: {messages}")
        answer = await self.completion_client.completion(messages)
        parsed_answer = self._parse_response(answer, step="final_answer")
        self._log_to_markdown("result", "Final Answer", json.dumps(parsed_answer))
        return parsed_answer

    async def run(self, initial_message: str) -> str:
        self.state["messages"] = [{"role": "user", "content": initial_message}]
        logger.debug(f"Initial state: {self._sanitize_state()}")

        while self.state["currentStep"] <= self.state["maxSteps"]:
            try:
                self._log_request_start("plan")
                await self._plan()
                self._log_request_end("plan")

                self._log_request_start("decide")
                await self._decide()
                self._log_request_end("decide")

                if not self.state.get("activeTool", {}).get("tool"):
                    raise ValueError("Active tool is not defined or missing the 'tool' property in state.")

                if self.state["activeTool"]["tool"] == "final_answer":
                    return await self.final_answer()

                self._log_request_start("describe")
                await self._describe()
                self._log_request_end("describe")

                self._log_request_start("execute")
                await self._execute()
                self._log_request_end("execute")

                self._log_request_start("reflect")
                await self._reflect()
                self._log_request_end("reflect")

                self.state["currentStep"] += 1
            except Exception as e:
                logger.error(f"Error during step {self.state['currentStage']}: {str(e)}")
                raise

    async def _plan(self):
        self.state["currentStage"] = "plan"
        self.state["systemPrompt"] = Prompts.plan_prompt(self.state)
        messages = [{"role": "user", "content": self.state["systemPrompt"]}]
        logger.debug(f"Plan request payload: {messages}")
        plan_response = await self.completion_client.completion(messages)
        self.state["plan"] = self._parse_response(plan_response, step="plan")

    async def _decide(self):
        self.state["currentStage"] = "decide"
        self.state["systemPrompt"] = Prompts.decide_prompt(self.state)
        messages = [{"role": "user", "content": self.state["systemPrompt"]}]
        logger.debug(f"Decide request payload: {messages}")
        decision_response = await self.completion_client.completion(messages)
        try:
            self.state["activeTool"] = json.loads(self._parse_response(decision_response, step="decide"))
            logger.debug(f"Active tool decided: {self.state['activeTool']}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse decision JSON: {decision_response}")
            raise ValueError(f"Error parsing decision JSON: {decision_response}") from e

    async def _describe(self):
        self.state["currentStage"] = "describe"
        if not self.state.get("activeTool", {}).get("tool"):
            raise ValueError("Active tool is not defined or missing the 'tool' property in state.")

        self.state["systemPrompt"] = Prompts.describe_prompt(self.state)
        messages = [{"role": "user", "content": self.state["systemPrompt"]}]
        logger.debug(f"Describe request payload: {messages}")
        describe_response = await self.completion_client.completion(messages)
        self.state["activeToolPayload"] = self._parse_response(describe_response, step="describe")

    async def _execute(self):
        self.state["currentStage"] = "execute"
        tool_name = self.state["activeTool"]["tool"]
        payload = self.state["activeToolPayload"]
        logger.debug(f"Executing tool: {tool_name} with payload: {payload}")
        result = f"Executed {tool_name} with payload {payload}"
        self.state["actionsTaken"].append({
            "name": tool_name,
            "payload": payload,
            "result": result,
            "reflection": ""
        })

    async def _reflect(self):
        self.state["currentStage"] = "reflect"
        self.state["systemPrompt"] = Prompts.reflection_prompt(self.state)
        messages = [{"role": "user", "content": self.state["systemPrompt"]}]
        logger.debug(f"Reflect request payload: {messages}")
        reflection_response = await self.completion_client.completion(messages)
        self.state["actionsTaken"][-1]["reflection"] = self._parse_response(reflection_response, step="reflect")

    def _parse_response(self, response: Dict[str, Any], step: str) -> str:
        logger.debug(f"Raw response for step {step}: {response}")
        try:
            if "completion" in response:
                return response["completion"]
            elif "content" in response:
                content_list = response.get("content", [])
                if content_list:
                    return content_list[0].get("text", "")
            raise ValueError("Invalid response format")
        except Exception as e:
            logger.error(f"Failed to parse response: {str(e)}")
            raise ValueError(f"Error parsing API response for step {step}: {response}")

    def _log_request_start(self, step):
        logger.debug(f"Step '{step}' started at {datetime.datetime.now()}")

    def _log_request_end(self, step):
        logger.debug(f"Step '{step}' ended at {datetime.datetime.now()}")

    def _log_to_markdown(self, log_type: str, header: str, content: str):
        with open("log.md", "a") as f:
            f.write(f"## {header}\n\n{content}\n\n")


@app.route("/", methods=["POST"])
async def process_request():
    data = await request.get_json()
    initial_message = data.get("messages", "")

    logger.debug(f"Incoming message: {initial_message}")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("API key is missing in environment variables or .env file.")

    agent = AIAgent(api_key)

    try:
        result = await agent.run(initial_message)
        logger.debug(f"Final sanitized state: {agent._sanitize_state()}")
        return jsonify({"response": result})
    except Exception as e:
        logger.error(f"Exception during agent execution: {str(e)}")
        return jsonify({"error": str(e)}), 500
```

### Full Explanation of the `index.py` File  

#### 1. Initialization and Configuration  

- **Flask as the framework**  
  - `Quart` is the asynchronous version of `Flask` and supports both synchronous and asynchronous endpoints.  
  - The application is defined and assigned to the variable `app`.  

- **Loading environment variables**  
  - `dotenv` is used to load essential environment variables like the Anthropic API key.  

- **Initialization of the `AIAgent` class**  
  - The `AIAgent` class manages the AI agent’s logic and communicates with the model via the `AnthropicCompletion` client.  

#### 2. Structure of the `AIAgent` Class  

- **State attributes (`state`)**  
  - Store information about the current stage (`currentStage`), user messages (`messages`), and actions taken by the agent (`actionsTaken`).  

- **Processing loop (`run`)**  
  - Processes the user message in successive stages: `plan`, `decide`, `describe`, `execute`, `reflect`.  
  - Ends when the `final_answer` stage is reached or the step limit is exceeded.  

- **Stage methods**  
  - `_plan` creates a plan of action based on the user’s message.  
  - `_decide` selects the next tool or decides to end the process.  
  - `_describe` generates input data for the selected tool.  
  - `_execute` performs the selected tool and records the results.  
  - `_reflect` analyzes the results and updates the plan.  

- **`final_answer` method**  
  - Creates the final answer and sends it to the user based on the collected data.  

- **Debugging**  
  - Debug logs like `[DEBUG]` help track the agent’s operation at each step.  

#### 3. `process_request` Endpoint  

- Handles POST requests to the `/` endpoint  
  - Retrieves data in JSON format, processes it using `AIAgent`.  
  - Creates an instance of `AIAgent` and calls the `run` method with the user’s message.  
  - Returns the agent’s response or an error code if something goes wrong.  

#### 4. Error Handling  

- Exception handling  
  - Each stage and endpoint is wrapped in try-except blocks to handle errors and return appropriate information in the HTTP response.  

#### 5. Logging  

- `_log_to_markdown`  
  - Agent actions are logged to the `log.md` file, allowing for analysis.  
- Debug logs  
  - `[DEBUG]` shows details about processed data and execution stages.  

#### 6. Key Elements  

- **Asynchronous operations**  
  - All operations are asynchronous, allowing the system to handle multiple requests concurrently.  

- **Integration with AnthropicCompletion**  
  - The `AnthropicCompletion` class handles communication with the AI model, processing input data and generating responses.  

#### 7. Potential Extensions  

- Adding new endpoints  
  - You can add functions to handle new tools or agent functionalities.  

- Optimizing decision logic  
  - You could implement more advanced decision-making mechanisms to increase flexibility.  

- Better logging  
  - Implement a logging system using the `logging` module rather than just `print` statements.  

The `index.py` file serves as the core of the application, managing data flow between the user, the AI agent, and the server, enabling scalable and efficient task execution.

2. **File `types.dt.py`** – contains data type definitions:

```python
from typing import List, Optional, TypedDict, Literal, Any

# Define the stages that the agent can go through
Stage = Literal['init', 'plan', 'decide', 'describe', 'reflect', 'execute', 'final']

class ITool(TypedDict):
    """
    Represents a tool that the AI agent can use, with a name, instruction, and description.
    """
    name: str
    instruction: str
    description: str

class IAction(TypedDict):
    """
    Represents an action taken by the AI agent, with fields for the action name, payload, result, reflection, and the tool used.
    """
    name: str
    payload: str
    result: str
    reflection: str
    tool: str

class IState(TypedDict, total=False):
    """
    Represents the state of the AI agent, including system prompts, messages, the current stage and step,
    and actions taken so far.
    """
    systemPrompt: str                      # Current system prompt
    messages: List[dict]                   # All messages in the conversation
    currentStage: Stage                    # Stage on which the system prompt depends
    currentStep: int                       # Current step in the agent's operation
    maxSteps: int                          # Maximum number of steps allowed
    activeTool: Optional[ITool]            # The tool currently being used by the agent
    activeToolPayload: Optional[Any]       # Payload for the active tool
    plan: str                              # Current plan of action
    actionsTaken: List[IAction]            # List of actions taken so far
```

### Explanation

1. **Stage**: A `Literal` type that defines the various stages the agent can go through (`init`, `plan`, `decide`, `describe`, `reflect`, `execute`, and `final`).

2. **ITool**: A `TypedDict` that represents a tool used by the agent, with three fields:
   - `name`: The name of the tool.
   - `instruction`: The instructions for using the tool.
   - `description`: A brief description of what the tool does.

3. **IAction**: A `TypedDict` representing an action taken by the AI agent, containing:
   - `name`: The name of the action.
   - `payload`: The data input for the action.
   - `result`: The outcome or result of the action.
   - `reflection`: The reflection or additional notes on the action.
   - `tool`: The tool used to perform the action.

4. **IState**: A `TypedDict` defining the complete state of the AI agent, including:
   - `systemPrompt`: The current system prompt guiding the agent’s behavior.
   - `messages`: A list of all messages exchanged in the conversation.
   - `currentStage`: The stage the agent is currently in.
   - `currentStep`: The current step in the agent's process.
   - `maxSteps`: The maximum number of steps allowed.
   - `activeTool`: The currently active tool being used by the agent.
   - `activeToolPayload`: The payload for the active tool.
   - `plan`: The current plan for the agent’s actions.
   - `actionsTaken`: A list of all actions the agent has taken.

This file defines all the necessary types to manage the agent's state and track the actions throughout its workflow in a structured and type-safe manner.

---

3. **File `task_manager.py`** – task management:

```python
# task_manager.py
class TaskManager:
    def __init__(self):
        pass

    def get_task(self, task_name):
        # Placeholder for retrieving a task based on task_name
        # Replace with actual logic
        tasks = {
            "example_task": {"function": self.example_task}
        }
        return tasks.get(task_name)

    def example_task(self):
        # Example task logic
        return "Task executed successfully"
```

### Explanation of `task_manager.py`

- **TaskManager class**: This class is designed to handle task management. It includes methods to retrieve a task by name (`get_task`) and execute an example task (`example_task`).
  - `get_task`: Returns a task based on the `task_name`. It currently has a placeholder for tasks, with `example_task` as a dummy function.
  - `example_task`: A placeholder task that simply returns a success message. 

This file will be expanded later to handle more complex task management logic, such as interacting with external systems or APIs.

---

4. **File `ssh_manager.py`** – asynchronous SSH connection management:

```python
# ssh_manager.py
import asyncssh
import asyncio

class AsyncSSHManager:
    def __init__(self, hostname: str, username: str, password: str):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.connection = None

    async def connect(self):
        """Establish an SSH connection."""
        self.connection = await asyncssh.connect(
            self.hostname,
            username=self.username,
            password=self.password
        )

    async def execute_command(self, command: str) -> str:
        """Execute a command over SSH and return the output."""
        if self.connection is None:
            raise ValueError("No active SSH connection")
        result = await self.connection.run(command, check=True)
        return result.stdout

    async def close_connection(self):
        """Close the SSH connection."""
        if self.connection:
            self.connection.close()
            await self.connection.wait_closed()
            self.connection = None
```

### Explanation of `ssh_manager.py`

- **AsyncSSHManager class**: This class handles SSH connections asynchronously using the `asyncssh` library.
  - `connect`: Establishes an SSH connection to a remote host using the provided hostname, username, and password.
  - `execute_command`: Executes a command on the remote server via SSH and returns the output.
  - `close_connection`: Closes the SSH connection.

This class is crucial for managing remote executions in the agent system, allowing it to run commands on remote servers securely and asynchronously.

#### Files inside lib directory

1. **File `ai.py`** – code responsible for handling the Anthropic API:

```python
import os
import httpx
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

class AnthropicCompletion:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("API key not provided or incorrectly set in environment variables")

    async def completion(self, messages: list, model: str = "claude-3-5-sonnet-20241022", retries: int = 3, delay: int = 5) -> dict:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0.7
        }

        for attempt in range(retries):
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 529:
                        time.sleep(delay)
                        continue
                    response.raise_for_status()
                    return response.json()
                except httpx.RequestError as e:
                    if attempt == retries - 1:
                        raise
                except httpx.HTTPStatusError as e:
                    if attempt == retries - 1:
                        raisePlik
- **Anthropic API Client Handling**
  - The `AnthropicCompletion` class is responsible for communication with the Anthropic API.
  - It enables sending queries to the AI model to generate responses based on the provided context.

- **Integration with Environment Variables**
  - The Anthropic API key (`ANTHROPIC_API_KEY`) is loaded from the `.env` file or environment settings, ensuring secure storage of authentication data.

#### 2. `AnthropicCompletion` Class

- **Initialization**
  - During initialization, the class retrieves the API key from arguments or environment variables. If the key is not found, an error (`ValueError`) is raised.

- **`completion` Method**
  - This is the main method of the class that handles sending queries to the API.
  - It takes the following parameters:
    - `messages`: A list of messages representing the conversation context.
    - `model`: The name of the AI model (default is `claude-3-5-sonnet-20241022`).
    - `retries`: The number of attempts in case the query fails.
    - `delay`: The delay time between retries.
  - It constructs the appropriate headers (`headers`) and request content (`payload`).

#### 3. Query Handling Process

- **Preparing the Request**
  - HTTP headers containing the API key and request content in JSON format are created.
  - The `payload` includes:
    - The model to be used.
    - Messages providing the context of the conversation.
    - Parameters such as maximum token count (`max_tokens`) and temperature (`temperature`).

- **Retrying the Request**
  - In case of a failed request (e.g., API overload), the method retries the request a specified number of times (`retries`) with a delay (`delay`).

- **Exception Handling**
  - `RequestError`: In case of a network error, a message is displayed and the request is retried if possible.
  - `HTTPStatusError`: In case of an HTTP error (e.g., authorization failure), the method raises an error and terminates.

- **Returning the Response**
  - If the request is successful, the method returns the response in JSON format.

#### 4. Debugging

- **Logging Details**
  - `[DEBUG] Response Status Code`: Displays the HTTP status code for each request.
  - `[WARNING] API overloaded`: Warns about API overload and attempts to retry the request.
  - `[ERROR] Request failed`: Informs about a connection error.
  - `[ERROR] HTTP Error`: Informs about errors related to the server response from the API.

#### 5. Potential Extensions

- **Support for Other Models**
  - Currently, the model `claude-3-5-sonnet-20241022` is set by default, but there could be an option for users to choose other models.

- **Improving Logging**
  - Instead of using `print`, the `logging` module could be implemented, which would allow better management of log levels (e.g., `INFO`, `DEBUG`, `ERROR`).

- **Caching Mechanisms**
  - Implementing API response caching could reduce the number of queries for repeated requests with the same context.

The `ai.py` file is a key component of the project, enabling communication with the AI model. It is equivalent to the API handling module in TypeScript but adapted to the Python environment.

2.**File `prompts.py`**

```python
from typing import Dict

class Prompts:
    @staticmethod
    def tools_instruction() -> Dict[str, str]:
        return {
            "get_html_contents": (
                'Required payload: {"url": "URL that needs to be downloaded"} '
                'Response format: HTML content of the page.'
            ),
            "game_submit_form": (
                'Required payload: {"url": "URL to a file that will be passed to the game"}. '
                'Response format: The game\'s response after submitting the form.'
            ),
            "upload_text_file": (
                'Required payload: {"content": "Text content of the file", '
                '"file_name": "Name of the file (e.g., document.md)"} '
                'Response format: URL of the uploaded file.'
            ),
            "final_answer": (
                'Required payload: {"answer": "Your final answer"}. '
                'Response format: A direct response to the user.'
            ),
            "play_music": (
                'Required payload: JSON object with Spotify API details for actions like search, play, or playlist creation.'
            )
        }

    @staticmethod
    def available_tools() -> Dict[str, str]:
        return {
            "get_html_contents": "Fetch HTML content of a URL.",
            "upload_text_file": "Create and upload a text file.",
            "game_submit_form": "Submit a URL to the game.",
            "final_answer": "Provide the final response to the user.",
            "play_music": "Generate Spotify API JSON for playing or managing music."
        }

    @staticmethod
    def extract_user_query(state) -> str:
        try:
            return next(
                (msg["content"] for msg in state.get("messages", []) if msg.get("role") == "user"),
                "No specific query provided."
            )
        except Exception:
            return "No specific query provided."

    @staticmethod
    def plan_prompt(state) -> str:
        user_query = Prompts.extract_user_query(state)

        return f"""
<main_objective>
Analyze the user's query and decide whether to provide an immediate answer or develop a detailed plan.
</main_objective>

<rules>
- If the query is straightforward (e.g., "How far is the Moon from Earth?"), prioritize addressing it directly.
- If the query requires multiple steps, use available tools to create an actionable plan.
- Always respond with clarity and avoid unnecessary complexity.
</rules>

<user_query>
{user_query}
</user_query>

<available_tools>
{Prompts.tools_instruction()}
</available_tools>
"""

    @staticmethod
    def decide_prompt(state) -> str:
        user_query = Prompts.extract_user_query(state)

        return f"""
<main_objective>
Determine the next step based on the user's query and current context. Either select the appropriate tool to proceed or decide to provide the final answer.
</main_objective>

<rules>
- Be concise and provide a JSON response with the selected tool and reasoning.
- If the question is straightforward, move directly to the final answer.
- Always return a valid JSON string with the tool name.
- The JSON structure must include:
  {{
    "_thoughts": "Your internal reasoning",
    "tool": "precise name of the tool"
  }}
</rules>

<user_query>
{user_query}
</user_query>

<available_tools>
{Prompts.available_tools()}
</available_tools>

<current_plan>
Plan: {state['plan'] if state.get('plan') else 'No plan yet.'}
</current_plan>

<actions_taken>
{state['actionsTaken']}
</actions_taken>
"""

    @staticmethod
    def describe_prompt(state) -> str:
        if "activeTool" not in state or not state["activeTool"].get("tool"):
            raise ValueError("Active tool is not defined or missing the 'tool' property.")

        return f"""
<main_objective>
Provide the required details to execute the tool "{state['activeTool']['tool']}" based on the current state.
</main_objective>

<tool_details>
Tool Name: {state['activeTool']['tool']}
Tool Instructions: {state['activeTool'].get('instruction', 'No instructions available')}
</tool_details>

<actions_taken>
{state['actionsTaken']}
</actions_taken>
"""

    @staticmethod
    def reflection_prompt(state) -> str:
        return f"""
<main_objective>
Reflect on the last action performed and suggest improvements or adjustments to the plan if needed.
</main_objective>

<actions_taken>
{state['actionsTaken']}
</actions_taken>
"""

    @staticmethod
    def final_answer_prompt(state) -> str:
        user_query = Prompts.extract_user_query(state)

        return f"""
<main_objective>
Provide the final answer to the user's query: "{user_query}".
</main_objective>

<rules>
- Directly answer the user's question in a clear and actionable manner.
- If the query is unclear, ask for clarification.
- Summarize key findings and insights.
</rules>

<current_plan>
{state['plan'] if state.get('plan') else 'No plan created.'}
</current_plan>

<actions_taken>
{state['actionsTaken']}
</actions_taken>
"""
```

### Full Explanation of `prompts.py`

#### 1. Key Functionalities

- **Generating prompts for the AI agent's system**  
  - The `prompts.py` file is responsible for generating the system prompts used by the agent in various phases of its operation, such as planning, decision-making, describing, reflecting, and generating the final answer.
  - Each phase has predefined rules and structures for generating the prompt.

- **Dynamic adjustment of prompt content**  
  - The prompt adjusts based on the system state (`state`), allowing the generation of context-sensitive responses tailored to the current interaction and history.

#### 2. Functions in `prompts.py`

##### `tools_instruction()`

- Returns a dictionary describing instructions for the available tools, such as:
  - **`get_html_contents`**: Fetch HTML content from a given URL.
  - **`game_submit_form`**: Submit files or data to a game.
  - **`upload_text_file`**: Create and upload text files.
  - **`final_answer`**: Generate the final answer to the user’s query.
  - **`play_music`**: Handle operations related to the Spotify API.

##### `available_tools()`

- Returns a list of

 available tools in a simplified format used in prompts like `decide_prompt`.

##### `plan_prompt(state)`

- Creates the prompt for the planning stage.
- Takes into account the current system state (`state`), including:
  - User messages.
  - Previous actions (`actionsTaken`).
  - Current plan (`plan`), if any.
- The prompt describes the planning goal and the agent’s operating rules:
  - Recognizing straightforward questions and responding directly.
  - Creating a plan if the question requires more complex analysis.

##### `decide_prompt(state)`

- Generates the prompt for the decision-making stage.
- Considers the current plan, list of actions taken, and available tools.
- Determines the next step in the process or selects the appropriate tool.

##### `describe_prompt(state)`

- Creates the prompt for the description stage (`describe`).
- Requires the `state` to define the active tool (`activeTool.name`) and its instructions (`activeTool.instruction`).
- The prompt defines the rules for generating the appropriate data to execute the tool.

##### `reflection_prompt(state)`

- Creates the prompt for the reflection stage.
- Allows the agent to analyze the actions it has taken and suggest improvements or adjustments.

##### `final_answer_prompt(state)`

- Generates the prompt for the final answer to the user’s query.
- Takes into account:
  - The initial plan (`plan`), if available.
  - All actions taken (`actionsTaken`).
  - The user's query as the starting point.
- The prompt’s rules guide the agent to provide clear, actionable, and concise answers.

#### 3. Key Benefits of `prompts.py`

- **Modularity**  
  - Each phase of the agent’s process has a dedicated function, making the code more maintainable and extendable.

- **Dynamic Content**  
  - Prompts are generated based on the current state of the system, providing flexibility and precision in responses.

- **Handling Complex Queries**  
  - The system can handle both simple questions and more complex scenarios requiring multiple steps, making it adaptable to various tasks.

#### 4. Potential Extensions

- **Adding New Tools**  
  - New tools can easily be added by extending the `tools_instruction()` and `available_tools()` functions.

- **Advanced Natural Language Handling**  
  - Additional rules for more complex natural language structures can be incorporated to improve the agent’s understanding.

- **Better Error Logging**  
  - A more robust error handling system can be implemented, possibly replacing the current debug `print` statements with a formal logging framework.

The `prompts.py` file is a crucial part of the agent system, defining the structure and rules for each phase of the agent’s interaction with the user. It's a Python adaptation of the `prompts.ts` file.

3. **File `agent.py`** – Agent's Logic for Decision Making, Reflection, and Action Execution

```python
import json
from lib.tools import browse, upload_file, play_music
from lib.prompts import Prompts
from lib.ai import AnthropicCompletion  # Use the AnthropicCompletion class
from typing import Dict, Any

def log_to_markdown(type: str, header: str, content: str):
    """
    Logs content to a markdown file.

    Parameters:
    - type (str): The type of log entry (e.g., 'basic', 'action', 'result').
    - header (str): The header of the log entry.
    - content (str): The content to log.
    """
    formatted_content = f"## {header}\n\n{content}\n\n" if type == "basic" else \
                        f"### {header}\n\n{content}\n\n" if type == "action" else \
                        f"#### {header}\n```\n{content}\n```\n\n"

    with open("log.md", "a") as f:
        f.write(formatted_content)

async def plan(state, anthropic_completion):
    """
    Generates a plan based on the current state.
    """
    state["currentStage"] = "plan"
    state["systemPrompt"] = Prompts.plan_prompt(state)
    state["plan"] = await anthropic_completion.completion(state["systemPrompt"])
    log_to_markdown("basic", "Planning", f"Current plan: {state['plan']}")

async def decide(state, anthropic_completion):
    """
    Decides the next tool to use based on the current state.
    """
    state["currentStage"] = "decide"
    state["systemPrompt"] = Prompts.decide_prompt(state)
    next_step = await anthropic_completion.completion(state["systemPrompt"])
    state["activeTool"] = {
        "name": next_step["tool"],
        "description": Prompts.available_tools().get(next_step["tool"]),
        "instruction": Prompts.tools_instruction().get(next_step["tool"])
    }
    log_to_markdown("action", "Decision", f"Next move: {json.dumps(next_step)}")

async def describe(state, anthropic_completion):
    """
    Generates a payload description for the active tool.
    """
    state["currentStage"] = "describe"
    state["systemPrompt"] = Prompts.describe_prompt(state)
    next_step = await anthropic_completion.completion(state["systemPrompt"])
    state["activeToolPayload"] = next_step
    log_to_markdown("action", "Description", f"Next step description: {json.dumps(next_step)}")

async def execute(state):
    """
    Asynchronously executes the active tool with the generated payload.
    """
    state["currentStage"] = "execute"
    if not state.get("activeTool"):
        raise ValueError("No active tool to execute")

    tool_name = state["activeTool"]["name"]
    payload = state.get("activeToolPayload", {})

    if tool_name == "get_html_contents":
        result = await browse(payload["url"])  # Async call to browse
    elif tool_name == "upload_text_file":
        result = await upload_file(payload)  # Async call to upload_file
    elif tool_name == "play_music":
        result = await play_music(payload)  # Async call to play_music
    else:
        result = f"Tool '{tool_name}' execution not defined."

    log_to_markdown("result", "Execution", f"Action result: {json.dumps(result)}")
    state["actionsTaken"].append({
        "name": tool_name,
        "payload": json.dumps(payload),
        "result": result,
        "reflection": ""
    })

async def reflect(state, anthropic_completion):
    """
    Reflects on the results of the last action.
    """
    state["currentStage"] = "reflect"
    state["systemPrompt"] = Prompts.reflection_prompt(state)
    reflection = await anthropic_completion.completion(state["systemPrompt"])
    state["actionsTaken"][-1]["reflection"] = reflection
    log_to_markdown("basic", "Reflection", reflection)

class AIAgent:
    def __init__(self, api_key: str):
        self.completion_client = AnthropicCompletion(api_key)
        self.state = {
            "currentStage": "init",
            "currentStep": 1,
            "maxSteps": 15,
            "messages": [],
            "systemPrompt": "",
            "plan": "",
            "actionsTaken": []
        }

    async def final_answer(self) -> str:
        """
        Generates the final answer based on the entire process.
        """
        self.state["systemPrompt"] = Prompts.final_answer_prompt(self.state)
        answer = await self.completion_client.completion(self.state["systemPrompt"])
        log_to_markdown("result", "Final Answer", json.dumps(answer))
        return answer

    async def run(self, initial_message: Dict[str, Any]) -> str:
        """
        Executes the agent's full process from planning to providing the final answer.

        Parameters:
        - initial_message (Dict[str, Any]): The initial message or prompt for the agent.

        Returns:
        - str: The final answer.
        """
        self.state["messages"] = [initial_message]

        while self.state["currentStep"] <= self.state["maxSteps"]:
            await plan(self.state, self.completion_client)
            await decide(self.state, self.completion_client)

            if self.state.get("activeTool", {}).get("name") == "final_answer":
                break

            await describe(self.state, self.completion_client)
            await execute(self.state)
            await reflect(self.state, self.completion_client)
            self.state["currentStep"] += 1

        return await self.final_answer()
```

### Full Explanation of the `agent.py` File

#### 1. Key Functionalities

- **Managing AI Agent Stages**  
  - The `agent.py` file implements the `AIAgent` class, which controls the flow of the AI agent through the various stages:
    - Planning (`plan`)
    - Decision-making (`decide`)
    - Description generation (`describe`)
    - Action execution (`execute`)
    - Reflection on the result (`reflect`)
    - Generating the final answer (`final_answer`)

- **Logging Progress in a Markdown File**  
  - Every important action is logged in the `log.md` file, enabling easy tracking of the agent’s actions.

#### 2. Key Elements of the File

##### `AIAgent` Class

- The main class responsible for handling all stages of the agent’s operation.

###### **`__init__()`**

- **Initializing the Agent’s State**
  - `currentStage`: The current stage of processing (e.g., `plan`, `decide`).
  - `currentStep`: The current step in the overall process.
  - `maxSteps`: The maximum number of steps to avoid infinite loops.
  - `messages`: The user messages that guide the agent’s behavior.
  - `actionsTaken`: A history of actions taken by the agent.
  - `api_key`: The Anthropic API key used to communicate with the AI model.

###### **`log_to_markdown()`**

- A function that logs the results of each stage to the `log.md` file.
- It takes:
  - `header`: The section header.
  - `content`: The content to be logged.

##### **Asynchronous Stage Methods**

- Each stage of the process is handled by a dedicated method.

###### **`plan()`**

- Generates an action plan based on the prompt.
- Sends a query to the AI model using the generated `plan_prompt`.

###### **`decide()`**

- Decides the next step or tool to use.
- Uses the `decide_prompt` to determine the best course of action.
- The result is processed as JSON, which helps in precisely selecting the next tool or action.

###### **`describe()`**

- Generates the input (`payload`) required to execute the tool.
- Uses the `describe_prompt`, and requires that the tool (`activeTool`) be defined in the agent’s state.

###### **`execute()`**

- Executes the selected tool or action.
- Stores the action result in the state (`state['actionsTaken']`).

###### **`reflect()`**

- Analyzes the last action taken by the agent.
- Uses the `reflection_prompt` to suggest improvements or adjustments to the plan.

###### **`final_answer()`**

- Generates the final response to the user’s query.
- Uses the `final_answer_prompt` and returns the response as the result of the agent’s actions.

#### 3. The Processing Loop in the `AIAgent` Class

- **Description**
  - The loop iterates through a maximum of `maxSteps` steps.
  - The stages (`plan`, `decide`, `describe`, `execute`, `reflect`) are executed in a set order.
  - The loop ends when the `final_answer` stage is reached or the maximum steps are exceeded.

- **Error Handling**
  - If an error occurs at any stage, the process stops and the error is logged.

#### 4. Key Advantages

- **Asynchronicity**
  - All methods are asynchronous, allowing efficient parallel processing.

- **Flexibility and Modularity**
  - Each stage is defined separately, making it easier to expand and modify functionalities.

- **Handling Complex Scenarios**
  - The agent can handle both simple user queries and more complex tasks requiring multi-step planning and reflection.

#### 5. Potential Improvements

- **Exception Handling**
  - More detailed error messages could be added for each stage.

- **Advanced Logging**
  - Logging to separate files

 or external monitoring systems (e.g., ElasticSearch, Sentry) could enhance analysis capabilities.

- **Enhancing Action History**
  - Storing more detailed data in `actionsTaken` can aid in debugging and analyzing results.

The `agent.py` file is a central component of the system, managing the agent's processing flow and integrating with the Anthropic model via asynchronous queries.

---

4. **File `tools.py`** – Functions for Handling HTML Content Fetching, File Uploading, Music Playback, etc.

```python
import httpx
from markdownify import markdownify as md
import os
import re

async def browse(url: str) -> str:
    """
    Asynchronously fetches HTML content from the given URL and converts it to Markdown.

    Parameters:
    - url (str): The URL to fetch content from.

    Returns:
    - str: The markdown content of the fetched HTML, or an error message if the request fails.
    """
    if url in ["https://aidevs.pl", "https://www.aidevs.pl"]:
        return "You can't browse the main website. Try another URL."

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            html_content = response.text

            # Extract script contents
            script_contents = ""
            script_tags = re.findall(r"<script\b[^>]*>([\s\S]*?)<\/script>", html_content)
            for i, script in enumerate(script_tags, 1):
                script_contents += f"\n\n--- Script {i} ---\n{script}"

            # Convert HTML to markdown using markdownify
            markdown_content = md(html_content)

            # Combine markdown content with script contents
            return f"{markdown_content}\n\n--- Script Contents ---{script_contents}"
    except httpx.RequestError as e:
        print("Error fetching URL:", e)
        return "Failed to fetch the URL, please try again."

async def upload_file(data: dict) -> str:
    """
    Asynchronously uploads a text file to a server and returns the file's URL.

    Parameters:
    - data (dict): Contains "content" and "file_name" keys.

    Returns:
    - str: The URL of the uploaded file or an error message.
    """
    url = os.getenv("UPLOAD_DOMAIN", "") + "/upload"
    if not url:
        return "ERROR: UPLOAD_DOMAIN environment variable is missing."

    # Sanitize file_name by removing protocol and replacing slashes
    data["file_name"] = data["file_name"].replace("://", "_").replace("/", "_")
    files = {
        'file': (data["file_name"], data["content"], 'text/plain'),
        'file_name': (None, data["file_name"])
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, files=files)
            response.raise_for_status()
            result = response.json()
            return f"Uploaded file to the URL: {result['uploaded_file']}"
    except httpx.RequestError as e:
        print("Upload failed:", e)
        return "Upload failed"

async def play_music(data: dict) -> str:
    """
    Asynchronously sends a request to a music playback service.

    Parameters:
    - data (dict): JSON payload for the music service.

    Returns:
    - str: The response from the music service or an error message.
    """
    url = os.getenv("MUSIC_URL", "")
    if not url:
        return "ERROR: MUSIC_URL environment variable is missing."

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data)
            response.raise_for_status()
            result = response.json()
            return result.get("data", "Music playback response received")
    except httpx.RequestError as e:
        print("Error playing music:", e)
        return "Failed to play music"

# Dictionary mapping tool names to functions
tools = {
    'get_html_contents': browse,
    'upload_text_file': upload_file,
    'play_music': play_music
}
```

### Explanation of `tools.py` File

#### 1. Main Functions

The `tools.py` file provides implementations for various tools used in the AI agent system. Each tool is represented by a function that performs a specific task. These functions allow operations such as fetching HTML content, uploading files, and integrating with music services.

---

#### Explanation of Each Function

- **`browse(url)`**  
  - **Description**: Fetches HTML content from the provided URL.
  - **Behavior**:
    - Sends an HTTP GET request to the provided URL.
    - Converts the fetched HTML content to markdown using the `markdownify` library.
    - Returns the formatted result or an error message if the operation fails.
  - **Error Handling**:
    - Handles `RequestException` exceptions, returning a detailed message in case of a connection error.

- **`upload_file(data)`**  
  - **Description**: Uploads a text file to a remote server.
  - **Behavior**:
    - Expects a dictionary `data` containing keys:
      - `content`: The content of the file.
      - `file_name`: The name of the file.
    - Uses the environment variable `UPLOAD_DOMAIN` as the endpoint for the server.
    - Sends a POST request with the file content as the payload.
    - Returns the uploaded file's URL if successful or an error message if the upload fails.
  - **Error Handling**:
    - Checks if the `UPLOAD_DOMAIN` environment variable is set. If not, it returns an error message.
    - Handles exceptions related to the connection or server response.

- **`play_music(data)`**  
  - **Description**: Sends a request to a music playback service.
  - **Behavior**:
    - Expects a dictionary `data` containing details for the request, such as songs to be played.
    - Uses the environment variable `MUSIC_URL` as the endpoint for the music service.
    - Sends a POST request with the music data.
    - Returns the server's response, which may contain details about the music being played.
  - **Error Handling**:
    - Checks if the `MUSIC_URL` environment variable is set. If not, it returns an error message.
    - Handles errors related to connection and server responses.

---

#### 2. `tools` Dictionary

- **Description**:  
  - A mapping of tool names (e.g., `"browse"`, `"upload_file"`, `"play_music"`) to their respective functions in Python.
  - This dictionary facilitates access to functions by their name, which is useful for dynamically executing tools within the AI agent.

---

#### 3. Key Features

- **Environment Variable Handling**:  
  - The `upload_file` and `play_music` functions rely on environment variables (`UPLOAD_DOMAIN`, `MUSIC_URL`) to determine the server endpoints.
- **Error Handling**:  
  - Each function includes detailed error handling, ensuring the user receives readable messages in case of issues.
- **Flexibility**:  
  - The `tools` dictionary allows easy addition of new tools or modification of existing ones.

---

#### 4. Key Benefits

- **Integration with External Services**:
  - Supports operations requiring interaction with external services, such as uploading files or playing music.
  
- **Data Conversion**:
  - The `browse` function allows automatic conversion of HTML content to markdown, which is useful for processing content.

---

#### 5. Potential Extensions

- **Functionality Expansion**:
  - New tool functions (e.g., file editing, handling other data formats) can be added.
  
- **Improved Logging**:
  - A logging system (e.g., to a file or external monitoring system) could replace simple error messages.

- **Unit Testing**:
  - Unit tests for each function could be added to ensure greater reliability.

The `tools.py` file provides essential functions for handling tools within the AI agent system, enabling integration with various external services and facilitating data processing.

---

#### Part 4: Automation Using Ansible

##### 1. Create Ansible Playbook – `site.yml`

Let's break the playbook into logical parts and create an Ansible project where each functionality (e.g., environment setup, file copying, application configuration) will be a separate playbook or role. This will make the project flexible, easy to install, modify, and expand.

### Plan

1. **Ansible Project Structure**:
   - We will create a main Ansible project directory with subdirectories like `roles` (where we place individual Ansible roles) and `playbooks`.
   - We will divide tasks into roles:
     - **Roles for environment**: Creating the virtual environment, installing packages.
     - **Roles for application files**: Creating each application file with complete code.
     - **Roles for server configuration**: Configuring and running the application server.

2. **Main Ansible Project Structure**:
   - `site.yml` – The main playbook file that runs all roles.
   - `roles/environment` – Role that creates the virtual environment and installs required packages.
   - `roles/application_files` – Role that creates application files with the full code.
   - `roles/server_configuration` – Role that configures and runs the application server.

### Step 1: Create Directory Structure

In the Ansible project directory, execute the following steps:

```bash
mkdir ansible_project
cd ansible_project
mkdir roles
mkdir playbooks
```

In the `roles` directory, create subdirectories for each role:

```bash
mkdir -p roles/environment/tasks
mkdir -p roles/environment/files
mkdir -p roles/application_files/tasks
mkdir -p roles/application_files/files


mkdir -p roles/server_configuration/tasks
```

### Step 2: Create Ansible Files for Each Role

#### 1. Role `environment`: Create Virtual Environment and Install Packages

In `roles/environment/tasks/main.yml`:

```yaml
---
- name: Create project directory
  file:
    path: "{{ project_dir }}"
    state: directory

- name: Create virtual environment
  command: python3 -m venv "{{ project_dir }}/venv"
  args:
    creates: "{{ project_dir }}/venv"

- name: Copy requirements.txt to project directory
  copy:
    src: "requirements.txt"  # Ansible automatically looks for the file in `files`
    dest: "{{ project_dir }}/requirements.txt"

- name: Activate the environment and install required packages
  pip:
    requirements: "{{ project_dir }}/requirements.txt"
    virtualenv: "{{ project_dir }}/venv"
    virtualenv_command: python3 -m venv
```

#### 2. Role `application_files`: Create Application Files

In `roles/application_files/tasks/main.yml`, add the full code for each application file.

```yaml
---
- name: Copy index.py to project directory
  copy:
    src: roles/application_files/files/index.py
    dest: "{{ project_dir }}/index.py"

- name: Copy types.dt.py to project directory
  copy:
    src: roles/application_files/files/types.dt.py
    dest: "{{ project_dir }}/types.dt.py"

- name: Copy README.md to project directory
  copy:
    src: roles/application_files/files/README.md
    dest: "{{ project_dir }}/README.md"

- name: Copy log.md to project directory
  copy:
    src: roles/application_files/files/log.md
    dest: "{{ project_dir }}/log.md"

- name: Create lib directory
  file:
    path: "{{ project_dir }}/lib"
    state: directory

- name: Copy ai.py to lib directory
  copy:
    src: roles/application_files/files/ai.py
    dest: "{{ project_dir }}/lib/ai.py"

- name: Copy prompts.py to lib directory
  copy:
    src: roles/application_files/files/prompts.py
    dest: "{{ project_dir }}/lib/prompts.py"

- name: Copy agent.py to lib directory
  copy:
    src: roles/application_files/files/agent.py
    dest: "{{ project_dir }}/lib/agent.py"

- name: Copy tools.py to lib directory
  copy:
    src: roles/application_files/files/tools.py
    dest: "{{ project_dir }}/lib/tools.py"

- name: Copy task_manager.py to project directory
  copy:
    src: roles/application_files/files/task_manager.py
    dest: "{{ project_dir }}/task_manager.py"

- name: Copy ssh_manager.py to project directory
  copy:
    src: roles/application_files/files/ssh_manager.py
    dest: "{{ project_dir }}/ssh_manager.py"

- name: Copy asgi_app.py to project directory
  copy:
    src: roles/application_files/files/asgi_app.py
    dest: "{{ project_dir }}/asgi_app.py"
```

#### 3. Role `server_configuration`: Server Configuration

In `roles/server_configuration/tasks/main.yml`:

```yaml
---
- name: Configure .env file
  copy:
    dest: "{{ project_dir }}/.env"
    content: |
      UPLOAD_DOMAIN=http://localhost:3000
      ANTHROPIC_API_KEY=your_anthropic_api_key

- name: Run the application server with Uvicorn
  shell: |
    source "{{ project_dir }}/venv/bin/activate"
    nohup uvicorn index:app --host 0.0.0.0 --port 3000 &
  args:
    executable: /bin/bash
  register: app_start_result
  ignore_errors: true  # Ignore errors in case of a restart
```

### Step 3: Main Playbook `site.yml`

In the main `ansible_project` directory, create `site.yml` to run all roles:

```yaml
---
- name: Configure and Install AI Dev Agent Project
  hosts: localhost
  vars:
    project_dir: "/home/adrian/aidevs/agent"
  roles:
    - role: environment
    - role: application_files
    - role: server_configuration
```

### Step 4: Preparing the Project ZIP Archive

Once you've created the full structure and added the complete code files in the appropriate places, you can create a ZIP archive:

```bash
zip -r ansible_project.zip ansible_project/
```

Download zip file:
{{< button href="../../../../files/ansible_project.zip" >}}click{{< /button >}}

### Summary

1. The project structure is divided into logical roles.
2. Each role performs specific tasks, making it easier to manage and develop.
3. The main `site.yml` file coordinates all roles, creating a fully functional application environment.
4. Once the structure is complete, you can zip the entire project and deploy it easily.

#### 1. Running the Playbook

To run the playbook and automate the project setup process, use:

```bash
sudo apt install ansible yamllint
yamllint site.yml
yamllint roles/environment/tasks/main.yml
yamllint roles/application_files/tasks/main.yml
yamllint roles/server_configuration/tasks/main.yml
ansible-playbook site.yml --syntax-check
ansible-playbook site.yml --check
ansible-playbook site.yml
```

#### 2. Debugging and Testing the Virtual Environment

If you want to verify if Ansible is correctly creating and using the virtual environment:

- Run the following manually in the project directory to check if the process works:

     ```bash
     python3 -m venv venv
     source venv/bin/activate  # Activate the virtual environment
     pip install -r requirements.txt  # Install dependencies
     ```

- If there are issues, check the Ansible logs after running the playbook.

### Debugging Uvicorn and Quart-based Application

#### Running the Server Manually

The app uses the **Uvicorn** server to run the **Quart** framework. To test its functionality:

1. **Activate the virtual environment**:

   ```bash
   source venv/bin/activate
   ```

2. **Start the application**:

   ```bash
   uvicorn index:app --host 0.0.0.0 --port 3000
   ```

   - `index:app` refers to the `index.py` module and the Quart `app` instance within that file.
   - Port `3000` is the default. Make sure it's available.

3. **Check if the server is working**:
   - Check open ports:

     ```bash
     ss -tuln | grep 3000
     ```

   - Send a test HTTP request:

     ```bash
     curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"messages": [{"role": "user", "content": "Hello, World!"}]}'
     ```

---

#### Logs and Debugging

1. **Uvicorn Logs**:
   - The Uvicorn server logs contain information about errors and HTTP traffic.
   - Run the app with debug logging enabled:

     ```bash
     uvicorn index:app --host 0.0.0.0 --port 3000 --log-level debug
     ```

2. **App Logs**:
   - The Quart app contains debug `print` statements for most operations. Ensure the Quart debug mode is enabled:

     ```bash
     export QUART_ENV=development
     export QUART_DEBUG=1
     ```

3. **Check `log.md` File**:
   - Check if `log.md` is properly logging data for each stage of the agent’s operation:

     ```bash
     tail -f log.md
     ```

---

#### Verifying Environment Variables

Make sure the `.env` file contains the correct values:

```plaintext
UPLOAD_DOMAIN=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Verify if the variables are loaded:

```bash
cat .env
```

---

#### Verifying After Installation

1. **Verify the Process**:
   - Check if the Uvicorn process is running:

     ```bash
     ps aux | grep uvicorn
     ```

2. **Test Endpoint**:
   - Send a request to the server:

     ```bash
     curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"messages": [{"role": "user", "content": "How far is the Moon?"}]}'
     ```

3. **Restart the App**:
   - If there are issues, stop and restart the process:

     ```bash
     pkill -f uvicorn
     uvicorn index:app --host 0.0.0.0 --port 3000
     ```

This set of steps should help with debugging and testing the **Uvicorn** and **Quart**-based application.
