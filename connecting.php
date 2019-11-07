<?php
// Content of database.php
$server ='localhost';
$username = 'maker';
$pw = 'lala';
$db = 'calendar';

$mysqli = new mysqli($server, $username, $pw, $db);

if($mysqli->connect_errno) {
	printf("Connection Failed: %s\n", $mysqli->connect_error);
	exit;
}
?>
