<?php
function open_database_connection($config) {
    $conn = new mysqli(
        $config['database_host'],
        $config['database_username'],
        $config['database_password'],
        $config['database_name']);
    return $conn;
}
?>