<?php
require_once('private.config.php');
require_once('utils.php');
require_once('ranking.php');
require_once('display-generation.php');

$similarities = grab_similarities($config, 4, 50);

$test_user = new Person(
    'Person name',
    'email@example.com',
    '425-123-1234',
    '98020',
    'field of interest - not currently used',
    array('python', 'java', 'php'));
    
$mentor_matches = generate_single_user_matches_html($config, $test_user, 4, 50);

if ($_GET['csv'] === 'true') {
    output_csv($similarities);
    exit(0);
}



function grab_similarities($config, $amount, $distance_threshold) {
    $conn = open_database_connection($config);

    $user_data = grab_data($conn, 'Users');
    $mentor_data = grab_data($conn, 'Mentors');

    $similarities = match_mentors($user_data, $mentor_data, $amount, $distance_threshold);
    return $similarities;
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


