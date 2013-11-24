<?php
require_once('private.config.php');
require_once('utils.php');
require_once('ranking.php');

$similarities = grab_similarities($config, 4, 50);

if ($_GET['csv'] === 'true') {
    output_csv($similarities);
    exit(0);
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

function wrap_span($classes, $item) {
    return "<span class='{$classes}'>{$item}</span>";
}

function generate_user_matches_html($user, $mentors) {
    $row = array();
    
    array_push($row, wrap_span('user-info name', $user->name));
    array_push($row, wrap_span('user-info keywords',  $user->pretty_keywords()));
    array_push($row, wrap_span('user-info location',  $user->location));
    array_push($row, wrap_span('user-info email',  $user->email));
    
    array_push($row, '<ol class="mentors">');
    
    foreach ($mentors as $mentor_pair) {
        $score = $mentor_pair['score'];
        $mentor = $mentor_pair['mentor'];
            
        array_push($row, '<li class="mentor">');
        array_push($row, wrap_span('mentor-info name',  $mentor->name));
        array_push($row, wrap_span('mentor-info keywords',  $mentor->pretty_keywords()));
        array_push($row, wrap_span('mentor-info location',  $mentor->location));
        array_push($row, wrap_span('mentor-info email',  $mentor->email));
        array_push($row, wrap_span('mentor-info score', $score));
        array_push($row, '</li>');
    }
    array_push($row, '</ol>');
    
    return implode("\n", $row);
}

function generate_masterlist_html($similarities) {
    $output = array();
    
    array_push($output, '<ul>');
    foreach ($similarities as $pair) {
        $user = $pair['user'];
        $mentors = $pair['mentors'];
        
        $row = array();
        
        array_push($row, '<li class="user">');
        array_push($row, generate_user_matches_html($user, $mentors));
        array_push($row, '</li>');
        
        array_push($output, implode("\n", $row));
    }
    array_push($output, '</ul>');
    
    return implode("\n", $output);
}
?>
<!DOCTYPE html>
<html>
<meta>
    <style type="text/css">
        .user-info{
            display:block;
        }
        .mentor-info{
            display:block;
        }
    </style>
</meta>
<body>
    <h1>View Matches</h1>
    <p><a href="view-matches.php?csv=true">Download as csv</a></p>
    
    <?php echo generate_masterlist_html($similarities); ?>
</body>
</html>


