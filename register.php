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
    $user = $mysqli->real_escape_string($_POST['username']);
    $hash = $mysqli->real_escape_string($_POST['password']);

    //hashes the password
    $salt = "VLVu2dxHWpAhiAScVmHjiKo";
    $option = [
      'salt' => "VLVu2dxHWpAhiAScVmHjiKo"
    ];
    $hashed = password_hash($hash, PASSWORD_BCRYPT, $option);

    //save username and salt into database
    $stmt = $mysqli->prepare("insert into users (username, password, salt) values (?, ?, ?)");

    if(!$stmt){
        echo json_encode(array(
          "success" => false,
          "message" => $mysqli->error
        ));
        // echo("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }


    $stmt->bind_param('sss', $user, $hashed, $salt);

    $stmt->execute();

    if ($stmt->errno == 0) {
        echo json_encode(array(
          "success" => true
        ));
        exit;
    }else{
        echo json_encode(array(
            "success" => false,
            "message" => "Duplicate username."
          ));
        exit;
    }


    $stmt->close();

?>
