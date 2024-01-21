<?php

$INDATA = $_GET;

function database_connect() {
    #Connect to mysql.
    $user = "vizexp";
    $db = "vizexp";
    $pass = "YrR15JM+T";
    $host = "localhost";
    $conn = mysqli_connect ($host, $user, $pass);

    if($conn == false or mysqli_select_db($conn, $db) == false) {
      echo "DB Connection failed";
      exit(-1);
    }
    return $conn;
}

function get_defaults($data, $conn) {
    $value = array();

    function def($value, $default, $data, $conn) {
        if (isset($data[$value])) {
            return mysqli_real_escape_string($conn, $data[$value]);
        }
        return $default;
    }

    $value["user"] = def('user', '', $data, $conn);
    $value["last"] = def('last', '2013-11-15', $data, $conn);
    $value["first"] = def('first', '2013-11-01', $data, $conn);
    $value["search"] = def('search', 'rob ford', $data, $conn);
    $value["search2"] = def('search2', '', $data, $conn);
    $value["hashtag"] = def('hashtag', 'topoli', $data, $conn);
    $value["offset"] = def('offset', '0', $data, $conn);
    $value["limit"] = def('limit', '10', $data, $conn);
    $value["type"] = def('type', 'main', $data, $conn);
    return $value;
}

function build_main_query($data) {
    #Build main query.
    $mainquery = "SELECT hash_Tweets.time, hash_Tweets.tweetid, GROUP_CONCAT(hash_Hashtags.name) AS hashtags 
        FROM hash_Hashtags, hash_Mentions, hash_Tweets WHERE     
        hash_Tweets.tweetid = hash_Mentions.tweet
        AND hash_Hashtags.id = hash_Mentions.tag
        AND hash_Tweets.time between '{$data["first"]}' AND '{$data["last"]}'
        AND hash_Tweets.text LIKE '%{$data["search"]}%'
        GROUP BY hash_Tweets.tweetid 
        ORDER BY hash_Tweets.time ASC 
        LIMIT {$data["limit"]}
        ";

    return $mainquery;
}

function build_secondary_query($data) {
    $num = substr_count($data['hashtag'], ",") + 1;
    $hashtags = "'".preg_replace('/,/', "','", $data['hashtag'])."'";
    $users = "'".preg_replace('/,/', "','", $data['user'])."'";
    
    #Build main query.
    $mainquery = "
        SELECT hash_Tweets.time, hash_Tweets.username, hash_Tweets.text, COUNT(*) AS count
        FROM hash_Hashtags, hash_Mentions, hash_Tweets WHERE     
        hash_Tweets.tweetid = hash_Mentions.tweet
        AND hash_Hashtags.id = hash_Mentions.tag
        AND hash_Tweets.time between '{$data["first"]}' AND '{$data["last"]}'
        AND hash_Hashtags.name IN ($hashtags)
        AND hash_Tweets.text LIKE '%{$data["search"]}%'
        AND hash_Tweets.text LIKE '%{$data["search2"]}%'
        ";
        
    if ($users != "''") {
        $mainquery .= "
        AND hash_Tweets.username IN ($users)
        ";
    }
        
    $mainquery .= "
        GROUP BY hash_Tweets.tweetid
        HAVING count = $num
        ORDER BY hash_Tweets.time ASC 
        LIMIT {$data["limit"]} OFFSET {$data["offset"]}
        ";
    
    return $mainquery;
}

function build_count_query($data) {
    #Build main query.
    $mainquery = "
        SELECT COUNT(*) AS `count`
        FROM hash_Hashtags, hash_Mentions, hash_Tweets WHERE     
        hash_Tweets.tweetid = hash_Mentions.tweet 
        AND hash_Hashtags.id = hash_Mentions.tag
        AND hash_Tweets.time between '{$data["first"]}' AND '{$data["last"]}' 
        AND hash_Hashtags.name = '{$data["hashtag"]}'
        AND hash_Tweets.text LIKE '%{$data["search"]}%'
        ";

    return $mainquery;
}

function build_user_query($data) {
    #Build main query.
    $mainquery = "
        SELECT hash_Tweets.username, COUNT(*) AS `count`
        FROM hash_Hashtags, hash_Mentions, hash_Tweets WHERE     
        hash_Tweets.tweetid = hash_Mentions.tweet 
        AND hash_Hashtags.id = hash_Mentions.tag
        AND hash_Tweets.time between '{$data["first"]}' AND '{$data["last"]}' 
        AND hash_Hashtags.name = '{$data["hashtag"]}'
        AND hash_Tweets.text LIKE '%{$data["search"]}%'
        GROUP BY hash_Tweets.username 
        ORDER BY count DESC 
        LIMIT {$data["limit"]}
        ";

    return $mainquery;
}

function build_hashtag_query($data) {
    #Build main query.
    $mainquery = "SELECT hash_Hashtags.name AS name, COUNT(*) AS `count`
        FROM hash_Hashtags, hash_Mentions, hash_Tweets WHERE     
        hash_Tweets.tweetid = hash_Mentions.tweet 
        AND hash_Hashtags.id = hash_Mentions.tag 
        AND hash_Tweets.time between '{$data["first"]}' AND '{$data["last"]}'
        AND hash_Tweets.text LIKE '%{$data["search"]}%'
        GROUP BY hash_Hashtags.name 
        ORDER BY count DESC 
        LIMIT {$data["limit"]}
        ";

    return $mainquery;
}

function json_hashtags($query) {
    #create data
    $data = array();
    while($post = mysqli_fetch_array($query)) {
        #Get specific day from row.
        $date = substr($post["time"], 0, 10);
       
        #If this day is not in data add it.
        if (!array_key_exists($date, $data)) {
            $data[$date] = array();
            $data[$date]["_total"] = 0;
        }
        
        #Increment total tweet counter for day.
        $data[$date]["_total"] +=1;
        
        #Count all of the hashtags in row.
        $hashtags = explode(',', $post['hashtags']);
        foreach($hashtags as $hash) {
            if(array_key_exists($hash, $data[$date])) {
                $data[$date][$hash] +=1;
            } else {
                $data[$date][$hash] = 1;
            }
        }
        unset($hash);
    }

    $num_rows = mysqli_num_rows($query);
    echo "[";

    $firstday = true;
    foreach ($data as $day => $day_data) {
    
        #Sort and slice date data
        array_multisort($day_data, SORT_DESC);
        $day_data = array_slice($day_data, 0, 11);
        $total = json_encode($day_data["_total"]);
        
    #   Cycle through each hashtag.
        $index = -1;
        foreach($day_data as $hash => $count) {
            if ($hash == "_total") {
                continue;
            }
            $index +=1;
            $json_count = json_encode($count);
            $json_name = json_encode($hash);
            $json_day = json_encode($day);
            
            echo $firstday ? "" : ",";
            $firstday = false;
            
            echo "{";
            echo "\"index\":$index,";
            echo "\"count\":$json_count,";
            echo "\"id\":$json_name,";
            echo "\"day\":$json_day,";
            echo "\"total\":$total";
            echo "}";
        }
        unset($hash, $count);
    }
    unset($date, $date_data);
    echo "]";
}

#Note: this function should print any query as valid json.
function json_tweets($query) {
    echo "[";
    $firstobj = true;
    while($post = mysqli_fetch_array($query)) {
        
        echo $firstobj ? "" : ",";
        $firstobj = false;
        
        echo "{";
        $firstkey = true;
        foreach($post as $key => $value) {
            if (is_numeric($key)) {
                continue;
            }
            
            echo $firstkey ? "" : ",";
            $firstkey = false;
            
            $json = json_encode(utf8_encode($value));
            echo "\"$key\":$json";
        }
        echo "}";
    }
    echo "]";
}

$conn = database_connect();
$source = get_defaults($INDATA, $conn);
$type = $source['type'];
if ($type == "main") {
    $string = build_main_query($source);
} else if ($type == "secondary") {
    $string = build_secondary_query($source);
} else if ($type == "count") {
    $string = build_count_query($source);
} else if ($type == "user") {
    $string = build_user_query($source);
} else if ($type == "hashtag") {
    $string = build_hashtag_query($source);
} else {
    exit(-1);
}

$query = mysqli_query($conn, $string);

//build metadata
$json_query = json_encode($string);
$json_results = json_encode(mysqli_num_rows($query));
$json_type = json_encode($source["type"]);

echo "{";
echo "\"metadata\":{";
    echo "\"type\":$json_type,";
#    echo "\"query\":$json_query,";
    echo "\"rows\":$json_results";
echo "},";
echo "\"data\":";

if ($source["type"] == "main") {
    json_hashtags($query);
} else {
    json_tweets($query);
}

echo "}";
?>

