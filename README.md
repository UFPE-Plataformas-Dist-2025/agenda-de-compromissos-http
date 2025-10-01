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
    - **U**pdate (PATCH /appointments/:id)
    - **D**elete (DELETE /appointments/:id)
- **Data Persistence**: The schedule is saved to a JSON file on the server.
- **Interactive Command-Line Interface**: The client, powered by Axios, provides an interactive prompt for communicating with the API.

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
    yarn start:server
    ```
    You will see a confirmation message: `[INFO] HTTP Scheduler API started and listening on http://localhost:3000`.

4.  **Start the Client**
    Open a **new** terminal (leave the server terminal running) and run the command below.
    ```sh
    yarn start:client
    ```
    After connecting, a `>` prompt will appear, ready to receive your commands.

## Available Commands

All commands must be entered into the client terminal. Arguments containing spaces (such as title and description) must be enclosed in double quotes (`"`).

| Command | Description | Format & Example |
| :--- | :--- | :--- |
| `ADD` | Adds a new appointment to the schedule via `POST /appointments`. | **Format:**<br>`ADD <date> <time> <duration_min> "<title>" "[optional_description]"`<br><br>**Example:**<br>```> ADD 2025-10-26 15:00 90 "Project Sync" "Discuss milestones"``` |
| `LIST` | Lists all appointments `LIST ALL` or filters by a specific date via `GET /appointments`. | **Format:**<br>`LIST` or `LIST <date>`<br><br>**Example:**<br>```> LIST\n> LIST 2025-10-26``` |
| `UPDATE` | Updates a specific field of an existing appointment via `PATCH /appointments/:id`. <br><br>**Updatable fields:**<br>`date`, `time`, `duration`, `title`, `description`. | **Format:**<br>`UPDATE <id> <field> "<new_value>"`<br><br>**Example:**<br>```> UPDATE 1 title "General Project Sync Meeting"``` |
| `DELETE` | Removes an appointment from the schedule via `DELETE /appointments/:id` | **Format:**<br>`DELETE <id>`<br><br>**Example:**<br>```> DELETE 2``` |

## Automated Testing (Jest)

To validate the API's stability and the client's error handling, the project uses an automated test suite built with Jest.

### How to Run the Tests

Because the resilience tests have conflicting requirements (server online vs. offline), the test suite is divided into two separate commands. After running, a detailed test-report.html file is generated in the project root.

1. **Testing the Offline Scenario**
    This command runs only the tests that require the server to be offline.
    ```sh
    yarn test:offline
    ```
2. **Testing Online Scenarios**
    This command runs all tests that require the server to be online (resilience timeout and concurrency). The server is started and stopped automatically for these tests.
    ```sh
    yarn test:online
    ```

### Test Scenarios Explained

The suite executes a series of tests distributed across two main categories:em.

#### Resilience Testsd
The goal is to verify the client's robustness during server failures.
- **Server Offline Scenario:** Validates that the client correctly handles an immediate connection error (ECONNREFUSED) when the server is unavailable from the start. This test is run with the server off.
- **Server Timeout Scenario:** Validates that the client's request timeout (ECONNABORTED) is triggered when the server is online but unresponsive. This test is run with the server on and managed automatically.

#### Concurrency Test
The goal is to ensure the server can handle multiple simultaneous write operations without data corruption.
- **Execution:** The test simulates multiple clients by sending a burst of `ADD` (`POST`) requests concurrently using Promise.all.
- **Expected Outcome:** After the requests complete, the test verifies that all appointments were created correctly and that each one has a unique ID, proving the server's stability and data integrity under load.

<br>
<div style="text-align: center; font-family: monospace; white-space: pre;">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&color=c92c36&width=435&lines=Thanks%20for%20your%20attention!">
  </a>
</div>