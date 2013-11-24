<?php
	function open_database_connection($config) {
	  	return new PDO('mysql:host=' . $config['database_host'] . ';dbname=' . $config['database_name'], 
	  					$config['database_username'], $config['database_password']);
	}
?>