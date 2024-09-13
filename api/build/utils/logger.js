const colors = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
    blue: '\x1b[36m%s\x1b[0m',
};
const logToConsole = (color, msg, data) => {
    console.log(color, msg, data ? data : '');
};
const logger = {
    r: (msg, data) => logToConsole(colors.red, msg, data),
    g: (msg, data) => logToConsole(colors.green, msg, data),
    y: (msg, data) => logToConsole(colors.yellow, msg, data),
    b: (msg, data) => logToConsole(colors.blue, msg, data),
};
export default logger;
