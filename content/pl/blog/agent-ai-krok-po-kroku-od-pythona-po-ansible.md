---
title: Agent AI krok po kroku - od Pythona po Ansible   
date: 2024-11-19T16:00:00+00:00  
description: Agent AI krok po kroku - od Pythona po Ansible  
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
image: images/2024-thumbs/aiagent01.webp  

---

#### Film instruktażowy

{{<youtube tC8MPmHNeUE>}}

### Część 1: Omówienie kroków

1. Tworzenie Dokumentacji w Markdown

Każdy z głównych plików (index.py, types.dt.py, pliki z katalogu lib/) powinien być opisany w dokumentacji technicznej. Poniżej przedstawiam pliki Markdown z pełną zawartością.

Plik README.md

README.md zawiera ogólne informacje o projekcie, jego działaniu, zależnościach oraz instrukcje uruchomienia.

#### Opis

Projekt AI Dev Agent to aplikacja umożliwiająca interakcję z modelem AI w celu realizacji określonych zadań. Skonfigurowany jest do pracy z różnymi narzędziami do przetwarzania tekstu i integracji z modelem Anthropic Claude.

#### Struktura Projektu

- index.py - główny plik aplikacji uruchamiający serwer Flask i obsługujący żądania.
- lib/ - folder zawierający wszystkie dodatkowe moduły:
  - ai.py - obsługa API dla modelu Anthropic.
  - agent.py - logika podejmowania decyzji i wykonania zadań przez agenta.
  - prompts.py - definicje promptów dla agenta.
  - tools.py - zestaw narzędzi do pobierania treści, przesyłania plików i innych działań.
- ssh_manager.py - zarządzanie połączeniami SSH i wykonywanie poleceń
- task_manager.py - zarządzanie zadaniami.
- types.dt.py - definicje typów danych i struktury stanu agenta.
- config.py - zmienne środowiskowe
- config.yml - zmienne środowiskowe
- .env - klucze API

#### Instalacja

1. Sklonuj repozytorium.
2. Utwórz środowisko wirtualne
3. Zainstaluj zależności
4. Uruchom serwer

```bash
python index.py
```

#### Użycie

Wysyłaj żądania POST do głównego punktu końcowego / z odpowiednią treścią wiadomości.

##### Plik `log.md`

`log.md` służy do zapisywania wyników działań agenta w formacie Markdown.

markdown

##### Log Operacji Agenta

Tutaj będą zapisywane wszystkie operacje wykonane przez agenta w czasie rzeczywistym.

##### Struktura Logów

Każda operacja zostanie opisana wraz z jej typem, nagłówkiem oraz treścią.

##### Przykład

[Typ Operacji] Nagłówek

Treść operacji...

### Część 2: Ręczne tworzenie struktury projektu i konfiguracja środowiska

#### 1. Tworzenie struktury katalogów projektu i plików

1. **Utwórz główny katalog projektu** i przejdź do niego:

   ```bash
   mkdir aidevs
   cd aidevs
   ```

2. **Utwórz strukturę katalogów i plikow w lib**:

   ```bash
   mkdir -p lib
   cd lib
   touch agent.py ai.py prompts.py tools.py
   ```

3. **Utwórz pliki projektu** w odpowiednich katalogach:

   ```bash
   touch .env asgi_app.py config.py config.yml index.py requirements.txt ssh_manager.py task_manager.py types.dt.py
   ```

Pliki są tworzone w **głównym katalogu projektu** (`ai_dev_agent`), ponieważ pełnią podstawowe funkcje dla całego projektu i nie są specyficzne dla żadnego podkatalogu.

##### 2. Konfiguracja środowiska wirtualnego i pliku requirements.txt

1. **Utwórz i aktywuj środowisko wirtualne**:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/macOS
   ```

Dodaj do `.bashrc` to:

```bash
alias activate-agent="source $HOME/agent/venv/bin/activate"
alias activate-aidevs="source $HOME/aidevs/agent/venv/bin/activate"
```

A potem wykonaj to:

```bash
source ~/.bashrc
```

2. **Dodaj wymagane pakiety do pliku `requirements.txt`**:

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

3. **Zainstaluj pakiety z `requirements.txt`**:

   ```bash
   pip install -r requirements.txt
   ```

##### 3. Konfiguracja pliku .env

1. **Utwórz plik `.env`** w głównym katalogu projektu z kluczami API:

   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   LLAMA_PATH=path_to_your_local_llama_model
   ```

   ---

#### Część 3: Tworzenie głównej logiki agenta i innych plików

1.**Plik `index.py`** – serves as the main entry point for the Flask-based server and handles various HTTP requests related to the AI agent's functionality.

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

### Pełne wyjaśnienie sekcji w pliku `index.py`

#### 1. Inicjalizacja i konfiguracja

- Flask jako framework
  - `Quart` jest asynchroniczną wersją `Flask` i obsługuje zarówno synchroniczne, jak i asynchroniczne endpointy.
  - Aplikacja jest definiowana i przypisywana do zmiennej `app`.

- Ładowanie zmiennych środowiskowych
  - `dotenv` jest używany do ładowania kluczowych zmiennych środowiskowych, takich jak klucz API Anthropic.

- Inicjalizacja klasy `AIAgent`
  - Klasa `AIAgent` zarządza logiką działania agenta AI i komunikuje się z modelem przez klienta `AnthropicCompletion`.

#### 2. Struktura klasy `AIAgent`

- Atrybuty stanu (`state`)
  - Przechowują informacje o bieżącym etapie (`currentStage`), wiadomościach użytkownika (`messages`) i działaniach podjętych przez agenta (`actionsTaken`).

- Pętla przetwarzania (`run`)
  - Przetwarza wiadomość użytkownika w kolejnych etapach: `plan`, `decide`, `describe`, `execute`, `reflect`.
  - Kończy się, gdy osiągnięty zostanie etap `final_answer` lub przekroczony zostanie limit kroków.

- Metody etapowe
  - `_plan` tworzy plan działania na podstawie wiadomości użytkownika.
  - `_decide` wybiera kolejne narzędzie lub decyduje o zakończeniu działania.
  - `_describe` generuje dane wejściowe do wybranego narzędzia.
  - `_execute` wykonuje wybrane narzędzie i zapisuje wyniki.
  - `_reflect` analizuje wyniki i aktualizuje plan.

- Metoda `final_answer`
  - Tworzy odpowiedź końcową i wysyła ją do użytkownika na podstawie zgromadzonych danych.

- Debugowanie
  - Logi debugowania, takie jak `[DEBUG]`, pomagają śledzić działanie agenta na każdym etapie.

#### 3. Endpoint `process_request`

- Obsługuje żądania POST na adres `/`
  - Pobiera dane w formacie JSON, analizuje je i przetwarza za pomocą `AIAgent`.
  - Tworzy instancję `AIAgent` i wywołuje metodę `run` z wiadomością użytkownika.
  - Zwraca odpowiedź agenta lub kod błędu, jeśli wystąpi problem.

#### 4. Obsługa błędów

- Obsługa wyjątków
  - Każdy etap działania i endpoint są opakowane w bloki try-except, aby obsłużyć błędy i zwrócić odpowiednie informacje w odpowiedzi HTTP.

#### 5. Logowanie

- `_log_to_markdown`
  - Dane o działaniach agenta są zapisywane w pliku `log.md`, co umożliwia ich analizę.
- Logi debugowania
  - `[DEBUG]` wyświetlają szczegóły dotyczące przetwarzanych danych i etapów działania.

#### 6. Kluczowe elementy

- Asynchroniczność
  - Wszystkie operacje są asynchroniczne, co umożliwia obsługę wielu żądań jednocześnie.

- Integracja z AnthropicCompletion
  - Klasa `AnthropicCompletion` obsługuje komunikację z modelem AI, przetwarzając dane wejściowe i generując odpowiedzi.

#### 7. Potencjalne rozszerzenia

- Dodawanie nowych endpointów
  - Można dodać funkcje do obsługi nowych narzędzi lub funkcjonalności agenta.

- Optymalizacja logiki
  - Można wprowadzić bardziej zaawansowane mechanizmy decyzyjne, aby zwiększyć elastyczność.

- Lepsze logowanie
  - Można wdrożyć system logowania oparty na module `logging` zamiast używać standardowego `print`.

Plik `index.py` stanowi serce aplikacji, które zarządza przepływem danych między użytkownikiem, agentem AI i serwerem, umożliwiając realizację zadań w sposób skalowalny i efektywny.

2.**Plik `types.dt.py`** – zawiera definicje typów danych:

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

### Wyjaśnienie

1. **Stage**: Typ `Literal` definiujący różne etapy działania agenta, w których może się znajdować (`init`, `plan`, `decide`, `describe`, `reflect`, `execute` oraz `final`).

2. **ITool**: `TypedDict`, który opisuje narzędzie za pomocą trzech pól:
   - `name`: Nazwa narzędzia.
   - `instruction`: Instrukcje dotyczące użycia narzędzia.
   - `description`: Krótki opis działania narzędzia.

3. **IAction**: `TypedDict` reprezentujący akcję wykonaną przez agenta AI, zawierający pola:
   - `name`: Nazwa akcji.
   - `payload`: Dane wejściowe lub ładunek dla akcji.
   - `result`: Wynik lub rezultat akcji.
   - `reflection`: Refleksja lub dodatkowe informacje o akcji.
   - `tool`: Narzędzie użyte do wykonania akcji.

4. **IState**: `TypedDict` definiujący pełny stan agenta AI, zawierający klucze:
   - `systemPrompt`: Bieżący prompt systemowy, który kieruje działaniem agenta.
   - `messages`: Lista wiadomości w rozmowie.
   - `currentStage`: Etap operacji, na którym znajduje się agent.
   - `currentStep`: Bieżący krok w wykonaniu agenta.
   - `maxSteps`: Maksymalna liczba kroków dozwolona dla agenta.
   - `activeTool`: Obecnie używane narzędzie.
   - `activeToolPayload`: Ładunek dla aktywnego narzędzia.
   - `plan`: Bieżący plan działania agenta.
   - `actionsTaken`: Lista wszystkich wykonanych dotychczas akcji.

Ten plik definiuje wszystkie typy potrzebne do zarządzania stanem i śledzenia akcji w ramach przepływu pracy agenta AI w sposób uporządkowany i bezpieczny typowo.

3.**Plik `task_manager.py`** - zarządzanie zadaniami:

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

4.**Plik `ssh_manager.py`** – asynchroniczne połączenie SSH:

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

#### Pliki w katalogu lib

1.**Plik `ai.py`** - Kod odpowiedzialny za obsługę API Anthropic

```python
import os
import httpx
from dotenv import load_dotenv
import time

# Załaduj zmienne środowiskowe
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
                        raise

```

### Pełne wyjaśnienie pliku `ai.py`

#### 1. Kluczowe funkcjonalności

- **Obsługa klienta Anthropic API**
  - Klasa `AnthropicCompletion` jest odpowiedzialna za komunikację z API Anthropic.
  - Umożliwia wysyłanie zapytań do modelu AI w celu generowania odpowiedzi na podstawie podanego kontekstu.

- **Integracja ze zmiennymi środowiskowymi**
  - Klucz API Anthropic (`ANTHROPIC_API_KEY`) jest ładowany z pliku `.env` lub ustawień środowiskowych, co zapewnia bezpieczne przechowywanie danych uwierzytelniających.

#### 2. Klasa `AnthropicCompletion`

- **Inicjalizacja**
  - Podczas inicjalizacji klasa pobiera klucz API z argumentów lub zmiennych środowiskowych. Jeśli klucz nie zostanie znaleziony, zgłaszany jest błąd (`ValueError`).

- **Metoda `completion`**
  - Jest to główna metoda klasy, która obsługuje wysyłanie zapytań do API.
  - Przyjmuje następujące parametry:
    - `messages`: Lista wiadomości reprezentujących kontekst rozmowy.
    - `model`: Nazwa modelu AI (domyślnie `claude-3-5-sonnet-20241022`).
    - `retries`: Liczba prób w przypadku niepowodzenia zapytania.
    - `delay`: Czas oczekiwania między kolejnymi próbami.
  - Buduje odpowiednie nagłówki (`headers`) i treść żądania (`payload`).

#### 3. Proces obsługi zapytań

- **Przygotowanie żądania**
  - Tworzone są nagłówki HTTP zawierające klucz API oraz treść żądania w formacie JSON.
  - `payload` zawiera:
    - Model, który ma zostać użyty.
    - Wiadomości dostarczające kontekstu rozmowy.
    - Parametry takie jak maksymalna liczba tokenów (`max_tokens`) i temperatura (`temperature`).

- **Próby wysyłki żądania**
  - W przypadku niepowodzenia zapytania (np. przeciążenie API), metoda ponawia żądanie określoną liczbę razy (`retries`) z opóźnieniem (`delay`).

- **Obsługa wyjątków**
  - `RequestError`: W przypadku błędu sieciowego, wyświetlany jest komunikat i wykonywana jest ponowna próba, jeśli to możliwe.
  - `HTTPStatusError`: W przypadku błędu HTTP (np. brak autoryzacji), metoda zgłasza błąd i przerywa działanie.

- **Zwracanie odpowiedzi**
  - Jeśli zapytanie zakończy się sukcesem, metoda zwraca odpowiedź w formacie JSON.

#### 4. Debugowanie

- **Logowanie szczegółów**
  - `[DEBUG] Response Status Code`: Wyświetla kod statusu HTTP dla każdego zapytania.
  - `[WARNING] API overloaded`: Ostrzega o przeciążeniu API i podejmuje próbę ponowienia zapytania.
  - `[ERROR] Request failed`: Informuje o błędzie w połączeniu.
  - `[ERROR] HTTP Error`: Informuje o błędach związanych z odpowiedzią serwera API.

#### 5. Potencjalne rozszerzenia

- **Obsługa innych modeli**
  - Obecnie model `claude-3-5-sonnet-20241022` jest domyślnie ustawiony, ale można dodać możliwość wyboru innych modeli przez użytkownika.

- **Usprawnienie logowania**
  - Zamiast używać `print`, można wdrożyć moduł `logging`, co pozwoli lepiej zarządzać poziomami logowania (np. `INFO`, `DEBUG`, `ERROR`).

- **Mechanizmy buforowania**
  - Można zaimplementować buforowanie odpowiedzi API, aby zmniejszyć liczbę zapytań przy wielokrotnych żądaniach z tym samym kontekstem.

Plik `ai.py` jest kluczowym elementem projektu, umożliwiającym komunikację z modelem AI. Jest to odpowiednik modułu obsługującego API w TypeScript, ale dostosowany do środowiska Pythona.

2.**Plik `prompts.py`**

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

### Pełne wyjaśnienie pliku `prompts.py`

#### 1. Kluczowe funkcjonalności

- **Generowanie promptów dla systemu agenta AI**
  - Plik `prompts.py` odpowiada za tworzenie promptów w różnych fazach działania agenta, takich jak planowanie, podejmowanie decyzji, opis, refleksja czy generowanie ostatecznej odpowiedzi.
  - Każda faza ma predefiniowane zasady i struktury promptów.

- **Dynamiczne dostosowywanie treści promptów**
  - Prompt uwzględnia stan systemu (`state`), co pozwala na generowanie odpowiedzi dopasowanych do bieżącego kontekstu i historii interakcji.

#### 2. Funkcje w pliku `prompts.py`

##### `tools_instruction()`

- Zwraca słownik opisujący instrukcje dla dostępnych narzędzi, takich jak:
  - **`get_html_contents`**: Pobieranie zawartości HTML z podanego URL.
  - **`game_submit_form`**: Wysyłanie plików lub danych do gry.
  - **`upload_text_file`**: Tworzenie i przesyłanie plików tekstowych.
  - **`final_answer`**: Generowanie finalnej odpowiedzi na pytanie użytkownika.
  - **`play_music`**: Obsługa działań związanych z API Spotify.

##### `available_tools()`

- Zwraca listę dostępnych narzędzi w uproszczonym formacie, używaną w promptach takich jak `decide_prompt`.

##### `plan_prompt(state)`

- Tworzy prompt dla etapu planowania.
- Uwzględnia obecny stan (`state`) systemu, w tym:
  - Wysłane wiadomości użytkownika.
  - Wcześniejsze działania (`actionsTaken`).
  - Aktualny plan (`plan`), jeśli istnieje.
- Prompt opisuje cel planowania oraz reguły działania agenta:
  - Rozpoznawanie prostych pytań i natychmiastowe udzielanie odpowiedzi.
  - Tworzenie planu, jeśli pytanie wymaga bardziej złożonej analizy.

##### `decide_prompt(state)`

- Generuje prompt dla etapu podejmowania decyzji.
- Uwzględnia obecny plan, listę wykonanych działań oraz dostępne narzędzia.
- Określa:
  - Kolejny krok w przetwarzaniu.
  - Wybór odpowiedniego narzędzia w formacie JSON.

##### `describe_prompt(state)`

- Tworzy prompt dla etapu opisu (`describe`).
- Wymaga, aby w stanie (`state`) zdefiniowane były:
  - Nazwa aktywnego narzędzia (`activeTool.name`).
  - Instrukcja dla narzędzia (`activeTool.instruction`).
- Prompt definiuje reguły generowania odpowiednich danych do wykonania narzędzia.

##### `reflection_prompt(state)`

- Tworzy prompt dla etapu refleksji.
- Pozwala agentowi analizować wykonane działania i sugerować ulepszenia.
- Uwzględnia plan i wszystkie wcześniejsze działania, aby ułatwić dokładną analizę.

##### `final_answer_prompt(state)`

- Generuje prompt dla ostatecznej odpowiedzi na zapytanie użytkownika.
- Uwzględnia:
  - Początkowy plan (`plan`), jeśli istnieje.
  - Wszystkie podjęte działania (`actionsTaken`).
  - Zapytanie użytkownika jako punkt wyjścia.
- Reguły w promptach nakierowują agenta na dostarczanie jasnych, dokładnych i przyjaznych odpowiedzi.

#### 3. Główne zalety pliku `prompts.py`

- **Modularność**:
  - Każda faza przetwarzania agenta ma dedykowaną funkcję, co ułatwia rozbudowę i utrzymanie kodu.
- **Dynamiczność**:
  - Prompt generowany jest na podstawie bieżącego stanu systemu, co pozwala na większą elastyczność i precyzję w odpowiedziach.
- **Obsługa złożonych zapytań**:
  - System potrafi dostosować się do prostych pytań użytkownika, jak i bardziej złożonych scenariuszy wymagających wielu kroków.

#### 4. Potencjalne rozszerzenia

- **Dodanie nowych narzędzi**:
  - Łatwo można wprowadzić nowe narzędzia, dodając je do funkcji `tools_instruction()` i `available_tools()`.
- **Zaawansowana obsługa języka naturalnego**:
  - Można wzbogacić prompty o dodatkowe reguły obsługujące bardziej złożone struktury językowe.
- **Lepsze logowanie błędów**:
  - Wprowadzenie systemu walidacji danych w stanie (`state`), aby unikać błędów wynikających z brakujących kluczy.

Plik `prompts.py` stanowi kluczowy element systemu agenta, określając strukturę i zasady działania każdej fazy interakcji. Jest to odpowiednik pliku `prompts.ts`, ale w pełni zaadaptowany do środowiska Pythona.

3.**Plik `agent.py`** – Logika agenta do podejmowania decyzji, refleksji i wykonania działań

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

### Pełne wyjaśnienie pliku `agent.py`

#### 1. Kluczowe funkcjonalności

- **Zarządzanie etapami agenta AI**  
  - Plik `agent.py` implementuje klasę `AIAgent`, która obsługuje przepływ procesu agenta AI przez kolejne etapy
    - Planowanie (`plan`)
    - Podejmowanie decyzji (`decide`)
    - Generowanie opisu (`describe`)
    - Wykonanie akcji (`execute`)
    - Refleksja nad wynikiem (`reflect`)
    - Generowanie ostatecznej odpowiedzi (`final_answer`)
  
- **Logowanie postępów w pliku Markdown**  
  - Każda istotna akcja jest zapisywana w pliku `log.md`, aby umożliwić łatwe śledzenie działań agenta.

#### 2. Kluczowe elementy pliku

##### Klasa `AIAgent`

- Główna klasa odpowiedzialna za sterowanie wszystkimi etapami pracy agenta.

###### **`__init__()`**

- **Inicjalizacja stanu agenta**
  - `currentStage` Aktualny etap przetwarzania (np. `plan`, `decide`).
  - `currentStep` Bieżący krok w ramach całego procesu.
  - `maxSteps` Maksymalna liczba kroków, aby uniknąć zapętlenia.
  - `messages` Wiadomości użytkownika, które są podstawą pracy agenta.
  - `actionsTaken` Historia działań podjętych przez agenta.
  - `api_key` Klucz API Anthropic, używany do komunikacji z modelem AI.

###### **`log_to_markdown()`**

- Funkcja zapisująca wyniki poszczególnych etapów do pliku `log.md`.
- Przyjmuje
  - `header` Nagłówek sekcji.
  - `content` Treść, która ma być zapisana.

##### **Asynchroniczne metody etapowe**

- Każdy etap procesu jest obsługiwany przez dedykowaną metodę.

###### **`plan()`**

- Generuje plan działania na podstawie promptu.
- Wysyła zapytanie do modelu AI z wygenerowanym promptem `plan_prompt`.

###### **`decide()`**

- Decyduje o następnym kroku lub narzędziu do użycia.
- Używa promptu `decide_prompt`, aby określić najlepszy sposób kontynuacji.
- Wynik jest przetwarzany jako JSON, co pozwala na precyzyjne wybranie narzędzia lub akcji.

###### **`describe()`**

- Generuje dane wejściowe (`payload`) wymagane do wykonania narzędzia.
- Używa promptu `describe_prompt` oraz wymaga, aby narzędzie (`activeTool`) było zdefiniowane w stanie agenta.

###### **`execute()`**

- Wykonuje wybrane narzędzie lub akcję.
- Przechowuje wynik działania w stanie (`state['actionsTaken']`).

###### **`reflect()`**

- Analizuje ostatnie działanie agenta.
- Używa promptu `reflection_prompt`, aby zasugerować ulepszenia lub dostosowania planu.

###### **`final_answer()`**

- Generuje ostateczną odpowiedź na pytanie użytkownika.
- Używa promptu `final_answer_prompt` i zwraca odpowiedź jako wynik działania agenta.

#### 3. Pętla przetwarzania w klasie `AIAgent`

- **Opis**
  - Pętla iteruje przez maksymalnie `maxSteps` kroków.
  - Kolejne etapy (`plan`, `decide`, `describe`, `execute`, `reflect`) są wykonywane w ustalonej kolejności.
  - Pętla kończy się, gdy osiągnięty zostanie etap `final_answer` lub limit kroków.
- **Zachowanie w przypadku błędów**
  - Jeśli wystąpi błąd na którymkolwiek etapie, proces jest zatrzymywany i błąd jest logowany.

#### 4. Kluczowe zalety

- **Asynchroniczność**
  - Wszystkie metody są asynchroniczne, co pozwala na efektywne przetwarzanie równoległe.
  
- **Elastyczność i modularność**
  - Każdy etap jest oddzielnie zdefiniowany, co ułatwia rozszerzanie i modyfikowanie funkcjonalności.

- **Obsługa złożonych scenariuszy**
  - Agent potrafi przetwarzać zarówno proste pytania użytkownika, jak i bardziej złożone zadania wymagające wieloetapowego planowania i refleksji.

#### 5. Potencjalne ulepszenia

- **Obsługa wyjątków**
  - Można dodać bardziej precyzyjne komunikaty błędów dla każdego etapu.
  
- **Zaawansowane logowanie**
  - Logowanie do oddzielnych plików lub systemów monitorowania (np. ElasticSearch, Sentry) może zwiększyć możliwości analizy.

- **Wzbogacenie historii działań**
  - Zapisywanie bardziej szczegółowych danych w `actionsTaken` może ułatwić debugowanie i analizę wyników.

Plik `agent.py` jest centralnym elementem systemu, zarządzającym przepływem procesu agenta AI oraz integracją z modelem Anthropic poprzez asynchroniczne zapytania.


4.**Plik `tools.py`** – Funkcje obsługujące pobieranie treści HTML, przesyłanie plików, odtwarzanie muzyki, itp.

```python
import httpx
from markdownify import markdownify as md
import os
import re

async def browse(url: str) -> str:
    """
    Asynchronicznie pobiera zawartość HTML z podanego URL i konwertuje ją do Markdown.

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
    Asynchronicznie przesyła plik tekstowy na serwer i zwraca URL pliku.

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
    Asynchronicznie wysyła żądanie do usługi odtwarzania muzyki.

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

### Wyjaśnienie pliku `tools.py`

#### 1. Główne funkcje

Plik `tools.py` dostarcza implementację różnych narzędzi używanych w systemie agenta AI. Każde narzędzie jest reprezentowane przez funkcję, która wykonuje specyficzne zadanie. Funkcje te umożliwiają wykonywanie operacji takich jak pobieranie treści HTML, przesyłanie plików czy integracja z usługami muzycznymi.

---

#### Wyjaśnienie każdej funkcji

- **`browse(url)`**  
  - **Opis**: Pobiera zawartość HTML z podanego adresu URL.
  - **Działanie**:
    - Wysyła zapytanie HTTP GET do podanego adresu URL.
    - Otrzymaną zawartość HTML konwertuje na markdown przy użyciu biblioteki `markdownify`.
    - Zwraca sformatowany wynik lub odpowiedni komunikat o błędzie, jeśli operacja się nie powiedzie.
  - **Obsługa błędów**:
    - Obsługuje wyjątki `RequestException`, zwracając szczegółowy komunikat w przypadku błędu połączenia.

- **`upload_file(data)`**  
  - **Opis**: Przesyła plik tekstowy na zdalny serwer.
  - **Działanie**:
    - Oczekuje słownika `data` zawierającego klucze:
      - `content`: Treść pliku.
      - `file_name`: Nazwa pliku.
    - Używa zmiennej środowiskowej `UPLOAD_DOMAIN` jako punktu końcowego serwera.
    - Wysyła żądanie POST z zawartością pliku jako payload.
    - Zwraca URL przesłanego pliku w przypadku powodzenia lub odpowiedni komunikat o błędzie w przypadku niepowodzenia.
  - **Obsługa błędów**:
    - Sprawdza, czy zmienna `UPLOAD_DOMAIN` jest ustawiona. Jeśli nie, zwraca odpowiedni komunikat o błędzie.
    - Obsługuje wyjątki związane z połączeniem lub odpowiedzią serwera.

- **`play_music(data)`**  
  - **Opis**: Wysyła żądanie odtworzenia muzyki do usługi muzycznej.
  - **Działanie**:
    - Oczekuje słownika `data` zawierającego szczegóły dotyczące żądania, np. utwory do odtworzenia.
    - Używa zmiennej środowiskowej `MUSIC_URL` jako punktu końcowego usługi muzycznej.
    - Wysyła żądanie POST z danymi o muzyce.
    - Zwraca odpowiedź serwera, która może zawierać szczegóły o odtwarzanej muzyce.
  - **Obsługa błędów**:
    - Sprawdza, czy zmienna `MUSIC_URL` jest ustawiona. Jeśli nie, zwraca odpowiedni komunikat o błędzie.
    - Obsługuje błędy związane z połączeniem i odpowiedzią serwera.

---

#### 2. Słownik `tools`

- **Opis**:  
  - Mapa funkcji narzędziowych, przypisująca nazwy narzędzi (np. `"browse"`, `"upload_file"`, `"play_music"`) do odpowiadających im funkcji w Pythonie.
  - Ułatwia dostęp do funkcji na podstawie ich nazwy, co jest przydatne podczas dynamicznego wykonywania narzędzi w ramach agenta AI.

---

#### 3. Główne cechy

- **Obsługa zmiennych środowiskowych**:  
  - Funkcje `upload_file` i `play_music` opierają się na zmiennych środowiskowych (`UPLOAD_DOMAIN`, `MUSIC_URL`), aby określić punkty końcowe serwerów.
- **Obsługa błędów**:  
  - Każda funkcja zawiera szczegółową obsługę błędów, zapewniając, że użytkownik otrzyma czytelny komunikat w przypadku problemów.
- **Elastyczność**:  
  - Słownik `tools` umożliwia łatwe dodawanie nowych narzędzi lub modyfikowanie istniejących.

---

#### 4. Kluczowe zalety

- **Integracja z zewnętrznymi usługami**:
  - Obsługuje operacje wymagające interakcji z zewnętrznymi serwisami, jak przesyłanie plików czy odtwarzanie muzyki.
  
- **Konwersja danych**:
  - Funkcja `browse` pozwala na automatyczną konwersję zawartości HTML na markdown, co może być przydatne do przetwarzania treści.

---

#### 5. Możliwości rozwoju

- **Rozszerzenie funkcjonalności**:
  - Dodanie nowych funkcji narzędziowych (np. edycji plików, obsługi innych formatów danych).
  
- **Lepsze logowanie**:
  - Wprowadzenie systemu logowania (np. do pliku lub zewnętrznego systemu monitorowania) zamiast prostych komunikatów błędów.

- **Testy jednostkowe**:
  - Dodanie testów jednostkowych dla każdej funkcji w celu zapewnienia większej niezawodności.

Plik `tools.py` dostarcza funkcje niezbędne do obsługi narzędzi w systemie agenta AI, umożliwiając integrację z różnymi zewnętrznymi usługami i ułatwiając przetwarzanie danych.

---

#### Część 4: Automatyzacja z użyciem Ansible

##### 1. Utwórz playbook Ansible – site.yml

Podzielmy playbook na logiczne części i utwórzmy projekt Ansible, w którym każda funkcjonalność (np. tworzenie środowiska, kopiowanie plików, konfiguracja aplikacji) będzie osobnym playbookiem lub rolą. Dzięki temu będziemy mieli elastyczny projekt, który można łatwo instalować, modyfikować i rozwijać.

### Plan

1. **Struktura projektu Ansible**:
   - Stworzymy główny katalog projektu Ansible z podkatalogami, takimi jak `roles` (gdzie umieścimy poszczególne role Ansible) i `playbooks`.
   - Podzielimy zadania na role:
     - **Role dla środowiska**: Tworzenie środowiska wirtualnego, instalacja paczek.
     - **Role dla plików aplikacji**: Tworzenie każdego pliku aplikacji z pełnym kodem.
     - **Role dla konfiguracji serwera**: Konfiguracja i uruchomienie serwera aplikacji.

2. **Główna struktura projektu Ansible**:
   - `site.yml` - główny plik playbooka, który uruchamia wszystkie role.
   - `roles/environment` - rola, która tworzy środowisko wirtualne i instaluje wymagane paczki.
   - `roles/application_files` - rola, która tworzy pliki aplikacji z pełnym kodem.
   - `roles/server_configuration` - rola, która konfiguruje i uruchamia serwer aplikacji.

### Krok 1: Tworzenie struktury katalogów

W katalogu projektu Ansible wykonaj poniższe kroki:

```bash
mkdir ansible_project
cd ansible_project
mkdir roles
mkdir playbooks
```

W katalogu `roles` utwórz podkatalogi dla każdej roli:

```bash
mkdir -p roles/environment/tasks
mkdir -p roles/environment/files
mkdir -p roles/application_files/tasks
mkdir -p roles/application_files/files
mkdir -p roles/server_configuration/tasks
```

### Krok 2: Utworzenie plików Ansible dla poszczególnych ról

#### 1. Rola `environment`: Tworzenie środowiska wirtualnego i instalacja paczek

W pliku `roles/environment/tasks/main.yml`:

```yaml
---
- name: Utwórz katalog projektu
  file:
    path: "{{ project_dir }}"
    state: directory

- name: Utwórz środowisko wirtualne
  command: python3 -m venv "{{ project_dir }}/venv"
  args:
    creates: "{{ project_dir }}/venv"

- name: Skopiuj plik requirements.txt do katalogu projektu
  copy:
    src: "requirements.txt"  # Ansible automatycznie wyszuka plik w katalogu `files`
    dest: "{{ project_dir }}/requirements.txt"

- name: Aktywuj środowisko i zainstaluj wymagane pakiety
  pip:
    requirements: "{{ project_dir }}/requirements.txt"
    virtualenv: "{{ project_dir }}/venv"
    virtualenv_command: python3 -m venv
```

#### 2. Rola `application_files`: Tworzenie plików aplikacji

W pliku `roles/application_files/tasks/main.yml`, dodajemy pełny kod każdego pliku aplikacji.

```yaml
---
- name: Skopiuj plik index.py do katalogu projektu
  copy:
    src: roles/application_files/files/index.py
    dest: "{{ project_dir }}/index.py"

- name: Skopiuj plik types.dt.py do katalogu projektu
  copy:
    src: roles/application_files/files/types.dt.py
    dest: "{{ project_dir }}/types.dt.py"

- name: Skopiuj plik README.md do katalogu projektu
  copy:
    src: roles/application_files/files/README.md
    dest: "{{ project_dir }}/README.md"

- name: Skopiuj plik log.md do katalogu projektu
  copy:
    src: roles/application_files/files/log.md
    dest: "{{ project_dir }}/log.md"

- name: Utwórz katalog lib
  file:
    path: "{{ project_dir }}/lib"
    state: directory

- name: Skopiuj plik ai.py do katalogu lib
  copy:
    src: roles/application_files/files/ai.py
    dest: "{{ project_dir }}/lib/ai.py"

- name: Skopiuj plik prompts.py do katalogu lib
  copy:
    src: roles/application_files/files/prompts.py
    dest: "{{ project_dir }}/lib/prompts.py"

- name: Skopiuj plik agent.py do katalogu lib
  copy:
    src: roles/application_files/files/agent.py
    dest: "{{ project_dir }}/lib/agent.py"

- name: Skopiuj plik tools.py do katalogu lib
  copy:
    src: roles/application_files/files/tools.py
    dest: "{{ project_dir }}/lib/tools.py"

- name: Skopiuj plik task_manager.py do katalogu projektu
  copy:
    src: roles/application_files/files/task_manager.py
    dest: "{{ project_dir }}/task_manager.py"

- name: Skopiuj plik ssh_manager.py do katalogu projektu
  copy:
    src: roles/application_files/files/ssh_manager.py
    dest: "{{ project_dir }}/ssh_manager.py"

- name: Skopiuj plik asgi_app.py do katalogu projektu
  copy:
    src: roles/application_files/files/asgi_app.py
    dest: "{{ project_dir }}/asgi_app.py"
```

#### 3. Rola `server_configuration`: Konfiguracja serwera

W pliku `roles/server_configuration/tasks/main.yml`:

```yaml
---
- name: Skonfiguruj plik .env
  copy:
    dest: "{{ project_dir }}/.env"
    content: |
      UPLOAD_DOMAIN=http://localhost:3000
      ANTHROPIC_API_KEY=your_anthropic_api_key

- name: Uruchom serwer aplikacji z Uvicorn
  shell: |
    source "{{ project_dir }}/venv/bin/activate"
    nohup uvicorn index:app --host 0.0.0.0 --port 3000 &
  args:
    executable: /bin/bash
  register: app_start_result
  ignore_errors: true  # Ignoruj błędy na wypadek ponownego uruchomienia
```

### Krok 3: Główny plik playbooka `site.yml`

W głównym katalogu `ansible_project`, utwórz plik `site.yml`, który uruchamia wszystkie role:

```yaml
---
- name: Konfiguracja i instalacja projektu AI Dev Agent
  hosts: localhost
  vars:
    project_dir: "/home/adrian/aidevs/agent"
  roles:
    - role: environment
    - role: application_files
    - role: server_configuration
```

### Krok 4: Przygotowanie archiwum projektu ZIP

Po utworzeniu całej struktury i dodaniu pełnych kodów plików w odpowiednich miejscach, możesz utworzyć archiwum ZIP:

```bash
zip -r ansible_project.zip ansible_project/
```

### Podsumowanie

1. Struktura projektu została podzielona na logiczne role.
2. Każda rola wykonuje specyficzne zadania, co ułatwia zarządzanie i rozwój.
3. Główny plik `site.yml` koordynuje wszystkie role, tworząc w pełni funkcjonalne środowisko aplikacji.
4. Po zakończeniu tworzenia struktury możesz spakować cały projekt do pliku ZIP, gotowego do pobrania i wdrożenia.

#### 1. Uruchamianie Playbooka

Aby uruchomić playbook i zautomatyzować proces konfiguracji projektu, wykonaj:

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

#### 2. Debugowanie i testowanie środowiska wirtualnego

Jeśli chcesz sprawdzić, czy Ansible poprawnie tworzy i używa środowiska wirtualnego:

- Uruchom ręcznie poniższe komendy w katalogu projektu, aby sprawdzić, czy proces działa:

     ```bash
     python3 -m venv venv
     source venv/bin/activate  # Aktywacja środowiska wirtualnego
     pip install -r requirements.txt  # Instalacja zależności
     ```

- W razie problemów, sprawdź logi Ansible po pełnym uruchomieniu playbooka.

### Debugowanie aplikacji opartej na Uvicorn i Quart

#### Uruchamianie serwera ręcznie

Aplikacja korzysta z serwera **Uvicorn**, który uruchamia framework **Quart**. Aby przetestować jej działanie:

1. **Aktywuj środowisko wirtualne**:

   ```bash
   source venv/bin/activate
   ```

2. **Uruchom aplikację**:

   ```bash
   uvicorn index:app --host 0.0.0.0 --port 3000
   ```

   - `index:app` wskazuje na moduł `index.py` oraz instancję Quart `app` w tym pliku.
   - Port `3000` jest standardowym ustawieniem. Upewnij się, że jest wolny.

3. **Sprawdź, czy serwer działa**:
   - Sprawdź otwarte porty:

     ```bash
     ss -tuln | grep 3000
     ```

   - Wyślij testowe zapytanie HTTP:

     ```bash
     curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"messages": [{"role": "user", "content": "Hello, World!"}]}'
     ```

---

#### Logi i debugowanie

1. **Logi Uvicorn**:
   - Logi serwera Uvicorn zawierają informacje o błędach i ruchu HTTP.
   - Uruchom aplikację z podniesionym poziomem logowania:

     ```bash
     uvicorn index:app --host 0.0.0.0 --port 3000 --log-level debug
     ```

2. **Logi aplikacji**:
   - W aplikacji Quart są wbudowane debugujące `print`-y dla większości operacji. Upewnij się, że masz włączony tryb debugowania Quart:

     ```bash
     export QUART_ENV=development
     export QUART_DEBUG=1
     ```

3. **Plik log.md**:
   - Sprawdź, czy `log.md` zapisuje poprawne dane dla poszczególnych etapów działania agenta:

     ```bash
     tail -f log.md
     ```

---

#### Sprawdzanie zmiennych środowiskowych

Upewnij się, że plik `.env` zawiera prawidłowe wartości:

```plaintext
UPLOAD_DOMAIN=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Zweryfikuj, czy zmienne zostały załadowane:

```bash
cat .env
```

---

#### Weryfikacja po instalacji

1. **Zweryfikuj proces**:
   - Sprawdź, czy proces Uvicorn działa:

     ```bash
     ps aux | grep uvicorn
     ```

2. **Przetestuj endpoint**:
   - Wyślij zapytanie do serwera:

     ```bash
     curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"messages": [{"role": "user", "content": "How far is the Moon?"}]}'
     ```

3. **Przywracanie aplikacji**:
   - W przypadku problemów zatrzymaj i ponownie uruchom proces:

     ```bash
     pkill -f uvicorn
     uvicorn index:app --host 0.0.0.0 --port 3000
     ```

Ten zestaw kroków powinien ułatwić debugowanie i testowanie aplikacji opartej na **Uvicorn** i **Quart**.
