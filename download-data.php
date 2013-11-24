<?php
require_once('private.config.php');
require_once('utils.php');

$conn = open_database_connection($config);



?>
<!DOCTYPE html>
<html>
<body>
    <h1>Testing</h1>
    <p><?php echo $config['database_host'] ?></p>
    <p><?php echo $config['database_username'] ?></p>
    <p><?php echo $config['database_name'] ?></p>
    <p><?php echo $config['database_password'] ?></p>
</body>
</html>

