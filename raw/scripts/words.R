#!/usr/bin/Rscript
library("tm", lib.loc="/home/ryan/R/x86_64-pc-linux-gnu-library/3.0")
library("rjson", lib.loc="/home/ryan/R/x86_64-pc-linux-gnu-library/3.0")

#standard file scans
csv.meta   <- read.csv ("files/metadata.csv")
paths      <- paste ("files/largedata/500/", as.vector (csv.meta[, "Text_File"]), sep="")
list.char  <- lapply (paths, scan, what="character", sep="\n")
list.char  <- lapply (list.char, gsub, pattern="(?<=(?<!\\w)\\w) (?=\\w(?!\\w))", replacement="", perl=TRUE)
list.char  <- lapply (list.char, tolower)
list.char  <- lapply(list.char, MC_tokenizer)
list.table <- lapply(list.char, table)
rm(paths)

#generate top 300 list
all.table <- sort(table(unlist(list.char)), decreasing=TRUE)
all.table <- all.table[!(names(all.table) %in% stopwords(kind="SMART"))]
all.table <- all.table[names(all.table) != ""]
all.table <- all.table[nchar(names(all.table)) > 2]
top       <- names(head(all.table, 300))
rm(all.table, list.char)

#generate final
dates <- csv.meta$Year
totals <- sapply(list.table, sum)

final <- aggregate(totals, list(year=dates), sum)
names(final) <- c("year", "total")
other <- expand.grid(top, unique(dates))
names(other) <- c("text", "year")
final <- merge(final ,other)
final$text <- as.character(final$text)
rm(other, totals)

#create base data
final$count <- mapply(function(year, word) {
  sub <- list.table[dates == year]
  counts <- sapply(sub, function (d) {
    return (d[word]) 
  })
  counts[is.na(counts)] <- 0
  as.integer(sum(counts))
}, final$year, final$text)

final$X1 <- final$count / final$total

#get smoothing data
for (i in seq(0.2, 0.4, 0.3)) {
  string <- paste("X", i*10, sep="")
  final[string] <- NA
  
  for (word in top) {
    l <- final$text == word
    final[l, string] <- predict(loess(final[l, "X1"] ~ final[l,"year"], span=i))
  }
}
rm(i, l, string, word)

#add total word counts
counts <- sapply(top, function (word) {
  sum(final[final$text == word, "count"])
})
final <- merge(final, data.frame(text = top, wordtot = counts))


write.csv(final, "data/words.csv", row.names=FALSE)

