<?php
include("lib.php");

// This lines transforms the raw JSON post data into the usual associative array
$_POST = json_decode(file_get_contents('php://input'), 1);
if (is_null($_POST) || empty($_POST))
	error("Couldn't read post data");
if (!isset($_POST['name']) || !isset($_POST['parts']) || !is_array($_POST['parts']))
	error("Malformed post data");

$dir = "data/";
$archive = new ZipArchive();
$filename = implode('__', [$_POST['name'], uniqid()]);

if ($archive->open($dir.$filename, ZipArchive::CREATE) !== true) {
	error("Could not create zip file");
}
$i = 1;
foreach($_POST['parts'] as $part) {
	$archive->addFromString($i, $part);
	$i++;
}

$archive->close();
success([
	'message'	=> "Encrypted file was successfully uploaded"
]);

?>
