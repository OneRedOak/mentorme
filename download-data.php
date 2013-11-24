<?php
require_once('utils.php');

$conn = open_database_connection();

//$user_data = grab_data($conn, 'Users');
//$mentor_data = grab_data($conn, 'Mentors');



function grab_data($conn, $table_name) {
    $result = $conn->query("select * from {$table_name};");
    $result->data_seek(0);
    $output = array();
    while ($row = $result->fetch_assoc()) {
        $output[$row['index']] = array(
            'name' => $row['name'],
            'email' => $row['email'],
            'location' => $row['location'],
            'field_of_interest' => $row['foi'],
            'keywords' => explode(',', $row['keywords']));
    }   
    
    return $output;
}

?>
<!DOCTYPE html>
<html>
<body>
    <h1>Testing</h1>
    <p><?php echo $config['database_host'] ?></p>
    <p><?php echo $config['database_username'] ?></p>
    <p><?php echo $config['database_name'] ?></p>
    <p><?php echo $config['database_password'] ?></p>
    <h2>User</h2>
    <p><?php echo var_dump($user_data) ?></p>
    
    <h2>Mentor</h2>
    <p><?php echo var_dump($mentor_data) ?></p>
</body>
</html>


