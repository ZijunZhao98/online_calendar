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

    $event_id =  $mysqli->real_escape_string($_POST['id']);
    // first, get the title,description,data,time,category of the events from the database
    $stmt = $mysqli->prepare("DELETE FROM events WHERE events.id=?");


    $stmt->bind_param('i', $event_id);

    $stmt->execute();
    if($stmt){
        echo json_encode(array(
          "success" => true
        ));
        exit;
    } else{
        echo json_encode(array(
            "success" => false,
            "message" => "delete event failed."
          ));
        exit;
    }

    $stmt->close();


?>
