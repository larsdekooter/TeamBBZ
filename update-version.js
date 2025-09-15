const fs = require("fs");
const path = require("path");
const appFile = require("./app.json");
const rdl = require("readline");

const { stdout, stdin } = process;

class SelectMenu {
  /**
   * @param {string} prompt - The message displayed to the user before the options.
   * @param {string[]} options - An array of strings representing the menu options.
   */
  constructor(prompt, options) {
    this.prompt = prompt;
    this.options = options;
    this.selectedIndex = 0;

    // Node.js's 'process' object is necessary for handling input/output in a CLI context.
    if (typeof process === "undefined" || !process.stdin || !process.stdout) {
      throw new Error("This class is designed for a Node.js CLI environment.");
    }

    // Set up raw mode for direct keyboard input.
    process.stdin.setRawMode(true);
    // Resume standard input to listen for events.
    process.stdin.resume();
    // Set character encoding for correct key interpretation.
    process.stdin.setEncoding("utf8");
  }

  /**
   * Renders the menu to the console.
   */
  render() {
    // Clear the console screen.
    console.clear();
    // Display the prompt message.
    console.log(this.prompt);
    stdout.write("\x1B[?25l"); // hide cursor
    // Iterate through options and display them with an indicator for the selected one.
    this.options.forEach((option, index) => {
      const isSelected = index === this.selectedIndex;
      // The cursor ">" indicates the currently selected option.
      const prefix = isSelected ? "> " : "  ";
      // Highlight the selected option with a different color.
      const color = isSelected ? "\x1b[36m" : "\x1b[0m"; // Cyan for selected, default for others.
      console.log(`${color}${prefix}${option}\x1b[0m`); // Reset color at the end of the line.
    });
  }

  /**
   * Listens for keyboard input to navigate the menu.
   * @returns {Promise<string>} A promise that resolves with the selected option.
   */
  listen() {
    this.render();

    return new Promise((resolve) => {
      // Define the function to handle key presses.
      const onKeyPress = (key) => {
        switch (key) {
          // Move the selection up.
          case "\x1b[A": // Up arrow key
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            break;
          // Move the selection down.
          case "\x1b[B": // Down arrow key
            this.selectedIndex = Math.min(
              this.options.length - 1,
              this.selectedIndex + 1
            );
            break;
          // Select the current option.
          case "\r": // Enter key (carriage return)
          case "\n": // Enter key (line feed)
            // Restore normal terminal behavior.
            process.stdin.removeListener("data", onKeyPress);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            // Resolve the promise with the selected option.
            resolve(this.options[this.selectedIndex]);
            stdout.write("\x1B[?25h");
            break;
          // Exit the process.
          case "\x03": // Ctrl+C
            stdout.write("\x1B[?25h");
            process.exit();
        }
        this.render();
      };
      // Attach the listener to the standard input.
      process.stdin.on("data", onKeyPress);
    });
  }
}

const select = new SelectMenu("Choose version type", [
  "Major",
  "Semver",
  "Minor",
]);

select.listen().then((value) => {
  const currentVersion = appFile.expo.version;
  let [major, semver, minor] = currentVersion
    .match(/\d*./gm)
    .map((x) => parseInt(x));
  switch (value) {
    case "Major":
      major++;
    case "Semver":
      semver++;
    case "Minor":
      minor++;
  }
  const newVersion = `${major}.${semver}.${minor}`;
  appFile.expo.version = newVersion;

  fs.writeFileSync(`./app.json`, JSON.stringify(appFile, null, 2), "utf-8");
});
