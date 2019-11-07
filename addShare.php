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
    $username = $_SESSION['username'];
    $name = $mysqli->real_escape_string($_POST['username']);

    //save username and salt into database
    $stmt = $mysqli->prepare("insert into share(user_id, user_name, source_name) values (?, ?, ?)");

    if(!$stmt){
        echo json_encode(array(
          "success" => false,
          "message" => $mysqli->error
        ));
        exit;
    }

    $stmt->bind_param('iss', $user, $username, $name);

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
