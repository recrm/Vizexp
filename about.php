<!DOCTYPE html>
<?php 

$i = $_GET['var'];

#people
$concept = array(
    "words" => null,
    "dendro" => null,
    "network" => "Amy Dyrbye",
    "hashtag" => "Lori Regattieri",
);
$design = array(
    "words" => null,
    "dendro" => "John Montague",
    "network" => null,
    "hashtag" => "Jennifer Windsor",
);
$programming = array(
    "words" => "Ryan Chartier",
    "dendro" => "Ryan Chartier",
    "network" => "Ryan Chartier",
    "hashtag" => "Ryan Chartier",
);

#image
$image = array(
    "words" => "words",
    "dendro" => "dendro",
    "network" => "network",
    "hashtag" => "hashtag",
);

$title = array(
    "words" => "CHum Words",
    "dendro" => "CHum Dendrogram Viewer",
    "network" => "CHum Tool Network",
    "hashtag" => "TweetViz",
);

$text = array();

$text["words"] = "
<p>The CHum Word Visualization was our first experiment in D3. Our objective was to visualize token frequency over time primarily as a means to test the capabilities of D3. The visualization includes the full text of five hundred articles, minus stop words, selected from the Computers and the Humanities journal. We selected each article because it dealt with tools or the usage of tools. This is the same dataset used in the dendrogram visualization.</p>
<p>Each data point represents a relative frequency. That is the total number of times each token was counted in a year divided by the total number of counted tokens. All data was preprocessed in an R script; the smoothing provided by R's loess function.</p>
";

$text["dendro"] = "
<p>The CHum Dendro Visualization originated out of earlier attempts to algorithmically find clusters of CHum articles. It became a visualization thanks to design work done by John Montague. The experiment’s data set includes five hundred articles chosen from the CHum journal due to their relevance to the conversation surrounding tool design and usage. This is the same data set used in the CHum word visualization.</p>
<p>This visualization required the more extensive preprocessing than the other visualization. The data was first processed by Mallet in order to create a topic model of each paper. These models were then used to calculate a ‘distance’ between each pair of articles. This distance matrix was then used by R to create a dendrogram of the paper clusters.</p>
<p>On the bottom row of the visualization there are exactly 500 one pixel columns each representing a paper; there is no significance in the order of these papers. The Y axis represents the relative distance between each paper. Articles that are close together cluster together closer to the bottom of the dendrogram, while articles that are far apart cluster closer to the top. The most distant articles only come together at the root node at the top of the visualization.</p>
<p>In addition to clustering, the visualization can also represent categorical data. The histogram at the bottom represents the distribution of papers over time, while the various colors represent categorical data assigned to each article.</p>
";
$text["network"] = "
<p>The CHum Tool Network Visualization began as an experiment in visualizing the way tools interact within the conversation about tools. In this basic network visualization each node represents a single tool while each link represents the number of times a pair of tools are mentioned in the same article. Clicking on a node produces a timeline along the bottom representing the chronology of mentions for that particular tool. Unlike  the other CHum visualizations, this project makes use of the entire CHum corpus.</p>
<p>The visualization makes use of two JSON files, nodes and links, that were created using R. The biggest implementation challenge in this project was deciding exactly what counted as a tool mention. Certain unsearchable names, such as to tool WORDS, are difficult to separate from their linguistic counterparts even using case sensitive searches. The software used to convert the pdf files into text files interprets CHum headers as being all capital letters. While much work has been done to clean the dataset of such false positives, mistakes are still possible. The visualization should be interpreted with this in mind.</p>
";

$text["hashtag"] = "
<p>TweetViz began as a conversation about 'untangling the hairball' or unpacking the dense cluster of relations hidden within the Twitter social networking platform. While some of our early attempt to visualize the networks within Twitter were gorgeous, they did not convey any meaningful data about the conversation in those networks. In order to simplify the data our group decided to focus in on visualizing hashtags and their interaction with each other.</p>
<p>The project collected approximately a million tweets using a twitter scrapping program called Twarc. The tweets we chose to collect all include references to a pair of popular politicians: Nelson Mandela and Rob Ford. Unlike the other visualization, the data is not preprocessed in R. Instead, the full text of each tweet and the user who tweeted each tweet was placed in a database, which the server analyses real time before sending it to D3. The benefit of this is that it would in theory allow for an extended prototype to pull directly from Twitter and visualize conversations as they happen. Unfortunately, the downside is that this also increases loading time.</p>
";

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
        <h1><?php echo $title[$i]; ?></h1>
        <a href="<?php echo $image[$i]; ?>.html">
            <img src="static/<?php echo $image[$i]; ?>.png" id='tool'>
        </a>
        <?php echo $text[$i]; ?>
        <br>
        <?php 
        if ($concept[$i]) {
            echo "<p class='name'>Concept: ".$concept[$i]."</p>\n";
        }
        if ($design[$i]) {
            echo "<p class='name'>Design: ".$design[$i]."</p>\n";
        }
        if ($programming[$i]) {
            echo "<p class='name'>Programming: ".$programming[$i]."</p>\n";
        }
        ?>
        <footer>
            <hr class="footer">
            <img src="static/INKE.jpg" id='inke'>
            <p class="foottext">Funding for the project genorously supllied by Just What do They Do (JWDTD) and Implementing New Knowledge Environments (INKE).</p>
        </footer>
    </body>
</html>
