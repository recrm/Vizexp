#!/usr/bin/Rscript
library("cluster", lib.loc="/usr/lib/R/library")
library("rjson", lib.loc="/home/ryan/R/x86_64-pc-linux-gnu-library/3.0")
library("sets", lib.loc="/home/ryan/R/x86_64-pc-linux-gnu-library/3.0")

#grab information from metadata
metadata <- read.csv("data/500_metadata.csv")
slice    <- metadata[c("Index", "Text_File")]
mallet   <- read.csv ("files/composition.csv", sep="\t")
merge    <- merge(slice, mallet, by.x="Text_File", by.y="filename")
index    <- as.numeric(merge$Index)
merge["Index"]     <- NULL
merge["Text_File"] <- NULL
data <- as.matrix(merge)
rm(slice, mallet, merge)

#sort data into sorted.frame
sorted <- outer(1:500, 0:99, Vectorize(function(row, topic) {
  data[row, match(topic, data[row,])+1]
}))

#create distance matrix
compute <- outer(1:500, 1:500, Vectorize(function(article.x, article.y) {
  x <- sorted[article.x,]
  y <- sorted[article.y,]
  mean(c(sum(x*log(x/y)), sum(y*log(y/x))))
}))

#creates dendrogram
distance <- as.dist(compute)
cluster  <- agnes(distance, method="ward")
dendro   <- as.dendrogram(cluster)
rm(compute, data, sorted, distance, cluster)

#count nodes in dendrogram
count <- 0
dendrapply(dendro, function(x) {count <<- count+1})

#create objects list
total_objects <- as.list(rep(0, count))
rm(count)

i <- 1
dendrapply(dendro, function(x) {
  Id      <- i
  Temp    <- 0
  Height  <- attr(x, "height")
  Destroy <- 0
  
  Children <- unlist(dendrapply(x, function(x) {
    if (is.leaf(x)) {
      return(as.numeric(index[attr(x, "label")]))
    } else {
      return (NULL)
    }
  }))
  
  catagories <- c("Describe computer-assisted research", "Review", "Present tool and development")
  
  type  <- table(sapply(Children, function(x) {
    metadata[metadata$Index == x, "Article_Purpose"]
  }))
  types <- sapply(catagories, function(x) {
    return(as.numeric(type[x]))
  })
  other <- length(Children) - sum(types)
  types <- c(types, other)
  names(types) <- c(catagories, "Other")
  
  year <- table(sapply(Children, function(x) {
    substr(metadata[metadata$Index == x, "Year"], 3, 3)
  }))
  
  years <- sapply(c("0", "6","7","8","9"), function(x) {
    return(as.numeric(year[x]))
  })
  
  years[is.na(years)] <- 0
  
  value <- list(id=i, temp=Temp, height=Height, destroy=Destroy, years=years, types=types, children=Children)
  total_objects[[i]] <<- value
  i <<- i + 1
})
rm(i, index)
total.sets <- lapply(total_objects, function(x) {as.set(x$children)})
set_test   <- Vectorize(set_is_proper_subset)

#command is insanely slow. Use with caution.
final <- lapply(total_objects, function(x) {
  if (x$id == 1) {
    x$destroy <- Inf
  } else {
    found     <- set_test(list(as.set(x$children)), total.sets)
    x$destroy <- total_objects[found][[length(total_objects[found])]]$height
  }
  return(x)
})

output <- toJSON(final)
output <- gsub("(?<=children\":)(?!\\[)", "[", output, perl=TRUE)
output <- gsub("(?<!\\])(?=},{)", "]", output, perl=TRUE)
output <- gsub("(?=}]$)", "]", output, perl=TRUE)
write(output, "Dendro/data/dendro.json")
rm(total.sets, total_objects, final, set_test, dendro)

#Create histogram data.
years <- sort(unique(metadata$Year))

hist.data <- lapply(seq(1, length(years)), function(i) {
  id <- years[[i]]
  articles <- metadata$Year == id
  temp <- 0
  children <- metadata$Index[articles]
  
  purpose <- table(metadata$Article_Purpose[articles])
  catagories <- c("Describe computer-assisted research", "Review", "Present tool and development")
  
  types <- sapply(catagories, function(x) {
    return(as.numeric(purpose[x]))
  })
  other <- length(children) - sum(types)
  types <- c(types, other)
  names(types) <- c(catagories, "Other")
  
  year.list <- rep(0, 5)
  names(year.list) <- c("0", "6","7","8","9")
  
  year.list[substr(id, 3, 3)] <- length(children)
  
  list(id=id, temp=temp, years=year.list, types=types, children=children)
})
rm(years)
write(toJSON(hist.data), "Dendro/data/hist.json")
