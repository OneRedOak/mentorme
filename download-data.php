<?php
require_once('private.config.php');
require_once('utils.php');

$conn = open_database_connection($config);

$user_data = grab_data($conn, 'Users');
$mentor_data = grab_data($conn, 'Mentors');

$similarities = match_mentors($user_data, $mentor_data, 4);

function match_mentors($users, $mentors, $threshold) {
    $data = array();
    foreach ($users as $user) {
        $ranked_mentors = rank_mentors($user, $mentors);
        $data[$user['index']] = array(
            'user' => $user,
            'mentors' => rank_mentors($user, $mentors));
    }
    return $data;
}


function cmp_similarity($a, $b) {
    return $a['score'] - $b['score'];
}
    
function rank_mentors($user, $mentors) {    
    $data = array();
    foreach ($mentors as $mentor) {
        array_push($data, 
            array(
                'score' => get_similarity_score($user, $mentor),
                'mentor' => $mentor));
    }
    
    uasort($data, 'cmp_similarity');
    
    return $data;
}

function get_similarity_score($person1, $person2) {
    $intersection = array_intersect($person1['keywords'], $person2['keywords']);
    return count($intersection);
}


function grab_data($conn, $table_name) {
    $result = $conn->query("select * from {$table_name};");
    $output = array();
    foreach ($result as $row) {
        $output[$row['index']] = array(
            'index' => $row['index'],
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
    <pre><?php echo var_dump($user_data) ?></pre>
    
    <h2>Mentor</h2>
    <pre><?php echo var_dump($mentor_data) ?></pre>
    
    <h2>Matches</h2>
    <pre><?php echo var_dump($similarities) ?></pre>
</body>
</html>


