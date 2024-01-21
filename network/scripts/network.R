library("rjson", lib.loc="/home/ryan/R/x86_64-pc-linux-gnu-library/3.0")

#standard file scans
paths     <- scan ("files/index.txt", what="char", sep="\n")
list.char <- lapply (paths, scan, what="character", sep="\n")
list.char <- lapply (list.char, gsub, pattern="(?<=(?<!\\w)\\w) (?=\\w(?!\\w))", replacement="", perl=TRUE)
list.char <- sapply (list.char, paste, collapse = " ")

#filter papers
articles <- data.frame(paths=paths, anames=paths)
articles$anames  <- sub("/home/ryan/Local/CHUM/[0-9]*/", "", paths)
articles$anames  <- sub(".txt", "", articles$anames)
articles$batchid <- sub("/home/ryan/Local/CHUM/", "", paths)
articles$batchid <- as.numeric(sub("/.+", "", articles$batchid))

ignore <- c("annual bibliography")
for (i in ignore) {
  temp <- grepl(ignore, articles$anames, ignore.case=TRUE)
  list.char <- list.char[!temp]
  articles <- articles[!temp,]
}
rm(i, ignore, temp, paths)

#get list of tools.
tool <- read.csv("files/tool_index.csv", sep=";", stringsAsFactors=FALSE)
tool$Short[tool$Short == ""] <- NA
tool$Full[tool$Full == ""] <- NA
tool$Full <- tolower(tool$Full)
tool$Full <- paste("\\W", tool$Full, "\\W", sep="")
tool$Full[tool$Full == "\\WNA\\W"] <- NA    
tool$Short <- paste("\\W", tool$Short, "\\W", sep="") 
tool$Short[tool$Short == "\\WNA\\W"] <- NA                   
                   
#grep list for search terms.
founda <- lapply(tool$Short, grepl, x=list.char, ignore.case = FALSE)                       
founda <- lapply(founda, function(a) {
  if (all(is.na(a))) {
    rep(FALSE, length(a))
  } else {
    a
  }
})

foundb <- lapply(tool$Full, grepl, x=list.char, ignore.case = TRUE)                       
foundb <- lapply(foundb, function(a) {
  if (all(is.na(a))) {
    rep(FALSE, length(a))
  } else {
    a
  }
})

found <- mapply(function(a,b) {
  a | b
}, founda, foundb, SIMPLIFY=FALSE)
names(found) <- tool$Name
rm(founda, foundb)

#create links csv
links <- as.data.frame(t(combn(tool$Name, 2)), stringsAsFactors=FALSE)
colnames(links) <- c("sourcename", "targetname")
links$id <- seq_along(links$source) - 1

links$weight <- apply(links, 1, function(x) {
  test  <- found[[x[1]]]
  test1 <- found[[x[2]]]
  length(list.char[test & test1])
})
links <- links[links$weight > 0,]

links$source <- sapply(links$sourcename, function(d) {
  match(d, tool$Name) - 1
})
links$target <- sapply(links$targetname, function(d) {
  match(d, tool$Name) - 1
})

#convert links to json
links.json <- lapply(seq_along(links$source), function(i) links[i,])
write(toJSON(links.json), "data/links.json")

#convert nodes to json
nodes <- data.frame(id=seq_along(tool$Name)-1, name=tool$Name)
nodes.json <- lapply(seq_along(nodes$name), function(i) nodes[i,])
write(toJSON(nodes.json), "data/nodes.json")
rm(links.json, nodes.json)


names(found) <- nodes$id
bool     <- as.data.frame(c(articles, found), stringsAsFactors=FALSE)
meta <- read.csv("files/meta_all.csv", stringsAsFactors=FALSE)
meta <- merge(meta, bool, by.x="index", by.y="batchid")
articles <- meta
articles[articles == FALSE] <- 'f'
articles[articles == TRUE] <- 't'
articles$batchid <- NULL
articles$volume[articles$volume == "t"] <- 1
articles$paths <- NULL
write.csv(articles, "data/all_metadata.csv", row.names=FALSE)
