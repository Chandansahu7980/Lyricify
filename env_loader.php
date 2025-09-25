<?php

#function to load env variable from the .env file
#parameter require path to your .env file
function load_env(string $path): void
{
    // Check if the .env file exists
    if (!file_exists($path)) {
        #no .env files on the given path
        echo "No .env file found";
        return;
    }

    // Read file lines, skipping empty ones and ignoring newlines
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments (lines starting with #)
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Split the line into key and value at the first '='
        list($name, $value) = explode('=', $line, 2);

        $name = trim($name);
        $value = trim($value);

        // Remove surrounding quotes from the value
        $value = trim($value, "\"");
        $value = trim($value, "'");

        // Set the environment variable
        // putenv() makes it available via getenv()
        // We also set the superglobals for convenience, though this is less reliable
        if (!empty($name)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            // $_SERVER[$name] = $value;
        }
    }
}

load_env(".env");
