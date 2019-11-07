<?php

  ini_set("session.cookie_httponly", 1);

  session_start();

  $previous_ua = @$_SESSION['useragent'];
  $current_ua = $_SERVER['HTTP_USER_AGENT'];

  if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua){
        die("Session hijack detected");
  }else{
        $_SESSION['useragent'] = $current_ua;
  }

  require 'connecting.php';
  //get the username and password
  $username = $_SESSION['username'];

  $stmt = $mysqli->prepare("SELECT user_id, user_name FROM share WHERE source_name = ?");

  // Bind the parameter
  $stmt->bind_param('s', $username);
  $stmt->execute();

  // Bind the results
  $stmt->bind_result($id, $name);
  $rows = array();
  while($stmt->fetch()){
      $rows['name'][] = $name;
      $rows['id'][] = $id;
  }

  echo json_encode($rows);

  exit;

  $stmt->close();

?>
