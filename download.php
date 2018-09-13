<?php
include("lib.php");

if (!isset($_GET['file']) || !file_exists('data/'.$_GET['file'])) {
	error("There's no such file");
}

$zip = new ZipArchive();
$zipFile = 'data/' . $_GET['file'];

if ($zip->open($zipFile) !== true) {
	error("File might be corrupted");
}

$parts = [];
for ($i = 0; $i < $zip->numFiles; $i++) {
	$stat = $zip->statIndex($i);
	$partname = $stat['name'];
	$path = sprintf("zip://%s#%s", $zipFile, $partname);
	$parts[] = file_get_contents($path);
}

success([
	'parts' => $parts
]);