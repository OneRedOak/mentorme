<?php
require_once('private.config.php');
require_once('utils.php');
require_once('ranking.php');

$conn = open_database_connection($config);

$user_data = grab_data($conn, 'Users');
$mentor_data = grab_data($conn, 'Mentors');

$similarities = match_mentors($user_data, $mentor_data, 4, 50);

?>
<!DOCTYPE html>
<html>
<body>
    <h1>Testing</h1>
    
    <h2>Matches</h2>
    <ul>
    <?php
        foreach ($similarities as $pair) {
            $user = $pair['user'];
            $mentors = $pair['mentors'];
            
            echo '<li>' . $user->name 
                . '<br>' . $user->pretty_keywords() 
                . '<br>' . $user->location;
                
            echo "<ol>";
            foreach ($mentors as $mentor_pair) {
                $score = $mentor_pair['score'];
                $mentor = $mentor_pair['mentor'];
                
                echo '<li>' . $mentor->name 
                    . '<br>' . $mentor->pretty_keywords() 
                    . '<br>' . $mentor->location 
                    . '<br>Score: ' . $score;
            }
            echo "</ol>";
        }
    ?>
    </ul>
</body>
</html>


