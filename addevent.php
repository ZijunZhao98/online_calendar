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
    $user = $_SESSION['user_id'];
    $title = $mysqli->real_escape_string($_POST['title']);
    $description = $mysqli->real_escape_string($_POST['description']);
    $date = $mysqli->real_escape_string($_POST['date']);
    $time = $mysqli->real_escape_string($_POST['time']);
    $category = $mysqli->real_escape_string($_POST['category']);

    //save username and salt into database
    $stmt = $mysqli->prepare("insert into events(user, title, description, date, time, category) values (?, ?, ?, ?, ?, ?)");

    if(!$stmt){
        echo json_encode(array(
          "success" => false,
          "message" => $mysqli->error
        ));
        exit;
    }

    $stmt->bind_param('isssss', $user, $title, $description, $date, $time, $category);

    $stmt->execute();

    if($stmt){
        // Register succeeded!
        echo json_encode(array(
          "success" => true
        ));
        exit;
    } else{
        echo json_encode(array(
            "success" => false,
            "message" => "Add event failed."
          ));
        exit;
    }

    $stmt->close();

?>
