<?php
require_once('database.php');

$config = parse_config('private.config.cfg');
$conn = open_database_connection($config);



?>
<!DOCTYPE html>
<html>
<body>
    <h1>Testing</h1>
    <p><?php echo $config['database_name'] ?></p>
    <p><?php echo $config['database_password'] ?></p>
</body>
</html>

