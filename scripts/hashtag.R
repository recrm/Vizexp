#utils/extractor.py -path /media/media/tweets id id_str created_at text u:screen_name u:id_str e:hashtags:text

#create csv data
data <- read.csv("files/output.csv", stringsAsFactors = FALSE)
data <- data[!is.na(data$e.hashtags.text),]
data$e.hashtags.text <- tolower(data$e.hashtags.text)

#format date information
data$created_at <- strptime(data$created_at, '%a %b %d %H:%M:%S +0000 %Y')
data$created_at <- strftime(data$created_at, "%Y-%m-%d %H:%M:%S")

#create hashtags
u.hash <- unique(data$e.hashtags.text)
hashtags <- data.frame(id=seq_along(u.hash), text=u.hash, stringsAsFactors = FALSE)
rownames(hashtags) <- NULL
names(hashtags) <- c("hashid", "hashtext")
rm(u.hash)

#create mentions.
mentions <- data[,c("id_str", "e.hashtags.text")]
names(mentions) <- c("tweetid", "hashtext")
mentions <- merge(mentions, hashtags)
rownames(mentions) <- NULL
mentions$hashtext <- NULL
mentions <- mentions[!(duplicated(mentions)),]

#sort by Tweets
tweets <- data[,c("id_str", "created_at", "u.screen_name", "u.id_str", "text")]
tweets <- tweets[!(duplicated(tweets)),]
names(tweets) <- c("tweetid", "timestamp", "username", "userid", "text")
tweets$text <- gsub("\r?\n|\r", " ", tweets$text)

#832163 - 832100 = 63 duplicate tweets????
#BUGGGGG not all tweets have unique ids I have no idea how that happened.
tweets <- tweets[!(duplicated(tweets$tweetid)),]

write.csv(hashtags, "files/hash_Hashtags.csv")
write.csv(tweets, "files/hash_Tweets.csv")
write.csv(mentions, "files/hash_Mentions.csv")
