<?php
$tweetfile = "../files/hash_Tweets.csv";
$mentionfile = "../files/hash_Mentions.csv";
$hashfile = "../files/hash_Hashtags.csv";

$user = "vizexp";
$db = "vizexp";
$pass = "YrR15JM+T";
$host = "localhost";

$conn = mysqli_connect ($host, $user, $pass);

if($conn == false or mysqli_select_db($conn, $db) == false) {
  echo "DB Connection failed";
  exit(-1);
}

//Tweets

$fp = fopen($tweetfile, "r");

while($line = fgetcsv($fp)) {

  if ($line[0] == "") {
    echo "line skipped\n";
    continue;
  }

  $tweetid = $line[1];
  $timestamp = $line[2];
  $name = $line[3];
  $userid = $line[4];
  $text = mysqli_real_escape_string($conn, $line[5]);
    
  $query = "INSERT INTO hash_Tweets (tweetid, userid, username, time, text) VALUES ($tweetid, $userid, \"$name\", \"$timestamp\", \"$text\")";
  $res = mysqli_query($conn,$query);
    
  if($res == false) {
    print_r($prev);
    print_r($line);
    print_r(fgetcsv($fp));
    echo "\nQuery failed: $query\n";
    echo mysqli_error($conn);
    echo "\n";
    exit(-1);
  }
  $prev = $line;
  
}
fclose($fp);

//Hashtags
$fp = fopen($hashfile, "r");
while($line = fgetcsv($fp)) {
  
  if ($line[0] == "") {
    echo "line skipped\n";
    continue;
  }

  $id = $line[1];
  $name = $line[2];

  $query = "INSERT INTO hash_Hashtags (id, name) VALUES ($id, \"$name\")";
  $res = mysqli_query($conn, $query);

  if($res == false) {
    print_r($line);
    echo "\nQuery failed: $query\n";
    exit(-1);
  }
}  
fclose($fp);

//Mentions
$fp = fopen($mentionfile, "r");
while($line = fgetcsv($fp)) {

  if ($line[0] == "") {
    echo "line skipped\n";
    continue;
  }

  $tweetid = $line[1];
  $hashid = $line[2];

  $query = "INSERT INTO hash_Mentions (tweet, tag) VALUES ($tweetid, $hashid)";
  $res = mysqli_query($conn, $query);

  if($res == false) {
    print_r($line);
    echo "\nQuery failed: $query\n";
    exit(-1);
  }
}
fclose($fp);

mysqli_close($conn);
?>
