<?php
require_once('utils.php');
require_once('ranking.php');

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

function generate_user_and_matches_html($user, $mentors) {
    $row = array();
    
    array_push($row, wrap_span('user-info name', $user->name));
    array_push($row, wrap_span('user-info keywords',  $user->pretty_keywords()));
    array_push($row, wrap_span('user-info location',  $user->location));
    array_push($row, wrap_span('user-info email',  $user->email));
    
    array_push($row, generate_matches_html($mentors));
    
    return implode("\n", $row);
}

function generate_matches_html($mentors) {
    $row = array();
    
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
        array_push($row, generate_user_and_matches_html($user, $mentors));
        array_push($row, '</li>');
        
        array_push($output, implode("\n", $row));
    }
    array_push($output, '</ul>');
    
    return implode("\n", $output);
}



function grab_custom_data($conn, $table_name) {
    $result = $conn->query("select * from {$table_name};");
    $output = array();
    $extra = array();
    foreach ($result as $row) {
        array_push($output,
            new Person($row['name'], $row['email'], $row['phone'], $row['location'], 
                       $row['foi'], explode_and_trim(',', $row['keywords']), 
                       $row['latitude'], $row['longitude']));
        array_push($extra, array(
            'job_title' => $row['jobtitle'],
            'company' => $row['currentcompany'],
            'notes' => $row['notes']));
    }
    
    return array('output' => $output, 'extra' => $extra);
}

function generate_custom_matches_html($mentors, $extras) {
    $row = array();
    
    array_push($row, '<ol class="mentors">');
    
    $images = array(
        'resources/mentors/pic1.jpg',
        'resources/mentors/pic2.jpg',
        'resources/mentors/pic3.jpg',
        'resources/mentors/pic4.jpg');
    
    $counter = 0;
    foreach ($mentors as $mentor_pair) {
        $score = $mentor_pair['score'];
        $mentor = $mentor_pair['mentor'];
        $extra = $extras[$counter];
            
        array_push($row, '<li class="mentor">');
        array_push($row, '<img src="' . $images[$counter] . '" height="150" width="150" class="mentor-info profile-pic">');
        array_push($row, wrap_span('mentor-info name',  $mentor->name));
        array_push($row, wrap_span('mentor-info job', $extra['job_title']));
        array_push($row, wrap_span('mentor-info company', $extra['company']));
        // Display on main page fails when the below single line is kept -- the 
        // function ends up returning null (??)
        // However, it works on view-matches.php
        //array_push($row, wrap_span('mentor-info info', htmlspecialchars($extra['notes'])));
        //array_push($row, wrap_span('mentor-info keywords',  $mentor->pretty_keywords()));
        
        array_push($row, '</li>');
        
        $counter = $counter + 1;
    }
    array_push($row, '</ol>');
    
    return implode("\n", $row);
}

function generate_single_user_matches_html($config, $user, $amount, $distance_threshold) {
    $conn = $conn = open_database_connection($config);
    $data = grab_custom_data($conn, 'Mentors');
    $mentor_data = $data['output'];
    $mentor_extra = $data['extra'];
    
    $ranked_mentors = $user->get_best_matches($mentor_data, $amount, $distance_threshold);
    
    return generate_custom_matches_html($ranked_mentors, $mentor_extra);
}
?>