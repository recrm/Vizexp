<!DOCTYPE html>
<?php

$i = $_GET['var'];

#words
$data = array(
    "words" => array(
        "image" => "words",
        "title" => "CHum Words",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
<p>The CHum Word Visualization was our first experiment in D3. Our objective was to visualize token frequency over time primarily as a means to test the capabilities of D3. The visualization includes the full text of five hundred articles, minus stop words, selected from the Computers and the Humanities journal. We selected each article because it dealt with tools or the usage of tools. This is the same dataset used in the dendrogram visualization.</p>
<p>Each data point represents a relative frequency. That is the total number of times each token was counted in a year divided by the total number of counted tokens. All data was preprocessed in an R script; the smoothing provided by R's loess function.</p>
        ",
    ),

    "dendro" => array(
        "image" => "dendro",
        "title" => "CHum Dendrogram Viewer",
        "design" => "John Montague",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
<p>The CHum Dendro Visualization originated out of earlier attempts to algorithmically find clusters of CHum articles. It became a visualization thanks to design work done by John Montague. The experiment’s data set includes five hundred articles chosen from the CHum journal due to their relevance to the conversation surrounding tool design and usage. This is the same data set used in the CHum word visualization.</p>
<p>This visualization required the more extensive preprocessing than the other visualization. The data was first processed by Mallet in order to create a topic model of each paper. These models were then used to calculate a ‘distance’ between each pair of articles. This distance matrix was then used by R to create a dendrogram of the paper clusters.</p>
<p>On the bottom row of the visualization there are exactly 500 one pixel columns each representing a paper; there is no significance in the order of these papers. The Y axis represents the relative distance between each paper. Articles that are close together cluster together closer to the bottom of the dendrogram, while articles that are far apart cluster closer to the top. The most distant articles only come together at the root node at the top of the visualization.</p>
<p>In addition to clustering, the visualization can also represent categorical data. The histogram at the bottom represents the distribution of papers over time, while the various colors represent categorical data assigned to each article.</p>
        ",
    ),

    "network" => array(
        "image" => "network",
        "title" => "CHum Tool Network",
        "concept" => "Amy Dyrbye",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
<p>The CHum Tool Network Visualization began as an experiment in visualizing the way tools interact within the conversation about tools. In this basic network visualization each node represents a single tool while each link represents the number of times a pair of tools are mentioned in the same article. Clicking on a node produces a timeline along the bottom representing the chronology of mentions for that particular tool. Unlike  the other CHum visualizations, this project makes use of the entire CHum corpus.</p>
<p>The visualization makes use of two JSON files, nodes and links, that were created using R. The biggest implementation challenge in this project was deciding exactly what counted as a tool mention. Certain unsearchable names, such as to tool WORDS, are difficult to separate from their linguistic counterparts even using case sensitive searches. The software used to convert the pdf files into text files interprets CHum headers as being all capital letters. While much work has been done to clean the dataset of such false positives, mistakes are still possible. The visualization should be interpreted with this in mind.</p>
        ",
    ),

    "hashtag" => array(
        "image" => "hashtag",
        "title" => "TweetViz",
        "concept" => "Lori Regattieri",
        "design" => "Jennifer Windsor",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
<p>TweetViz began as a conversation about 'untangling the hairball' or unpacking the dense cluster of relations hidden within the Twitter social networking platform. While some of our early attempt to visualize the networks within Twitter were gorgeous, they did not convey any meaningful data about the conversation in those networks. In order to simplify the data our group decided to focus in on visualizing hashtags and their interaction with each other.</p>
<p>The project collected approximately a million tweets using a twitter scrapping program called Twarc. The tweets we chose to collect all include references to a pair of popular politicians: Nelson Mandela and Rob Ford. Unlike the other visualization, the data is not preprocessed in R. Instead, the full text of each tweet and the user who tweeted each tweet was placed in a database, which the server analyses real time before sending it to D3. The benefit of this is that it would in theory allow for an extended prototype to pull directly from Twitter and visualize conversations as they happen. Unfortunately, the downside is that this also increases loading time.</p>
        ",
    ),

    "galaxy" => array(
        "image" => "galaxy",
        "title" => "Topic Galaxy Viewer",
        "design" => "John Montague",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
<p>The topic modeling galaxy viewer continues some of our previous work in visualizing topic models. However, instead of focusing on visualizing documents using topic models as a <a href='about.php?var=dendro'>previous</a> visualization attempted we instead focused on visualizing the enormity of data embedded in the topic model itself.</p>

<p>The galaxy itself is a two dimensional representation of the n-dimensional probability vector space that the topic model itself represents. This reduction is calculated using a mixture of mathematical <a href=' http://www.sciencedirect.com/science/article/pii/0020025585900556'>magic</a> and the d3 force directed physics engine.</p>

<p>The galaxy visualizes almost everything buried in the standard output of the Mallet topic modeling engine. The distance between the centers of each bubble roughly represent how similar these topics are to each other. The size of each bubble represents the prevalence of that topic in the entire corpus. The color of the each bubble represents the internal entropy of the topic itself. Darker bubbles are more chaotic and are closer to the galactic, and mathematical, center of the galaxy represented by the single white bubble. Clicking on a bubble produces a list of the mallet assigned keys for each topic as well as a small bar depicting the relative importance of that key to that specific topic. Each topic is assigned a name that defaults to the first key in that topic, but can be changed by the user.</p>

<p>The visualization is also designed to work with a collection of plugins that can provide additional information about that topic. Pinning a topic moves it to the expandable bottom bar where it can be edited and further visualized. We built two plugins to compliment the main galaxy viewer. The first is the document viewer that displays the individual document topic makeup. The second is a simple token visualizer that uses metadata assigned each document to graph the raw counts of each instance of a topic over time. Other plugins have been suggested, such as word clouds, but not implemented.</p>

<p>Unfortunately, the Galaxy viewer does have some downsides. The formula used to compute the distance between two topics requires a double sum which scales poorly with the dimension of the topic. Without aggressively pruning low frequency words from the topic, reducing most topics from as many as a twenty thousand words to as few as two thousand, the algorithm can take days to complete. For this reason the viewer in its current form cannot accept user uploaded data even though the design and algorithm is intended to accept arbitrary Mallet output. For the same reason, the token viewer itself suffers. In its current form it only represents the keywords of a topic which frequently accounts for less than ten percent of the topic itself. Additional, the distance between each bubble is itself an approximation because we are trying to squeeze several thousand dimensions into a two dimensional picture. Misrepresentations are to be expected.</p>",
    ),

    "ggwords" => array(
        "image" => "ggwords",
        "title" => "GamerGate tokens",
        "programming" => "Ryan Chartier",
        "lead" => "Geoffrey Rockwell",
        "text" => "
        <p>GamerGate Tokens is a simple visualization of the top 1000 tokens found in our collection of scrapped tweets. Twitter entities such as urls, user mentions, and hashtags are removed prior to tokenizing the tweets and are not represented in this visualization. Clicking on any node will produce a small pre-generated random sample of the tweets that contain that word allowing us to get a small idea of how that word is used in context. Due to the excessive number of tweets in our dataset I had to keep these examples small and are therefore few in number.</p>

        <p>I personally find it humorous to note that the top four keywords in order (after stopwords) are 'people, just, like, and games'.</p>
        "
    )

);

?>
<html>
    <head>
        <meta charset="utf-8">
        <title>Visualizations</title>
        <link href="css/share.css" type="text/css" rel="stylesheet" />
	    <link href="css/about.css" type="text/css" rel="stylesheet" />
    </head>
    <body>
        <a href='index.html'>
            <img src="static/jwdts.png" id="banner">
        </a>
        <h1>
            <?php echo $data[$i]["title"]; ?>
        </h1>
        <img src="static/<?php echo $data[$i]["image"]; ?>.png" id='tool'>
        <p>
            <?php echo $data[$i]["text"]; ?>
        </p>
        <?php
        if (isset($data[$i]["lead"])) {
            echo "<p class='name'>Project Lead: ".$data[$i]["lead"]."</p>\n";
        }
        if (isset($data[$i]["concept"])) {
            echo "<p class='name'>Concept: ".$data[$i]["concept"]."</p>\n";
        }
        if (isset($data[$i]["design"])) {
            echo "<p class='name'>Design: ".$data[$i]["design"]."</p>\n";
        }
        if (isset($data[$i]["programming"])) {
            echo "<p class='name'>Programming: ".$data[$i]["programming"]."</p>\n";
        }
        ?>
        <footer>
            <hr class="footer">
            <img src="static/INKE.jpg" id='inke'>
            <p class="foottext">
                Funding for the project generously supplied by Just What do They Do (JWDTD), Implementing New Knowledge Environments (INKE), and Social Science and Humanities Research Council of Canada (SSHRC). <br>
                Source code for website as well as data analysis can be found <a href="https://github.com/recrm/Vizexp">here</a>.
            </p>
        </footer>
    </body>
</html>