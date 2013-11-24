<?php
require_once('private.config.php');
require_once('utils.php');
require_once('ranking.php');

$similarities = grab_similarities($config, 4, 50);

if ($_GET['csv'] === 'true') {
    output_csv($similarities);
} else {
    output_html($similarities);
}

// Functions

function grab_similarities($config, $amount, $distance_threshold) {
    $conn = open_database_connection($config);

    $user_data = grab_data($conn, 'Users');
    $mentor_data = grab_data($conn, 'Mentors');

    $similarities = match_mentors($user_data, $mentor_data, $amount, $distance_threshold);
    return $similarities;
}

function output_csv($similarities) {
    header("Content-type: text/csv");
    header("Content-Disposition: attachment; filename=file.csv");
    header("Pragma: no-cache");
    header("Expires: 0");
    
    $output = array();
    
    foreach ($similarities as $pair) {
        $row = array();
        $user = $pair['user'];
        $mentors = $pair['mentors'];
        
        array_push($row, $user->name);
        array_push($row, $user->pretty_keywords());
        array_push($row, $user->location);
        array_push($row, $user->email);
        
        foreach ($mentors as $mentor_pair) {
            $score = $mentor_pair['score'];
            $mentor = $mentor_pair['mentor'];
            
            array_push($row, $mentor->name); 
            array_push($row, $mentor->pretty_keywords());
            array_push($row, $mentor->location );
            array_push($row, $mentor->email);
            array_push($row, $score);
        }
        
        array_push($output, implode("\t", $row));
    }
    
    echo implode("\n", $output);
} 

function output_html($similarities) { ?>
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
                    . '<br>' . $user->location
                    . '<br>' . $user->email;
                    
                echo "<ol>";
                foreach ($mentors as $mentor_pair) {
                    $score = $mentor_pair['score'];
                    $mentor = $mentor_pair['mentor'];
                    
                    echo '<li>' . $mentor->name 
                        . '<br>' . $mentor->pretty_keywords() 
                        . '<br>' . $mentor->location
                        . '<br>' . $mentor->email
                        . '<br>Score: ' . $score;
                }
                echo "</ol>";
            }
        ?>
        </ul>
    </body>
    </html>
<?php } 


?>



