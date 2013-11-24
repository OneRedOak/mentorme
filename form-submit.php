<?php
	require_once("private.config.php");
	require_once("utils.php");

	$data = $_POST;
	$subject = 'Hello From ilone';
	$receiver = 'myuser1@localhost';
	$sender = null;
	$sender_name = null;
	$message = null;
	$additional = '';

	$send_copy_to_sender = false;

	$validation_messages = array(
			'invalid_email' => 'Please provide valid email.',
			'invalid_name' => 'Please provide a valid name.',
			'empty_message' => 'Message is empty.',
			'empty_field' => 'can not be empty.',
			'global_error' => 'Could not send the email, please try again later.',
			'spam_bot' => 'Spam is not welcome!',
			'success' => 'Your email has been sent.',
			'email_used' => 'Your emails is already used'
		);

	//print_r($data);

	if( isset($data) && $data['contact_site'] == '' ) {
		foreach ($data as $key => $value) {
			if($key != 'contact_site') {
				if($key == 'email') {
					if(!filter_var($value, FILTER_VALIDATE_EMAIL)) {
						error($validation_messages['invalid_email'], $key);
					} else {
						$sender = $value;
					}
				} else {
					switch ($key) {
						case 'name':
							if(_is_valid_field($value) ) {
								$sender_name = $value;
							} else {
								error($validation_messages['invalid_name'], $key);
							}
							break;

						case 'message':
							if($value != '') {
								$message = $value;
							} else {
								error($validation_messages['empty_message'], $key);
							}
							break;

						case 'subject':
							if($value != '') {
								$subject = $value;
							} else {
								error($key . ' ' . $validation_messages['empty_field'] , $key);
							}
							break;

						default:
							if($value != '') {
								$additional = "\r\n" . '<br><br><hr style="border: none; border-top: 1px solid #ededed;">' . $key . ': ' . $value;
							} else {
								error($key . ' ' . $validation_messages['empty_field'] , $key);
							}
							break;
					}
						
				}
				
			}
		}

		$conn = open_database_connection($config);
		$mentee_add_statment = $conn->prepare("INSERT INTO 
						Users(email, keywords, location, name, phone, foi, notes) 
						VALUES(?, ?, ?, ?, ?, ?, ?)");
		$mentor_add_statment = $conn->prepare("INSERT INTO 
						Mentors(email, keywords, name, phone, industry, 
							jobtitle, currentcompany, notes, location) 
						VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
		$mentee_email_check = $conn->prepare("SELECT COUNT(*) AS count FROM `Users` WHERE email = '?'");
		$mentor_email_check = $conn->prepare("SELECT COUNT(*) AS count FROM `Mentors` WHERE email = '?'");

		$mentor_email_check_result = $mentor_email_check->execute(array($data["email"]));
		$mentee_email_check_result = $mentee_email_check->execute(array($data["email"]));

		if($mentor_email_check_result[0]["count"] === 0 && $mentee_email_check_result[0]["count"] === 0) {
			$file = file_get_contents("keywords.json");
			$keywords = json_decode($file, true);

			if(empty($data["job_title"])) {
				$user_input = $data["foi"] . " " . $data["message"];
			}
			else {
				$user_input =   $data["job_title"] . " " .
								$data["industry"] . " " .
								$data["current_company"] . " " . 
								$data["message"];
			}
			

			$user_input = clean($user_input);

			$user_input_array = array_unique(explode("-", $user_input));

			$user_keyword_data = array(); 

			foreach($user_input_array as $user_input_word) {
				$user_input_word = strtolower($user_input_word);
				foreach($keywords["Keywords"] as $keyword) {
					if($user_input_word === $keyword) {
						array_push($user_keyword_data, $keyword);	
					}
				}
			}

			if(empty($data["job_title"])) {
				$mentee_add_statment->execute(array(
												htmlspecialchars($data["email"]),
												implode(",", $user_keyword_data),
												htmlspecialchars($data["zip"]),
												htmlspecialchars($data["name"]),
												htmlspecialchars($data["phone"]),
												htmlspecialchars($data["foi"]),
												htmlspecialchars($data["message"])
									   ));
			} 
			else {
				$mentor_add_statment->execute(array(
												htmlspecialchars($data["email"]),
												implode(",", $user_keyword_data),
												htmlspecialchars($data["name"]),
												htmlspecialchars($data["phone"]),
												htmlspecialchars($data["industry"]),
												htmlspecialchars($data["job_title"]),
												htmlspecialchars($data["current_company"]),
												htmlspecialchars($data["message"]),
												htmlspecialchars($data["zip"])
									   ));
			}

			$headers = 'MIME-Version: 1.0' . "\r\n" .
						'Content-type: text/html; charset=UTF-8' . "\r\n" .
						'From: ' . $sender_name . '<'. $sender .'>' ."\r\n" .
						'Reply-To: ' . $sender . "\r\n".
						"\r\n";

			
			$complete_message = $message . $additional;
			$complete_message = str_replace( array("\n", "\r"), array("<br/>"), $complete_message );

			$to = $send_copy_to_sender ? $receiver . ', ' . $sender : $receiver;

			if(mail($to, $subject, $complete_message, $headers))
			{
				success($validation_messages['success']);
			}
			else
			{
				error($validation_messages['global_error'], 'global');
			}
		} else {
			error($validation_messages['email_used'], 'global');	
		}
	} else {
		error($validation_messages['spam_bot'], 'global');
	}

	function clean($string) {
		$string = str_replace(" ", "-", $string); // Replaces all spaces with hyphens.
   		$string = preg_replace('/[^A-Za-z0-9\-]/', '', $string); // Removes special chars.
		return preg_replace('/-+/', '-', $string); // Replaces multiple hyphens with single one.
	}

	function error($text, $field) {
		die(
			json_encode(
				array(
					'error' => $field,
					'message' => $text
				)
			)
		);
	}

	function success($text) {
		die(
			json_encode(
				array(
					'message' => $text
				)
			)
		);
	}

	function _is_valid_field($field) {
		return preg_match('/^[a-z0-9()\/\'":\*+|,.; \- !?&#$@]{2,75}$/i', $field);
	}
?>