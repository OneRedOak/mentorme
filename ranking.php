<?php

require_once('location.php');

class Person
{
    public $name;
    public $email;
    public $phone;
    public $location;
    public $field_of_interest;
    public $keywords;
    
    public function __construct($name, $email, $phone, $location, $field_of_interest, $keywords) {
        $this->name = $name;
        $this->email = $email;
        $this->phone = $phone;
        $this->location = $location;
        $this->field_of_interest = $field_of_interest;
        $this->keywords = $keywords;
    }
    
    public function pretty_keywords() {
        return implode(", ", $this->keywords);
    }
    
    public function get_similarity_score($other) {
        $intersection = array_intersect($this->keywords, $other->keywords);
        return count($intersection);
    }
    
    private function filter_by_distance($others, $distance_threshold) {
        $output = array();
        
        foreach ($others as $other) {
            if (getDistance($this->location, $other->location) <= $distance_threshold) {
                array_push($output, $other);
            }
        }
        return $output;
    }
    
    public function get_best_matches($mentors, $amount, $distance_threshold) {
        $data = array();
        $mentors = $this->filter_by_distance($mentors, $distance_threshold);
        foreach ($mentors as $mentor) {
            array_push($data, 
                array(
                    'score' => $this->get_similarity_score($mentor),
                    'mentor' => $mentor));
        }
        
        uasort($data, 'cmp_similarity');
        return array_slice($data, 0, $amount);
    }
}

function cmp_similarity($a, $b) {
    return $b['score'] - $a['score'];
}

function match_mentors($users, $mentors, $amount, $distance_threshold) {
    $data = array();
    foreach ($users as $user) {
        $ranked_mentors = $user->get_best_matches($mentors, $amount, $distance_threshold);
        array_push($data, array(
            'user' => $user,
            'mentors' => $ranked_mentors));
    }
    
    return $data;
}

function grab_data($conn, $table_name) {
    $result = $conn->query("select * from {$table_name};");
    $output = array();
    foreach ($result as $row) {
        array_push($output,
            new Person($row['name'], $row['email'], $row['phone'], $row['location'], 
                       $row['foi'], explode_and_trim(',', $row['keywords'])));
    }
    
    return $output;
}

function explode_and_trim($separator, $arr) {
    return array_map('trim', explode($separator, $arr));
}

?>