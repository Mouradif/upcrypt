<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
$files = [];
$dir = "data/";
$list = scandir($dir);
foreach ($list as $file) {
	if(!preg_match("#^.+__.+$#", $file))
		continue;

	$files[] = [
		'path'	=> $file,
		'name'	=> explode('__', $file)[0]
	];
}
echo json_encode($files);
?>
