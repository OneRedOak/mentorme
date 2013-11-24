<?php
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
			'success' => 'Your email has been sent.'
		);

	//print_r($data);

	if( isset($data) && $data['contact_site'] == '' )
	{
		foreach ($data as $key => $value)
		{
			if($key != 'contact_site')
			{
				if($key == 'email')
				{
					if(!filter_var($value, FILTER_VALIDATE_EMAIL))
					{
						error($validation_messages['invalid_email'], $key);
					}
					else
					{
						$sender = $value;
					}
				}
				else
				{
					switch ($key)
					{
						case 'name':
							if(_is_valid_field($value) )
							{
								$sender_name = $value;
							} 
							else
							{
								error($validation_messages['invalid_name'], $key);
							}
							break;

						case 'message':
							if($value != '')
							{
								$message = $value;
							}
							else
							{
								error($validation_messages['empty_message'], $key);
							}
							break;

						case 'subject':
							if($value != '')
							{
								$subject = $value;
							}
							else
							{
								error($key . ' ' . $validation_messages['empty_field'] , $key);
							}
							break;

						default:
							if($value != '')
							{
								$additional = "\r\n" . '<br><br><hr style="border: none; border-top: 1px solid #ededed;">' . $key . ': ' . $value;
							}
							else
							{
								error($key . ' ' . $validation_messages['empty_field'] , $key);
							}
							break;
					}
						
				}
				
			}
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

	}
	else
	{
		error($validation_messages['spam_bot'], 'global');
	}



	function error($text, $field)
	{
		die(
			json_encode(
				array(
					'error' => $field,
					'message' => $text
				)
			)
		);
	}

	function success($text)
	{
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