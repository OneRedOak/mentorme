<?php

/**
 * Opens and parses config values from the provided file.
 */
function parse_config($path) {
    $contents = file_get_contents($path);
    $pairs = explode("\n", $contents);
    $output = array();
    foreach ($pairs as $pair) {
        $pairArr = explode("=", $pair);
        $output[$pairArr[0]] = $pairArr[1];
    }
    return $output;
}

function open_database_connection($config) {
    $conn = new mysqli(
        $config['database_host'],
        $config['database_username'],
        $config['database_password'],
        $config['database_name']);
    return $conn;
}
?>