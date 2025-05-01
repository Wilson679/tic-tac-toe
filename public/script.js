document.addEventListener("DOMContentLoaded", () => {
    console.log("Welcome to Tic Tac Toe!");

    const root = document.getElementById("root");

    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h1");
    heading.textContent = "Welcome to Tic-Tac-Toe";

    const paragraph = document.createElement("p");
    paragraph.textContent = "This is the homepage of your Next.js application.";

    container.appendChild(heading);
    container.appendChild(paragraph);
    root.appendChild(container);
});
