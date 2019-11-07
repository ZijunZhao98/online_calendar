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
  $user = $mysqli->real_escape_string($_POST['id']);

  $stmt = $mysqli->prepare("SELECT events.id, events.title, events.description, events.date,
    events.time, events.category FROM events WHERE events.user = ?");

  // Bind the parameter
  $stmt->bind_param('i', $user);
  $stmt->execute();

  // Bind the results
  $stmt->bind_result($id, $title, $description, $date, $time, $category);
  $rows = array();
  while($stmt->fetch()){
      $rows['id'][] = $id;
      $rows['title'][] = $title;
      $rows['description'][] = $description;
      $rows['date'][] = $date;
      $rows['time'][] = $time;
      $rows['category'][] = $category;
  }

  echo json_encode($rows);

  exit;

  $stmt->close();

?>
