![HTTP Socket Appointment Scheduler](assets/banner.png)

# HTTP Socket Appointment Scheduler
![Badge Concluído](https://img.shields.io/static/v1?label=STATUS&message=Completed&color=af0421&style=for-the-badge)

This is an academic project developed for the **Plataformas de Distribuição UFPE, 2025.2** course, taught by Professor **Nelson Souto Rosa**. The objective was to adjust in a client-server application in Node.js to manage a real-time appointment schedule using **HTTP Protocol**, instead of TCP.

### Authors
* **Rodolfo Marinho:** `[armc@cin.ufpe.br]`
* **Samara Sabino:** `[sssc@cin.ufpe.br]`

## Description

This project is a client-server application built with Node.js that uses **HTTP (Hypertext Transfer Protocol)** to manage a real-time, shared appointment schedule. The server maintains a list of events, and multiple clients can connect to add, list, update, and remove appointments.

Appointment data is persisted to an `appointments.json` file on the server-side, ensuring that information is not lost between server restarts.

## Features

- **RESTful API Server**: Built with Express.js, providing a stateless HTTP server with structured endpoints.
- **Robust Client-Side Error Handling**: Gracefully handles API and network errors by interpreting HTTP status codes and providing clear feedback to the user.
- **CRUD Operations via API**: Clients perform the four basic data operations through standard HTTP methods:
    - **C**reate (POST /appointments)
    - **R**ead (GET /appointments)
    - **U**pdate (PUT /appointments/:id)
    - **D**elete (DELETE /appointments/:id)
- **Data Persistence**: The schedule is saved to a JSON file on the server.
- **Interactive Command-Line Interface**: TThe client, powered by Axios, provides an interactive prompt for communicating with the API.

## Architectural Shift: The HTTP Request-Response Model

A core objective of this project was to refactor the application from a low-level, stateful TCP connection to a high-level, stateless **HTTP API**. This change fundamentally alters how the client and server communicate, moving away from a continuous data stream towards a structured, transactional model.

This demonstrates a key concept in distributed systems: abstracting communication through a well-defined API. The responsibility of ensuring message delivery is handled by the underlying TCP protocol, allowing our application layer to focus on the logic of the requests and responses themselves.

Error handling is no longer about managing timeouts for potential packet loss. Instead, it revolves around a much richer and more explicit system:
    - **HTTP Status Codes:** The client can immediately understand the outcome of a request (e.g., 200 OK, 404 Not Found, 400 Bad Request).
    - **JSON Error Messages:** The server can send detailed error messages in the response body, which the client can then display to the user for precise feedback.

This results in a more robust, predictable, and easily debuggable system.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Yarn](https://yarnpkg.com/) (or another package manager like npm)

## How to Run

1.  **Clone the Repository**
    ```sh
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_NAME>
    ```

2.  **Install Dependencies**
    ```sh
    yarn install
    ```

3.  **Start the Server**
    Open a terminal and run the following command. The server will start the API on port 3000.
    ```sh
    node src/server/api.js
    ```
    You will see a confirmation message: `[INFO] HTTP Scheduler API started and listening on http://localhost:3000`.

4.  **Start the Client**
    Open a **new** terminal (leave the server terminal running) and run the command below.
    ```sh
    node src/client/client.js
    ```
    After connecting, a `>` prompt will appear, ready to receive your commands.

## Available Commands

All commands must be entered into the client terminal. Arguments containing spaces (such as title and description) must be enclosed in double quotes (`"`).

| Command | Description | Format & Example |
| :--- | :--- | :--- |
| `ADD` | Adds a new appointment to the schedule via `POST /appointments`. | **Format:**<br>`ADD <date> <time> <duration_min> "<title>" "[optional_description]"`<br><br>**Example:**<br>```> ADD 2025-10-26 15:00 90 "Project Sync" "Discuss milestones"``` |
| `LIST` | Lists all appointments `LIST ALL` or filters by a specific date via `GET /appointments`. | **Format:**<br>`LIST` or `LIST <date>`<br><br>**Example:**<br>```> LIST\n> LIST 2025-10-26``` |
| `UPDATE` | Updates a specific field of an existing appointment via `PUT /appointments/:id`. <br><br>**Updatable fields:**<br>`date`, `time`, `duration`, `title`, `description`. | **Format:**<br>`UPDATE <id> <field> "<new_value>"`<br><br>**Example:**<br>```> UPDATE 1 title "General Project Sync Meeting"``` |
| `DELETE` | Removes an appointment from the schedule via `DELETE /appointments/:id` | **Format:**<br>`DELETE <id>`<br><br>**Example:**<br>```> DELETE 2``` |

## Concurrency & Resilience Testing

To validate the API's ability to handle multiple simultaneous clients and ensure the client's error handling is robust, the project uses Jest for automated integration testing.

These tests simulate various real-world scenarios, making concurrent requests to the live server to verify its performance and stability under pressure. API tools like Postman can also be used for manual, granular testing of each endpoint.

### How to Run the Tests

The test suite is designed to be run against a live server instance.

1.  **Ensure the Server is Running**
    In one terminal, start the API server:
    ```sh
    node src/server/server.js
    ```

2.  **Execute the Test Suite**
    In a new terminal, run the test command from the project's root directory:
    ```sh
    yarn test
    ```

Jest will automatically discover and run all test files. Upon completion, a final report will be displayed in the terminal, summarizing the number of passed and failed tests.

### Test Scenarios Explained

The suite executes 30 tests distributed across three distinct scenarios, each designed to validate a specific aspect of the system.

#### Scenario 1: Stable Server & Normal Load
* **Goal:** To verify that the API can correctly handle standard CRUD operations from multiple concurrent users without data corruption or errors.
* **Execution:** Multiple simulated users connect at the same time. Each user performs a sequence of `ADD`, `LIST`, `UPDATE`, and `DELETE` commands.
* **Expected Outcome:** All operations must be processed correctly by the API, returning `2xx` status codes, and all tests should pass.

#### Scenario 2: Server Crash Simulation
* **Goal:** To test the client's resilience and *error handling* when the server fails unexpectedly during operations.
* **Execution:** The test server is programmed to shut down after receiving a few requests. Immediately, multiple users attempt to send more requests.
* **Expected Outcome:** The first few requests will succeed. All subsequent requests must result in a network connection error (e.g., `ECONNREFUSED`). A test is successful if the client correctly catches this error and provides user feedback without crashing.

#### Scenario 3: Server Offline Simulation
* **Goal:** To validate the client's *initial connection error handling* when the server is unavailable from the start.
* **Execution:** Multiple users attempt to send requests, but the server process is never started.
* **Expected Outcome:** Every request from every client must fail immediately with a network connection error. A test is successful if the client correctly handles this initial error.

<br>
<div style="text-align: center; font-family: monospace; white-space: pre;">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&color=c92c36&width=435&lines=Thanks%20for%20your%20attention!">
  </a>
</div>