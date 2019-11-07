<?php
    header("Content-Type: application/json");
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

    // Use a prepared statement
  	$stmt = $mysqli->prepare("SELECT COUNT(*), id, username, password FROM users WHERE username=?");

    //if user clicks login, validates the user

    // Bind the parameter
    $user = $mysqli->real_escape_string($_POST['username']);
    $stmt->bind_param('s', $user);
    $stmt->execute();

     // Bind the results
  	$stmt->bind_result($cnt, $user_id, $username, $pwd_hash);
   	$stmt->fetch();

   	$pwd_guess = $mysqli->real_escape_string($_POST['password']);

   	// Compare the submitted password to the actual password hash
   	if($cnt == 1 && password_verify($pwd_guess, $pwd_hash)){
       	// Login succeeded!
       	$_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        $_SESSION['loggedIn'] = true;
        $_SESSION['token'] = substr(md5(rand()), 0, 10);

      	echo json_encode(array(
      		"success" => true
      	));
      	exit;
   	} else{
      echo json_encode(array(
      		"success" => false,
      		"message" => "Incorrect Username or Password"
      	));
      exit;
   	}

?>
