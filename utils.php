<?php
require_once('private.config.php');

function open_database_connection() {
    $conn = new mysqli(
        $config['database_host'],
        $config['database_username'],
        $config['database_password'],
        $config['database_name']);
    return $conn;
}
?>