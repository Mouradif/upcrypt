<?php
function success($response) {
	$response['success'] = true;
	die(json_encode($response));
}

function error($error) {
	die(json_encode([
		'success'	=> false,
		'error'		=> $error
	]));
}
?>