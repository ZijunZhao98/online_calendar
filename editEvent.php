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

    $title = $mysqli->real_escape_string($_POST['title']);
    $description = $mysqli->real_escape_string($_POST['description']);
    $date = $mysqli->real_escape_string($_POST['date']);
    $time = $mysqli->real_escape_string($_POST['time']);
    $category = $mysqli->real_escape_string($_POST['category']);
    $id= $mysqli->real_escape_string($_POST['id']);

    //update the database
    $stmt = $mysqli->prepare("UPDATE events SET events.title = ?, events.description = ?, events.date = ?, events.time = ?, events.category = ? WHERE events.id = ?");

    error_log(print_r($stmt, TRUE));

    if(!$stmt){
      echo json_encode(array(
        "success" => false,
        "message" => $mysqli->error
      ));
      exit;
    }

    $stmt->bind_param('sssssi', $title, $description, $date, $time, $category, $id);

    $stmt->execute();

    if($stmt){
        echo json_encode(array(
          "success" => true
        ));
        exit;
    } else{
        echo json_encode(array(
            "success" => false,
            "message" => "Edit event failed."
          ));
        exit;
    }

    $stmt->close();


?>
